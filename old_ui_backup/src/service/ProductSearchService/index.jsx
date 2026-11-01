import { getProductsBySubcategoryMock } from "@/mocks/products.mock";

export const searchProducts = async (params = {}) => {
  const page = Math.floor((params.offset || 0) / (params.limit || 12)) + 1;
  const response = getProductsBySubcategoryMock({
    subcategoryHandle: params.category || "organic-foods",
    page,
    limit: params.limit || 12,
  });

  let products = response.data.products;
  if (params.q) {
    const query = params.q.toLowerCase();
    products = products.filter((product) =>
      product.title.toLowerCase().includes(query)
    );
  }

  return {
    ...response,
    data: {
      ...response.data,
      products,
      aggregations: response.data.filters,
    },
  };
};
