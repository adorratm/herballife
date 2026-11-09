/**
 * Merchant/Meta feed `g:id` ile GA4 / Ads olaylarındaki `item_id` aynı olmalı
 * (dinamik yeniden pazarlama + sepet verili dönüşümler).
 */
export function catalogItemId(
  product: { slug: string },
  variant?: { id: string; sku?: string | null } | null,
): string {
  if (variant) return variant.sku?.trim() || `${product.slug}-${variant.id}`;
  return product.slug;
}
