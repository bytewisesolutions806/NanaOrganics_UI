'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useEffect, useState } from 'react';
import useCategoryStore from '@/store/useCategotyStore';

const CategoryList = ({ availableFilters = [] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { category: categoryHandle, subcategory: subcategoryHandle } = useParams();
  const { categories, fetchCategories, loading, error } = useCategoryStore();
  const [manualExpanded, setManualExpanded] = useState(null);

  const expandedCategory = manualExpanded ?? categoryHandle;

  const selectedValues = (facetId) =>
    (searchParams.get(`f_${facetId}`) || '').split(',').filter(Boolean);

  const toggleFilter = (facetId, valueId) => {
    const key = `f_${facetId}`;
    const selected = new Set(selectedValues(facetId));

    if (selected.has(valueId)) selected.delete(valueId);
    else selected.add(valueId);

    const nextParams = new URLSearchParams(searchParams.toString());
    if (selected.size > 0) nextParams.set(key, [...selected].join(','));
    else nextParams.delete(key);
    nextParams.delete('page');

    const query = nextParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams.toString());
    for (const key of [...nextParams.keys()]) {
      if (key.startsWith('f_')) nextParams.delete(key);
    }
    nextParams.delete('page');

    const query = nextParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const hasSelectedFilters = [...searchParams.keys()].some((key) =>
    key.startsWith('f_'),
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading && categories.length === 0) {
    return <p className="text-sm text-gray-500">Loading categories...</p>;
  }

  if (error && categories.length === 0) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (categories.length === 0) {
    return <p className="text-sm text-gray-500">No categories available.</p>;
  }

  return (
    <aside aria-label="Catalog filters" className="space-y-8">
      <nav aria-label="Product categories">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Categories</h2>

      <ul className="category-scrollbar max-h-96 space-y-3 overflow-y-auto pr-2">
        {categories.map((category) => {
          const isExpanded = expandedCategory === category.handle;
          const isActive = categoryHandle === category.handle;

          return (
            <li key={category.id}>
              <button
                type="button"
                onClick={() =>
                  setManualExpanded(isExpanded ? '' : category.handle)
                }
                aria-expanded={isExpanded}
                className={`flex w-full items-center justify-between gap-2 text-left font-semibold ${
                  isActive ? 'text-[#1EA766]' : 'text-gray-800'
                }`}
              >
                <span>{category.name}</span>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 shrink-0" />
                ) : (
                  <ChevronRight className="h-5 w-5 shrink-0" />
                )}
              </button>

              {isExpanded && category.subcategories.length > 0 && (
                <ul className="mt-2 space-y-2 border-l border-[#DDECE9] pl-4">
                  {category.subcategories.map((subcategory) => {
                    const isActiveSubcategory =
                      subcategory.handle === subcategoryHandle;

                    return (
                      <li key={subcategory.id}>
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/shop/${category.handle}/${subcategory.handle}`,
                            )
                          }
                          className={`text-left text-sm hover:text-[#1EA766] ${
                            isActiveSubcategory
                              ? 'font-semibold text-[#1EA766]'
                              : 'text-gray-600'
                          }`}
                        >
                          {subcategory.name}
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
      </nav>

      {availableFilters.length > 0 && (
        <section aria-labelledby="available-filters-title">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2
              id="available-filters-title"
              className="text-lg font-semibold text-gray-900"
            >
              Filters
            </h2>
            {hasSelectedFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-[#1EA766] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-3">
            {availableFilters.map((facet) => (
              <details
                key={facet.id}
                open
                className="rounded-xl bg-white"
              >
                <summary className="cursor-pointer list-none px-3 py-3 font-semibold text-gray-800">
                  {facet.name}
                </summary>
                <ul className="max-h-56 space-y-2 overflow-y-auto px-3 py-3">
                  {facet.values.map((value) => (
                    <li key={value.id}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedValues(facet.id).includes(value.id)}
                          onChange={() => toggleFilter(facet.id, value.id)}
                          className="h-4 w-4 rounded accent-[#1EA766]"
                        />
                        <span className="min-w-0 flex-1">{value.name}</span>
                        <span className="text-xs text-gray-400">{value.count}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
};

export default CategoryList;
