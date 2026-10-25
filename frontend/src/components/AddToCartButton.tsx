"use client";

import { useRouter } from "@/i18n/routing";
import { useState } from "react";
import { useTranslations } from "next-intl";
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
  label,
  className,
  disabled = false,
  productName,
  price,
  goToCart = true,
  onAdded,
}: Props) {
  const router = useRouter();
  const tProduct = useTranslations("product");
  const defaultLabel = label ?? tProduct("addToCart");
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (disabled || loading) return;
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
      setAdded(true);
      emitCartToast(productName);
      onAdded?.();
      window.setTimeout(() => setAdded(false), 1600);
      if (goToCart) router.push("/sepet" as const);
      else router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : tProduct("addError"),
      );
    } finally {
      setLoading(false);
    }
  }

  const baseClass =
    className ||
    "btn-cta w-full py-6 font-display text-lg tracking-widest disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div>
      <button
        type="button"
        disabled={loading || disabled}
        onClick={onClick}
        aria-live="polite"
        className={`add-cart-burst cursor-pointer ${baseClass}${
          added ? " is-added" : ""
        }`}
      >
        {loading
          ? tProduct("adding")
          : added
            ? tProduct("addedCheck")
            : defaultLabel}
      </button>
      {error ? (
        <p className="mt-3 font-meta text-[10px] uppercase text-error">{error}</p>
      ) : null}
    </div>
  );
}
