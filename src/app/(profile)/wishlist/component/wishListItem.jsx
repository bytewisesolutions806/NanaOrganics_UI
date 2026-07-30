'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import useWishlistStore from '@/store/useWishlistStore';

export default function WishlistItem({ item }) {
  const removeItem = useWishlistStore((state) => state.removeItem);
  const removingId = useWishlistStore((state) => state.removingId);
  const busy = removingId === item.product_id;

  const showDiscount = item.discount > 0 && item.originalPrice > item.price;

  return (
    <div className="border border-[#CFE3DF] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-[55px] h-[55px] sm:w-[70px] sm:h-[70px] rounded-lg overflow-hidden shrink-0 relative bg-gray-50">
          <Image
            src={item.image}
            alt={item.name}
            width={70}
            height={70}
            className="object-cover w-full h-full"
            unoptimized={item.image?.startsWith('http')}
          />
        </div>

        <p className="text-sm sm:text-base font-medium min-w-0">
          {item.name}
          {item.weight ? (
            <span className="text-gray-500 text-xs sm:text-sm font-normal">
              {' '}
              - {item.weight}
            </span>
          ) : null}
        </p>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm sm:text-base">
            ${Number(item.price).toFixed(2)}
          </span>

          {showDiscount && (
            <>
              <span className="text-gray-400 line-through text-xs">
                ${Number(item.originalPrice).toFixed(2)}
              </span>

              <span className="bg-[#D6F5E1] text-[#008144] text-[10px] sm:text-xs px-2 py-1 rounded-xl">
                Save {item.discount}%
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => removeItem(item.product_id)}
          className="text-[#2C665E] hover:text-red-500 disabled:opacity-40 p-1"
          aria-label="Remove from wishlist"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
