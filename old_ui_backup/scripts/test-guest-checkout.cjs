const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { create } = require('zustand');

function load(relativePath, dependencies, globals = {}) {
  const filename = path.join(__dirname, '..', relativePath);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    ...globals,
  }, { filename });
  return exports;
}

async function main() {
  const calls = [];
  let result = { __typename: 'Order', id: 'guest-order' };
  const service = load('src/service/CartService/index.jsx', {
    '@/lib/defaultImage': { DEFAULT_IMAGE: '/placeholder.png' },
    '@/lib/graphql/client': {
      async shopApiRequest(document, variables) {
        calls.push({ document, variables });
        if (document.includes('mutation SetGuestCustomer')) return { setCustomerForOrder: result };
        return { activeOrder: { id: 'guest-order', state: 'AddingItems', lines: [] } };
      },
    },
  });
  const input = { email: ' guest@example.com ', first_name: ' Guest ', last_name: ' Buyer ', phone: ' 1234567890 ' };
  await service.setGuestCustomerApi(input);
  assert.equal(calls.at(-1).variables.input.emailAddress, 'guest@example.com');
  assert.equal(calls.at(-1).variables.input.firstName, 'Guest');
  assert.equal(calls.at(-1).variables.input.phoneNumber, '1234567890');

  result = { __typename: 'EmailAddressConflictError', message: 'Conflict' };
  await assert.rejects(service.setGuestCustomerApi(input), /Please sign in/);
  result = { __typename: 'GuestCheckoutError', message: 'Guest checkout disabled' };
  await assert.rejects(service.setGuestCustomerApi(input), /Guest checkout disabled/);
  result = { __typename: 'AlreadyLoggedInError' };
  await service.setGuestCustomerApi(input);
  result = null;
  await assert.rejects(service.setGuestCustomerApi(input), /returned no order/);

  let cartId;
  const cart = { id: 'guest-order', items: [{ id: 'line-1' }], total_quantity: 1 };
  const window = { location: { href: '/shop' } };
  const store = load('src/store/useCartStore.js', {
    zustand: { create },
    '@/store/AuthStore': { default: { getState: () => ({ isAuthenticated: false, setCartId: id => { cartId = id; } }) } },
    '@/service/CartService': { addToCartApi: async () => ({ cart }), fetchCartApi: async () => cart },
  }, { window, sessionStorage: { getItem: () => null } }).default;
  await store.getState().addToCart({ variant_id: 'variant-1', quantity: 1 });
  assert.equal(window.location.href, '/shop');
  assert.equal(store.getState().lastAction, 'ADD_SUCCESS');
  assert.equal(cartId, 'guest-order');
  store.getState().resetCart();
  await store.getState().fetchCart();
  assert.equal(store.getState().items.length, 1);
  console.log('PASS: guest cart creation/restoration, contact attachment, registered-email errors, session recovery, and API failures.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
