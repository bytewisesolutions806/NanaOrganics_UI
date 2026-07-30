'use client';

import useOrdersFilterStore from '@/store/useOrdersFilterStore';

export default function MyOrdersFilter({ filterOpen, setFilterOpen, filters }) {
  const { selectedFilters, toggleFilter, clearFilters } =
    useOrdersFilterStore();

  if (!filters) return null;

  const renderStatus = () => (
    <div className="space-y-3 text-sm">
      {filters?.status?.map((item) => {
        const label = item.label || item;
        const value = item.id || item;
        const checked = selectedFilters.status?.includes(value);

        return (
          <label key={value} className="flex gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleFilter('status', value)}
            />
            {label}
          </label>
        );
      })}
    </div>
  );

  const renderOrderTime = () => (
    <div className="space-y-3 text-sm">
      {filters?.orderTime?.map((item) => {
        const label = item.label || item;
        const value = item.id || item;
        const checked = selectedFilters.orderTime?.includes(value);

        return (
          <label key={value} className="flex gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleFilter('orderTime', value)}
            />
            {label}
          </label>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="hidden lg:block lg:col-span-3 bg-[#E6EFEF] rounded-xl p-6">
        <h3 className="font-semibold mb-4">Status</h3>
        {renderStatus()}

        <h3 className="font-semibold mt-6 mb-4">Order Time</h3>
        {renderOrderTime()}

        <button
          type="button"
          onClick={() => clearFilters()}
          className="mt-4 text-sm text-[#2C665E] underline"
        >
          Clear filters
        </button>
      </div>

      {filterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[998]"
            onClick={() => setFilterOpen(false)}
            aria-hidden
          />

          <div className="fixed top-0 right-0 h-full w-[80%] max-w-[320px] bg-white shadow-xl z-[999] p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>

              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="text-gray-500 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-3">Status</h4>
              {renderStatus()}
            </div>

            <div>
              <h4 className="font-semibold mb-3">Order Time</h4>
              {renderOrderTime()}
            </div>

            <button
              type="button"
              onClick={() => clearFilters()}
              className="mt-6 text-sm text-[#2C665E] underline"
            >
              Clear filters
            </button>
          </div>
        </>
      )}
    </>
  );
}
