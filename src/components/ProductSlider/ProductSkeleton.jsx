'use client';

export default function ProductSliderSkeleton({ title = 'Loading...' }) {
  return (
    <section className="w-full mt-10 mb-16">
      <div className="px-5 md:px-10 lg:max-w-[1300px] mx-auto">
        {/* HEADER SKELETON */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-60 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>

          <div className="h-9 w-28 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>

        {/* PRODUCT SKELETONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-[#E6F4F2] p-3">
              {/* IMAGE */}
              <div className="h-[180px] w-full bg-gray-200 rounded-xl animate-pulse"></div>

              {/* PRICE */}
              <div className="h-5 w-20 bg-gray-200 rounded mt-4 animate-pulse"></div>

              {/* TITLE */}
              <div className="h-4 w-32 bg-gray-200 rounded mt-3 animate-pulse"></div>

              {/* DROPDOWN */}
              <div className="h-10 w-full bg-gray-200 rounded-xl mt-4 animate-pulse"></div>

              {/* BUTTON */}
              <div className="h-10 w-full bg-gray-200 rounded-xl mt-4 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
