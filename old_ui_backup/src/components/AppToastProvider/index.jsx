"use client";

import { Toast } from "primereact/toast";
import { createContext, useRef } from "react";

export const ToastContext = createContext(null);

export default function AppToastProvider({ children }) {
  const toastRef = useRef(null);

  return (
    <ToastContext.Provider value={toastRef}>
      <Toast ref={toastRef} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
}
