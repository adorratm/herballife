import type { CartItem } from "@/lib/types";

export const STORE_PICKUP_CODE = "store_pickup";

/** Ücretsiz kargo eşiği (TRY). 0 = kapalı. */
export function freeShippingThreshold(cmsOver?: number | null): number {
  if (cmsOver != null && Number.isFinite(cmsOver) && cmsOver > 0) {
    return cmsOver;
  }
  const raw =
    process.env.NEXT_PUBLIC_FREE_SHIPPING_OVER ||
    process.env.FREE_SHIPPING_OVER ||
    "750";
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Sepet kargo ücreti: kalemlerdeki ürün kargo ücretlerinin en yükseği
 * (tek paket; ürünler toplanmaz, adet çarpılmaz).
 */
export function cartProductShippingFee(
  items: CartItem[] | null | undefined,
): number {
  if (!items?.length) return 0;
  let max = 0;
  for (const item of items) {
    const fee = Number(item.product?.shippingFee ?? 0);
    if (Number.isFinite(fee) && fee > max) max = fee;
  }
  return Math.max(0, max);
}

export function resolveCartShippingFee(
  items: CartItem[] | null | undefined,
  opts: {
    provider?: string | null;
    subtotal: number;
    freeShippingOver?: number | null;
  },
): number {
  if (isStorePickup(opts.provider)) return 0;
  const freeOver = freeShippingThreshold(opts.freeShippingOver);
  if (freeOver > 0 && opts.subtotal >= freeOver) return 0;
  return cartProductShippingFee(items);
}

export function isStorePickup(provider?: string | null): boolean {
  return provider === STORE_PICKUP_CODE;
}

export function shippingMethodLabel(
  provider?: string | null,
  storePickupLabel?: string,
): string {
  if (isStorePickup(provider)) {
    return storePickupLabel || STORE_PICKUP_CODE;
  }
  return provider || "—";
}
