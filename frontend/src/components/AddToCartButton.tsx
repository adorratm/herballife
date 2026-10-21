"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { emitCartToast } from "@/components/CartToast";
import { ApiError } from "@/lib/api";
import { trackAddToCart } from "@/lib/analytics";
import { cartAddItem } from "@/lib/cart";

type Props = {
  productId: string;
  variantId?: string | null;
  label?: string;
  className?: string;
  disabled?: boolean;
  productName?: string;
  price?: number;
  /** false: toast + sayfada kal; true: sepete git (varsayılan) */
  goToCart?: boolean;
  onAdded?: () => void;
};

export function AddToCartButton({
  productId,
  variantId,
  label = "Sepete Ekle",
  className,
  disabled = false,
  productName,
  price,
  goToCart = true,
  onAdded,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (disabled) return;
    setLoading(true);
    setError(null);
    try {
      await cartAddItem({
        productId,
        variantId,
        quantity: 1,
      });
      trackAddToCart({
        id: productId,
        name: productName,
        price,
        quantity: 1,
      });
      emitCartToast(productName);
      onAdded?.();
      if (goToCart) router.push("/sepet");
      else router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Sepete eklenemedi. API bağlantısını kontrol edin.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={loading || disabled}
        onClick={onClick}
        className={
          className ||
          "btn-cta w-full py-6 font-display text-lg tracking-widest disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {loading ? "İşleniyor…" : label}
      </button>
      {error ? (
        <p className="mt-3 font-meta text-[10px] uppercase text-error">{error}</p>
      ) : null}
    </div>
  );
}
