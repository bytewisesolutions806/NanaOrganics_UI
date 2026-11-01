"use client";
import { ChevronUp, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useFilterStore } from "@/store/useFilterStore";

const VISIBLE_COUNT = 5;

const BrandFilter = () => {
  const { filters, selected, toggleBrand } = useFilterStore();

  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const brands = filters?.brands || [];

  const filteredBrands = useMemo(() => {
    return brands.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [brands, search]);

  const visibleBrands = useMemo(() => {
    if (showAll || search) return filteredBrands;
    return filteredBrands.slice(0, VISIBLE_COUNT);
  }, [filteredBrands, showAll, search]);

  if (!brands.length) return null;

  return (
    <div className="mb-6 overflow-hidden">
      {/* HEADER */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-3 bg-white rounded-2xl border border-[#E6F4F2] "
      >
        <h4 className="font-medium text-gray-900 text-base">Brand</h4>
        <ChevronUp
          className={`h-5 w-5 transition-transform ${
            isOpen ? "rotate-0" : "rotate-180"
          }`}
        />
      </button>

      {/* BODY */}
      {isOpen && (
        <div className="px-4 pb-4">
          {/* SEARCH */}
          <div className="relative mb-3 mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowAll(true); // show all when searching
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F1F7F6] text-sm outline-none  h-10 focus:ring-2 focus:ring-[#1EA766]/30"
            />
          </div>

          {/* BRAND LIST */}
          <ul className="space-y-3">
            {visibleBrands.map((brand) => (
              <li key={brand.name}>
                <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={selected.brands.includes(brand.name)}
                    onChange={() => toggleBrand(brand.name)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#1EA766]"
                  />
                  <span>{brand.name}</span>
                </label>
              </li>
            ))}

            {visibleBrands.length === 0 && (
              <p className="text-sm text-gray-400">No brands found</p>
            )}
          </ul>

          {/* SHOW MORE / LESS */}
          {filteredBrands.length > VISIBLE_COUNT && !search && (
            <button
              type="button"
              onClick={() => setShowAll((p) => !p)}
              className="mt-3 text-sm font-medium text-[#1EA766]"
            >
              {showAll ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandFilter;
