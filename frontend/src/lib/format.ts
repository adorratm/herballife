import {
  herbalImageForSlug,
  localProductFallback,
} from "@/lib/herbal-images";
import {
  isBrokenRemoteImageUrl,
  stockImage,
  type StockImageKey,
} from "@/lib/stock-images";

/**
 * CSS `text-transform: uppercase` ve `toUpperCase()` Türkçe locale’de
 * Latin "i" → "İ" yapar. İngilizce metinde en-US, Türkçe karakterli metinde tr-TR.
 */
export function displayUpper(text: string): string {
  if (/[şğıüöçıİŞĞÜÖÇ]/.test(text)) {
    return text.toLocaleUpperCase("tr-TR");
  }
  return text.toLocaleUpperCase("en-US");
}

export function formatMoney(
  amount: string | number | null | undefined,
  currency = "TRY",
) {
  const value = Number(amount ?? 0);
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function isUsableImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/images/")) return true;
  if (!/^https?:\/\//i.test(trimmed)) return false;
  return !isBrokenRemoteImageUrl(trimmed);
}

export function productImage(url: string | null | undefined, seed = "product") {
  const bySlug = herbalImageForSlug(seed);
  if (bySlug) return bySlug;

  if (url && isUsableImageUrl(url)) {
    return url.trim();
  }
  return localProductFallback(seed);
}

const BLOG_PLACEHOLDER_KEYS: StockImageKey[] = [
  "blog",
  "workshop",
  "ethos",
  "hero",
  "product-5",
];

function blogPlaceholderForSeed(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return stockImage(BLOG_PLACEHOLDER_KEYS[hash % BLOG_PLACEHOLDER_KEYS.length]);
}

/** Blog kapak — eksik/bozuk URL’de yerel PNG (SVG değil; next/image ile sorunsuz). */
export function blogCoverImage(
  url: string | null | undefined,
  slug?: string | null,
) {
  const trimmed = (url || "").trim();
  if (trimmed && isUsableImageUrl(trimmed)) {
    return trimmed;
  }
  const seed = (slug || "blog").trim() || "blog";
  return blogPlaceholderForSeed(seed);
}

/** Genel içerik görseli (CMS, medya, OG vb.) */
export function contentImage(
  url: string | null | undefined,
  fallback: string = stockImage("og"),
): string {
  const trimmed = (url || "").trim();
  if (trimmed && isUsableImageUrl(trimmed)) return trimmed;
  return fallback;
}
