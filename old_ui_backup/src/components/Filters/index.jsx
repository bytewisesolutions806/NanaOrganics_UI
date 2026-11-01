'use client';
import { ChevronDown, Rat } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import PriceRange from './PriceRangeFilter';
import BrandFilter from './BrandFilter';
import AvailabilityFilter from './AvailabilityFilter';
import DiscountFilter from './DiscountFilter';
import DietaryFilter from './DietaryFilter';
import RatingFilter from './RatingFilter';
import CategoryFilter from './CategoryFilter';

const Filters = ({ filter, category, subcategory }) => {
  console.log('Filters Category', category, subcategory);
  const {
    filters,
    loading,
    fetchFilters,
    selected,
    toggleCategory,
    toggleBrand,
    toggleSize,
    setPrice,
    clearFilters,
  } = useFilterStore();

  const [isPriceOpen, setIsPriceOpen] = useState(true);

  useEffect(() => {}, []);

  useEffect(() => {
    fetchFilters({ category, subcategory });
  }, [category, subcategory, fetchFilters]);

  if (loading) return <p>Loading filters...</p>;
  if (!filters) return null;

  return (
    <aside className="lg:col-span-1">
      <div className="lg:sticky lg:top-24">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Filters</h3>
          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-[#E6F4F2] text-[#1EA766] font-semibold rounded-2xl text-xl cursor-pointer"
          >
            Clear
          </button>
        </div>

        {/* CATEGORIES */}
        <CategoryFilter categoryHandle={category} subCategoryHandle={subcategory} />

        {/* DISCOUNT */}
        <DiscountFilter />

        {/* BRANDS */}
        <BrandFilter />

        {/* PRICE */}
        {filters.price_range && (
          <div className="rounded-xl mb-6 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsPriceOpen((p) => !p)}
              className="w-full flex items-center justify-between px-3 py-3 border border-[#E6F4F2] rounded-2xl"
            >
              <h4 className="font-medium text-gray-800 text-base">Price</h4>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${isPriceOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <div
              className={`transition-all duration-300 ${
                isPriceOpen ? 'max-h-[300px]' : 'max-h-0'
              } overflow-hidden`}
            >
              <div className="pt-2 px-1">
                <PriceRange
                  min={filters.price_range.min}
                  max={filters.price_range.max}
                  value={selected.price}
                  onChange={setPrice}
                />
              </div>
            </div>
          </div>
        )}

        {/* SIZES */}
        {filters.available_sizes?.length > 0 && <AvailabilityFilter />}

        {/* Customer Ratings */}
        <RatingFilter />

        {/* DIETARY */}
        <DietaryFilter />
      </div>
    </aside>
  );
};

export default Filters;
