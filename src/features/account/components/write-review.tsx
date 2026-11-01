"use client";

/* eslint-disable @next/next/no-img-element -- Vendure assets use environment-specific hosts. */

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Camera, Star, X } from "lucide-react";

import { EmptyState, LoadingCards } from "./account-ui";
import { type CustomerOrder, getCustomerOrder, submitCustomerReview } from "@/services/api/account";

interface ReviewPhoto { file: File; preview: string; }

export function WriteReview() {
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const previews = useRef(new Set<string>());

  useEffect(() => {
    let active = true;
    const previewUrls = previews.current;
    getCustomerOrder(params.orderId)
      .then((value) => { if (active) { setOrder(value); setProductId(value?.lines[0]?.productId || ""); } })
      .catch((caught: unknown) => {
        if (!active) return;
        const message = caught instanceof Error ? caught.message : "Could not load the order.";
        if (/not (?:currently )?authorized|unauthorized|session|login/i.test(message)) router.replace("/login"); else setError(message);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; previewUrls.forEach((url) => URL.revokeObjectURL(url)); };
  }, [params.orderId, router]);

  function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []); event.target.value = ""; setError("");
    if (files.some((file) => !file.type.startsWith("image/"))) { setError("Choose image files only."); return; }
    if (files.some((file) => file.size > 2.5 * 1024 * 1024)) { setError("Each image must be 2.5 MB or smaller."); return; }
    if (photos.length + files.length > 4) { setError("You can upload up to four images."); return; }
    setPhotos((current) => [...current, ...files.map((file) => { const preview = URL.createObjectURL(file); previews.current.add(preview); return { file, preview }; })]);
  }
  function removePhoto(preview: string) { URL.revokeObjectURL(preview); previews.current.delete(preview); setPhotos((current) => current.filter((photo) => photo.preview !== preview)); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order || !productId || rating < 1 || !content.trim()) { setError("Choose a product and rating, then enter your review."); return; }
    setSubmitting(true); setError("");
    try { await submitCustomerReview({ productId, orderId: order.id, rating, title: title.trim(), content: content.trim() }, photos.map((photo) => photo.file)); router.push("/account/reviews"); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not submit the review."); setSubmitting(false); }
  }

  if (loading) return <LoadingCards count={2} />;
  if (!order) return <EmptyState title="Order not found" message={error || "This order could not be found."} />;
  if (order.status !== "delivered") return <EmptyState title="Review unavailable" message="You can review products after the order has been delivered." />;
  const selected = order.lines.find((line) => line.productId === productId) || order.lines[0];
  return (
    <section>
      <Link href={`/account/orders/${order.id}`} className="text-sm font-semibold text-[#2c665e] hover:underline">← Back to Order #{order.code}</Link>
      <div className="mt-4 rounded-2xl border border-[#cfe3df] bg-white p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2c665e]">My account</p><h1 className="mt-1 text-3xl font-semibold">Write a Review</h1>
        {error ? <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <form onSubmit={submit} className="mt-6 space-y-5">
          {order.lines.length > 1 ? <label className="grid gap-1.5 text-xs font-medium text-[#66736e]">Product<select value={productId} onChange={(event) => setProductId(event.target.value)} className="h-11 rounded-lg border border-[#cfe3df] bg-white px-3 text-sm">{order.lines.map((line) => <option key={line.id} value={line.productId}>{line.productName} — {line.variantName}</option>)}</select></label> : null}
          <div className="flex items-center gap-4 rounded-xl bg-[#f5faf8] p-4"><div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-white">{selected?.imageUrl ? <img src={selected.imageUrl} alt="" className="size-full object-contain p-2" /> : <Star size={25} className="text-[#80aaa2]" />}</div><div><h2 className="font-semibold">{selected?.productName}</h2><p className="mt-1 text-sm text-[#72807a]">{selected?.variantName}</p></div></div>
          <div><p className="mb-2 text-xs font-medium text-[#66736e]">Your rating *</p><div className="flex gap-1">{[1,2,3,4,5].map((star) => <button key={star} type="button" onClick={() => setRating(star)} aria-label={`Rate ${star} stars`} className="rounded p-1"><Star size={30} className={star <= rating ? "fill-amber-400 text-amber-400" : "text-[#cbd4d0]"} /></button>)}</div></div>
          <label className="grid gap-1.5 text-xs font-medium text-[#66736e]">Title (optional)<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="Summarize your experience" className="h-11 rounded-lg border border-[#cfe3df] px-3 text-sm outline-none focus:border-[#2c665e]" /></label>
          <label className="grid gap-1.5 text-xs font-medium text-[#66736e]">Review *<textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} placeholder="Tell others what you liked or disliked" className="rounded-lg border border-[#cfe3df] p-3 text-sm outline-none focus:border-[#2c665e]" /></label>
          <div><div className="mb-2 flex items-center justify-between"><p className="text-xs font-medium text-[#66736e]">Photos (optional)</p><span className="text-xs text-[#8a9490]">{photos.length}/4</span></div><div className="flex flex-wrap gap-2">{photos.map((photo) => <div key={photo.preview} className="relative size-20 overflow-hidden rounded-lg border"><img src={photo.preview} alt="" className="size-full object-cover" /><button type="button" onClick={() => removePhoto(photo.preview)} aria-label="Remove photo" className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/65 text-white"><X size={13} /></button></div>)}{photos.length < 4 ? <label className="grid size-20 cursor-pointer place-items-center rounded-lg border border-dashed border-[#8cbab3] text-[#2c665e] hover:bg-[#f1f8f7]"><Camera size={22} /><input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={addPhotos} disabled={submitting} className="sr-only" /></label> : null}</div></div>
          <div className="flex justify-end gap-3"><Link href={`/account/orders/${order.id}`} className="inline-flex min-h-11 items-center rounded-lg border px-5 text-sm font-semibold">Cancel</Link><button type="submit" disabled={submitting || !rating || !content.trim()} className="min-h-11 rounded-lg bg-[#2c665e] px-6 text-sm font-semibold text-white disabled:opacity-50">{submitting ? "Submitting…" : "Submit Review"}</button></div>
        </form>
      </div>
    </section>
  );
}
