"use client";

import Link from "next/link";
import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { StoreHomepageVideo } from "@/types/storefront";

interface HomeVideoShowcaseProps {
  video: StoreHomepageVideo;
  brandSlug?: string;
}

export function HomeVideoShowcase({
  video,
  brandSlug,
}: HomeVideoShowcaseProps) {
  const [playing, setPlaying] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const playerRef = useRef<HTMLVideoElement>(null);
  const item = video.videos[0];

  useEffect(() => {
    if (!playing) return;
    if (dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
    playerRef.current?.play().catch(() => undefined);
  }, [playing]);

  if (!item) return null;

  const closePlayer = () => {
    playerRef.current?.pause();
    dialogRef.current?.close();
    setPlaying(false);
  };

  return (
    <section
      className="relative isolate overflow-hidden bg-[#18231a]"
      aria-labelledby="homepage-video-heading"
    >
      <div className="relative min-h-[320px] sm:min-h-[390px] lg:min-h-[440px]">
        <video
          key={item.id}
          src={`${item.videoAsset.source}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 -z-20 size-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-black/55" />

        <div className="mx-auto flex min-h-[320px] max-w-5xl flex-col items-center justify-center px-6 py-14 text-center text-white sm:min-h-[390px] lg:min-h-[440px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/80 sm:text-xs">
            The Nana journey
          </p>
          <h2
            id="homepage-video-heading"
            className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl"
          >
            {video.title}
          </h2>
          {video.description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
              {video.description}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="mt-6 flex flex-col items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#18231a]"
            aria-label={`Play ${video.title}`}
          >
            <span className="grid size-14 place-items-center rounded-full bg-white text-[#183326] shadow-lg transition hover:scale-105">
              <Play className="ml-1 size-5 fill-current" aria-hidden="true" />
            </span>
            <span className="text-xs font-medium">Watch the video</span>
          </button>

          {item.product ? (
            <Link
              href={`/products/${item.product.slug}${brandSlug ? `?brand=${encodeURIComponent(brandSlug)}` : ""}`}
              className="mt-4 text-xs font-medium text-white/90 underline decoration-white/40 underline-offset-4 hover:text-white"
            >
              Explore {item.product.name}
            </Link>
          ) : null}
        </div>

      </div>

      <dialog
        ref={dialogRef}
        className="m-auto w-[min(1100px,calc(100%-2rem))] max-w-none overflow-visible rounded-2xl bg-black p-0 text-white backdrop:bg-black/85"
        onCancel={closePlayer}
        onClose={() => setPlaying(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closePlayer();
        }}
      >
        <button
          type="button"
          onClick={closePlayer}
          className="absolute -top-11 right-0 grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
          aria-label="Close video"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        {playing ? (
          <video
            ref={playerRef}
            key={item.id}
            src={item.videoAsset.source}
            controls
            autoPlay
            playsInline
            preload="metadata"
            className="max-h-[80vh] w-full rounded-2xl bg-black"
          />
        ) : null}
      </dialog>
    </section>
  );
}
