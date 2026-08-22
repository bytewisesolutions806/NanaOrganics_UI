'use client';

import { useEffect, useState } from 'react';

import ProductBreadcrumb from '@/components/ProductBreadcrumb';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductCustomerReviews from '@/components/product/ProductCustomerReviews';
import ProductOverview from '@/components/ProductDetails/ProductOverview';
import ProductPurchaseSection from '@/components/ProductDetails/ProductPurchaseSection';
import ProductDescription from '@/components/ProductDetails/ProductDescription';
import ProductTrustStats from '@/components/ProductDetails/ProductTrustStats';
import RelatedProducts from '@/components/ProductDetails/RelatedProducts';
import useProductPurchase from '@/components/ProductDetails/useProductPurchase';
import useProductWishlist from '@/components/ProductDetails/useProductWishlist';
import { recordRecentlyViewedProduct } from '@/lib/recentlyViewedProducts';
import { fetchUserOrdersApi } from '@/service/OrdersService';
import useAuthStore from '@/store/AuthStore';

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
  relatedProducts = [],
}) {
  const purchase = useProductPurchase(productData);
  const wishlist = useProductWishlist(productData?.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const descriptionSections = getDescriptionSections(productData);
  const [recentProductOrder, setRecentProductOrder] = useState(null);
  const [reviewsSummary, setReviewsSummary] = useState(productData?.reviews_summary || {
    average_rating: 0,
    total_reviews: 0,
  });
  const averageRating = Number(reviewsSummary?.average_rating || 0);
  const totalReviews = Number(reviewsSummary?.total_reviews || 0);

  useEffect(() => {
    recordRecentlyViewedProduct(productData?.handle || productData?.slug);
  }, [productData?.handle, productData?.slug]);

  useEffect(() => {
    let cancelled = false;
    setRecentProductOrder(null);

    if (!hasHydrated || !isAuthenticated || !productData?.id) {
      return () => {
        cancelled = true;
      };
    }

    fetchUserOrdersApi({ take: 100 })
      .then((response) => {
        if (cancelled) return;
        const productId = String(productData.id);
        const newestMatchingOrder = (response.data?.orders || [])
          .filter(
            (order) =>
              order.status !== 'cancelled' &&
              (order.items || []).some(
                (item) => String(item.product_id) === productId,
              ),
          )
          .sort(
            (left, right) =>
              new Date(right.created_at || 0).getTime() -
              new Date(left.created_at || 0).getTime(),
          )[0];

        setRecentProductOrder(newestMatchingOrder || null);
      })
      .catch(() => {
        if (!cancelled) setRecentProductOrder(null);
      });

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isAuthenticated, productData?.id]);

  return (
    <div style={{ fontFamily: '"Plus Jakarta Sans", Arial, sans-serif' }}>
      <div className="mx-auto mt-10 w-[calc(100%_-_40px)] max-w-[1298px]">
        <ProductBreadcrumb
          category={category.handle}
          categoryName={category.name}
          subcategory={subcategory}
          subcategoryName={subcategoryName ?? subcategory}
          productName={productData.title}
        />

        <div className="mt-5 grid grid-cols-1 gap-10 min-[1400px]:grid-cols-[minmax(0,660px)_minmax(0,550px)] min-[1400px]:gap-[86px]">
          <ProductImageGallery thumbnail={productData.thumbnail} images={productData.images} productName={productData.title} />

          <div className="w-full max-w-[660px] min-[1400px]:max-w-[550px]">
            <ProductOverview
              productData={productData}
              selectedVariant={purchase.selectedVariant}
              isVariantInStock={purchase.isVariantInStock}
              wishlist={wishlist}
            />
            <ProductPurchaseSection
              productData={productData}
              purchase={purchase}
              reviewsSummary={reviewsSummary}
              recentOrder={recentProductOrder}
            />
            <ProductDescription sections={descriptionSections} />
          </div>
        </div>
      </div>

      <ProductTrustStats
        averageRating={averageRating}
        totalReviews={totalReviews}
        returnWindow={productData?.returns_policy?.window_days || 30}
      />

      <div className="mx-auto w-[calc(100%_-_40px)] max-w-[1298px]">
        <ProductCustomerReviews productId={productData?.id} onStatsChange={setReviewsSummary} />
      </div>

      <RelatedProducts
        products={relatedProducts}
        browseLink={`/shop/${category.handle}/${subcategory}`}
      />
    </div>
  );
}
