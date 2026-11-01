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

const normalizeMeasurementUnit = (unit) => {
  const normalized = unit.toLowerCase();

  if (/^(kilograms?|kgs?|kg)$/.test(normalized)) return 'kg';
  if (/^(milligrams?|mgs?|mg)$/.test(normalized)) return 'mg';
  if (/^(grams?|gms?|grms?|gm|grm|g)$/.test(normalized)) return 'g';
  if (/^(milliliters?|millilitres?|ml)$/.test(normalized)) return 'ml';
  if (/^(centiliters?|centilitres?|cl)$/.test(normalized)) return 'cl';
  if (/^(liters?|litres?|l)$/.test(normalized)) return 'l';
  if (/^(ounces?|oz)$/.test(normalized)) return 'oz';
  if (/^(pounds?|lbs?|lb)$/.test(normalized)) return 'lb';
  if (/^(pieces?|pcs?|pc)$/.test(normalized)) return 'pcs';

  return normalized;
};

const getVariantDisplayLabel = (variant) => {
  const candidates = [
    ...(variant?.options || []).flatMap((option) => [option?.name, option?.value, option?.code]),
    variant?.label,
    variant?.title,
    variant?.name,
    variant?.sku,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  for (const candidate of candidates) {
    const measurement = candidate.match(
      /(?:^|[^a-z0-9])(\d+(?:[.,]\d+)?)[\s_-]*(kilograms?|kgs?|kg|milligrams?|mgs?|mg|grams?|gms?|grms?|gm|grm|g|milliliters?|millilitres?|ml|centiliters?|centilitres?|cl|liters?|litres?|l|ounces?|oz|pounds?|lbs?|lb|pieces?|pcs?|pc)(?=$|[^a-z])/i
    );

    if (measurement) {
      const [, amount, unit] = measurement;
      return `${amount.replace(',', '.')}${normalizeMeasurementUnit(unit)}`;
    }
  }

  return '';
};

const ProductCard = ({ item, category, cardVariant = 'default' }) => {
  const variants = Array.isArray(item?.variants) ? item.variants : [];
  const buildVariantOptions = (variants = []) =>
    variants.map((v) => ({
      label: getVariantDisplayLabel(v) || '—',
      value: v.id, // variant_id
      price: v.price,
      in_stock: v.in_stock,
      // disabled: !v.in_stock // PrimeReact supports this
    }));

  const variantOptions = buildVariantOptions(variants);
  const measurableVariantOptions = variantOptions.filter((variant) => variant.label !== '—');
  const reviewsCount = Number(item?.reviews_count || 0);
  const [quantity, setQuantity] = useState(1);

  // ✅ initialize once from props
  const [selectedVariantId, setSelectedVariantId] = useState(
    () =>
      measurableVariantOptions.find((variant) => variant.in_stock)?.value ??
      variantOptions.find((variant) => variant.in_stock)?.value ??
      measurableVariantOptions[0]?.value ??
      variantOptions[0]?.value ??
      null
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
      quantity,
    });
  };

  const handleVariantChange = (variantId) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  };

  const { addingVariantId } = useCartStore();

  const isAddingThisVariant = addingVariantId === selectedVariant?.id;
  const sellingPrice = Number(selectedVariant?.price || 0);
  const originalPrice = Number(selectedVariant?.original_price || sellingPrice);
  const discountPercent =
    originalPrice > sellingPrice && sellingPrice > 0
      ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
      : Number(selectedVariant?.discount || item?.discount || 0);
  const isShowcase = cardVariant === 'showcase';
  const selectedVariantLabel =
    variantOptions.find((variant) => variant.value === selectedVariantId)?.label || '';

  return (
    <div className={`h-full ${isShowcase ? 'px-0' : 'px-1 sm:px-2'}`}>
      {/* CARD */}
      <div
        className={`
          product-card flex flex-col overflow-hidden bg-white
          border transition relative mx-auto w-full
          ${isShowcase
            ? 'product-card--showcase h-[456px] max-w-[304px] rounded-xl border-[#D6E3DC]'
            : 'h-[420px] max-w-[360px] rounded-2xl border-[#E6F4F2] sm:h-[440px] sm:max-w-[290px]'}
        `}
      >
        {isShowcase && measurableVariantOptions.length > 0 ? (
          measurableVariantOptions.length > 1 ? (
            <select
              value={selectedVariantId || ''}
              onChange={(event) => handleVariantChange(event.target.value)}
              onClick={(event) => event.stopPropagation()}
              aria-label="Select product weight"
              className="product-card-showcase-badge product-card-showcase-badge-select absolute left-0 top-6 z-20"
            >
              {measurableVariantOptions.map((variant) => (
                <option key={variant.value} value={variant.value}>
                  {variant.label}
                </option>
              ))}
            </select>
          ) : (
            <span className="product-card-showcase-badge absolute left-0 top-6 z-20">
              {measurableVariantOptions[0].label}
            </span>
          )
        ) : null}

        {/* CLICKABLE CONTENT */}
        <Link
          href={`/shop/${categoryHandle}/${subCategoryHandle}/${item.handle || item.slug || item.id}`}
          className="flex-1 flex flex-col"
        >
          {/* IMAGE */}
          <div className="relative">
            {!isShowcase ? (
              <span className="absolute left-0 top-3 z-10 rounded-lg bg-[#E6F4F2] px-3 py-1 text-xs text-[#1EA766]">
                Organic
              </span>
            ) : null}

            <Image
              src={item.thumbnail || DEFAULT_IMAGE}
              alt={item.title || 'Product image'}
              width={300}
              height={200}
              sizes="(max-width: 480px) 92vw, (max-width: 640px) 68vw, (max-width: 900px) 46vw, (max-width: 1280px) 31vw, 290px"
              className={isShowcase
                ? 'product-card-showcase-image h-[270px] w-full object-contain'
                : 'h-[170px] w-full rounded-t-2xl object-cover sm:h-[180px]'}
              priority={false}
            />
          </div>

          {/* CONTENT */}
          <div
            className={`flex flex-1 flex-col ${
              isShowcase ? 'product-card-showcase-content' : 'px-4 pt-2'
            }`}
          >
            {isShowcase ? (
              <>
                <p className="product-card-showcase-title line-clamp-2">{item.title}</p>
                <p className="product-card-showcase-description mt-1 line-clamp-1">
                  {item.description || 'Pure • Authentic • Traditionally valued'}
                </p>
              </>
            ) : null}

            <div className={`flex min-h-7 items-center gap-2 ${isShowcase ? 'mt-2' : ''}`}>
              <h3 className="flex items-end gap-1">
                <span className={`relative -top-1 ${isShowcase ? 'text-[10px] text-[#55B63B]' : 'text-xs'}`}>$</span>
                <span className={`product-card-price ${isShowcase ? 'text-xl font-medium text-[#2C3330]' : 'text-lg'}`}>
                  {sellingPrice.toFixed(2)}
                </span>
              </h3>

              {originalPrice > sellingPrice && (
                <span className="product-card-original-price pl-1 text-xs text-gray-400 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}

              {discountPercent > 0 && (
                <span className={`ml-auto text-[9px] ${isShowcase ? 'rounded-full bg-[#61C64A] px-2 py-0.5 text-white' : 'rounded-md bg-[#E6F4F2] px-2 py-1 text-[#1EA766]'}`}>
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {!isShowcase ? (
              <>
                <p className="mt-2 h-10 text-sm text-gray-800 line-clamp-2">{item.title}</p>
                {reviewsCount > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <Rating value={item.rating} readOnly cancel={false} className="text-sm text-[#5EA087]" />
                    <span className="flex items-center text-xs text-gray-500">
                      <MessageCircle className="mx-1 h-3 w-3" />
                      {reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </Link>

        <WishlistButton
          productId={item.productId || item.id}
          className={`absolute z-20 h-8 w-8 ${
            isShowcase
              ? 'product-card-showcase-wishlist right-4 top-5'
              : 'right-3 top-2 rounded-full shadow-sm'
          }`}
        />

        {/* BOTTOM ACTIONS (ALWAYS ALIGNED) */}
        <div className="mt-auto pb-5">
          {isShowcase ? (
            <div className="product-card-showcase-actions">
              <div className="product-card-quantity" aria-label="Product quantity">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity === 1}
                  aria-label="Decrease quantity"
                  className="product-card-quantity-button"
                >
                  −
                </button>
                <output className="product-card-quantity-value" aria-live="polite">
                  {String(quantity).padStart(2, '0')}
                </output>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                  disabled={quantity === 99}
                  aria-label="Increase quantity"
                  className="product-card-quantity-button"
                >
                  +
                </button>
              </div>

              <Button
                disabled={!selectedVariant?.in_stock || isAddingThisVariant}
                className={`product-card-add-button product-card-showcase-add-button ${
                  !selectedVariant?.in_stock || isAddingThisVariant
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#2D684F] text-white'
                }`}
                onClick={handleAddToCart}
              >
                {isAddingThisVariant
                  ? 'Adding...'
                  : selectedVariant?.in_stock
                    ? 'Add to Cart'
                    : 'Out of Stock'}
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-3 flex justify-center">
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
                    onChange={(event) => handleVariantChange(event.value)}
                    placeholder="Select a variant"
                    emptyMessage="No variants available"
                    aria-label="Select product variant"
                    className="product-variant-dropdown w-[90%]"
                    panelClassName="product-variant-dropdown-panel"
                  />
                )}
              </div>

              <div className="mt-3 flex justify-center">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
