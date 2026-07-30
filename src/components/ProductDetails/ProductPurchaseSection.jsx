'use client';

import Image from 'next/image';
import { Button } from 'primereact/button';
import { formatCurrency } from '@/utils/formatCurrency';
import packageCheck from '@/assets/images/package-check.png';
import Undo from '@/assets/images/undo.png';
import SupportedPayment from '@/assets/images/Supported_payment.png';

export default function ProductPurchaseSection({ productData, purchase }) {
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

  return (
    <div className="mt-4">
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-700">
          Item Form:
          <i className="ml-2 font-semibold text-gray-900">
            {productData?.specifications?.item_form || ''}
          </i>
        </span>
        <Button className="ml-auto font-bold text-[#1EA766] underline">More Details</Button>
      </div>

      <div className="mt-4 grid grid-cols-[120px_1fr] gap-y-2 text-sm">
        <span className="text-gray-500">Brand</span>
        <span className="font-semibold text-gray-900">{productData?.specifications?.brand}</span>
        <span className="text-gray-500">Variety</span>
        <span className="font-semibold text-gray-900">{productData?.title}</span>
        <span className="text-gray-500">Item Form</span>
        <span className="font-semibold text-gray-900">
          {productData?.specifications?.item_form || 'Organic'}
        </span>
        <span className="text-gray-500">Net Quantity</span>
        <span className="font-semibold text-gray-900">
          {selectedVariant?.title ?? '-'} - {productData?.metadata?.quantity_type || ''}
        </span>
        <span className="text-gray-500">Diet Type</span>
        <span className="font-semibold text-gray-900">
          {productData?.specifications?.diet_type || ''}
        </span>
      </div>

      <hr className="mt-4 text-[#3C5750]/25" />

      <div className="mt-8">
        <div className="mb-2 flex items-center">
          <span className="text-lg font-normal">Price</span>
          <span className="ml-auto text-lg font-normal">Quantity</span>
        </div>
        <div className="flex items-center">
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(sellingPrice, currency)}
            </span>
            {mrpPrice && mrpPrice > sellingPrice && (
              <span className="text-lg text-gray-500 line-through">
                {formatCurrency(mrpPrice, currency)}
              </span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={decreaseQuantity}
              disabled={quantity === 1}
              className={`flex h-10 w-10 items-center justify-center rounded-full border ${quantity === 1 ? 'cursor-not-allowed opacity-40' : 'hover:bg-gray-100'}`}
            >
              −
            </button>
            <span className="min-w-[24px] text-center text-base font-semibold">
              {String(quantity).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={increaseQuantity}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-lg font-bold hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex">
          <Image src={packageCheck} height={25} width={25} alt="Package" />
          <p className="ml-2 text-[#21252C]">
            Estimated Delivery: {productData?.delivery_info?.estimated_label || 'N/A'}
          </p>
        </div>
        <div className="mt-3 flex">
          <Image src={Undo} height={25} width={25} alt="Returns" />
          <p className="ml-2 text-[#21252C]">
            Returns Accepted within {productData?.returns_policy?.window_days} days
          </p>
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-sm">
          Size: <span className="font-semibold">{selectedVariant?.label}</span>
        </p>
        <div className="flex flex-col gap-4">
          {(productData.variants || []).map((variant) => {
            const isSelected = selectedVariant?.id === variant.id;
            return (
              <button
                type="button"
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`relative flex items-start gap-4 rounded-xl border p-4 transition ${isSelected ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2">
                  {isSelected && <div className="h-3 w-3 rounded-full bg-black" />}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{variant.title}</p>
                  <p className="text-sm text-gray-600">
                    {variant.pricePerUnit} <span className="font-semibold">FREE</span> Delivery in{' '}
                    {productData?.delivery_info?.estimated_label || '-'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">${variant.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-400 line-through">
                    ${variant.original_price.toFixed(2)}
                  </p>
                </div>
                {variant.isPopular && (
                  <span className="absolute -top-3 right-4 rounded bg-[#EDA747] px-2 py-1 text-xs text-white">
                    Most Popular
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <Button
          onClick={addSelectedVariant}
          disabled={!isVariantInStock || isAdding}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-colors duration-200 ${!isVariantInStock || isAdding ? 'cursor-not-allowed bg-gray-300 text-gray-500' : 'bg-[#1EA766] text-white'}`}
        >
          {isAdding ? (
            <>
              <i className="pi pi-spin pi-spinner text-gray-600" />
              Adding items to cart...
            </>
          ) : isVariantInStock ? (
            'Add to Cart'
          ) : (
            'Out of Stock'
          )}
        </Button>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <Image src={SupportedPayment} height={80} alt="Supported Payments" />
        <p className="mt-4 flex items-center justify-center text-base text-[#5C7159]">
          <i className="pi pi-lock mr-2 text-lg text-[#5C7159]" />
          Safe and Secure Payments
        </p>
      </div>
    </div>
  );
}
