import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const filename = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "features", "checkout", "stripe-payment.tsx");
const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  fileName: filename,
}).outputText;

const tick = () => new Promise((resolve) => setImmediate(resolve));

function setup({ submit = async () => ({}), confirm = async () => ({ paymentIntent: { status: "succeeded" } }), success = async () => {} } = {}) {
  const calls = { errors: [], busy: [], confirmations: [], successes: 0, stored: [], walletErrors: [] };
  const elements = { submit };
  const stripe = { confirmPayment: async (params) => { calls.confirmations.push(params); return confirm(params); } };
  const components = { Elements: "Elements", ExpressCheckoutElement: "ExpressCheckoutElement", PaymentElement: "PaymentElement", useElements: () => elements, useStripe: () => stripe };
  const jsx = (type, props) => ({ type, props });
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require: (id) => {
      if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (id === "react") return { useRef: (current) => ({ current }), useState: (value) => [value, () => {}] };
      if (id === "@stripe/react-stripe-js") return components;
      if (id === "lucide-react") return { LockKeyhole: "LockKeyhole" };
      if (id === "@/lib/stripe") return { stripePromise: {}, stripePublishableKey: "test-key" };
      throw new Error(`Unexpected dependency: ${id}`);
    },
    sessionStorage: { setItem: (...args) => calls.stored.push(args) },
    window: { location: { origin: "https://shop.example" } },
    encodeURIComponent,
    Error,
  }, { filename });

  const root = exports.StripePayment({
    clientSecret: "test-secret", orderCode: "ORDER 1", customerEmail: "buyer@example.com", total: "$10",
    onSuccess: async () => { calls.successes++; await success(); },
    onError: (message) => calls.errors.push(message),
    onProcessingChange: (value) => calls.busy.push(value),
  });
  const form = root.props.children.type(root.props.children.props);
  const children = form.props.children;
  const wallet = children[0].props.children[0];
  assert.equal(wallet.type, "ExpressCheckoutElement");
  assert.equal(children[1].type, "PaymentElement");
  const walletEvent = { paymentFailed: (error) => calls.walletErrors.push(error) };
  return { calls, form, wallet, walletEvent };
}

{
  const { calls, form } = setup();
  form.props.onSubmit({ preventDefault() {} });
  await tick();
  assert.equal(calls.successes, 1);
  assert.equal(calls.confirmations.length, 1);
  assert.equal(calls.confirmations[0].redirect, "if_required");
  assert.equal(calls.confirmations[0].confirmParams.return_url, "https://shop.example/checkout/stripe-return?order_code=ORDER%201");
  assert.equal(calls.confirmations[0].confirmParams.payment_method_data.billing_details.email, "buyer@example.com");
  assert.deepEqual(calls.stored[0], ["stripe_order_code", "ORDER 1"]);
  assert.deepEqual(calls.busy, [true]);
}

{
  const { calls, form } = setup({ submit: async () => ({ error: { message: "Incomplete details" } }) });
  form.props.onSubmit({ preventDefault() {} });
  await tick();
  assert.equal(calls.confirmations.length, 0);
  assert.equal(calls.errors.at(-1), "Incomplete details");
  assert.deepEqual(calls.busy, [true, false]);
}

{
  const { calls, wallet, walletEvent } = setup({ confirm: async () => ({ error: { message: "Payment declined" } }) });
  wallet.props.onConfirm(walletEvent);
  await tick();
  assert.equal(calls.walletErrors[0].message, "Payment declined");
  assert.equal(calls.errors.at(-1), "Payment declined");
  assert.deepEqual(calls.busy, [true, false]);
}

{
  const { calls, wallet } = setup();
  let opened = false;
  wallet.props.onClick({ resolve: () => { opened = true; }, reject: () => assert.fail("Wallet was rejected") });
  assert.equal(opened, true);
  wallet.props.onCancel();
  assert.deepEqual(calls.busy, [true, false]);
}

{
  const { calls, wallet, walletEvent } = setup();
  wallet.props.onConfirm(walletEvent);
  await tick();
  assert.equal(calls.successes, 1);
  assert.equal(calls.walletErrors.length, 0);
}

{
  const { calls, form } = setup({ confirm: async () => ({ paymentIntent: { status: "requires_payment_method" } }) });
  form.props.onSubmit({ preventDefault() {} });
  await tick();
  assert.equal(calls.successes, 0);
  assert.match(calls.errors.at(-1), /not completed/);
  assert.deepEqual(calls.busy, [true, false]);
}

{
  const { calls, form } = setup({ confirm: async () => ({ paymentIntent: { status: "processing" } }) });
  form.props.onSubmit({ preventDefault() {} });
  await tick();
  assert.equal(calls.successes, 1);
}

{
  const { calls, form } = setup({ confirm: async () => { throw new Error("Network error"); } });
  form.props.onSubmit({ preventDefault() {} });
  await tick();
  assert.match(calls.errors.at(-1), /do not retry/);
  assert.deepEqual(calls.busy, [true]);
}

{
  const { calls, form } = setup({ success: async () => { throw new Error("Order lookup failed"); } });
  form.props.onSubmit({ preventDefault() {} });
  await tick();
  assert.match(calls.errors.at(-1), /do not retry/);
  assert.deepEqual(calls.busy, [true]);
}

{
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  const { calls, form } = setup({ confirm: () => pending });
  form.props.onSubmit({ preventDefault() {} });
  form.props.onSubmit({ preventDefault() {} });
  await tick();
  assert.equal(calls.confirmations.length, 1);
  release({ paymentIntent: { status: "succeeded" } });
  await tick();
  assert.equal(calls.successes, 1);
}

console.log("Stripe payment form tests passed.");
