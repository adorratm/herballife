"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
  size?: "default" | "compact";
  className?: string;
  /** Otomatik kaydırma (ms). 0 = kapalı */
  intervalMs?: number;
};

export function ProductCarousel({
  products,
  size = "default",
  className = "",
  intervalMs = 4200,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [paused, setPaused] = useState(false);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    if (dir > 0 && el.scrollLeft >= max - 8) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (dir < 0 && el.scrollLeft <= 8) {
      el.scrollTo({ left: max, behavior: "smooth" });
      return;
    }
    const amount = Math.max(el.clientWidth * 0.7, 200);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update, products.length]);

  useEffect(() => {
    if (paused || intervalMs <= 0 || products.length < 3) return;
    const id = window.setInterval(() => scrollByDir(1), intervalMs);
    return () => window.clearInterval(id);
  }, [paused, intervalMs, products.length, scrollByDir]);

  if (!products.length) return null;

  return (
    <div
      className={`product-carousel relative ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
    >
      {canPrev ? (
        <button
          type="button"
          aria-label="Önceki ürünler"
          onClick={() => scrollByDir(-1)}
          className="absolute -left-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-outline-variant bg-white text-xl font-bold text-on-surface shadow-md transition-colors hover:bg-primary hover:text-on-primary md:flex"
        >
          ‹
        </button>
      ) : null}
      {canNext ? (
        <button
          type="button"
          aria-label="Sonraki ürünler"
          onClick={() => scrollByDir(1)}
          className="absolute -right-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-outline-variant bg-white text-xl font-bold text-on-surface shadow-md transition-colors hover:bg-primary hover:text-on-primary md:flex"
        >
          ›
        </button>
      ) : null}

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 [-ms-overflow-style:none] scrollbar-none snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[42%] shrink-0 snap-start sm:w-[30%] md:w-[22%] lg:w-[18%]"
          >
            <ProductCard product={product} size={size} />
          </div>
        ))}
      </div>
    </div>
  );
}
