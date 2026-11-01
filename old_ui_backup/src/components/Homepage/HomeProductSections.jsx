import ProductSlider from '@/components/ProductSlider';
import ProductSliderSkeleton from '@/components/ProductSlider/ProductSkeleton';

export default function HomeProductSections({ collections, loading }) {
  if (loading && collections.length === 0) {
    return (
      <>
        {Array.from({ length: 2 }, (_, index) => (
          <ProductSliderSkeleton key={index} />
        ))}
      </>
    );
  }

  return collections.map((collection, index) => (
    <ProductSlider
      key={collection.id}
      title={collection.title}
      eyebrow={collection.id === 'featured' ? 'Featured products' : undefined}
      subtitle={collection.description}
      products={collection.products}
      browseLink="/shop"
      bgClass={index % 2 === 1 ? 'bg-[#F8FAF7]' : ''}
      sectionClass="w-full py-9 sm:py-12 lg:py-14"
      designVariant="figma"
    />
  ));
}
