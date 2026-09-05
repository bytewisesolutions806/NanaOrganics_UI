# Guest checkout

Visitors can add products and check out without creating an account. The Shop
API client preserves the Vendure session with `credentials: 'include'`; the
local cart ID is only a UI reference and does not authorize access to an order.

Checkout saves guest contact details with `setCustomerForOrder` before saving
addresses and requesting shipping. Both Cash on Delivery and Stripe use this
prepared active order. Signed-in customers retain their existing customer and
saved-address flow. Guest confirmation and Stripe return pages do not request
the account-only order history.

The backend's default Vendure guest checkout policy remains in effect: an email
belonging to a registered account requires sign-in. The checkout displays an
actionable message for that response. No user account or password is created by
guest checkout.

## Verification

Run `node scripts/test-guest-checkout.cjs` and `npm run build` from the UI project.
The regression script mocks the API; it does not submit real orders or payments.

With Vendure running, test in a private browser window:

1. Add an item without signing in and reload the cart to check session persistence.
2. Open checkout and enter a new email and delivery address.
3. Get shipping options, select shipping, and continue to payment.
4. Use a test payment configuration to complete COD or Stripe checkout and verify
   that the order has the guest contact details and that confirmation works.
5. Repeat with a registered email and verify the sign-in guidance.
6. Sign in and verify saved addresses and the existing checkout still work.

Deployments must allow credentialed requests from the storefront origin and
preserve the Shop API cookie. Guest order history or email-verification-based
tracking is a separate feature; guests should retain their order reference.
