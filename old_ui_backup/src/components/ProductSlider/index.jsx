'use client';

import ProductCarousel from '@/components/ProductCarousel';

export default function ProductSlider({
  title,
  subtitle,
  products = [],
  browseLink = '/shop',
  bgClass = '', // 👈 NEW
  sectionClass = '',
  designVariant = 'figma',
  eyebrow,
  browseLabel,
  showBrowse = true,
  cardVariant,
  breakpoints,
  renderProduct,
}) {
  return (
    <ProductCarousel
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      products={products}
      browseLink={browseLink}
      browseLabel={browseLabel || (designVariant === 'figma' ? 'View More Products' : 'Browse More')}
      showBrowse={showBrowse}
      backgroundClass={bgClass}
      sectionClass={sectionClass}
      variant={designVariant === 'figma' ? 'showcase' : 'default'}
      cardVariant={cardVariant}
      breakpoints={breakpoints}
      renderProduct={renderProduct}
    />
  );
}
