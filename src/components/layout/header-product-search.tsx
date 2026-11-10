"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search, X } from "lucide-react";

import type { StorefrontSearchResult } from "@/types/storefront";

interface HeaderProductSearchProps {
  activeBrandSlug: string;
  searchId: string;
  onClose: () => void;
}

export function HeaderProductSearch({
  activeBrandSlug,
  searchId,
  onClose,
}: HeaderProductSearchProps) {
  const [term, setTerm] = useState("");
  const [items, setItems] = useState<StorefrontSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function brandQuery() {
    return activeBrandSlug
      ? `&brand=${encodeURIComponent(activeBrandSlug)}`
      : "";
  }

  function productHref(slug: string) {
    const query = activeBrandSlug
      ? `?brand=${encodeURIComponent(activeBrandSlug)}`
      : "";
    return `/products/${encodeURIComponent(slug)}${query}`;
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchTerm = term.trim();
    if (searchTerm.length < 2) return;

    router.push(
      `/product-listing?q=${encodeURIComponent(searchTerm)}${brandQuery()}`,
    );
    onClose();
  }

  function openProduct(slug: string) {
    router.push(
      productHref(slug),
    );
    onClose();
  }

  useEffect(() => {
    if (inputRef.current?.offsetParent !== null) inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-search-toggle]")
      ) {
        return;
      }

      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const normalizedTerm = term.trim();

    if (normalizedTerm.length < 2) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/storefront/search?q=${encodeURIComponent(normalizedTerm)}`,
          { signal: controller.signal },
        );
        const result = (await response.json()) as {
          items?: StorefrontSearchResult[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error ?? "Product search failed.");
        }

        setItems(result.items ?? []);
      } catch (searchError) {
        if (controller.signal.aborted) return;
        setItems([]);
        setError(
          searchError instanceof Error
            ? searchError.message
            : "Product search is temporarily unavailable.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [term]);

  return (
    <div
      id={`${searchId}-panel`}
      ref={containerRef}
      className="absolute right-0 top-1/2 z-[55] w-[min(72vw,280px)] -translate-y-1/2 sm:relative sm:right-auto sm:top-auto sm:w-48 sm:translate-y-0 xl:w-56"
    >
      <label htmlFor={`${searchId}-input`} className="sr-only">
        Search products
      </label>
      <form
        role="search"
        onSubmit={submitSearch}
        className="flex items-center gap-2 rounded-md border border-[#cbd9ce] bg-transparent px-3 focus-within:border-[#2C5D43] focus-within:ring-2 focus-within:ring-[#2C5D43]/15"
      >
          <Search
            aria-hidden="true"
            className="size-5 shrink-0 text-[#2C5D43]"
          />
          <input
            ref={inputRef}
            id={`${searchId}-input`}
            type="search"
            value={term}
            maxLength={100}
            onChange={(event) => {
              const value = event.target.value;
              setTerm(value);
              setItems([]);
              setError(null);
              setIsLoading(value.trim().length >= 2);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") onClose();
            }}
            placeholder="Search products..."
            autoComplete="off"
            className="min-h-10 w-full min-w-0 bg-transparent text-sm text-[#27382d] outline-none placeholder:text-[#7b887e]"
          />
          {isLoading && (
            <LoaderCircle
              aria-label="Searching products"
              className="size-4 shrink-0 animate-spin text-[#2C5D43]"
            />
          )}
          <button
            type="button"
            onClick={() => {
              setTerm("");
              setItems([]);
              setError(null);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="grid size-7 shrink-0 place-items-center rounded text-[#526458] hover:bg-[#eff5ef] focus-visible:outline-2 focus-visible:outline-[#2C5D43]"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
      </form>

      {term.trim().length >= 2 && (
        <div
          className="absolute inset-x-0 top-full mt-2 rounded-md border border-[#dbe4dc] bg-white shadow-lg"
          role="region"
          aria-label="Product search suggestions"
          aria-live="polite"
        >
            {error ? (
              <p role="alert" className="px-3 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : isLoading ? (
              <p className="px-3 py-3 text-sm text-[#526458]">
                Searching products...
              </p>
            ) : !isLoading && items.length === 0 ? (
              <p className="px-3 py-3 text-sm text-[#526458]">
                No products found.
              </p>
            ) : (
              <ul>
                {items.map((item) => (
                  <li key={item.productId}>
                    <Link
                      href={productHref(item.slug)}
                      onClick={(event) => {
                        event.preventDefault();
                        openProduct(item.slug);
                      }}
                      className="block rounded-md px-3 py-3 text-sm font-medium text-[#27382d] hover:bg-[#eff5ef] focus-visible:outline-2 focus-visible:outline-[#2C5D43]"
                    >
                      {item.productName}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {!error && !isLoading ? (
              <Link
                href={`/product-listing?q=${encodeURIComponent(term.trim())}${brandQuery()}`}
                onClick={onClose}
                className="block border-t border-[#e5ece6] px-3 py-3 text-sm font-semibold text-[#315f48] hover:bg-[#eff5ef]"
              >
                View all results for “{term.trim()}”
              </Link>
            ) : null}
        </div>
      )}
    </div>
  );
}
