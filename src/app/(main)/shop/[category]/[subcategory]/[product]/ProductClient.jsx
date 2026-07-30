'use client';

import { useEffect } from 'react';

import ProductBreadcrumb from '@/components/ProductBreadcrumb';
import ProductImageGallery from '@/components/ProductImageGallery';
import NewArrivals from '@/components/NewArrivals';
import ProductCustomerReviews from '@/components/product/ProductCustomerReviews';
import ProductOverview from '@/components/ProductDetails/ProductOverview';
import ProductPurchaseSection from '@/components/ProductDetails/ProductPurchaseSection';
import ProductDescription from '@/components/ProductDetails/ProductDescription';
import ProductTrustStats from '@/components/ProductDetails/ProductTrustStats';
import useProductPurchase from '@/components/ProductDetails/useProductPurchase';
import useProductWishlist from '@/components/ProductDetails/useProductWishlist';
import { recordRecentlyViewedProduct } from '@/lib/recentlyViewedProducts';

function getDescriptionSections(productData) {
  try {
    return JSON.parse(productData?.metadata?.description_sections || '[]');
  } catch (error) {
    console.error('Invalid description_sections JSON', error);
    return [];
  }
}

export default function ProductClient({
  category,
  subcategory,
  subcategoryName,
  productData,
}) {
  const purchase = useProductPurchase(productData);
  const wishlist = useProductWishlist(productData?.id);
  const descriptionSections = getDescriptionSections(productData);
  const averageRating = Number(productData?.reviews_summary?.average_rating || 0);
  const totalReviews = Number(productData?.reviews_summary?.total_reviews || 0);

  useEffect(() => {
    recordRecentlyViewedProduct(productData?.handle || productData?.slug);
  }, [productData?.handle, productData?.slug]);

  return (
    <>
      <div className="mx-auto mt-10 max-w-7xl px-4 md:px-8 lg:px-16">
        <ProductBreadcrumb
          category={category.handle}
          categoryName={category.name}
          subcategory={subcategory}
          subcategoryName={subcategoryName ?? subcategory}
          productName={productData.title}
        />

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <ProductImageGallery
            thumbnail={productData.thumbnail}
            images={productData.images}
            productName={productData.title}
          />

          <div>
            <ProductOverview
              productData={productData}
              selectedVariant={purchase.selectedVariant}
              isVariantInStock={purchase.isVariantInStock}
              wishlist={wishlist}
            />
            <ProductPurchaseSection productData={productData} purchase={purchase} />
            <ProductDescription sections={descriptionSections} />
          </div>
        </div>
      </div>

      <ProductTrustStats averageRating={averageRating} totalReviews={totalReviews} />

      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-16">
        <ProductCustomerReviews productId={productData?.id} />
      </div>

      <div className="mt-8">
        <NewArrivals />
      </div>
    </>
  );
}
