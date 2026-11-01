"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/AuthStore";
import useCartStore from '@/store/useCartStore';
import useWishlistStore from '@/store/useWishlistStore';
import { AUTH_EVENT_KEY } from '@/lib/authSession';

export default function AuthHydration() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const syncAuthEvent = (event) => {
      if (event.key !== AUTH_EVENT_KEY || !event.newValue) return;

      try {
        const authEvent = JSON.parse(event.newValue);
        if (authEvent.type !== 'logout') return;

        useAuthStore.getState().logoutFromAnotherTab();
        useCartStore.getState().resetCart();
        useWishlistStore.getState().resetWishlist();
      } catch {
        // Ignore malformed or unrelated localStorage values.
      }
    };

    window.addEventListener('storage', syncAuthEvent);
    return () => window.removeEventListener('storage', syncAuthEvent);
  }, []);

  return null;
}
