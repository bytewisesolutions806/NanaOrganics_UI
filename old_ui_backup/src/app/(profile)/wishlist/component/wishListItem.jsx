'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import useWishlistStore from '@/store/useWishlistStore';
import { formatCurrency } from '@/utils/formatCurrency';

export default function WishlistItem({ item }) {
  const removeItem = useWishlistStore((state) => state.removeItem);
  const removingId = useWishlistStore((state) => state.removingId);
  const busy = removingId === item.product_id;
  const productHref = `/shop/wishlist/wishlist/${encodeURIComponent(item.slug)}`;

  return (
    <div className="border border-[#CFE3DF] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <Link
        href={productHref}
        className="flex min-w-0 flex-1 flex-col gap-3 rounded-lg sm:flex-row sm:items-center sm:justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1EA766]"
      >
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

          <p className="text-sm sm:text-base font-medium min-w-0 hover:text-[#1EA766]">
            {item.name}
            {item.weight ? (
              <span className="text-gray-500 text-xs sm:text-sm font-normal">
                {' '}
                - {item.weight}
              </span>
            ) : null}
          </p>
        </div>

        <span className="font-semibold text-sm sm:text-base">
          {formatCurrency(item.price, item.currency)}
        </span>
      </Link>

      <button
        type="button"
        disabled={busy}
        onClick={() => removeItem(item.product_id)}
        className="self-end text-[#2C665E] hover:text-red-500 disabled:opacity-40 p-1 sm:self-auto"
        aria-label={`Remove ${item.name} from wishlist`}
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
