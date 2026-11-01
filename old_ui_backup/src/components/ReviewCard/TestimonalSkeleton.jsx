import { Skeleton } from "primereact/skeleton";

export default function TestimonialSkeleton() {
  return (
    <div className="relative mt-5 w-full max-w-[400px]">
      {/* Quote icon placeholder */}
      <div className="absolute -top-5 left-4 z-20">
        <Skeleton width="60px" height="60px" borderRadius="50%" />
      </div>

      <div className="bg-white rounded-2xl shadow-md px-4 pt-8 pb-6 min-h-[200px]">
        {/* Comment lines */}
        <div className="space-y-3">
          <Skeleton width="100%" height="14px" />
          <Skeleton width="95%" height="14px" />
          <Skeleton width="90%" height="14px" />
          <Skeleton width="70%" height="14px" />
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-6">
          {/* Name */}
          <Skeleton width="120px" height="18px" />

          <span className="hidden sm:block w-px h-5 bg-gray-200" />

          {/* Stars */}
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} width="16px" height="16px" borderRadius="50%" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
