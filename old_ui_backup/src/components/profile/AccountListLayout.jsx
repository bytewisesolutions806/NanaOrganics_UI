'use client';

export default function AccountListLayout({ title, count, children, headerRight }) {
  return (
    <div className="flex flex-col h-[650px] px-3 sm:px-4 lg:px-0">
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
  );
}
