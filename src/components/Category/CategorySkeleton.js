import { Skeleton } from "primereact/skeleton";

export const CategorySkeleton = () => (
  <div
    className="
      bg-[#E6F4F2]
      h-[250px] w-[198px]
      rounded-2xl
      flex flex-col items-center
      shrink-0
      p-3
    "
  >
    {/* Image placeholder */}
    <Skeleton
      width="174px"
      height="174px"
      borderRadius="16px" // ✅ matches rounded-2xl
      animation="wave"
    />

    {/* Title placeholder */}
    <div className="mt-6 w-full flex justify-center">
      <Skeleton width="60%" height="18px" animation="wave" />
    </div>
  </div>
);
