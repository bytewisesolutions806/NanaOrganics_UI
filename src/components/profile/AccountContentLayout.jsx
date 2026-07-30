'use client';

export default function AccountContentLayout({ title, count, headerRight, children, sidebar }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Main Content */}
      <div className={`col-span-12 ${sidebar ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
        <div className="flex flex-col h-[650px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>

              {typeof count !== 'undefined' && (
                <span className="bg-[#E6EFEF] text-[#2C665E] px-3 py-1 rounded-xl text-xs sm:text-sm">
                  {count}
                </span>
              )}
            </div>

            {headerRight}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">{children}</div>
        </div>
      </div>

      {/* Optional Sidebar (Filters etc.) */}
      {sidebar && <div className="hidden lg:block lg:col-span-3">{sidebar}</div>}
    </div>
  );
}
