'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/store/AuthStore';
import useWishlistStore from '@/store/useWishlistStore';
import { fetchAllWishlistProductIds } from '@/service/WishlistService';

export default function useProductWishlist(productId) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addProduct = useWishlistStore((state) => state.addProduct);
  const removeProductById = useWishlistStore((state) => state.removeProductById);
  const [inWishlist, setInWishlist] = useState(false);
  const [checking, setChecking] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!productId || !isAuthenticated) {
      setChecking(false);
      setInWishlist(false);
      return;
    }

    let cancelled = false;
    setChecking(true);
    fetchAllWishlistProductIds()
      .then((ids) => {
        if (!cancelled) setInWishlist(ids.has(productId));
      })
      .catch(() => {
        if (!cancelled) setInWishlist(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, productId]);

  const toggle = useCallback(async () => {
    if (!productId) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    if (checking || updating) return;

    setError('');
    setUpdating(true);
    try {
      if (inWishlist) {
        await removeProductById(productId);
        setInWishlist(false);
      } else {
        await addProduct(productId);
        setInWishlist(true);
      }
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          'Could not update wishlist',
      );
    } finally {
      setUpdating(false);
    }
  }, [addProduct, checking, inWishlist, isAuthenticated, pathname, productId, removeProductById, router, updating]);

  return { inWishlist, checking, busy: checking || updating, error, toggle };
}
