import { create } from "zustand";
import { getProductById } from "@/service/Product";

const useProductStore = create((set, get) => ({
  product: null,
  loading: false,
  error: null,
  fetchedId: null, // 👈 prevents refetch loop

  fetchProduct: async (productId) => {
  console.log("fetchProduct called with:", productId);

  if (get().fetchedId === productId) {
    console.log("Already fetched, skipping");
    return;
  }

  set({ loading: true, error: null });

  try {
    const response = await getProductById(productId);

    console.log("Product data response:", response);

    if (!response?.success) {
      throw new Error("Product not found");
    }

    set({
      product: response.data,
      loading: false,
      fetchedId: productId,
    });
  } catch (err) {
    console.error("fetchProduct error:", err);
    set({
      loading: false,
      error: err.message || "Failed to load product",
    });
  }
},


  resetProduct: () =>
    set({
      product: null,
      loading: false,
      error: null,
      fetchedId: null,
    }),
}));

export default useProductStore;
