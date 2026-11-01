'use client';
import { ChevronUp, Star } from 'lucide-react';
import { useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';

const RATINGS = [4, 3, 2];

const RatingFilter = () => {
  const { selected, setRating } = useFilterStore();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-6 overflow-hidden">
      {/* HEADER */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-3 bg-white  rounded-2xl border border-[#E6F4F2]"
      >
        <h4 className="font-medium text-gray-900 text-base">Customer Ratings</h4>
        <ChevronUp
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`}
        />
      </button>

      {/* BODY */}
      {isOpen && (
        <div className="px-4 pb-4 mt-4">
          <ul className="space-y-3">
            {RATINGS.map((r) => (
              <li key={r}>
                <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
                  <input
                    type="radio"
                    name="rating"
                    checked={selected.rating === r}
                    onChange={() => setRating(selected.rating === r ? null : r)}
                    className="h-4 w-4 accent-[#1EA766]"
                  />

                  <span className="flex items-center gap-1">
                    {r}
                    <Star className="h-4 w-4 fill-[#1EA766] text-[#1EA766]" />
                    &amp; Above
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

export default RatingFilter;
