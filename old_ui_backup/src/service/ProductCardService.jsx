import honey from "@/assets/images/products/honey.png";
import product02 from "@/assets/images/products/product_image_02.png";
import product03 from "@/assets/images/products/product_image_03.png";
import product04 from "@/assets/images/products/product_image_04.png";
import product05 from "@/assets/images/products/product_image_05.png";
export const products = Array.from({ length: 100 }, (_, index) => {
  const images = [honey, product02, product03, product04, product05];
  const id = index + 1;

  const isTrending = id % 5 === 0;
  const isFeatured = id % 7 === 0;
  const isNewArrival = id > 85;

  // ✅ Base index
  let imageIndex = index;

  // ✅ Shift image order based on tag
  if (isFeatured) {
    imageIndex += 2; // stronger offset
  } else if (isTrending) {
    imageIndex += 1; // lighter offset
  }

  const image = images[imageIndex % images.length];

  return {
    id: `prod_${String(id).padStart(3, "0")}`,
    title: `Organic Product ${id}`,
    price: 10 + (id % 5) * 2,
    oldPrice: 15 + (id % 3) * 2,
    discount: "Save 15%",
    weightOptions: [
      { label: "1kg", value: "1kg" },
      { label: "500g", value: "500g" },
    ],
    reviews: Math.floor(Math.random() * 500),
    rating: Math.floor(Math.random() * 2) + 4,

    image,
    isTrending,
    isFeatured,
    isNewArrival,
  };
});
