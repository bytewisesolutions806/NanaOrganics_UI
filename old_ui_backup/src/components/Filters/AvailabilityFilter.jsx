'use client';
import { ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';

const AvailabilityFilter = () => {
  const { filters, selected, toggleSize } = useFilterStore();
  const [isOpen, setIsOpen] = useState(true);

  const sizes = filters?.available_sizes || [];

  if (!sizes.length) return null;

  return (
    <div className="mb-6 overflow-hidden">
      {/* HEADER */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-3 bg-white rounded-2xl border border-[#E6F4F2]"
      >
        <h4 className="font-medium text-gray-900 text-base">Availability</h4>
        <ChevronUp
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`}
        />
      </button>

      {/* BODY */}
      {isOpen && (
        <div className="px-4 pb-4 mt-4">
          <ul className="space-y-3">
            {sizes.map((item) => (
              <li key={item.size}>
                <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
                  <input
                    type="radio"
                    name="availability-size"
                    checked={selected.size === item.size}
                    onChange={() => toggleSize(item.size)}
                    className="h-4 w-4 accent-[#1EA766]"
                  />
                  <span>
                    {item.size}
                    {Number(item.size) ? 'g' : ''}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AvailabilityFilter;
