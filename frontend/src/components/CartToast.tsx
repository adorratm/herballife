"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const EVENT = "herbal:cart-toast";

export function emitCartToast(productName?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT, { detail: { name: productName || "Ürün" } }),
  );
}

export function CartToastHost() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("Ürün");

  useEffect(() => {
    function onToast(e: Event) {
      const detail = (e as CustomEvent<{ name?: string }>).detail;
      setName(detail?.name || "Ürün");
      setVisible(true);
      window.setTimeout(() => setVisible(false), 3200);
    }
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div
      className={`fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-60 mx-auto flex max-w-[min(100vw-1.5rem,22rem)] items-center gap-3 rounded-2xl border border-primary/20 bg-white px-4 py-3.5 text-on-surface shadow-[0_16px_40px_-12px_rgba(18,20,17,0.28)] transition-all duration-400 md:bottom-6 md:left-auto md:right-6 md:mx-0 ${
        visible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-10 scale-95 opacity-0"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="cart-success-pop flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
        ✓
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-on-surface">Sepete eklendi</p>
        <p className="truncate text-xs text-on-surface-variant">{name}</p>
      </div>
      <Link
        href="/sepet"
        className="shrink-0 rounded-full bg-primary-fixed px-3 py-1.5 text-xs font-bold text-primary transition-transform hover:scale-105"
      >
        Görüntüle
      </Link>
    </div>
  );
}
