'use client';

/**
 * Simple page controls for My Orders (1-based page index).
 */
export default function OrdersPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  /** e.g. "orders" | "reviews" — shown in "Showing X–Y of Z …" */
  itemLabel = 'orders',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  if (totalItems === 0 || totalPages <= 1) return null;

  const go = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== page) onPageChange(next);
  };

  const pages = [];
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1);
  }
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 mt-2 border-t border-[#CFE3DF]">
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium text-gray-800">{from}</span>–
        <span className="font-medium text-gray-800">{to}</span> of{' '}
        <span className="font-medium text-gray-800">{totalItems}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="px-3 py-2 text-sm rounded-lg border border-[#C6D8D7] text-[#2C665E] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F1F8F7]"
        >
          Previous
        </button>

        <div className="flex items-center gap-1">
          {start > 1 && (
            <>
              <PageBtn n={1} current={page} go={go} />
              {start > 2 && <span className="px-1 text-gray-400">…</span>}
            </>
          )}
          {pages.map((n) => (
            <PageBtn key={n} n={n} current={page} go={go} />
          ))}
          {end < totalPages && (
            <>
              {end < totalPages - 1 && (
                <span className="px-1 text-gray-400">…</span>
              )}
              <PageBtn n={totalPages} current={page} go={go} />
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-2 text-sm rounded-lg border border-[#C6D8D7] text-[#2C665E] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F1F8F7]"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function PageBtn({ n, current, go }) {
  const active = n === current;
  return (
    <button
      type="button"
      onClick={() => go(n)}
      className={`min-w-[2.25rem] h-9 px-2 text-sm rounded-lg transition-colors ${
        active
          ? 'bg-[#1EA766] text-white font-semibold'
          : 'border border-[#C6D8D7] text-[#2C665E] hover:bg-[#F1F8F7]'
      }`}
    >
      {n}
    </button>
  );
}
