'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/store/AuthStore';
import useWishlistStore from '@/store/useWishlistStore';

export default function useProductWishlist(productId) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const normalizedId = productId == null ? '' : String(productId);
  const productIds = useWishlistStore((state) => state.wishlistProductIds);
  const idsLoaded = useWishlistStore((state) => state.wishlistIdsLoaded);
  const idsLoading = useWishlistStore((state) => state.wishlistIdsLoading);
  const fetchProductIds = useWishlistStore((state) => state.fetchWishlistProductIds);
  const addProduct = useWishlistStore((state) => state.addProduct);
  const removeProductById = useWishlistStore((state) => state.removeProductById);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!normalizedId || !isAuthenticated || idsLoaded) return;
    fetchProductIds().catch(() => {
      setError('Could not load your wishlist');
    });
  }, [fetchProductIds, idsLoaded, isAuthenticated, normalizedId]);

  const inWishlist = normalizedId ? productIds.has(normalizedId) : false;
  const checking = Boolean(
    normalizedId && isAuthenticated && (!idsLoaded || idsLoading),
  );

  const toggle = useCallback(async () => {
    if (!normalizedId) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    if (checking || updating) return;

    setError('');
    setUpdating(true);
    try {
      if (inWishlist) {
        await removeProductById(normalizedId);
      } else {
        await addProduct(normalizedId);
      }
    } catch (requestError) {
      setError(requestError?.message || 'Could not update wishlist');
    } finally {
      setUpdating(false);
    }
  }, [addProduct, checking, inWishlist, isAuthenticated, normalizedId, pathname, removeProductById, router, updating]);

  return { inWishlist, checking, busy: checking || updating, error, toggle };
}
