"use client";

import { useEffect, useRef, useState } from "react";

/** Aşağı kaydır → kompakt; yukarı / tepe → geniş. İki FAB senkron kalsın diye aynı mantık. */
export function useFabScrollExpand(enabled = true) {
  const [expanded, setExpanded] = useState(true);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    lastY.current = window.scrollY;
    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        if (y < 48) {
          setExpanded(true);
        } else if (delta > 8) {
          setExpanded(false);
        } else if (delta < -8) {
          setExpanded(true);
        }
        lastY.current = y;
        ticking.current = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  return expanded;
}

/** Mobil alt nav üstü — WhatsApp + Paketleri incele aynı yükseklik */
export const FAB_BOTTOM_MOBILE =
  "bottom-[calc(5rem+env(safe-area-inset-bottom))]";
export const FAB_BOTTOM_MOBILE_COOKIE =
  "bottom-[calc(11rem+env(safe-area-inset-bottom))]";
