"use client";

import { useEffect, useState } from "react";

export function DevViewportIndicator() {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateViewport() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return (
    <output
      aria-label={`Viewport size: ${viewport.width} by ${viewport.height} pixels`}
      className="pointer-events-none fixed bottom-3 right-3 z-[100] rounded-md border border-white/15 bg-[#17241c]/90 px-2.5 py-1.5 font-mono text-xs font-medium tabular-nums text-white shadow-lg backdrop-blur-sm"
    >
      {viewport.width} × {viewport.height}
    </output>
  );
}
