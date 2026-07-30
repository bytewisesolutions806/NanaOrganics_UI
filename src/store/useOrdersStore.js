import { create } from "zustand";
import { fetchUserOrderByIdApi, fetchUserOrdersApi } from "@/service/OrdersService";

const useOrdersStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetchUserOrdersApi();
      set({ orders: response.data?.orders || [], loading: false });
    } catch (error) {
      set({ error: error.message || "Failed to load orders", loading: false });
    }
  },

  refreshOrders: async () => {
    try {
      const response = await fetchUserOrdersApi();
      set({ orders: response.data?.orders || [], error: null });
    } catch (error) {
      set({ error: error.message || "Failed to refresh orders" });
    }
  },

  fetchOrderById: async (orderId, { force = false } = {}) => {
    if (!orderId) return null;
    const current = get().orders.find((item) => String(item.id) === String(orderId));
    if (current && !force) return current;
    try {
      const response = await fetchUserOrderByIdApi(orderId);
      const order = response.data?.order || null;
      if (order) {
        set((state) => ({
          orders: current
            ? state.orders.map((item) =>
                String(item.id) === String(orderId) ? order : item
              )
            : [...state.orders, order],
        }));
      }
      return order;
    } catch (error) {
      set({ error: error.message || "Failed to load order" });
      return null;
    }
  },

  clearOrders: () => set({ orders: [], error: null }),
}));

export default useOrdersStore;
