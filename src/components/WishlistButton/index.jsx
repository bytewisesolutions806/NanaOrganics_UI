'use client';

import useProductWishlist from '@/components/ProductDetails/useProductWishlist';

export default function WishlistButton({ productId, className = '' }) {
  const wishlist = useProductWishlist(productId);

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    wishlist.toggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={wishlist.busy}
      aria-label={wishlist.inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={wishlist.inWishlist}
      title={wishlist.error || undefined}
      className={`flex items-center justify-center bg-white text-[#1EA766] transition-colors hover:bg-[#E6F4F2] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {wishlist.checking ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1EA766] border-t-transparent" />
      ) : (
        <span
          className={`pi text-[16px] ${wishlist.inWishlist ? 'pi-heart-fill' : 'pi-heart'}`}
        />
      )}
    </button>
  );
}
