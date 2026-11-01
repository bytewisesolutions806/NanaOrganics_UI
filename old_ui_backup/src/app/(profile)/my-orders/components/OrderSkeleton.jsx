'use client';

export default function OrderCardSkeleton() {
  return (
    <div className="border border-[#CFE3DF] rounded-2xl p-4 flex items-center justify-between animate-pulse">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Image Skeleton */}
        <div className="w-[60px] h-[60px] lg:w-[85px] lg:h-[85px] bg-gray-200 rounded-xl"></div>

        {/* Text Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-40 bg-gray-200 rounded"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Right Section (Desktop) */}
      <div className="hidden lg:block text-right space-y-2">
        <div className="h-3 w-32 bg-gray-200 rounded"></div>
        <div className="h-3 w-24 bg-gray-200 rounded"></div>
        <div className="h-3 w-36 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
