/**
 * Stok görselleri — frontend public/images yolları (S3 stock/*.jpg 404 olmasın).
 * Seed / CMS defaults bu path’leri DB’ye yazar; vitrin doğrudan sunar.
 */

export type ApiStockImageKey =
  | 'hero'
  | 'ethos'
  | 'workshop'
  | 'blog'
  | 'og'
  | 'product-1'
  | 'product-2'
  | 'product-3'
  | 'product-4'
  | 'product-5';

const LOCAL_STOCK: Record<ApiStockImageKey, string> = {
  hero: '/images/cutouts/formul-1-shake.png',
  ethos: '/images/cutouts/herbal-aloe.png',
  workshop: '/images/cutouts/bitkisel-cay.png',
  blog: '/images/cutouts/multi-fiber.png',
  og: '/images/products/formul-1-shake.png',
  'product-1': '/images/products/formul-1-shake.png',
  'product-2':
    '/images/products/bitkisel-konsantre-caylar-klasik-50-g.png',
  'product-3': '/images/products/thermo-complete-90-tablet.png',
  'product-4':
    '/images/products/herbal-aloe-konsantre-icecek-473-ml.png',
  'product-5': '/images/products/2026-paket-1-shaker-hediyeli.png',
};

export function apiStockImage(key: ApiStockImageKey): string {
  return LOCAL_STOCK[key];
}
