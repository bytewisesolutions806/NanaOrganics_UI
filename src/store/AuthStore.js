import { create } from "zustand";

const useAuthStore = create((set) => ({
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
      sessionStorage.setItem("accessToken", token);
      sessionStorage.setItem("customer", JSON.stringify(customer));
      sessionStorage.removeItem("pendingPasswordReset");
    }
    // Prefer server cart; keep guest cart_id in session if user had items before login
    const storedCartId = typeof window !== "undefined" ? sessionStorage.getItem("cart_id") : null;
    const cartId = cartIdFromServer || storedCartId || null;
    if (cartId && typeof window !== "undefined") {
      sessionStorage.setItem("cart_id", cartId);
    }

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
      sessionStorage.setItem("customer", JSON.stringify(customer));
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
  hydrate: () => {
    if (typeof window === "undefined") return;

    const token = sessionStorage.getItem("accessToken");
    const customer = sessionStorage.getItem("customer");
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
      try {
        set({
          token,
          customer: JSON.parse(customer),
          cartId,
          pendingPasswordReset,
          isAuthenticated: true,
          hasHydrated: true,
        });
        return;
      } catch {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("customer");
      }
    }

    set({
      token: null,
      customer: null,
      cartId,
      pendingPasswordReset,
      isAuthenticated: false,
      hasHydrated: true,
    });
  },

  // ✅ LOGOUT
  logout: () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }

    set({
      token: null,
      customer: null,
      cartId: null,
      isAuthenticated: false,
      hasHydrated: true,
      pendingVerification: null,
      pendingPasswordReset: null,
    });
  },
}));

export default useAuthStore;
