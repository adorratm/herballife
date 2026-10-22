"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { loginPath } from "@/lib/auth";
import {
  ensureWishlistIds,
  subscribeWishlist,
  toggleWishlistProduct,
} from "@/lib/wishlist";

type Props = {
  productId: string;
  size?: "sm" | "lg";
  /** Kart üzerinde Link içindeyse tıklanınca gezinmeyi engeller */
  stopPropagation?: boolean;
};

export function FavoriteButton({
  productId,
  size = "sm",
  stopPropagation = true,
}: Props) {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void ensureWishlistIds();
    return subscribeWishlist((ids) => setActive(ids.has(productId)));
  }, [productId]);

  async function onClick(e: MouseEvent) {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (busy) return;
    setBusy(true);
    try {
      const result = await toggleWishlistProduct(productId);
      if ("needsAuth" in result) {
        router.push(loginPath(window.location.pathname));
        return;
      }
      setActive(result.inWishlist);
    } catch {
      /* sessiz: buton önceki durumda kalır */
    } finally {
      setBusy(false);
    }
  }

  const sizeClass =
    size === "lg"
      ? "h-auto min-h-14 w-14"
      : "h-10 w-10";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={active ? "Favorilerden çıkar" : "Favorilere ekle"}
      aria-pressed={active}
      className={`pressable inline-flex cursor-pointer items-center justify-center rounded-full border shadow-sm transition-all hover:scale-105 ${sizeClass} ${
        active
          ? "border-tertiary bg-tertiary text-on-tertiary"
          : "border-outline-variant/40 bg-surface-container-lowest/95 text-on-surface-variant hover:border-tertiary hover:text-tertiary"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <HeartIcon filled={active} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M12 21s-6.5-4.35-9.33-8.11C.8 10.35.7 7.2 2.7 5.35A4.6 4.6 0 0 1 9 5.2L12 8l3-2.8a4.6 4.6 0 0 1 6.3.15c2 1.85 1.9 5-.07 7.54C18.5 16.65 12 21 12 21z" />
    </svg>
  );
}
