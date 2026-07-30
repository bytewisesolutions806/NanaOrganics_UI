"use client";

import { Button } from "primereact/button";

interface ResponsiveButtonProps {
  label: string;
  onClick: () => void;
}

export default function ResponsiveButton({
  label,
  onClick,
}: ResponsiveButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="p-button-rounded text-sm font-medium border-2 border-[#1EA766] bg-transparent text-[#1EA766] rounded-2xl
                 flex items-center justify-center gap-2"
      style={{ padding: "0.6rem 1.4rem" }}
      iconPos="right"
    >
      {/* Force desktop label */}
      <span className="hidden sm:block">{label}</span>

      {/* Force mobile icon */}
      <i className="pi pi-angle-right block sm:hidden text-lg"></i>
    </Button>
  );
}
