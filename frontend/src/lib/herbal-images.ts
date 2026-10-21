/** Yerel ürün görselleri — public/images/products */
export const HERBAL_PRODUCT_IMAGES: Record<string, string> = {
  "formul-1-shake": "/images/products/formul-1-shake.png",
  "formul-1-besleyici-shake-karisimi-muz-aromali-550-g":
    "/images/products/formul-1-besleyici-shake-karisimi-muz-aromali-550-g.jpeg",
  "formul-1-besleyici-shake-karisimi-ahududu-ve-beyaz-cikolata-aromali-500gr":
    "/images/products/formul-1-besleyici-shake-karisimi-ahududu-ve-beyaz-cikolata-aromali-500gr.png",
  "formul-1-besleyici-shake-karisimi-cikolata-aromali-500-g":
    "/images/products/formul-1-besleyici-shake-karisimi-cikolata-aromali-500-g.jpeg",
  "thermo-complete-90-tablet":
    "/images/products/thermo-complete-90-tablet.png",
  "bitkisel-konsantre-caylar-klasik-50-g":
    "/images/products/bitkisel-konsantre-caylar-klasik-50-g.png",
  "herbal-aloe-konsantre-icecek-473-ml":
    "/images/products/herbal-aloe-konsantre-icecek-473-ml.png",
  "multi-fiber-multi-fiber-lifli-ve-aromali-icecek-tozu-elma-204-g":
    "/images/products/multi-fiber-multi-fiber-lifli-ve-aromali-icecek-tozu-elma-204-g.png",
  "formul-2-vitamin-ve-mineral-kompleks-kadinlar-icin-60-tablet":
    "/images/products/formul-2-vitamin-ve-mineral-kompleks-kadinlar-icin-60-tablet.png",
  "formul-2-vitamin-ve-mineral-kompleks-erkekler-icin-60-tablet":
    "/images/products/formul-2-vitamin-ve-mineral-kompleks-erkekler-icin-60-tablet.png",
  "2026-paket-1-shaker-hediyeli":
    "/images/products/2026-paket-1-shaker-hediyeli.png",
  "2026-paket-2-shaker-hediyeli":
    "/images/products/2026-paket-2-shaker-hediyeli.png",
  "2026-paket-3-shaker-hediyeli":
    "/images/products/2026-paket-3-shaker-hediyeli.png",
  "2026-paket-4-shaker-hediyeli":
    "/images/products/2026-paket-4-shaker-hediyeli.png",
  "2026-paket-5-shaker-hediyeli":
    "/images/products/2026-paket-5-shaker-hediyeli.png",
  "kilo-alma-seti-shaker-hediyeli":
    "/images/products/kilo-alma-seti-shaker-hediyeli.png",
  "paket-1": "/images/products/paket-1.jpg",
  "paket-2": "/images/products/paket-2.jpg",
  "paket-3": "/images/products/paket-3.jpg",
  "paket-4": "/images/products/paket-4.jpg",
  "hl-skin-besleyici-el-ve-vucut-losyonu-147-ml":
    "/images/products/hl-skin-besleyici-el-ve-vucut-losyonu-147-ml.png",
  "hl-skin-besleyici-goz-kremi-15-ml":
    "/images/products/hl-skin-besleyici-goz-kremi-15-ml.png",
  "hl-skin-yenileyici-jel-temizleyici-147-ml":
    "/images/products/hl-skin-yenileyici-jel-temizleyici-147-ml.png",
  "shaker-tekli": "/images/products/shaker-tekli.jpg",
};

const LOCAL_FALLBACKS = [
  "/images/products/formul-1-shake.png",
  "/images/products/bitkisel-konsantre-caylar-klasik-50-g.png",
  "/images/products/thermo-complete-90-tablet.png",
  "/images/products/herbal-aloe-konsantre-icecek-473-ml.png",
  "/images/products/2026-paket-1-shaker-hediyeli.png",
];

export function herbalImageForSlug(slug: string): string | null {
  return HERBAL_PRODUCT_IMAGES[slug] || null;
}

export function localProductFallback(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % LOCAL_FALLBACKS.length;
  }
  return LOCAL_FALLBACKS[hash];
}
