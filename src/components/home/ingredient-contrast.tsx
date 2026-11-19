"use client";

import { useEffect, useRef, type ReactNode } from "react";

function linearChannel(value: number) {
  const channel = value / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

export function IngredientContrast({
  backgroundSrc,
  children,
}: {
  backgroundSrc?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    const section = container?.closest("section");
    if (!container || !section) return;

    for (const label of container.querySelectorAll<HTMLElement>("[data-ingredient-label]")) {
      label.style.color = "#111111";
      label.style.backgroundColor = "#ffffff";
    }
    if (!backgroundSrc) return;

    const image = new window.Image();
    image.crossOrigin = "anonymous";
    let active = true;
    const observer = new ResizeObserver(updateContrast);

    function updateContrast() {
      if (!active || !image.naturalWidth || !image.naturalHeight || !section || !container) return;
      const bounds = section.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        console.warn("Unable to assess ingredient background contrast: canvas is unavailable.");
        return;
      }

      const scale = Math.max(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        ((bounds.width - width) / 2 / bounds.width) * canvas.width,
        ((bounds.height - height) / 2 / bounds.height) * canvas.height,
        (width / bounds.width) * canvas.width,
        (height / bounds.height) * canvas.height,
      );

      for (const label of container.querySelectorAll<HTMLElement>("[data-ingredient-label]")) {
        const rect = label.getBoundingClientRect();
        const x = Math.max(0, Math.floor(((rect.left - bounds.left) / bounds.width) * canvas.width));
        const y = Math.max(0, Math.floor(((rect.top - bounds.top) / bounds.height) * canvas.height));
        const right = Math.min(canvas.width, Math.ceil(((rect.right - bounds.left) / bounds.width) * canvas.width));
        const bottom = Math.min(canvas.height, Math.ceil(((rect.bottom - bounds.top) / bounds.height) * canvas.height));
        if (right <= x || bottom <= y) continue;

        const pixels = context.getImageData(x, y, right - x, bottom - y).data;
        let min = 1;
        let max = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          const luminance =
            0.2126 * linearChannel(pixels[i]) +
            0.7152 * linearChannel(pixels[i + 1]) +
            0.0722 * linearChannel(pixels[i + 2]);
          min = Math.min(min, luminance);
          max = Math.max(max, luminance);
        }

        const darkContrast = (min + 0.05) / (linearChannel(17) + 0.05);
        const lightContrast = 1.05 / (max + 0.05);
        const useDark = darkContrast >= lightContrast;
        label.style.color = useDark ? "#111111" : "#ffffff";
        label.style.backgroundColor = Math.max(darkContrast, lightContrast) >= 4.5
          ? "transparent"
          : useDark ? "#ffffff" : "#111111";
      }
    }

    image.onload = () => {
      if (!active) return;
      updateContrast();
      observer.observe(section);
      observer.observe(container);
    };
    image.onerror = () => {
      if (active) console.warn("Unable to assess ingredient background contrast; using a readable label background.");
    };
    image.src = backgroundSrc;

    return () => {
      active = false;
      observer.disconnect();
      image.onload = null;
      image.onerror = null;
    };
  }, [backgroundSrc]);

  return <div ref={ref}>{children}</div>;
}
