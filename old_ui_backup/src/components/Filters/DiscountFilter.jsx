"use client";
import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { useFilterStore } from "@/store/useFilterStore";

const DiscountFilter = () => {
  const { filters, selected, setDiscount } = useFilterStore();
  const [isOpen, setIsOpen] = useState(true);

  const discounts = filters?.discount_ranges || [];

  if (!discounts.length) return null;

  return (
    <div className="mb-6 overflow-hidden">
      {/* HEADER */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-3 bg-white  rounded-2xl border border-[#E6F4F2] "
      >
        <h4 className="font-medium text-gray-900 text-base">Discount</h4>
        <ChevronUp
          className={`h-5 w-5 transition-transform ${
            isOpen ? "rotate-0" : "rotate-180"
          }`}
        />
      </button>

      {/* BODY */}
      {isOpen && (
        <div className="px-4 pb-4 mt-4">
          <ul className="space-y-3">
            {discounts.map((d) => (
              <li key={d.min}>
                <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
                  {/* RADIO */}
                  <input
                    type="radio"
                    name="discount"
                    checked={selected.discount === d.min}
                    onChange={() => setDiscount(d.min)}
                    className="h-4 w-4 accent-[#1EA766]"
                  />

                  {/* LABEL */}
                  <span>{d.min}% Off</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DiscountFilter;
