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
let customerResult;
let activeOrder;
const calls = [];

vm.runInNewContext(source, {
  exports: moduleExports,
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

function order(id) {
  return { __typename: "Order", id, code: "ORDER-1", state: "AddingItems", lines: [] };
}

async function main() {
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
