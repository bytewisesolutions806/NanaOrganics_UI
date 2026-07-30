export const mapListProductToDetail = (product) => {
  return {
    id: product.id,
    name: product.title,
    handle: product.handle,

    categoryHandle: product.categoryHandle,
    subcategoryHandle: product.subcategoryHandle,

    brand: {
      name: "Pure Tree",
      slug: "pure-tree",
    },

    badges: ["Vegetarian", "Gluten-Free", "Organic"],

    images: {
      main: product.thumbnail,
      gallery: [
        product.thumbnail,
        product.thumbnail,
        product.thumbnail,
      ],
    },

    variants: product.weightOptions.map((opt, index) => ({
      id: opt.value,
      label:
        opt.value === "1kg"
          ? "1 Kg"
          : `${opt.value.replace("g", "")} Grams`,
      price: product.price + index * 200,
      mrp: product.original_price + index * 250,
      stock: 10 - index * 2,
      isDefault: index === 1, // 500g default
      isPopular: index === 1,
    })),

    pricing: {
      currency: "INR",
    },

    ratings: {
      average: product.rating,
      totalReviews: product.reviews_count,
    },

    description: [
      {
        title: "PURE WILD FOREST ORGANIC RAW HONEY",
        description:
          "Sourced from deep forest regions where bees feed on wildflowers and medicinal flora.",
      },
      {
        title: "TASTE & AROMA",
        description:
          "Rich aroma with a naturally sweet taste preserved without heating.",
      },
    ],

    delivery: {
      estimated: "3–5 business days",
      cashOnDelivery: true,
    },

    policies: {
      returnWindowDays: 30,
      moneyBackGuarantee: true,
    },

    stock: {
      status: product.in_stock ? "IN_STOCK" : "OUT_OF_STOCK",
      quantityLeft: product.in_stock ? 12 : 0,
      message: product.in_stock
        ? "Hurry! Stock is running out"
        : "Currently unavailable",
    },
  };
};
