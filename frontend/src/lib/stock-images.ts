/**
 * Varsayılan stok görselleri — yerel public/images (S3 bağımlılığı yok).
 * Key isimleri seed / CMS ile uyumlu tutulur.
 */

export const STOCK_IMAGE_KEYS = [
  "hero",
  "ethos",
  "workshop",
  "blog",
  "og",
  "product-1",
  "product-2",
  "product-3",
  "product-4",
  "product-5",
] as const;

export type StockImageKey = (typeof STOCK_IMAGE_KEYS)[number];

/** Yerel, her zaman mevcut fallback görseller */
const LOCAL_STOCK: Record<StockImageKey, string> = {
  hero: "/images/cutouts/formul-1-shake.png",
  ethos: "/images/cutouts/herbal-aloe.png",
  workshop: "/images/cutouts/bitkisel-cay.png",
  blog: "/images/cutouts/multi-fiber.png",
  og: "/images/products/formul-1-shake.png",
  "product-1": "/images/products/formul-1-shake.png",
  "product-2": "/images/products/bitkisel-konsantre-caylar-klasik-50-g.png",
  "product-3": "/images/products/thermo-complete-90-tablet.png",
  "product-4": "/images/products/herbal-aloe-konsantre-icecek-473-ml.png",
  "product-5": "/images/products/2026-paket-1-shaker-hediyeli.png",
};

export function stockImage(key: StockImageKey): string {
  return LOCAL_STOCK[key];
}

export function stockProductFallback(seed: string): string {
  const keys: StockImageKey[] = [
    "product-1",
    "product-2",
    "product-3",
    "product-4",
    "product-5",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % keys.length;
  }
  return stockImage(keys[hash]);
}

/** Unsplash / eski harici stok URL’lerini yerel stok ile değiştir. */
export function replaceUnsplashUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (!/unsplash\.com/i.test(url)) return url;

  if (url.includes("photo-1447933601403")) return stockImage("ethos");
  if (url.includes("photo-1495474472287")) return stockImage("workshop");
  if (url.includes("photo-1559056199")) return stockImage("product-4");
  if (url.includes("photo-1610889556528")) return stockImage("product-5");
  if (url.includes("photo-1514432324607")) return stockImage("hero");
  return stockImage("og");
}

/** Bozuk / eski CDN URL’si mi? */
export function isBrokenRemoteImageUrl(url: string): boolean {
  return (
    /unsplash\.com/i.test(url) ||
    /aida-public/i.test(url) ||
    /lh3\.googleusercontent\.com\/aida/i.test(url) ||
    /kilic-coffee/i.test(url) ||
    /\/stock\/(hero|ethos|workshop|blog|og|product-\d+)\.jpg/i.test(url) ||
    /herbalurunleri\.com\/upload/i.test(url) ||
    /1781247663/i.test(url) ||
    /herbalkapida\.s3\.[^/]+\.amazonaws\.com\/stock\//i.test(url)
  );
}
