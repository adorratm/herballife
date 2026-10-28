/**
 * Ürün görselleri — S3 WebP (scripts/migrate-images-to-s3-webp.mjs).
 * Yerel path fallback: frontend/public/images/products
 */
const S3_BASE =
  (process.env.AWS_CDN_URL || process.env.NEXT_PUBLIC_CDN_URL || '')
    .replace(/\/$/, '') ||
  'https://herbalkapida.s3.eu-central-1.amazonaws.com';

function s3Product(slugFile: string): string {
  return `${S3_BASE}/products/${slugFile}.webp`;
}

export const HERBAL_PRODUCT_IMAGES: Record<string, string> = {
  'formul-1-shake': s3Product('formul-1-shake'),
  'formul-1-besleyici-shake-karisimi-muz-aromali-550-g': s3Product(
    'formul-1-besleyici-shake-karisimi-muz-aromali-550-g',
  ),
  'formul-1-besleyici-shake-karisimi-ahududu-ve-beyaz-cikolata-aromali-500gr':
    s3Product(
      'formul-1-besleyici-shake-karisimi-ahududu-ve-beyaz-cikolata-aromali-500gr',
    ),
  'formul-1-besleyici-shake-karisimi-cikolata-aromali-500-g': s3Product(
    'formul-1-besleyici-shake-karisimi-cikolata-aromali-500-g',
  ),
  'thermo-complete-90-tablet': s3Product('thermo-complete-90-tablet'),
  'bitkisel-konsantre-caylar-klasik-50-g': s3Product(
    'bitkisel-konsantre-caylar-klasik-50-g',
  ),
  'herbal-aloe-konsantre-icecek-473-ml': s3Product(
    'herbal-aloe-konsantre-icecek-473-ml',
  ),
  'multi-fiber-multi-fiber-lifli-ve-aromali-icecek-tozu-elma-204-g': s3Product(
    'multi-fiber-multi-fiber-lifli-ve-aromali-icecek-tozu-elma-204-g',
  ),
  'formul-2-vitamin-ve-mineral-kompleks-kadinlar-icin-60-tablet': s3Product(
    'formul-2-vitamin-ve-mineral-kompleks-kadinlar-icin-60-tablet',
  ),
  'formul-2-vitamin-ve-mineral-kompleks-erkekler-icin-60-tablet': s3Product(
    'formul-2-vitamin-ve-mineral-kompleks-erkekler-icin-60-tablet',
  ),
  '2026-paket-1-shaker-hediyeli': s3Product('2026-paket-1-shaker-hediyeli'),
  '2026-paket-2-shaker-hediyeli': s3Product('2026-paket-2-shaker-hediyeli'),
  '2026-paket-3-shaker-hediyeli': s3Product('2026-paket-3-shaker-hediyeli'),
  '2026-paket-4-shaker-hediyeli': s3Product('2026-paket-4-shaker-hediyeli'),
  '2026-paket-5-shaker-hediyeli': s3Product('2026-paket-5-shaker-hediyeli'),
  'kilo-alma-seti-shaker-hediyeli': s3Product('kilo-alma-seti-shaker-hediyeli'),
  'paket-1': s3Product('paket-1'),
  'paket-2': s3Product('paket-2'),
  'paket-3': s3Product('paket-3'),
  'paket-4': s3Product('paket-4'),
  'hl-skin-besleyici-el-ve-vucut-losyonu-147-ml': s3Product(
    'hl-skin-besleyici-el-ve-vucut-losyonu-147-ml',
  ),
  'hl-skin-besleyici-goz-kremi-15-ml': s3Product(
    'hl-skin-besleyici-goz-kremi-15-ml',
  ),
  'hl-skin-yenileyici-jel-temizleyici-147-ml': s3Product(
    'hl-skin-yenileyici-jel-temizleyici-147-ml',
  ),
  'shaker-tekli': s3Product('shaker-tekli'),
};

export function herbalProductImage(slug: string): string | null {
  return HERBAL_PRODUCT_IMAGES[slug] || null;
}

export function isLegacyCoffeeStockUrl(
  url: string | null | undefined,
): boolean {
  if (!url) return true;
  return (
    /kilic-coffee/i.test(url) ||
    /\/stock\/product-\d+\.jpg/i.test(url) ||
    /unsplash\.com/i.test(url) ||
    /herbalurunleri\.com\/upload/i.test(url) ||
    /1781247663/i.test(url) ||
    /gurme-domates-corbasi/i.test(url)
  );
}
