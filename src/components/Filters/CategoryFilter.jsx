// "use client";

// import { ChevronLeft, ChevronDown } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import useCategoryStore from "@/store/useCategotyStore";
// import { useFilterStore } from "@/store/useFilterStore";

// const VISIBLE_COUNT = 6;

// const CategoryFilter = ({ categoryHandle, subCategoryHandle }) => {
//   console.log("Sbcategory selected",subCategoryHandle)

//   const router = useRouter();

//  const { filters, selected, toggleBrand } = useFilterStore();
//  console.log("filter Loaded", filters)

//   const {
//     category,
//     subcategories,
//     fetchCategoryWithSubcategories,
//   } = useCategoryStore();

//   const [showAll, setShowAll] = useState(false);

//   useEffect(() => {
//     fetchCategoryWithSubcategories(categoryHandle);
//   }, [categoryHandle, fetchCategoryWithSubcategories]);

//   if (!category) return null;

//   const visibleSubcategories = showAll
//     ? subcategories
//     : subcategories.slice(0, VISIBLE_COUNT);

//   return (
//     <div className="mb-6">
//       {/* TITLE */}
//       <h3 className=" font-semibold mb-3 text-base">Category</h3>

//       {/* PARENT CATEGORY */}
//       {/* <button
//         onClick={() => router.push(`/shop/${category.handle}`)}
//         className="flex items-center gap-2 text-gray-700 mb-3"
//       >
//         <ChevronLeft className="h-5 w-5 text-[#2C665E]" strokeWidth={2.8} />
//         {category.name}
//       </button> */}

//       {/* ACTIVE CATEGORY */}
//       <div className="flex items-center gap-2 font-semibold text-gray-900 mb-3 text-base">
//         <ChevronDown className="h-5 w-5 text-[#2C665E]" strokeWidth={2.9} />
//          {category.name}
//       </div>

//       {/* SUBCATEGORIES */}
//       <ul className="space-y-3 text-gray-600">
//         {visibleSubcategories.map((sub) => {
//           const isActive = sub.handle === subCategoryHandle;

//           return (
//             <li key={sub.id}>
//               <button
//                 onClick={() =>
//                   router.push(
//                     `/shop/${category.handle}/${sub.handle}`
//                   )
//                 }
//                 className={`
//                   cursor-pointer text-base pl-7
//                   ${isActive ? "font-semibold text-gray-900" : "hover:text-gray-900"}
//                 `}
//               >
//                 {sub.name}
//               </button>
//             </li>
//           );
//         })}
//       </ul>

//       {/* SHOW MORE */}
//       {subcategories.length > VISIBLE_COUNT && (
//         <button
//           onClick={() => setShowAll((p) => !p)}
//           className="mt-3 text-sm font-medium text-[#1EA766]"
//         >
//           {showAll ? "Show Less" : "Show More"}
//         </button>
//       )}
//     </div>
//   );
// };

// export default CategoryFilter;

'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useFilterStore } from '@/store/useFilterStore';

const CategoryFilter = ({ categoryHandle, subCategoryHandle }) => {
  const router = useRouter();
  const { filters } = useFilterStore();

  const categories = filters?.categories || [];

  const [expandedCategory, setExpandedCategory] = useState(categoryHandle);

  useEffect(() => {
    setExpandedCategory(categoryHandle);
  }, [categoryHandle]);

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-4 text-base">Categories</h3>

      <ul className="space-y-3">
        {categories.map((cat) => {
          const isExpanded = expandedCategory === cat.handle;
          const isActiveCategory = categoryHandle === cat.handle;

          return (
            <li key={cat.id}>
              {/* PARENT CATEGORY */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : cat.handle)}
                className={`
                  w-full flex items-center justify-between
                  text-base font-semibold
                  ${isActiveCategory ? 'text-gray-900' : 'text-gray-700'}
                `}
              >
                <span>{cat.name}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-[#2C665E]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {/* SUBCATEGORIES */}
              {isExpanded && cat.subcategories?.length > 0 && (
                <ul className="mt-2 space-y-2 pl-5">
                  {cat.subcategories.map((sub) => {
                    const isActiveSub = sub.handle === subCategoryHandle;

                    return (
                      <li key={sub.id}>
                        <button
                          onClick={() => router.push(`/shop/${cat.handle}/${sub.handle}`)}
                          className={`
                            text-sm
                            ${
                              isActiveSub
                                ? 'font-semibold text-gray-900'
                                : 'text-gray-600 hover:text-gray-900'
                            }
                          `}
                        >
                          {sub.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CategoryFilter;
