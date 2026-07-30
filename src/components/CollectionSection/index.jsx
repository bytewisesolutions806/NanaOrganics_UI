'use client';

import ProductSlider from '@/components/ProductSlider';

export default function CollectionsSection({ collection }) {
  if (!collection?.products?.length) return null;

  return (
    <ProductSlider
      title={collection.title}
      subtitle={collection.description}
      products={collection.products}
      browseLink="/shop"
      bgClass=""
      sectionClass="w-full mt-10 mb-16"
    />
  );
}
