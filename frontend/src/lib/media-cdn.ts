/**
 * Yerel /images/... ve /brand/... yollarını S3/CDN WebP adresine çevirir.
 * NEXT_PUBLIC_CDN_URL veya bilinen bucket varsayılanı kullanılır.
 */
const DEFAULT_S3 =
  "https://herbalkapida.s3.eu-central-1.amazonaws.com";

export function mediaCdnBase(): string {
  const raw =
    process.env.NEXT_PUBLIC_CDN_URL ||
    process.env.AWS_CDN_URL ||
    process.env.NEXT_PUBLIC_S3_PUBLIC_BASE ||
    DEFAULT_S3;
  return raw.replace(/\/$/, "");
}

/** /images/products/foo.png → {cdn}/products/foo.webp */
export function toCdnWebpUrl(localOrRemote: string): string {
  const src = (localOrRemote || "").trim();
  if (!src) return src;
  if (/^https?:\/\//i.test(src) && !src.includes("/images/") && !src.includes("/brand/")) {
    return src;
  }

  let path = src;
  try {
    if (/^https?:\/\//i.test(src)) {
      path = new URL(src).pathname;
    }
  } catch {
    /* keep path */
  }

  const base = mediaCdnBase();
  const products = path.match(/\/images\/products\/([^/?#]+)\.[a-zA-Z0-9]+$/i);
  if (products) return `${base}/products/${products[1]}.webp`;

  const cutouts = path.match(/\/images\/cutouts\/([^/?#]+)\.[a-zA-Z0-9]+$/i);
  if (cutouts) return `${base}/cutouts/${cutouts[1]}.webp`;

  const brand = path.match(/\/(?:images\/)?brand\/([^/?#]+)\.[a-zA-Z0-9]+$/i);
  if (brand) return `${base}/brand/${brand[1]}.webp`;

  return src;
}
