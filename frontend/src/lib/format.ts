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
