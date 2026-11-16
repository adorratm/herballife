import { sanitizeProductSku } from "@/lib/catalog-seo";

/**
 * Merchant/Meta feed `g:id` ile GA4 / Ads olaylarındaki `item_id` aynı olmalı
 * (dinamik yeniden pazarlama + sepet verili dönüşümler).
 * Google: id/sku en fazla 50 karakter; boş dize olmamalı.
 */
export function catalogItemId(
  product: { slug: string },
  variant?: { id: string; sku?: string | null } | null,
): string {
  if (variant) {
    return (
      sanitizeProductSku(variant.sku, `${product.slug}-${variant.id}`) ||
      sanitizeProductSku(variant.id) ||
      "item"
    );
  }
  return sanitizeProductSku(product.slug) || "item";
}
