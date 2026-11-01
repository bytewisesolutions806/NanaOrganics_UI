'use client';

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import CategoryList from '@/components/CategoryList';

export default function MobileCategoryFilter({ availableFilters = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 🔘 FILTER BUTTON (Mobile only) */}
      <button
        onClick={() => setOpen(true)}
        className="
          lg:hidden ml-auto
          flex items-center gap-2
          bg-[#E6F4F2] text-[#2C665E]
          px-4 py-2 rounded-xl
          text-sm font-semibold
        "
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filter
      </button>

      {/* 🌑 BACKDROP */}
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />}

      {/* 📦 DRAWER */}
      <div
        className={`
    fixed left-0
    top-[50px]
    h-[calc(100%-50px)]
    w-[85%] max-w-sm
    bg-white z-50 shadow-xl
    transform transition-transform duration-300
    ${open ? 'translate-x-0' : '-translate-x-full'}
  `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Categories &amp; Filters</h2>
          <button onClick={() => setOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* CATEGORY LIST */}
        <div className="h-[calc(100%-65px)] overflow-y-auto p-4">
          <CategoryList availableFilters={availableFilters} />
        </div>
      </div>
    </>
  );
}
