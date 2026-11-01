"use client";

/* eslint-disable @next/next/no-img-element -- Vendure product assets use environment-specific hosts. */

import { useCallback, useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { AccountHeading, EmptyState, LoadingCards, Pagination } from "./account-ui";
import {
  type WishlistItem,
  formatMoney,
  getWishlist,
} from "@/services/api/account";
import {
  clearSharedWishlist,
  removeProductFromSharedWishlist,
  useWishlist,
} from "@/features/wishlist/wishlist-store";

const PAGE_SIZE = 10;

export function WishlistManager() {
  useWishlist();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState("");
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async (nextPage: number) => {
    setLoading(true); setError("");
    try {
      const result = await getWishlist(nextPage, PAGE_SIZE);
      setItems(result.items); setTotal(result.totalItems); setPage(nextPage);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not load your wishlist.";
      if (/not (?:currently )?authorized|unauthorized|session|login/i.test(message)) router.replace("/login"); else setError(message);
    } finally { setLoading(false); }
  }, [router]);
  useEffect(() => {
    let active = true;
    getWishlist(1, PAGE_SIZE)
      .then((result) => { if (active) { setItems(result.items); setTotal(result.totalItems); } })
      .catch((caught: unknown) => {
        if (!active) return;
        const message = caught instanceof Error ? caught.message : "Could not load your wishlist.";
        if (/not (?:currently )?authorized|unauthorized|session|login/i.test(message)) router.replace("/login");
        else setError(message);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router]);

  async function remove(productId: string) {
    setRemoving(productId); setError("");
    try { await removeProductFromSharedWishlist(productId); await load(items.length === 1 && page > 1 ? page - 1 : page); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not remove the item."); }
    finally { setRemoving(""); }
  }
  async function clearAll() {
    setClearing(true); setError("");
    try { await clearSharedWishlist(); setItems([]); setTotal(0); setPage(1); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not clear the wishlist."); }
    finally { setClearing(false); }
  }

  return (
    <section>
      <AccountHeading title="My Wishlist" count={total} action={total ? <button type="button" onClick={clearAll} disabled={clearing || loading} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={16} /> {clearing ? "Clearing…" : "Clear all"}</button> : null} />
      {error ? <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <LoadingCards /> : items.length === 0 ? <EmptyState title="Your wishlist is empty" message="Save products you love and they’ll appear here." /> : (
        <div className="rounded-2xl border border-[#cfe3df] bg-white p-3 sm:p-5">
          <div className="divide-y divide-[#e2ece9]">
            {items.map((item) => (
              <article key={item.productId} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                <div className="grid size-[76px] shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f2f8f6]">
                  {item.imageUrl ? <img src={item.imageUrl} alt="" className="size-full object-contain p-2" /> : <Heart size={26} className="text-[#80aaa2]" />}
                </div>
                <div className="min-w-0 flex-1"><h2 className="font-semibold text-[#26332e]">{item.name}</h2>{item.variantName ? <p className="mt-1 text-sm text-[#74807b]">{item.variantName}</p> : null}<p className="mt-2 font-bold">{formatMoney(item.price, item.currencyCode)}</p></div>
                <button type="button" onClick={() => remove(item.productId)} disabled={removing === item.productId} aria-label={`Remove ${item.name} from wishlist`} className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-[#cfe3df] px-3 text-sm font-semibold text-[#2c665e] hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:self-auto"><Trash2 size={16} /> {removing === item.productId ? "Removing…" : "Remove"}</button>
              </article>
            ))}
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} totalItems={total} onChange={(nextPage) => void load(nextPage)} />
        </div>
      )}
    </section>
  );
}
