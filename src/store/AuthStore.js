import { create } from "zustand";
import { clearShopApiCache } from '@/lib/graphql/client';
import {
  clearStoredAuthSession,
  getStoredAccessToken,
  getStoredCustomer,
  publishAuthEvent,
  storeAuthSession,
} from '@/lib/authSession';
import { fetchProfileApi } from '@/service/ProfileService';
import { logoutUser } from '@/service/AuthService';

let hydrationRequest = null;

function clearClientAuthState(set) {
  if (typeof window !== "undefined") {
    clearStoredAuthSession();
    sessionStorage.removeItem("cart_id");
    sessionStorage.removeItem("pendingPasswordReset");
  }

  clearShopApiCache();
  set({
    token: null,
    customer: null,
    cartId: null,
    isAuthenticated: false,
    hasHydrated: true,
    pendingVerification: null,
    pendingPasswordReset: null,
  });
}

const useAuthStore = create((set, get) => ({
  // ✅ AUTHENTICATED STATE
  token: null,
  customer: null,
  cartId: null,
  isAuthenticated: false,
  hasHydrated: false,

  // ✅ PENDING SIGNUP VERIFICATION
  pendingVerification: null,

  // ✅ PENDING FORGOT PASSWORD
  pendingPasswordReset: null,

  // ✅ SAVE SIGNUP VERIFICATION INFO
  setPendingVerification: (data) =>
    set({
      pendingVerification: data,
    }),

  // ✅ SAVE FORGOT PASSWORD INFO
  setPendingPasswordReset: (data) =>
    set(() => {
      if (typeof window !== "undefined") {
        if (data) {
          sessionStorage.setItem("pendingPasswordReset", JSON.stringify(data));
        } else {
          sessionStorage.removeItem("pendingPasswordReset");
        }
      }
      return { pendingPasswordReset: data };
    }),

  // ✅ CLEAR RESET STATE
  clearPendingPasswordReset: () =>
    set(() => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pendingPasswordReset");
      }
      return { pendingPasswordReset: null };
    }),

  // ✅ LOGIN AFTER OTP VERIFICATION
  login: (token, customer, cartIdFromServer) => {
    if (typeof window !== "undefined") {
      storeAuthSession({ token, customer });
      sessionStorage.removeItem("pendingPasswordReset");
    }
    // Prefer server cart; keep guest cart_id in session if user had items before login
    const storedCartId = typeof window !== "undefined" ? sessionStorage.getItem("cart_id") : null;
    const cartId = cartIdFromServer || storedCartId || null;
    if (cartId && typeof window !== "undefined") {
      sessionStorage.setItem("cart_id", cartId);
    }

    clearShopApiCache();

    set({
      token,
      customer,
      cartId,
      isAuthenticated: true,
      hasHydrated: true,
      pendingVerification: null,
      pendingPasswordReset: null,
    });
  },

  /** Merge profile fields into stored customer after GET/PUT /user/profile */
  setCustomer: (customer) => {
    if (typeof window !== "undefined" && customer) {
      storeAuthSession({ token: get().token || getStoredAccessToken(), customer });
    }
    set({ customer });
  },

  /** Keep auth + sessionStorage in sync when cart changes (add-to-cart, fetch) */
  setCartId: (cartId) => {
    if (typeof window !== "undefined") {
      if (cartId) {
        sessionStorage.setItem("cart_id", cartId);
      } else {
        sessionStorage.removeItem("cart_id");
      }
    }
    set({ cartId: cartId || null });
  },

  // ✅ HYDRATE SESSION
  hydrate: async () => {
    if (typeof window === "undefined") return;
    if (hydrationRequest) return hydrationRequest;

    hydrationRequest = (async () => {
      const token = getStoredAccessToken();
      const customer = getStoredCustomer();
      const cartId = sessionStorage.getItem("cart_id");
      const pendingPasswordResetValue = sessionStorage.getItem("pendingPasswordReset");
      let pendingPasswordReset = null;

      if (pendingPasswordResetValue) {
        try {
          pendingPasswordReset = JSON.parse(pendingPasswordResetValue);
        } catch {
          sessionStorage.removeItem("pendingPasswordReset");
        }
      }

      if (token && customer) {
        storeAuthSession({ token, customer });
        set({
          token,
          customer,
          cartId,
          pendingPasswordReset,
          isAuthenticated: true,
          hasHydrated: true,
        });
        return;
      }

      // sessionStorage is isolated per tab. Recover the shared Vendure
      // session from its HttpOnly cookie for new tabs and remembered sessions.
      try {
        const profileResponse = await fetchProfileApi();
        const cookieCustomer = profileResponse?.data?.customer;
        if (profileResponse?.success && cookieCustomer) {
          storeAuthSession({ token: null, customer: cookieCustomer });
          clearShopApiCache();
          set({
            token: null,
            customer: cookieCustomer,
            cartId,
            pendingPasswordReset,
            isAuthenticated: true,
            hasHydrated: true,
          });
          return;
        }
      } catch {
        // No valid Vendure cookie exists for this browser session.
      }

      // A login may have completed while the cookie check was in flight.
      if (get().isAuthenticated) return;

      clearStoredAuthSession();
      set({
        token: null,
        customer: null,
        cartId,
        pendingPasswordReset,
        isAuthenticated: false,
        hasHydrated: true,
      });
    })().finally(() => {
      hydrationRequest = null;
    });

    return hydrationRequest;
  },

  // ✅ LOGOUT
  logout: async () => {
    const serverLogout = logoutUser().catch(() => null);
    clearClientAuthState(set);
    await serverLogout;
    publishAuthEvent('logout');
  },

  logoutFromAnotherTab: () => clearClientAuthState(set),
}));

export default useAuthStore;
