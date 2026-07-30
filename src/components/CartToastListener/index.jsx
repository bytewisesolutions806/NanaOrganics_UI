"use client";

import { useContext, useEffect } from "react";
import { ToastContext } from "../AppToastProvider";
import useCartStore from "@/store/useCartStore";

export default function CartToastListener() {
  const toastRef = useContext(ToastContext);
  const { lastAction, clearLastAction } = useCartStore();

  useEffect(() => {
    if (!lastAction || !toastRef?.current) return;

    const toast = toastRef.current;

    switch (lastAction) {
      case "ADD_SUCCESS":
        toast.show({
          severity: "success",
          summary: "Added to Cart",
          detail: "Item added successfully",
          life: 3000,
        });
        break;

      case "UPDATE_SUCCESS":
        toast.show({
          severity: "info",
          summary: "Cart Updated",
          detail: "Item quantity updated",
          life: 2500,
        });
        break;

      case "DELETE_SUCCESS":
        toast.show({
          severity: "warn",
          summary: "Item Removed",
          detail: "Item removed from cart",
          life: 3000,
        });
        break;

      case "ADD_ERROR":
      case "UPDATE_ERROR":
      case "DELETE_ERROR":
        toast.show({
          severity: "error",
          summary: "Cart Error",
          detail: "Something went wrong",
          life: 3500,
        });
        break;
    }

    clearLastAction();
  }, [lastAction, clearLastAction, toastRef]);

  return null;
}
