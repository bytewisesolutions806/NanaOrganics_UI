'use client';

import Image from 'next/image';
import { Button } from 'primereact/button';
import { Box, LockKeyhole, PackageCheck, RotateCcw, ShieldCheck, Star, Truck } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import SupportedPayment from '@/assets/images/Supported_payment.png';

function SpecificationRow({ label, value }) {
  if (!value) return null;
  return (
    <>
      <dt className="text-[#68716F]">{label}</dt>
      <dd className="font-semibold text-[#21252C]">{value}</dd>
    </>
  );
}

function RatingMark({ filled }) {
  return (
    <span className={`flex h-6 w-6 items-center justify-center rounded ${filled ? 'bg-[#21A56E]' : 'bg-[#C8C8C8]'}`}>
      <Star className="h-[15px] w-[15px] fill-white text-white" strokeWidth={1.5} />
    </span>
  );
}

function formatOrderDate(value, fallback) {
  if (value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
    }
  }
  return fallback || 'Pending';
}

function findOrderUpdateDate(order, pattern) {
  return (order?.updates || []).find((update) =>
    pattern.test(String(update.status || '')),
  )?.createdAt;
}

function RecentOrderTimeline({ order }) {
  if (!order) return null;

  const placedDate = formatOrderDate(order.created_at, order.confirmedDate);
  const shippedDate = formatOrderDate(
    findOrderUpdateDate(order, /shipped/i),
    order.shippedDate,
  );
  const deliveredDate = formatOrderDate(
    findOrderUpdateDate(order, /delivered/i),
    order.deliveredDate,
  );
  const steps = [
    { title: 'Order Placed', date: placedDate, Icon: Box },
    { title: 'Shipped', date: shippedDate, Icon: Truck },
    { title: 'Delivered', date: deliveredDate, Icon: PackageCheck },
  ];

  return (
    <section className="mt-7" aria-label="Most recent order progress">
      <ol className="relative grid grid-cols-3 before:absolute before:left-[16.666%] before:right-[16.666%] before:top-6 before:h-px before:bg-[#2C665E]">
        {steps.map((step) => (
          <li
            key={step.title}
            className="relative z-10 flex min-w-0 flex-col items-center px-1 text-center sm:px-3"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2C665E] text-white shadow-[0_3px_8px_rgba(44,102,94,0.18)]">
              <step.Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <strong className="mt-3 block text-[11px] leading-4 text-[#21252C] sm:text-sm">
              {step.date}
            </strong>
            <span className="mt-1 block text-[11px] leading-4 text-[#4F5755] sm:text-sm">
              {step.title}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function ProductPurchaseSection({
  productData,
  purchase,
  reviewsSummary,
  recentOrder = null,
}) {
  const {
    quantity,
    selectedVariant,
    setSelectedVariant,
    isVariantInStock,
    isAdding,
    sellingPrice,
    mrpPrice,
    currency,
    increaseQuantity,
    decreaseQuantity,
    addSelectedVariant,
  } = purchase;
  const deliveryLabel = productData?.delivery_info?.estimated_label || '3-5 business days';
  const averageRating = Number(reviewsSummary?.average_rating || 0);
  const totalReviews = Number(reviewsSummary?.total_reviews || 0);
  const itemForm = productData?.specifications?.item_form;

  return (
    <div className="mt-5 text-[#21252C]">
      <div className="flex items-center gap-4 text-sm">
        {itemForm ? (
          <span>
            Item Form: <strong>{itemForm}</strong>
          </span>
        ) : null}
        <a href="#about-this-item" className="ml-auto font-bold text-[#1EA766] underline underline-offset-4">
          More Details
        </a>
      </div>

      <dl className="mt-4 grid grid-cols-[110px_1fr] gap-x-4 gap-y-2 text-sm">
        <SpecificationRow label="Brand" value={productData?.specifications?.brand || 'Nana Organics'} />
        <SpecificationRow label="Variety" value={productData?.title} />
        <SpecificationRow label="Item Form" value={productData?.specifications?.item_form} />
        <SpecificationRow label="Net Quantity" value={selectedVariant?.label || selectedVariant?.title} />
        <SpecificationRow label="Diet Type" value={productData?.specifications?.diet_type} />
      </dl>

      <hr className="mt-7 border-[#3C5750]/25" />

      {totalReviews > 0 ? (
        <div className="mt-7 flex flex-wrap items-center gap-3 text-sm">
          <div className="flex gap-0.5" aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, index) => (
              <RatingMark key={index} filled={index < Math.round(averageRating)} />
            ))}
          </div>
          <span>{totalReviews.toLocaleString('en-IN')} happy customers</span>
          <a href="#customer-reviews" className="ml-auto font-bold text-[#1EA766] underline underline-offset-4">
            Read Reviews
          </a>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-end gap-6">
        <div>
          <p className="mb-1 text-sm text-[#68716F]">Price</p>
          <div className="flex items-end gap-3">
            <span className="text-[32px] font-bold leading-none text-[#21252C]">
              {formatCurrency(sellingPrice || 0, currency)}
            </span>
            {mrpPrice > sellingPrice ? (
              <span className="text-sm text-[#68716F] line-through">{formatCurrency(mrpPrice, currency)}</span>
            ) : null}
          </div>
        </div>

        <div className="ml-auto">
          <p className="mb-2 text-sm text-[#68716F]">Quantity</p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={decreaseQuantity} disabled={quantity === 1} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#9BB2AC] text-lg disabled:cursor-not-allowed disabled:opacity-40" aria-label="Decrease quantity">−</button>
            <span className="min-w-5 text-center font-semibold">{String(quantity).padStart(2, '0')}</span>
            <button type="button" onClick={increaseQuantity} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#9BB2AC] text-lg" aria-label="Increase quantity">+</button>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2.5 text-sm">
        <p className="flex items-center gap-2"><PackageCheck className="h-7 w-7 text-[#2C665E]" strokeWidth={1.5} /> Estimated Delivery: {deliveryLabel}</p>
        <p className="flex items-center gap-2"><ShieldCheck className="h-7 w-7 text-[#2C665E]" strokeWidth={1.5} /> Money-back Guarantee</p>
        <p className="flex items-center gap-2"><RotateCcw className="h-7 w-7 text-[#2C665E]" strokeWidth={1.5} /> Returns Accepted Within {productData?.returns_policy?.window_days || 30} Days</p>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm text-[#545860]">Size: <strong>{selectedVariant?.label || selectedVariant?.title}</strong></p>
        <div className="flex flex-col gap-3">
          {(productData.variants || []).map((variant) => {
            const isSelected = selectedVariant?.id === variant.id;
            return (
              <button
                type="button"
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`relative flex min-h-20 items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${isSelected ? 'border-[1.5px] border-[#1EA766] bg-white shadow-[0_6px_12px_rgba(60,87,80,0.10)]' : 'border-[#5C7159]/20 bg-white/50 hover:border-[#8EAAA3]'}`}
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#6D887F]">
                  {isSelected ? <span className="h-3 w-3 rounded-full bg-[#6D887F]" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{variant.label || variant.title}</span>
                  <span className="mt-1 block text-sm text-[#545860]">
                    {formatCurrency(variant.price, variant.currency || currency)} – <strong className="text-[#21252C]">FREE</strong> Delivery in {deliveryLabel}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <strong className="block text-xl">{formatCurrency(variant.price, variant.currency || currency)}</strong>
                  {variant.original_price > variant.price ? <span className="text-sm line-through">{formatCurrency(variant.original_price, variant.currency || currency)}</span> : null}
                </span>
                {variant.isPopular ? <span className="absolute -top-2.5 right-5 rounded-b-md bg-[#EDA747] px-2 py-1 text-xs text-white">Most Popular</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={addSelectedVariant}
        disabled={!isVariantInStock || isAdding}
        className={`mt-5 flex h-[50px] w-full items-center justify-center rounded-xl text-base font-semibold transition-colors ${!isVariantInStock || isAdding ? 'cursor-not-allowed bg-gray-300 text-gray-500' : 'bg-[#1EA766] text-white'}`}
      >
        {isAdding ? <><i className="pi pi-spin pi-spinner mr-2" />Adding to cart...</> : isVariantInStock ? 'Add to Cart' : 'Out of Stock'}
      </Button>

      <div className="mt-5 text-center">
        <Image src={SupportedPayment} alt="Accepted payment methods" className="mx-auto h-auto max-h-10 w-auto max-w-full" />
        <p className="mt-3 flex items-center justify-center gap-2 text-sm text-[#5C7159]"><LockKeyhole className="h-5 w-5" /> Safe and Secure Payment</p>
      </div>

      <RecentOrderTimeline order={recentOrder} />
    </div>
  );
}
