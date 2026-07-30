"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Pagination = ({ page, totalPages, onPageChange }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const changePage = (nextPage) => {
    if (onPageChange) {
      onPageChange(nextPage);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const getPages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (page > 3) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i += 1) pages.push(i);

    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-2 sm:gap-3"
    >
      <button
        type="button"
        onClick={() => changePage(page - 1)}
        disabled={page === 1}
        aria-label="Go to previous page"
        className="flex items-center gap-1 rounded-xl bg-[#E6F4F2] px-3 py-2.5 text-sm text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:rounded-2xl sm:px-5 sm:py-3"
      >
        <ChevronLeft size={18} />
        Prev
      </button>

      <span className="min-w-24 text-center text-sm text-gray-700 sm:hidden">
        Page {page} of {totalPages}
      </span>

      <div className="hidden items-center gap-2 sm:flex sm:gap-3">
        {getPages().map((item, index) =>
          item === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
              &hellip;
            </span>
          ) : (
            <button
              type="button"
              key={item}
              onClick={() => changePage(item)}
              aria-label={`Go to page ${item}`}
              aria-current={item === page ? "page" : undefined}
              className={`h-12 w-12 rounded-2xl text-sm font-medium ${
                item === page
                  ? "bg-[#E6F4F2] text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => changePage(page + 1)}
        disabled={page === totalPages}
        aria-label="Go to next page"
        className="flex items-center gap-1 rounded-xl bg-[#E6F4F2] px-3 py-2.5 text-sm text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:rounded-2xl sm:px-5 sm:py-3"
      >
        Next
        <ChevronRight size={18} />
      </button>
    </nav>
  );
};

export default Pagination;
