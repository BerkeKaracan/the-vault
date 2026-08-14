"use client";

import { useEffect, useRef } from "react";

export function PointerGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    function onMove(event: PointerEvent) {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const element = ref.current;
        if (!element) return;
        element.style.setProperty("--pointer-x", `${event.clientX}px`);
        element.style.setProperty("--pointer-y", `${event.clientY}px`);
        element.style.opacity = "1";
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} aria-hidden className="landing-pointer-glow" />;
}
