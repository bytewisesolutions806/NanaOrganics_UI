export const normalizeProducts = (products) =>
  products.map((product, index) => ({
    id: index + 1,
    ...product,
    weightOptions: product.weightOptions.map((w) =>
      typeof w === "string" ? { label: w, value: w } : w
    ),
  }));
