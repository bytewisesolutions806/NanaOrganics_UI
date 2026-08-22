'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CarouselArrow({ direction, className = '', label }) {
  const isPrevious = direction === 'previous';
  const Icon = isPrevious ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={label || (isPrevious ? 'Previous items' : 'Next items')}
      className={`h-10 w-10 cursor-pointer items-center justify-center text-[#1EA766] transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1EA766] focus-visible:ring-offset-2 ${className}`}
    >
      <Icon className="h-10 w-10" strokeWidth={1.8} aria-hidden="true" />
    </button>
  );
}
