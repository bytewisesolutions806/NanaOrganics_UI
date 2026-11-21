import { ChevronLeft, ChevronRight } from "lucide-react";

export function AccountHeading({
  eyebrow = "My account",
  title,
  count,
  action,
}: {
  eyebrow?: string;
  title: string;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2c665e]">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-semibold text-[#1f2c27]">
          {title}{typeof count === "number" ? <span className="ml-2 text-lg font-normal text-[#75807c]">({count})</span> : null}
        </h1>
      </div>
      {action}
    </header>
  );
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onChange,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  onChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const visiblePageCount = Math.min(4, totalPages);
  const firstVisiblePage = Math.max(
    1,
    Math.min(page - 1, totalPages - visiblePageCount + 1),
  );
  const visiblePages = Array.from(
    { length: visiblePageCount },
    (_, index) => firstVisiblePage + index,
  );

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-center gap-2 border-t border-[#e3ece9] pt-5"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="inline-flex h-10 items-center justify-center gap-1 rounded-md border border-[#a9c9a5] px-2 text-sm font-medium text-[#2c665e] transition hover:bg-[#f1f8f6] disabled:border-[#dfe7e2] disabled:text-[#aab5af] sm:px-4"
      >
        <ChevronLeft size={17} aria-hidden="true" />
        <span className="hidden sm:inline">Prev</span>
      </button>
      {firstVisiblePage > 1 ? (
        <span
          aria-hidden="true"
          className="grid size-10 place-items-center text-sm text-[#2c665e]"
        >
          …
        </span>
      ) : null}
      {visiblePages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onChange(pageNumber)}
          aria-label={`Page ${pageNumber}`}
          aria-current={pageNumber === page ? "page" : undefined}
          className={`grid size-10 place-items-center rounded-md text-sm font-semibold transition ${
            pageNumber === page
              ? "bg-[#2c665e] text-white shadow-sm"
              : "text-[#2c665e] hover:bg-[#eef7f1]"
          }`}
        >
          {String(pageNumber).padStart(2, "0")}
        </button>
      ))}
      {firstVisiblePage + visiblePageCount - 1 < totalPages ? (
        <span
          aria-hidden="true"
          className="grid size-10 place-items-center text-sm text-[#2c665e]"
        >
          …
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="inline-flex h-10 items-center justify-center gap-1 rounded-md border border-[#2c665e] px-2 text-sm font-medium text-[#2c665e] transition hover:bg-[#f1f8f6] disabled:border-[#dfe7e2] disabled:text-[#aab5af] sm:px-4"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={17} aria-hidden="true" />
      </button>
    </nav>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#bcd6d1] bg-[#f7fbfa] px-6 py-14 text-center">
      <h2 className="text-lg font-semibold text-[#26342e]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6e7975]">{message}</p>
    </div>
  );
}

export function LoadingCards({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-2xl border border-[#e1ebe8] bg-white p-5">
          <div className="h-full rounded-xl bg-[#edf4f1]" />
        </div>
      ))}
    </div>
  );
}
