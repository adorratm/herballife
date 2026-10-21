export const STORE_PICKUP_CODE = "store_pickup";

/** Ücretsiz kargo eşiği (TRY). 0 = kapalı. */
export function freeShippingThreshold(): number {
  const raw =
    process.env.NEXT_PUBLIC_FREE_SHIPPING_OVER ||
    process.env.FREE_SHIPPING_OVER ||
    "750";
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function isStorePickup(provider?: string | null): boolean {
  return provider === STORE_PICKUP_CODE;
}

export function shippingMethodLabel(provider?: string | null): string {
  if (isStorePickup(provider)) return "Mağazadan teslim";
  return provider || "—";
}
