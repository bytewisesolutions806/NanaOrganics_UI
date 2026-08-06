'use client';
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useId } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import useCartStore from '@/store/useCartStore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ReusableButton from '@/components/ReUsableButton';
import WishlistButton from '@/components/WishlistButton';

import 'swiper/css';
import 'swiper/css/navigation';
import './index.css';

export default function ProductSlider({
  title,
  subtitle,
  products = [],
  browseLink = '/shop',
  bgClass = '', // 👈 NEW
  sectionClass = '',
}) {
  const swiperId = useId();
  const router = useRouter();

  return (
    <section className={`${bgClass} ${sectionClass}`}>
      <div className="px-5 md:px-10 lg:max-w-[1300px] mx-auto relative">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
            {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
          </div>

          <ReusableButton label="Browse More" onClick={() => router.push(browseLink)} />
        </div>

        {/* Custom Arrows */}
        <button
          className={`
    custom-prev-${swiperId}
    hidden lg:flex
    absolute
    top-1/2 -translate-y-1/2
    z-20
    w-10 h-10
    text-[4rem]
    font-normal
    text-[#1ea766]
    items-center justify-center
    cursor-pointer
    transition-all duration-200

    /* LG – INSIDE */
    lg:left-2

    /* XL – OUTSIDE */
    xl:left-[-60px]
  `}
        >
          ‹
        </button>

        <button
          className={`
    custom-next-${swiperId}
    hidden lg:flex
    absolute
    top-1/2 -translate-y-1/2
    z-20
    w-10 h-10
    text-[4rem]
    font-normal
    text-[#1ea766]
    items-center justify-center
    cursor-pointer
    transition-all duration-200

    /* LG – INSIDE */
    lg:right-2

    /* XL – OUTSIDE */
    xl:right-[-60px]
  `}
        >
          ›
        </button>

        {/* SWIPER */}
        <Swiper
          modules={[Navigation]}
          loop
          spaceBetween={10}
          navigation={{
            prevEl: `.custom-prev-${swiperId}`,
            nextEl: `.custom-next-${swiperId}`,
          }}
          breakpoints={{
            1440: { slidesPerView: 4 },
            1024: { slidesPerView: 3 },
            640: { slidesPerView: 2 },
            0: { slidesPerView: 1 },
          }}
        >
          {products.map((item) => (
            <SwiperSlide key={item.id}>
              <ProductCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function ProductCard({ item }) {
  const router = useRouter();
  const variants = Array.isArray(item?.variants) ? item.variants : [];
  const ratingValue = Number(item?.rating || 0);
  const reviewsCount = Number(item?.reviews_count || 0);

  const buildVariantOptions = (list = []) =>
    list.map((v) => ({
      label: `${v.title}`,
      value: v.id, // variant_id
      price: v.price,
      in_stock: v.in_stock,
      // disabled: !v.in_stock // PrimeReact supports this
    }));

  const variantOptions = buildVariantOptions(variants);

  // ✅ initialize once from props
  const [selectedVariantId, setSelectedVariantId] = useState(
    () =>
      variantOptions.find((variant) => variant.in_stock)?.value ?? variantOptions[0]?.value ?? null
  );

  // ✅ derive selected variant
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  const handleRedirect = () => {
    if (!item.parent_category?.handle || !item.subcategory?.handle) return;

    router.push(`/shop/${item.parent_category.handle}/${item.subcategory.handle}/${item.id}`);
  };
  const addToCart = useCartStore((state) => state.addToCart);
  const handleAddToCart = () => {
    if (!selectedVariant?.id) return;
    addToCart({
      variant_id: selectedVariant.id,
      quantity: 1,
    });
  };

  const { addingVariantId } = useCartStore();

  const isAddingThisVariant = addingVariantId === selectedVariant?.id;

  return (
    <div className="px-2">
      <div className="rounded-2xl bg-white transition border border-[#E6F4F2] w-full sm:w-[260px] md:w-[270px] lg:w-[290px] mx-auto">
        {/* IMAGE */}
        <div className="relative cursor-pointer" onClick={handleRedirect}>
          <span className="absolute top-2 left-2 bg-[#E6F4F2] text-[#1EA766] text-xs px-3 py-1 rounded-lg">
            Organic
          </span>
          <WishlistButton
            productId={item.productId}
            className="absolute right-2 top-2 z-10 h-7 w-7 rounded-full border border-[#E6F4F2]"
          />

          <Image
            src={item.thumbnail || '/AppLogo.svg'}
            alt={item.title || 'Product image'}
            width={300}
            height={200}
            className="w-full h-[180px] rounded-t-2xl object-cover"
          />
        </div>

        {/* PRICE */}
        <div className="px-3 mt-2 flex items-center gap-2">
          <h3 className="flex items-end gap-1">
            <span className="text-xs relative -top-1">$</span>
            <span className="text-lg font-semibold">{selectedVariant?.price?.toFixed(2)}</span>
          </h3>

          {selectedVariant?.original_price > selectedVariant?.price && (
            <span className="line-through text-gray-400 text-xs pl-3">
              ${selectedVariant.original_price.toFixed(2)}
            </span>
          )}

          {Number(selectedVariant?.discount) > 0 && (
            <span className="bg-[#D6F5E1] text-[#008144] text-xs px-3 py-1 rounded-xl ml-auto mr-2 font-semibold">
              Save {selectedVariant.discount}%
            </span>
          )}
        </div>

        {/* TITLE */}
        <p className="px-3 pt-2 text-sm text-gray-800 line-clamp-2 min-h-[40px]">{item.title}</p>

        {/* RATING + REVIEWS */}
        {reviewsCount > 0 && (
          <div className="px-3 mt-1 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-[#1EA766] font-medium">
              <i className="pi pi-star-fill text-[10px]" />
              {ratingValue.toFixed(1)}
            </span>
            <span className="text-gray-500">
              ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}

        {/* DROPDOWN */}
        <div className="w-full flex justify-center mt-3">
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
        </div>

        {/* ADD TO CART */}
        <div className="w-full flex justify-center mt-3 mb-4">
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
  );
}
