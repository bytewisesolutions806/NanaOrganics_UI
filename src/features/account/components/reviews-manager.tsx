"use client";

/* eslint-disable @next/next/no-img-element -- Vendure review assets use environment-specific hosts. */

import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Star, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { AccountHeading, EmptyState, LoadingCards, Pagination } from "./account-ui";
import {
  type CustomerReview,
  deleteCustomerReview,
  getCustomerReviews,
  updateCustomerReview,
} from "@/services/api/account";

const PAGE_SIZE = 8;

export function ReviewsManager() {
  const router = useRouter();
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<CustomerReview | null>(null);
  const [deleting, setDeleting] = useState<CustomerReview | null>(null);

  const load = useCallback(async (nextPage: number) => {
    setLoading(true); setError("");
    try {
      const result = await getCustomerReviews(nextPage, PAGE_SIZE);
      setReviews(result.items); setTotal(result.totalItems); setPage(nextPage);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not load your reviews.";
      if (/not (?:currently )?authorized|unauthorized|session|login/i.test(message)) router.replace("/login"); else setError(message);
    } finally { setLoading(false); }
  }, [router]);
  useEffect(() => {
    let active = true;
    getCustomerReviews(1, PAGE_SIZE)
      .then((result) => { if (active) { setReviews(result.items); setTotal(result.totalItems); } })
      .catch((caught: unknown) => {
        if (!active) return;
        const message = caught instanceof Error ? caught.message : "Could not load your reviews.";
        if (/not (?:currently )?authorized|unauthorized|session|login/i.test(message)) router.replace("/login");
        else setError(message);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router]);

  return (
    <section>
      <AccountHeading title="My Reviews & Ratings" count={total} />
      {error ? <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <LoadingCards /> : reviews.length === 0 ? <EmptyState title="No reviews yet" message="After an order is delivered, you can review its products from My Orders." /> : (
        <div className="space-y-4">
          {reviews.map((review) => <ReviewCard key={review.id} review={review} onEdit={() => setEditing(review)} onDelete={() => setDeleting(review)} />)}
          <Pagination page={page} pageSize={PAGE_SIZE} totalItems={total} onChange={(nextPage) => void load(nextPage)} />
        </div>
      )}
      {editing ? <EditReviewDialog review={editing} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await load(page); }} /> : null}
      {deleting ? <DeleteReviewDialog review={deleting} onClose={() => setDeleting(null)} onDeleted={async () => { setDeleting(null); await load(reviews.length === 1 && page > 1 ? page - 1 : page); }} /> : null}
    </section>
  );
}

function Rating({ value, onChange, size = 18 }: { value: number; onChange?: (value: number) => void; size?: number }) {
  return <div className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>{[1, 2, 3, 4, 5].map((star) => onChange ? <button key={star} type="button" onClick={() => onChange(star)} aria-label={`Rate ${star} stars`} className="rounded p-0.5 focus-visible:outline-2 focus-visible:outline-[#2c665e]"><Star size={size} className={star <= value ? "fill-amber-400 text-amber-400" : "text-[#cbd4d0]"} /></button> : <Star key={star} size={size} aria-hidden="true" className={star <= value ? "fill-amber-400 text-amber-400" : "text-[#cbd4d0]"} />)}</div>;
}

function ReviewCard({ review, onEdit, onDelete }: { review: CustomerReview; onEdit: () => void; onDelete: () => void }) {
  const images = [...review.images.map((image) => image.url), ...review.legacyImages];
  const statusClass = review.status === "approved" ? "bg-emerald-50 text-emerald-800" : review.status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800";
  return (
    <article className="rounded-2xl border border-[#cfe3df] bg-white p-4 sm:p-5">
      <div className="flex gap-4">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f2f8f6]">{review.productPreview ? <img src={review.productPreview} alt="" className="size-full object-contain p-1" /> : <Star size={25} className="text-[#80aaa2]" />}</div>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-semibold text-[#26332e]">{review.productName || "Product"}</h2><div className="mt-1 flex flex-wrap items-center gap-2"><Rating value={review.rating} /><span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusClass}`}>{review.status}</span></div></div><time className="text-xs text-[#7c8782]">{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(review.createdAt))}</time></div></div>
      </div>
      {review.title ? <h3 className="mt-4 font-semibold">{review.title}</h3> : null}
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5f6b66]">{review.content}</p>
      {images.length ? <div className="mt-3 flex flex-wrap gap-2">{images.map((src, index) => <div key={`${src}-${index}`} className="size-16 overflow-hidden rounded-lg border border-[#d9e5e2]"><img src={src} alt="" className="size-full object-cover" /></div>)}</div> : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5eeeb] pt-3"><p className="inline-flex items-center gap-1.5 text-xs text-[#64716c]">{review.verifiedPurchase ? <><CheckCircle2 size={14} className="text-[#1ea766]" /> Verified purchase</> : `Order #${review.orderCode}`}</p><div className="flex gap-3"><button type="button" onClick={onEdit} className="text-sm font-semibold text-[#2c665e] hover:underline">Edit</button><button type="button" onClick={onDelete} className="text-sm font-semibold text-red-600 hover:underline">Delete</button></div></div>
    </article>
  );
}

interface NewImage { file: File; preview: string; }
function EditReviewDialog({ review, onClose, onSaved }: { review: CustomerReview; onClose: () => void; onSaved: () => Promise<void> }) {
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(review.title);
  const [content, setContent] = useState(review.content);
  const [images, setImages] = useState(review.images);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const previews = useRef(new Set<string>());
  useEffect(() => () => { previews.current.forEach((url) => URL.revokeObjectURL(url)); }, []);
  const imageCount = images.length + review.legacyImages.length + newImages.length;

  function addImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []); event.target.value = ""; setError("");
    if (files.some((file) => !file.type.startsWith("image/"))) { setError("Choose image files only."); return; }
    if (files.some((file) => file.size > 2.5 * 1024 * 1024)) { setError("Each image must be 2.5 MB or smaller."); return; }
    if (imageCount + files.length > 4) { setError("You can add up to four images."); return; }
    setNewImages((current) => [...current, ...files.map((file) => { const preview = URL.createObjectURL(file); previews.current.add(preview); return { file, preview }; })]);
  }
  function removeNew(preview: string) { URL.revokeObjectURL(preview); previews.current.delete(preview); setNewImages((current) => current.filter((image) => image.preview !== preview)); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!rating || !content.trim()) { setError("Choose a rating and enter your review."); return; }
    setBusy(true); setError("");
    try { await updateCustomerReview(review.id, { rating, title: title.trim(), content: content.trim(), retainedImageIds: images.map((image) => image.id) }, newImages.map((image) => image.file)); await onSaved(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not update the review."); }
    finally { setBusy(false); }
  }
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/45 p-4" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><div role="dialog" aria-modal="true" aria-labelledby="edit-review-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"><div className="mb-5 flex items-center justify-between"><h2 id="edit-review-title" className="text-xl font-semibold">Edit review</h2><button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-gray-100"><X size={19} /></button></div>{error ? <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}<form onSubmit={submit} className="space-y-4"><div><p className="mb-1.5 text-xs font-medium text-[#66736e]">Rating</p><Rating value={rating} onChange={setRating} size={24} /></div><label className="grid gap-1.5 text-xs font-medium text-[#66736e]">Title (optional)<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className="h-11 rounded-lg border border-[#cfe3df] px-3 text-sm outline-none focus:border-[#2c665e]" /></label><label className="grid gap-1.5 text-xs font-medium text-[#66736e]">Review<textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} className="rounded-lg border border-[#cfe3df] p-3 text-sm outline-none focus:border-[#2c665e]" /></label><div><div className="mb-2 flex items-center justify-between"><p className="text-xs font-medium text-[#66736e]">Photos</p><span className="text-xs text-[#8a9490]">{imageCount}/4</span></div><div className="flex flex-wrap gap-2">{images.map((image) => <Photo key={image.id} src={image.url} onRemove={() => setImages((current) => current.filter((item) => item.id !== image.id))} />)}{review.legacyImages.map((src, index) => <Photo key={`legacy-${index}`} src={src} />)}{newImages.map((image) => <Photo key={image.preview} src={image.preview} onRemove={() => removeNew(image.preview)} />)}{imageCount < 4 ? <label className="grid size-16 cursor-pointer place-items-center rounded-lg border border-dashed border-[#8cbab3] text-[#2c665e] hover:bg-[#f1f8f7]"><Camera size={20} /><input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={addImages} disabled={busy} className="sr-only" /></label> : null}</div></div><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} disabled={busy} className="rounded-lg border px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={busy || !content.trim() || !rating} className="rounded-lg bg-[#2c665e] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save Review"}</button></div></form></div></div>
  );
}
function Photo({ src, onRemove }: { src: string; onRemove?: () => void }) { return <div className="relative size-16 overflow-hidden rounded-lg border border-[#d6e4e0]"><img src={src} alt="" className="size-full object-cover" />{onRemove ? <button type="button" onClick={onRemove} aria-label="Remove image" className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-black/65 text-white"><X size={12} /></button> : null}</div>; }
function DeleteReviewDialog({ review, onClose, onDeleted }: { review: CustomerReview; onClose: () => void; onDeleted: () => Promise<void> }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function remove() { setBusy(true); setError(""); try { await deleteCustomerReview(review.id); await onDeleted(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not delete the review."); setBusy(false); } }
  return <div className="fixed inset-0 z-[110] grid place-items-center bg-black/45 p-4"><div role="alertdialog" aria-modal="true" aria-labelledby="delete-review-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-3 grid size-11 place-items-center rounded-full bg-red-50 text-red-600"><Trash2 size={20} /></div><h2 id="delete-review-title" className="text-xl font-semibold">Delete review?</h2><p className="mt-2 text-sm leading-6 text-[#68746f]">Your review for {review.productName} will be permanently deleted.</p>{error ? <p role="alert" className="mt-3 text-sm text-red-600">{error}</p> : null}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} disabled={busy} className="rounded-lg border px-4 py-2 text-sm">Cancel</button><button type="button" onClick={remove} disabled={busy} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Deleting…" : "Delete"}</button></div></div></div>;
}
