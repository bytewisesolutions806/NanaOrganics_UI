'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Rating } from 'primereact/rating';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { MessageCircle } from 'lucide-react';
import useCartStore from '@/store/useCartStore';

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

  const measurement = fullLabel.match(
    /(\d+(?:[.,]\d+)?\s*(?:kg|mg|g|ml|cl|l|oz|lbs?))\s*$/i,
  );

  return measurement?.[1] || fullLabel;
};

const ProductCard = ({ item, category }) => {
  const buildVariantOptions = (variants = []) =>
    variants.map((v) => ({
      label: getVariantDisplayLabel(v, item.title),
      value: v.id, // variant_id
      price: v.price,
      in_stock: v.in_stock,
      // disabled: !v.in_stock // PrimeReact supports this
    }));

  const variantOptions = buildVariantOptions(item.variants || []);
  const reviewsCount = Number(item?.reviews_count || 0);

  // ✅ initialize once from props
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => variantOptions[0]?.value ?? null
  );

  // ✅ derive selected variant
  const selectedVariant = item.variants.find((v) => v.id === selectedVariantId);

  const addToCart = useCartStore((state) => state.addToCart);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const categoryHandle = category?.parent_category?.handle;
  const subCategoryHandle = category?.handle;

  const handleAddToCart = () => {
    addToCart({
      variant_id: selectedVariant.id,
      quantity: 1,
    });
  };

  const { addingVariantId } = useCartStore();

  const isAddingThisVariant = addingVariantId === selectedVariant?.id;
  return (
    <div className="px-2 h-full">
      {/* CARD */}
      <div
        className="
          h-full flex flex-col
          rounded-2xl bg-white
          border border-[#E6F4F2]
          transition
          w-full
          sm:w-[260px]
          md:w-[270px]
          lg:w-[260px]
          mx-auto
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

            <span className="absolute top-2 right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center z-10">
              <i className="pi pi-heart text-[16px] text-[#1EA766]" />
            </span>

            <Image
              src={item.thumbnail}
              alt={item.title}
              width={300}
              height={200}
              className="w-full h-[180px] object-cover rounded-t-2xl"
              priority={false}
            />
          </div>

          {/* CONTENT */}
          <div className="flex-1 flex flex-col px-3 pt-2">
            {/* PRICE */}
            <div className="flex items-center gap-2">
              <h3 className="flex items-end gap-1">
                <span className="text-xs relative -top-1">$</span>
                <span className="text-lg font-semibold">{selectedVariant?.price?.toFixed(2)}</span>
              </h3>

              {item.original_price > item.price && (
                <span className="line-through text-gray-400 text-xs pl-2">
                  ${item.original_price?.toFixed(2)}
                </span>
              )}

              {item.discount > 0 && (
                <span className="ml-auto bg-[#E6F4F2] text-[#1EA766] text-[10px] px-2 py-1 rounded-md">
                  Save {item.discount}%
                </span>
              )}
            </div>

            {/* TITLE */}
            <p className="mt-2 text-sm text-gray-800 line-clamp-2 min-h-[40px]">{item.title}</p>

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
              w-[90%] p-2 text-xs sm:text-sm rounded-xl
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
