"use client";
import { useHomeStore } from "@/store/HomeStore";
import ProductSlider from "@/components/ProductSlider";

export default function FeaturedCollections() {
  const featuredCollections = useHomeStore(
    (state) => state.featuredCollections
  );
  console.log("Trending Component - featuredCollections:", featuredCollections);

  return (
    <>
      {featuredCollections && (
        <ProductSlider
          title={featuredCollections.title}
          subtitle={featuredCollections.description}
          products={featuredCollections.products}
          browseLink={`/collections/${featuredCollections.handle}`}
          bgClass=""
          sectionClass="w-full mt-12 mb-16"
        />
      )}
    </>
  );
}
