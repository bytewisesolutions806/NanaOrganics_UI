'use client';

import { useEffect } from 'react';
import useWishlistStore from '@/store/useWishlistStore';
import WishlistItem from './component/wishListItem';
import AccountListLayout from '@/components/profile/AccountListLayout';

export default function WishlistPage() {
  const {
    wishlist,
    loading,
    error,
    pagination,
    fetchWishlist,
    setPage,
  } = useWishlistStore();

  useEffect(() => {
    fetchWishlist(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount load only
  }, []);

  return (
    <AccountListLayout title="My Wishlist" count={pagination.total}>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : wishlist.length === 0 && !error ? (
        <p className="text-gray-400">Your wishlist is empty.</p>
      ) : (
        <>
          {wishlist.map((item) => (
            <WishlistItem key={item.product_id} item={item} />
          ))}

          {pagination.total_pages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E6F4F2] mt-2">
              <p className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.total_pages}
                <span className="text-gray-400 ml-2">
                  ({pagination.total} items)
                </span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!pagination.has_prev || loading}
                  onClick={() => setPage(pagination.page - 1)}
                  className="px-4 py-2 rounded-lg border border-[#CFE3DF] text-sm font-medium text-[#2C665E] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F1F8F7]"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!pagination.has_next || loading}
                  onClick={() => setPage(pagination.page + 1)}
                  className="px-4 py-2 rounded-lg bg-[#2C665E] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#244a45]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AccountListLayout>
  );
}
