import { create } from "zustand";
import { ordersFilterMock } from "@/mocks/ordersFilter.mock";

/** Static filter definitions — no backend endpoint required */
const y = new Date().getFullYear();
const defaultFilters = {
  status: [
    { id: "confirmed", label: "Confirmed" },
    { id: "on_the_way", label: "On the way" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
    { id: "returned", label: "Returned" },
  ],
  orderTime: [
    { id: "this_week", label: "This Week" },
    { id: "last_30_days", label: "Last 30 Days" },
    { id: `year_${y}`, label: String(y) },
    { id: "older", label: "Older" },
  ],
};

const useOrdersFilterStore = create((set) => ({
  filters: null,
  loading: false,
  selectedFilters: {
    status: [],
    orderTime: [],
  },

  fetchFilters: async () => {
    set({ loading: true });

    try {
      set({
        filters: ordersFilterMock || defaultFilters,
        loading: false,
      });
    } catch (error) {
      console.error("Filter load error:", error);
      set({ filters: defaultFilters, loading: false });
    }
  },

  toggleFilter: (type, value) =>
    set((state) => {
      const current = state.selectedFilters[type] || [];

      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      return {
        selectedFilters: {
          ...state.selectedFilters,
          [type]: updated,
        },
      };
    }),

  clearFilters: () =>
    set({
      selectedFilters: {
        status: [],
        orderTime: [],
      },
    }),
}));

export default useOrdersFilterStore;
