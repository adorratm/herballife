import {
  herbalImageForSlug,
  localProductFallback,
} from "@/lib/herbal-images";

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

export function productImage(url: string | null | undefined, seed = "product") {
  const bySlug = herbalImageForSlug(seed);
  if (bySlug) return bySlug;

  if (
    url &&
    (url.startsWith("/images/") ||
      (!url.includes("unsplash.com") &&
        !url.includes("aida-public") &&
        !url.includes("lh3.googleusercontent.com/aida") &&
        !/kilic-coffee/i.test(url) &&
        !/\/stock\/(hero|ethos|workshop|blog|og|product-\d+)\.jpg/i.test(url) &&
        !/herbalurunleri\.com\/upload/i.test(url) &&
        !/1781247663/i.test(url)))
  ) {
    return url;
  }
  return localProductFallback(seed);
}

const BLOG_PLACEHOLDER_IMAGES = [
  "/images/blog-placeholder.svg",
  "/images/blog-placeholder-2.svg",
  "/images/blog-placeholder-3.svg",
] as const;

function blogPlaceholderForSeed(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return BLOG_PLACEHOLDER_IMAGES[hash % BLOG_PLACEHOLDER_IMAGES.length];
}

/** Blog kapak — ürün stok görseline düşmez (öne çıkan yazı bozuk görünmesin). */
export function blogCoverImage(
  url: string | null | undefined,
  slug?: string | null,
) {
  const trimmed = (url || "").trim();
  if (
    trimmed &&
    (trimmed.startsWith("/images/") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://")) &&
    !trimmed.includes("unsplash.com") &&
    !/\/stock\/(hero|ethos|workshop|blog|og|product-\d+)\.jpg/i.test(trimmed) &&
    !/herbalurunleri\.com\/upload/i.test(trimmed)
  ) {
    return trimmed;
  }
  const seed = (slug || "blog").trim() || "blog";
  return blogPlaceholderForSeed(seed);
}
