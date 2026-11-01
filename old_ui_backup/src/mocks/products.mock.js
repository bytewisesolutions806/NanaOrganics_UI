import { mapListProductToDetail } from "./productDetail.mock";

export const getProductsBySubcategoryMock = ({
  subcategoryHandle,
  page = 1,
  limit = 12,
}) => {
  const TOTAL_PRODUCTS = 38;

  // 🔹 Parent category (from your real API example)
  const CATEGORY_HANDLE = "home-essentials";
  const CATEGORY_NAME = "Home Essentials";

  const products = Array.from(
    { length: Math.min(limit, TOTAL_PRODUCTS) },
    (_, index) => {
      const id = index + 1;
      const price = 50 + id * 10;
      const originalPrice = price + 20;

      return {
        // ================= IDENTIFIERS =================
        id: `prod_mock_${subcategoryHandle}_${id}`,
        handle: `organic-${subcategoryHandle}-${id}`,

        // ================= ROUTING (VERY IMPORTANT) =================
        categoryHandle: CATEGORY_HANDLE,
        subcategoryHandle: subcategoryHandle,

        // ================= DISPLAY =================
        title: `Organic ${subcategoryHandle
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())} ${id}`,
        description: "",
        thumbnail:
          "https://devadmin.nanaorganics.co/static/1767646951610-d63717e7860cd80d77bd6559d6297db1894a131a%20(1).png",

        // ================= PRICING =================
        price,
        original_price: originalPrice,
        discount: Math.round(
          ((originalPrice - price) / originalPrice) * 100
        ),
        currency: "USD",

        // ================= META =================
        rating: Math.floor(Math.random() * 2) + 4,
        reviews_count: Math.floor(Math.random() * 200),
        in_stock: id % 5 !== 0,
        badge:
          id % 6 === 0
            ? "Best Seller"
            : id % 4 === 0
            ? "Trending"
            : null,

        // ================= VARIANTS =================
        weightOptions: [
          { label: "250g", value: "250g" },
          { label: "500g", value: "500g" },
          { label: "1kg", value: "1kg" },
        ],

        // ================= AUDIT =================
        created_at: new Date().toISOString(),
      };
    }
  );

  return {
    success: true,
    data: {
      // ================= SUBCATEGORY =================
      subcategory: {
        id: `pcat_mock_${subcategoryHandle}`,
        name: subcategoryHandle
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        handle: subcategoryHandle,
        description: "",
        parent_category: {
          id: "pcat_mock_parent",
          name: CATEGORY_NAME,
          handle: CATEGORY_HANDLE,
        },
      },

      // ================= PRODUCTS =================
      products,

      // ================= PAGINATION =================
      pagination: {
        page,
        limit,
        total: TOTAL_PRODUCTS,
        total_pages: Math.ceil(TOTAL_PRODUCTS / limit),
        has_next: page * limit < TOTAL_PRODUCTS,
        has_prev: page > 1,
      },

      // ================= FILTERS =================
      filters: {
        price_range: {
          min: 50,
          max: 50 + TOTAL_PRODUCTS * 10,
        },
        ratings: [5, 4, 3, 2, 1],
      },

      // ================= SORT OPTIONS =================
      sort_options: [
        { value: "featured", label: "Featured" },
        { value: "newest", label: "Newest First" },
        { value: "price_asc", label: "Price: Low to High" },
        { value: "price_desc", label: "Price: High to Low" },
        { value: "rating", label: "Highest Rated" },
        { value: "best_selling", label: "Best Selling" },
      ],
    },
  };
};

export const getProductByIdMock = (productId) => {
  const POSSIBLE_SUBCATEGORIES = [
    "organic-foods",
    "hair-care",
    "skin-care",
    "baby-care",
  ];

  for (const subcategoryHandle of POSSIBLE_SUBCATEGORIES) {
    const response = getProductsBySubcategoryMock({
      subcategoryHandle,
      limit: 50,
    });

    const product = response.data.products.find(
      (p) => p.id === productId
    );

    if (product) {
      return {
        success: true,
        data: mapListProductToDetail(product),
      };
    }
  }

  return { success: false };
};


