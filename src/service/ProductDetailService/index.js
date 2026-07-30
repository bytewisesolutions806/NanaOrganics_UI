import honey_image_01 from "../../assets/images/ProductImages/honey_image_01.png";
import honey_image_02 from "../../assets/images/ProductImages/honey_image_02.png";
import honey_image_03 from "../../assets/images/ProductImages/honey_image_03.png";
import honey_image_04 from "../../assets/images/ProductImages/honey_image_04.png";
import honey_image_05 from "../../assets/images/ProductImages/honey_image_05.png";
import honey_image_06 from "../../assets/images/ProductImages/honey_image_06.png";

export const products = [
  {
    id: 2001,
    name: "Wild Forest Organic Honey",
    slug: "wild-forest-organic-honey-500g",

    categorySlug: "home-essentials",
    subcategorySlug: "organic-foods",

    brand: {
      name: "Pure Tree",
      slug: "pure-tree",
    },

    badges: ["Vegetarian", "Gluten-Free", "Organic"],

    // ✅ PRODUCT IMAGES
    images: {
      main: honey_image_01,
      gallery: [
        honey_image_02,
        honey_image_03,
        honey_image_04,
        honey_image_05,
        honey_image_06,
      ],
      // Optional: variant-specific images
      byVariant: {
        "350g": [honey_image_04, honey_image_02],
        "500g": [honey_image_02, honey_image_06, honey_image_02],
        "1kg": [honey_image_02, honey_image_05, honey_image_01],
      },
    },

    stock: {
      status: "IN_STOCK",
      quantityLeft: 12,
      message: "Hurry! Stock is running out",
    },

    tags: [
      "Gluten-Free Flours",
      "Organic Flours",
      "Baking Essentials",
      "Healthy Baking",
    ],

    highlights: {
      itemForm: "Organic",
      netQuantity: "500 Grams",
      dietType: "Vegetarian",
    },

    description: [
      {
        title: "PUREWILD FOREST ORGANIC RAW HONEY",
        description:
          "Sourced from deep forest regiions where bees feed on naturally growing wildflowers and medicinal flora. this honey is completely raw, unprocessed, and unheated, ensuring you reeive all its natural enzymes,pollen and nutrients.",
      },
      {
        title: "TASTE & AROMA",
        description:
          "Sourced from deep forest regiions where bees feed on naturally growing wildflowers and medicinal flora. this honey is completely raw, unprocessed, and unheated, ensuring you reeive all its natural enzymes,pollen and nutrients.",
      },
      {
        title: "HEALTH BENEFITS",
        description:
          "Sourced from deep forest regiions where bees feed on naturally growing wildflowers and medicinal flora. this honey is completely raw, unprocessed, and unheated, ensuring you reeive all its natural enzymes,pollen and nutrients.",
      },
    ],

    variants: [
      {
        id: "350g",
        label: "350 Grams",
        price: 599,
        mrp: 349,
        stock: 10,
        pricePerUnit: "79.00/100g",
        deliveryText: "FREE delivery in 2 days",
      },
      {
        id: "500g",
        label: "500 Grams",
        price: 399,
        mrp: 449,
        stock: 12,
        isDefault: true,
        isPopular: true,
        pricePerUnit: "79.00/100g",
        deliveryText: "FREE delivery in 4 days",
      },
      {
        id: "1kg",
        label: "1 Kg",
        price: 749,
        mrp: 899,
        stock: 5,
        pricePerUnit: "79.00/100g",
        deliveryText: "FREE delivery in 2 days",
      },
    ],

    pricing: {
      currency: "INR",
    },

    delivery: {
      estimated: "3-5 business days",
      cashOnDelivery: true,
    },

    policies: {
      returnWindowDays: 30,
      moneyBackGuarantee: true,
    },

    ratings: {
      average: 5,
      totalReviews: 13245,
    },

    reviews: [
      {
        id: 1,
        userName: "Anjali R",
        rating: 5,
        title: "Very pure and natural",
        comment: "You can feel the purity. Flavor is amazing.",
        createdAt: "2025-01-10",
      },
    ],

    seo: {
      title: "Wild Forest Organic Honey 500g | Pure Tree",
      description:
        "Buy Pure Tree Wild Forest Organic Honey 500g. 100% natural & nutritious.",
    },

    createdAt: "2024-12-01",
  },

  {
    id: 2002,
    name: "Keratin Repair Shampoo",
    slug: "keratin-repair-shampoo",
    categorySlug: "hair-care",
    subcategorySlug: "shampoo",

    brand: "Natura Herbs",

    price: {
      selling: 399,
      mrp: 499,
      currency: "INR",
    },

    ratings: {
      average: 4.4,
      count: 13425,
    },

    delivery: {
      estimated: "3-5 business days",
    },

    createdAt: "2024-12-15",
  },

  {
    id: 2003,
    name: "Aloe Vera Face Wash",
    slug: "aloe-vera-face-wash",
    categorySlug: "skin-care",
    subcategorySlug: "face-wash",

    brand: "Green Essence",

    price: {
      selling: 299,
      mrp: 349,
      currency: "INR",
    },

    ratings: {
      average: 4.6,
      count: 9821,
    },

    createdAt: "2024-11-20",
  },
];

//  {/* ✅ Price */}
//           <p className="text-2xl font-bold text-green-700 mb-4">
//             ₹
//             {productData.price?.selling ??
//               productData.variants?.find((v) => v.isDefault)?.price}
//           </p>

//           {/* ✅ Stock */}
//           {productData.stock?.message && (
//             <p className="text-red-600 mb-3">{productData.stock.message}</p>
//           )}

//           {/* ✅ Variants */}
//           {productData.variants && (
//             <div className="mb-4">
//               <p className="font-medium mb-2">Size:</p>
//               <div className="flex gap-2">
//                 {productData.variants.map((variant) => (
//                   <button
//                     key={variant.id}
//                     className={`border px-3 py-1 rounded ${
//                       variant.isDefault ? "border-black" : "border-gray-300"
//                     }`}
//                   >
//                     {variant.label}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* ✅ Highlights */}
//           {productData.description?.aboutThisItem && (
//             <ul className="list-disc pl-5 text-gray-700">
//               {productData.description.aboutThisItem.map((item, idx) => (
//                 <li key={idx}>{item}</li>
//               ))}
//             </ul>
//           )}
