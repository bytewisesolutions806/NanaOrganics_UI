'use client';
export const dynamic = 'force-dynamic';
import { Toast } from 'primereact/toast';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { LockKeyhole } from 'lucide-react';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/AuthStore';
import './index.css';

export default function CartPage() {
  const router = useRouter();
  const toast = useRef(null);

  const {
    items,
    pricing,
    totalQuantity,
    fetchCart,
    updateCart,
    deleteItemsFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    couponLoading,
    loading,
  } = useCartStore();

  const currencyCode = useCartStore((state) => state.currency_code);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const currencySymbol = currencyCode?.toLowerCase?.() === 'eur' ? '€' : '$';

  /** Avoid flashing “empty cart” before sessionStorage + API resolve */
  const [cartReady, setCartReady] = useState(false);

  /* ================= FETCH CART ================= */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!hasHydrated) return;
      if (isAuthenticated) {
        await fetchCart();
      }
      if (!cancelled) setCartReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchCart, hasHydrated, isAuthenticated]);

  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCode.trim().toUpperCase();
    if (!normalizedCode || couponLoading) return;

    try {
      const updatedCart = await applyCoupon(normalizedCode);
      const appliedCode = updatedCart?.pricing?.coupon_code;
      const savings = Number(updatedCart?.pricing?.coupon_discount_amount || 0);
      setCouponCode(appliedCode || normalizedCode);
      toast.current.show({
        severity: 'success',
        summary: 'Coupon Applied',
        detail:
          savings > 0
            ? `You saved ${currencySymbol}${savings.toFixed(2)}`
            : 'The code was accepted. Its discount will activate when the order meets the promotion requirements.',
        life: 3000,
      });
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Coupon Not Applied',
        detail: err?.message || 'Coupon is invalid, expired, or has reached its usage limit.',
        life: 3000,
      });
    }
  };

  const handleRemoveCoupon = async () => {
    const appliedCode = pricing?.coupon_code;
    if (!appliedCode || couponLoading) return;
    try {
      await removeCoupon(appliedCode);
      setCouponCode('');
      toast.current.show({
        severity: 'success',
        summary: 'Coupon Removed',
        detail: `${appliedCode} was removed from your cart.`,
        life: 2500,
      });
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Coupon Not Removed',
        detail: err?.message || 'Could not remove the coupon. Please try again.',
        life: 3000,
      });
    }
  };

  /* ================= LOADING / EMPTY ================= */
  if (!cartReady || loading) {
    return (
      <div className="max-w-5xl mx-auto py-24 text-center text-gray-600">
        <p className="text-lg">Loading your cart…</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-24 text-center">
        <h2 className="text-2xl font-semibold">Your cart is empty 🛒</h2>
      </div>
    );
  }

  const isCouponApplied = Boolean(pricing?.coupon_code);

  /* ================= HANDLERS ================= */
  const handleRemoveItem = async (itemId) => {
    await deleteItemsFromCart(itemId);
  };

  const handleUpdateQuantity = async (item, newQty) => {
    if (newQty < 1) return;
    await updateCart({ item_id: item.id, quantity: newQty });
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Toast ref={toast} position="top-right" />

      {/* ================= LEFT ================= */}
      <section className="lg:col-span-2">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">
            Cart{' '}
            <span className="text-sm bg-[#E6F4F2] text-[#1EA766] px-2 py-1 rounded-full">
              {totalQuantity}
            </span>
          </h1>

          <button onClick={clearCart} className="text-sm bg-[#E6F4F2] px-4 py-2 rounded-xl">
            ✕ Clear All
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">{totalQuantity} items added</p>

        {/* CART ITEMS */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-[#E6F4F2] rounded-2xl p-4 hover:bg-[#FAFEFD]"
            >
              {/* ❌ REMOVE */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveItem(item.id);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
              >
                ✕
              </button>

              {/* IMAGE */}
              <div className="relative w-[100px] h-[100px] shrink-0">
                <Image
                  src={item.product.thumbnail}
                  alt={item.title}
                  fill
                  className="rounded-xl object-cover"
                />
              </div>

              {/* CONTENT */}
              <div className="flex-1 w-full">
                <h3 className="text-sm font-medium text-gray-800">{item.title}</h3>

                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {/* VARIANT */}
                  {/* {item.variant_title && (
                    <Dropdown
                      value={item.variant_title}
                      options={[
                        {
                          label: `${item.variant_title} g`,
                          value: item.variant_title,
                        },
                      ]}
                      disabled
                      className="w-28 text-sm"
                    />
                  )} */}

                  <div className="hidden sm:block h-6 w-px bg-[#E6F4F2]" />

                  {/* QUANTITY */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Quantity:</span>

                    <button
                      disabled={item.quantity === 1}
                      className={`
                        w-8 h-8 border rounded-full
                        ${
                          item.quantity === 1
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-100'
                        }
                      `}
                      onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                    >
                      −
                    </button>

                    <span className="text-sm w-6 text-center">{item.quantity}</span>

                    <button
                      className="w-8 h-8 border rounded-full"
                      onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* PRICE */}
              <div className="text-right shrink-0">
                <p className="font-semibold">
                  {currencySymbol}
                  {item.final_price.toFixed(2)}
                </p>
                {item.discount_amount > 0 && (
                  <p className="text-xs text-gray-400 line-through">
                    {currencySymbol}
                    {item.total_price.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= RIGHT ================= */}
      <aside className="bg-[#E6F4F2] rounded-2xl p-6 h-fit">
        <h2 className="text-lg font-semibold mb-4">Price details</h2>

        {pricing && (
          <>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span>
                  {currencySymbol}
                  {Number(
                    pricing.subtotal_before_discounts_with_tax ?? pricing.subtotal,
                  ).toFixed(2)}
                </span>
              </div>

              {pricing.product_discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Product Discount</span>
                  <span>
                    -{currencySymbol}
                    {pricing.product_discount.toFixed(2)}
                  </span>
                </div>
              )}

              {pricing.coupon_code && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({pricing.coupon_code})</span>
                  <span>
                    -{currencySymbol}
                    {pricing.coupon_discount_amount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <hr className="my-4 border-[#CFE7E3]" />
            <div className="mt-4">
              <label className="text-xs text-gray-500">Code Promo</label>

              <div className="flex gap-2 mt-1">
                <input
                  placeholder="ENTER CODE"
                  value={pricing.coupon_code || couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !isCouponApplied) handleApplyCoupon();
                  }}
                  disabled={isCouponApplied || couponLoading}
                  maxLength={64}
                  aria-label="Coupon code"
                  className={`
                  flex-1 px-3 py-2 border rounded-xl text-sm
                  ${isCouponApplied ? 'bg-gray-100 cursor-not-allowed' : ''}
                `}
                />

                <Button
                  label={couponLoading ? 'Please wait...' : isCouponApplied ? 'Remove' : 'Apply'}
                  disabled={couponLoading || (!isCouponApplied && !couponCode.trim())}
                  className={`
                px-4 rounded-xl
                  ${
                    isCouponApplied
                    ? 'bg-white text-red-600 border border-red-200'
                    : 'bg-[#6C8F85] text-white'
                }
              `}
                  onClick={isCouponApplied ? handleRemoveCoupon : handleApplyCoupon}
                />
              </div>

              {/* SUCCESS MESSAGE */}
              {isCouponApplied && (
                <p className="text-xs text-green-600 mt-2">
                  Coupon <strong>{pricing.coupon_code}</strong> is applied
                  {pricing.coupon_discount_amount > 0
                    ? ` — You saved ${currencySymbol}${pricing.coupon_discount_amount.toFixed(2)}`
                    : '. Its requirements are not met yet.'}
                </p>
              )}
            </div>

            <div className="flex justify-between font-semibold text-lg mt-4">
              <span>Total</span>
              <span>
                {currencySymbol}
                {pricing.total.toFixed(2)}
              </span>
            </div>
          </>
        )}

        <Button
          onClick={() => router.push('/checkout')}
          label="Proceed to Checkout"
          className="w-full mt-6 bg-[#1EA766] text-white py-3 rounded-xl"
        />

        <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-4">
          <LockKeyhole className="w-5 h-5" />
          Your information is securely protected
        </p>
      </aside>
    </div>
  );
}
