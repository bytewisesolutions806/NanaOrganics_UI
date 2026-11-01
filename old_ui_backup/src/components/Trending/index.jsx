"use client";
import { useHomeStore } from "@/store/HomeStore";
import ProductSlider from "@/components/ProductSlider";

export default function Trending() {
  const trendingNow = useHomeStore((state) => state.trendingNow);
  console.log("Trending Component - trendingNow:", trendingNow);

  return (
    <>
      {trendingNow && (
        <ProductSlider
          title={trendingNow.title}
          subtitle={trendingNow.description}
          products={trendingNow.products}
          browseLink={`/collections/${trendingNow.handle}`}
          bgClass=""
          sectionClass="w-full mt-10 mb-16"
        />
      )}
    </>
  );
}
