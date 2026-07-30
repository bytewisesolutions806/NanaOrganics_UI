import { create } from "zustand";
import {
    fetchCartApi,
    addToCartApi,
    updateCartItemApi,
    deleteCartItemApi,
    clearCartApi,
} from "@/service/CartService";
import useAuthStore from "@/store/AuthStore";

const useCartStore = create((set, get) => ({
    // ======================
    // STATE
    // ======================
    cartId: null,
    currency_code: null,
    items: [],
    pricing: null,
    itemCount: 0,
    totalQuantity: 0,
    loading: false,

    // 🔥 per-variant loader (KEY FIX)
    addingVariantId: null,

    error: null,

    // 👇 Used by PrimeReact Toast listener
    lastAction: null,

    setCartFromApi: (cart) => {
        if (!cart) {
            useAuthStore.getState().setCartId(null);
            set({
                cartId: null,
                currency_code: null,
                items: [],
                pricing: null,
                itemCount: 0,
                totalQuantity: 0,
                loading: false,
            });
            return;
        }

        useAuthStore.getState().setCartId(cart.id);
        set({
            cartId: cart.id,
            currency_code: cart.currency_code || null,
            items: cart.items || [],
            pricing: cart.pricing || null,
            itemCount: cart.item_count || 0,
            totalQuantity: cart.total_quantity || 0,
            loading: false,
        });
    },

    // ======================
    // FETCH CART
    // ======================
    fetchCart: async() => {
        try {
            set({ error: null, loading: true });

            const cart = await fetchCartApi();
            get().setCartFromApi(cart);
        } catch (err) {
            set({
                error: err.message || "Failed to fetch cart",
                loading: false,
            });
        }
    },

    // ======================
    // ADD TO CART
    // ======================
    addToCart: async({ variant_id, quantity }) => {
        // Check for the user is logged in or not

        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
            window.location.href = '/login'
            return
        }

        // 🛑 prevent double-click / parallel add
        if (get().addingVariantId) return;

        try {
            set({
                addingVariantId: variant_id,
                error: null,
                lastAction: null,
            });

            const prevCartId =
                get().cartId ||
                (typeof window !== "undefined"
                    ? sessionStorage.getItem("cart_id")
                    : null);

            const result = await addToCartApi({
                variant_id,
                quantity,
                cart_id: prevCartId || undefined,
            });

            if (!result?.cart) {
                throw new Error("Add to cart returned no active order.");
            }
            get().setCartFromApi(result.cart);

            set({
                addingVariantId: null,
                lastAction: "ADD_SUCCESS",
            });
        } catch (err) {
            set({
                addingVariantId: null,
                error: err.message || "Failed to add item",
                lastAction: "ADD_ERROR",
            });
        }
    },

    // ======================
    // UPDATE CART ITEM
    // ======================
    updateCart: async({ item_id, quantity }) => {
        try {
            set({ error: null, lastAction: null });

            const cart = await updateCartItemApi({ item_id, quantity });
            get().setCartFromApi(cart);

            set({
                lastAction: "UPDATE_SUCCESS",
            });
        } catch (err) {
            set({
                error: err.message || "Failed to update cart",
                lastAction: "UPDATE_ERROR",
            });
        }
    },

    // ======================
    // DELETE CART ITEM
    // ======================
    deleteItemsFromCart: async(item_id) => {
        try {
            set({ error: null, lastAction: null });

            const cart = await deleteCartItemApi(item_id);
            get().setCartFromApi(cart);

            set({
                lastAction: "DELETE_SUCCESS",
            });
        } catch (err) {
            set({
                error: err.message || "Failed to remove item",
                lastAction: "DELETE_ERROR",
            });
        }
    },

    // ======================
    // CLEAR ACTIVE CART
    // ======================
    clearCart: async() => {
        try {
            set({ error: null, loading: true, lastAction: null });
            const cart = await clearCartApi();

            set({
                cartId: cart?.id || get().cartId,
                currency_code: cart?.currency_code || get().currency_code,
                items: cart?.items || [],
                pricing: cart?.pricing || null,
                itemCount: cart?.item_count || 0,
                totalQuantity: cart?.total_quantity || 0,
                loading: false,
                lastAction: "CLEAR_SUCCESS",
            });
        } catch (err) {
            set({
                error: err.message || "Failed to clear cart",
                loading: false,
                lastAction: "CLEAR_ERROR",
            });
        }
    },

    // ======================
    // CLEAR TOAST ACTION
    // ======================
    clearLastAction: () => set({ lastAction: null }),

    // ======================
    // RESET CART (LOGOUT)
    // ======================
    resetCart: () => {
        useAuthStore.getState().setCartId(null);
        set({
            cartId: null,
                    currency_code: null,
            items: [],
            pricing: null,
            itemCount: 0,
            totalQuantity: 0,
            loading: false,
            addingVariantId: null,
            error: null,
            lastAction: null,
        });
    },
}));

export default useCartStore;
