"use client";

import { useState, useEffect } from "react";
import { ArrowDownWideNarrow, X } from "lucide-react";
import Filters from "@/components/Filters";

const MobileFilterTrigger = ({ filters, category, subcategory }) => {
  const [open, setOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  return (
    <>
      {/* ICON (Mobile only) */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden ml-auto bg-[#E6F4F2] rounded-xl w-10 h-10 flex items-center justify-center"
        aria-label="Open Filters"
      >
        <ArrowDownWideNarrow className="h-6 w-6 text-[#2C665E]" />
      </button>

      {/* OVERLAY */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* PANEL */}
          <div className="absolute inset-y-0 right-0 w-full bg-white overflow-y-auto">
            {/* HEADER */}
            <div className="sticky top-0 flex items-center justify-between px-4 py-4 border-b bg-white">
              <h2 className="text-base font-semibold">Filters</h2>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FILTER CONTENT */}
            <div className="p-4">
              <Filters filters={filters} />
            </div>

            {/* FOOTER */}
            <div className="sticky bottom-0 p-4 border-t bg-white border-[#2C665E]">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-xl bg-[#1EA766] text-white font-medium text-base"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileFilterTrigger;
