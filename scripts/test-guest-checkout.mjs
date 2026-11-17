import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const filename = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "services",
  "api",
  "checkout.ts",
);
const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  fileName: filename,
}).outputText;
const moduleExports = {};
const validationFilename = path.join(path.dirname(filename), "..", "..", "lib", "address-validation.ts");
const validationExports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(validationFilename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  fileName: validationFilename,
}).outputText, { exports: validationExports }, { filename: validationFilename });
let customerResult;
let activeOrder;
const calls = [];

vm.runInNewContext(source, {
  exports: moduleExports,
  require: (id) => {
    if (id === "@/services/api/auth") return { getAuthHeaders: () => ({}) };
    if (id === "@/lib/address-validation") return validationExports;
    throw new Error(`Unexpected dependency: ${id}`);
  },
  process: { env: { NEXT_PUBLIC_VENDURE_API_URL: "https://store.example/shop-api" } },
  fetch: async (_url, options) => {
    const body = JSON.parse(options.body);
    calls.push({ body, options });
    const data = body.query.includes("query ActiveOrder")
      ? { activeOrder }
      : { setCustomerForOrder: customerResult };
    return { ok: true, status: 200, json: async () => ({ data }) };
  },
}, { filename });

const accountFilename = path.join(path.dirname(filename), "account.ts");
const accountExports = {};
const accountCalls = [];
vm.runInNewContext(ts.transpileModule(fs.readFileSync(accountFilename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  fileName: accountFilename,
}).outputText, {
  exports: accountExports,
  require: (id) => {
    if (id === "@/services/api/auth") return { getAuthHeaders: () => ({}) };
    if (id === "@/lib/address-validation") return validationExports;
    throw new Error(`Unexpected dependency: ${id}`);
  },
  process: { env: { NEXT_PUBLIC_VENDURE_API_URL: "https://store.example/shop-api" } },
  fetch: async (_url, options) => {
    const body = JSON.parse(options.body);
    accountCalls.push(body);
    return { ok: true, json: async () => ({ data: { createCustomerAddress: { id: "1" }, updateCustomerAddress: { id: "1" } } }) };
  },
}, { filename: accountFilename });

function order(id) {
  return { __typename: "Order", id, code: "ORDER-1", state: "AddingItems", lines: [] };
}

async function main() {
  assert.equal(validationExports.isSupportedCountry("us"), true);
  assert.equal(validationExports.isSupportedCountry("CA"), true);
  assert.equal(validationExports.isSupportedCountry("IN"), false);
  assert.equal(validationExports.validatePostalCode("us", "12345-6789"), "");
  assert.equal(validationExports.validatePostalCode("ca", "a1a1a1"), "");
  assert.equal(validationExports.normalizePostalCode("ca", "a1a1a1"), "A1A 1A1");
  assert.match(validationExports.validatePostalCode("US", "123"), /valid US ZIP/);
  assert.match(validationExports.validatePostalCode("CA", "12345"), /valid Canadian postal/);
  assert.match(validationExports.validatePostalCode("IN", "123456"), /only in the United States and Canada/);
  await assert.rejects(moduleExports.setCheckoutAddress({ countryCode: "IN", postalCode: "123456" }), /only in the United States and Canada/);
  assert.equal(calls.length, 0);
  const address = { firstName: "Test", lastName: "Buyer", phoneNumber: "", streetLine1: "Main", streetLine2: "", city: "City", province: "ON", postalCode: "123456", countryCode: "in", isDefault: false };
  await assert.rejects(accountExports.createCustomerAddress(address), /only in the United States and Canada/);
  await assert.rejects(accountExports.updateCustomerAddress("1", { ...address, countryCode: "ca" }), /valid Canadian postal/);
  assert.equal(accountCalls.length, 0);
  await accountExports.createCustomerAddress({ ...address, countryCode: "ca", postalCode: "a1a1a1" });
  assert.equal(accountCalls[0].variables.input.countryCode, "CA");
  assert.equal(accountCalls[0].variables.input.postalCode, "A1A 1A1");
  activeOrder = order("guest-order");
  customerResult = order("guest-order");
  const contact = {
    emailAddress: "guest@example.com",
    firstName: "Guest",
    lastName: "Buyer",
    phoneNumber: "1234567890",
  };

  const guestOrder = await moduleExports.setCheckoutCustomer(contact);
  assert.equal(guestOrder.id, "guest-order");
  assert.equal(calls[1].body.variables.input.emailAddress, contact.emailAddress);
  assert.equal(calls[1].body.variables.input.firstName, contact.firstName);
  assert.equal(calls[0].options.credentials, "include");
  assert.equal(calls[1].options.credentials, "include");
  assert.match(calls[1].body.query, /setCustomerForOrder/);

  customerResult = { __typename: "EmailAddressConflictError", message: "Conflict" };
  await assert.rejects(
    moduleExports.setCheckoutCustomer(contact),
    /This email belongs to an existing account/,
  );

  customerResult = { __typename: "GuestCheckoutError", message: "Guest checkout disabled" };
  await assert.rejects(
    moduleExports.setCheckoutCustomer(contact),
    /Guest checkout disabled/,
  );

  customerResult = { __typename: "AlreadyLoggedInError" };
  const authenticatedOrder = await moduleExports.setCheckoutCustomer(contact);
  assert.equal(authenticatedOrder.id, "guest-order");

  customerResult = null;
  await assert.rejects(
    moduleExports.setCheckoutCustomer(contact),
    /returned no order/,
  );

  console.log("PASS: anonymous checkout attaches contact details and reports guest-checkout API errors.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
