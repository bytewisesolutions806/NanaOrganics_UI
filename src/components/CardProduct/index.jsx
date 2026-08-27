'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Rating } from 'primereact/rating';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { MessageCircle } from 'lucide-react';
import useCartStore from '@/store/useCartStore';
import WishlistButton from '@/components/WishlistButton';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';
import './index.css';

const getVariantDisplayLabel = (variant, productTitle = '') => {
  const fullLabel = String(variant?.label || variant?.title || '').trim();
  const title = String(productTitle || '').trim();

  if (!fullLabel) return '';

  if (title && fullLabel.toLowerCase().startsWith(title.toLowerCase())) {
    const remainder = fullLabel.slice(title.length);
    const suffix = /^[\s\-–—:|/]/.test(remainder)
      ? remainder.replace(/^[\s\-–—:|/]+/, '').trim()
      : '';

    if (suffix) return suffix;
  }

  const measurement = fullLabel.match(/(\d+(?:[.,]\d+)?\s*(?:kg|mg|g|ml|cl|l|oz|lbs?))\s*$/i);

  return measurement?.[1] || fullLabel;
};

const ProductCard = ({ item, category }) => {
  const variants = Array.isArray(item?.variants) ? item.variants : [];
  const buildVariantOptions = (variants = []) =>
    variants.map((v) => ({
      label: getVariantDisplayLabel(v, item.title),
      value: v.id, // variant_id
      price: v.price,
      in_stock: v.in_stock,
      // disabled: !v.in_stock // PrimeReact supports this
    }));

  const variantOptions = buildVariantOptions(variants);
  const reviewsCount = Number(item?.reviews_count || 0);

  // ✅ initialize once from props
  const [selectedVariantId, setSelectedVariantId] = useState(
    () =>
      variantOptions.find((variant) => variant.in_stock)?.value ?? variantOptions[0]?.value ?? null
  );

  // ✅ derive selected variant
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  const addToCart = useCartStore((state) => state.addToCart);
  const categoryHandle =
    category?.parent_category?.handle || item?.parent_category?.handle || 'deals';
  const subCategoryHandle = category?.handle || item?.subcategory?.handle || 'deals';

  const handleAddToCart = () => {
    if (!selectedVariant?.id) return;

    addToCart({
      variant_id: selectedVariant.id,
      quantity: 1,
    });
  };

  const { addingVariantId } = useCartStore();

  const isAddingThisVariant = addingVariantId === selectedVariant?.id;
  const sellingPrice = Number(selectedVariant?.price || 0);
  const originalPrice = Number(selectedVariant?.original_price || sellingPrice);
  const discountPercent =
    originalPrice > sellingPrice && sellingPrice > 0
      ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
      : Number(selectedVariant?.discount || item?.discount || 0);

  return (
    <div className="h-full px-1 sm:px-2">
      {/* CARD */}
      <div
        className="
          product-card flex h-[420px] flex-col overflow-hidden sm:h-[440px]
          rounded-2xl bg-white
          border border-[#E6F4F2]
          transition
          relative mx-auto w-full max-w-[360px] sm:max-w-[290px]
        "
      >
        {/* CLICKABLE CONTENT */}
        <Link
          href={`/shop/${categoryHandle}/${subCategoryHandle}/${item.handle || item.slug || item.id}`}
          className="flex-1 flex flex-col"
        >
          {/* IMAGE */}
          <div className="relative">
            <span className="absolute top-2 left-2 bg-[#E6F4F2] text-[#1EA766] text-xs px-3 py-1 rounded-lg z-10">
              Organic
            </span>

            <Image
              src={item.thumbnail || DEFAULT_IMAGE}
              alt={item.title || 'Product image'}
              width={300}
              height={200}
              sizes="(max-width: 480px) 92vw, (max-width: 640px) 68vw, (max-width: 900px) 46vw, (max-width: 1280px) 31vw, 290px"
              className="h-[170px] w-full rounded-t-2xl object-cover sm:h-[180px]"
              priority={false}
            />
          </div>

          {/* CONTENT */}
          <div className="flex-1 flex flex-col px-3 pt-2">
            {/* PRICE */}
            <div className="flex min-h-7 items-center gap-2">
              <h3 className="flex items-end gap-1">
                <span className="text-xs relative -top-1">$</span>
                <span className="product-card-price text-lg">{sellingPrice.toFixed(2)}</span>
              </h3>

              {originalPrice > sellingPrice && (
                <span className="product-card-original-price pl-2 text-xs text-gray-400 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}

              {discountPercent > 0 && (
                <span className="ml-auto bg-[#E6F4F2] text-[#1EA766] text-[10px] px-2 py-1 rounded-md">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* TITLE */}
            <p className="mt-2 h-10 text-sm text-gray-800 line-clamp-2">{item.title}</p>

            {/* RATING */}
            {reviewsCount > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <Rating
                  value={item.rating}
                  readOnly
                  cancel={false}
                  className="text-sm text-[#5EA087]"
                />
                <span className="text-xs text-gray-500 flex items-center">
                  <MessageCircle className="w-3 h-3 mx-1" />
                  {reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )}
          </div>
        </Link>

        <WishlistButton
          productId={item.productId || item.id}
          className="absolute right-3 top-2 z-20 h-8 w-8 rounded-full shadow-sm"
        />

        {/* BOTTOM ACTIONS (ALWAYS ALIGNED) */}
        <div className="mt-auto pb-4">
          {/* {item.weightOptions && ( */}
          <div className="flex justify-center mt-3">
            {variantOptions.length === 1 ? (
              <div className="product-variant-single w-[90%]" aria-label="Product variant">
                {variantOptions[0].label}
              </div>
            ) : (
              <Dropdown
                value={selectedVariantId}
                options={variantOptions}
                optionLabel="label"
                optionValue="value"
                onChange={(e) => setSelectedVariantId(e.value)}
                placeholder="Select a variant"
                emptyMessage="No variants available"
                aria-label="Select product variant"
                className="product-variant-dropdown w-[90%]"
                panelClassName="product-variant-dropdown-panel"
              />
            )}
            {/* <Dropdown
                options={item.weightOptions}
                value={selectedWeight}
                onChange={(e) => setSelectedWeight(e.value)}
                placeholder="Select weight"
                className="w-[90%] text-xs sm:text-sm border border-[#D6DBE5] rounded-xl p-2 sm:p-3"
              /> */}
          </div>
          {/* )} */}

          <div className="flex justify-center mt-3">
            <Button
              disabled={!selectedVariant?.in_stock || isAddingThisVariant}
              className={`
              product-card-add-button min-h-12 w-[90%] p-1 text-base rounded-xl
              flex items-center justify-center gap-2 font-semibold
              transition-colors duration-200
              ${
                !selectedVariant?.in_stock || isAddingThisVariant
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#E6F4F2] text-[#1EA766]'
              }
            `}
              onClick={handleAddToCart}
            >
              {isAddingThisVariant ? (
                <>
                  <i className="pi pi-spin pi-spinner text-gray-500 text-sm" />
                  Adding...
                </>
              ) : selectedVariant?.in_stock ? (
                'Add to Cart'
              ) : (
                'Out of Stock'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
