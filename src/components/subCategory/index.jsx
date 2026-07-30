"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "primereact/card";
import { CategorySkeleton } from "../Category/CategorySkeleton";

const SubCategorySection = ({
  categoryHandle,
  categoryName,
  categoryDescription,
  subcategories = [],
  loading
}) => {

  const router = useRouter();
  return (
    <section className="w-full p-5 md:p-10 lg:max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="sm:text-3xl font-semibold text-gray-800">
            {categoryName}
          </h2>
          <p className="text-gray-600 sm:text-sm mt-1">
            {categoryDescription}
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="w-full">
        <div
          className="
            grid w-full grid-cols-2 gap-4 px-1
            sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
          "
        >
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <CategorySkeleton key={index} />
              ))
            : subcategories.map((item) => (
                <Card
                  key={item.id}
                  onClick={() =>
                    router.push(
                      `/shop/${categoryHandle}/${item.slug || item.handle}`
                    )
                  }
                  className="
                    bg-[#E6F4F2] hover:bg-white text-center cursor-pointer
                    h-[250px] w-full min-w-0
                    flex flex-col items-center justify-between
                    transition duration-200
                    rounded-2xl
                  "
                >
                  {/* Image (fallback supported) */}
                  <div
                    className="
                      relative
                      w-full max-w-[180px] h-[160px]
                      sm:h-[170px]
                      lg:h-[174px]
                      mt-2
                    "
                  >
                    <Image
                      src={
                        item.featuredAsset?.preview?.replace(/\\/g, "/") ??
                        item.image ??
                        "/AppLogo.svg"
                      }
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 140px, 174px"
                      className="object-cover rounded-2xl"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="mt-6 text-gray-800 text-base font-semibold mb-3">
                    {item.name}
                  </h3>
                </Card>
              ))}
        </div>
      </div>
    </section>
  );
};

export default SubCategorySection;
