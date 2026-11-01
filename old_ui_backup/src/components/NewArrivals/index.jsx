"use client";
import { useHomeStore } from "@/store/HomeStore";
import ProductSlider from "@/components/ProductSlider";

export default function newArrivals() {
  const newArrivals = useHomeStore((state) => state.newArrivals);
  console.log("Trending Component - newArrivals:", newArrivals);

  return (
    <>
      {newArrivals && (
        <ProductSlider
          title={newArrivals.title}
          subtitle={newArrivals.description}
          products={newArrivals.products}
          browseLink={`/collections/${newArrivals.handle}`}
          bgClass=""
          sectionClass="w-full bg-[#E6F4F2] pt-16 mt-20  pb-16 mb-16"
        />
      )}
    </>
  );
}
