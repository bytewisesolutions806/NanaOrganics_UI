'use client';

import { useContext, useEffect } from 'react';
import { ToastContext } from '../AppToastProvider';
import useCartStore from '@/store/useCartStore';

export default function CartToastListener() {
  const toastRef = useContext(ToastContext);
  const { lastAction, clearLastAction } = useCartStore();

  useEffect(() => {
    if (!lastAction || !toastRef?.current) return;

    const toast = toastRef.current;

    switch (lastAction) {
      case 'ADD_SUCCESS':
        toast.show({
          severity: 'success',
          summary: 'Added to Cart',
          detail: 'The item has been added successfully to your cart.',
          life: 3000,
        });
        break;

      case 'UPDATE_SUCCESS':
        toast.show({
          severity: 'info',
          summary: 'Cart Updated',
          detail: 'The item quantity has been updated successfully.',
          life: 2500,
        });
        break;

      case 'DELETE_SUCCESS':
        toast.show({
          severity: 'warn',
          summary: 'Item Removed',
          detail: 'The item has been successfully removed from your cart.',
          life: 3000,
        });
        break;

      case 'ADD_ERROR':
      case 'UPDATE_ERROR':
      case 'DELETE_ERROR':
        toast.show({
          severity: 'error',
          summary: 'Cart Error',
          detail: 'We could not update your cart. Please try again.',
          life: 3500,
        });
        break;
    }

    clearLastAction();
  }, [lastAction, clearLastAction, toastRef]);

  return null;
}
