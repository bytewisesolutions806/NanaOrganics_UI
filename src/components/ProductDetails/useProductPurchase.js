'use client';

import { useState } from 'react';
import useCartStore from '@/store/useCartStore';

export default function useProductPurchase(productData) {
  const variants = productData?.variants || [];
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(
    () => variants.find((variant) => variant.isPopular) || variants.find((variant) => variant.in_stock) || variants[0] || null,
  );
  const addToCart = useCartStore((state) => state.addToCart);
  const addingVariantId = useCartStore((state) => state.addingVariantId);

  const isVariantInStock = selectedVariant?.in_stock === true && selectedVariant?.inventory_quantity > 0;
  const isAdding = addingVariantId === selectedVariant?.id;

  const addSelectedVariant = () => {
    if (!selectedVariant || !isVariantInStock || isAdding) return;
    addToCart({ variant_id: selectedVariant.id, quantity });
  };

  return {
    quantity,
    selectedVariant,
    setSelectedVariant,
    isVariantInStock,
    isAdding,
    sellingPrice: selectedVariant?.price,
    mrpPrice: selectedVariant?.original_price,
    currency: selectedVariant?.currency ?? 'USD',
    increaseQuantity: () => setQuantity((current) => current + 1),
    decreaseQuantity: () => setQuantity((current) => (current > 1 ? current - 1 : 1)),
    addSelectedVariant,
  };
}
