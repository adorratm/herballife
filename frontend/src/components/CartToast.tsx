"use client";

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
      window.setTimeout(() => setVisible(false), 2800);
    }
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-surface-container-lowest px-5 py-3.5 text-on-surface shadow-xl transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-24 opacity-0"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-fixed text-primary">
        ✓
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold">Ürün sepete eklendi</span>
        <span className="text-xs text-on-surface-variant">{name}</span>
      </div>
    </div>
  );
}
