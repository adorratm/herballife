/** Referans mağaza + Botanical — tekrar etmeyen menü setleri */

export type NavItem = { href: string; label: string };

/** Üst ince şerit — sipariş/ödeme kısayolları (CMS menüde tekrarlanmaz) */
export const UTILITY_LINKS: NavItem[] = [
  { href: "/siparis-sorgula", label: "Sipariş Sorgula" },
  { href: "/odeme-bildirimi", label: "Ödeme Bildirimi" },
  { href: "/banka-hesaplari", label: "Banka Hesapları" },
  { href: "/hesabim/favoriler", label: "Favorilerim" },
];

/** Kategori menü öğeleri — görsel + kısa açıklama */
export const CATEGORY_CHIPS: (NavItem & {
  accent?: boolean;
  image: string;
  blurb: string;
})[] = [
  {
    href: "/urunler/kategori/kilo-kontrolu",
    label: "Kilo Kontrol",
    blurb: "Formül ve program",
    image: "/images/products/thermo-complete-90-tablet.png",
  },
  {
    href: "/urunler/kategori/icecekler",
    label: "İçecekler",
    blurb: "Aloe, çay, lif",
    image: "/images/products/herbal-aloe-konsantre-icecek-473-ml.png",
  },
  {
    href: "/urunler/kategori/avantajli-setler",
    label: "Setler",
    blurb: "Karıştırıcı hediyeli",
    image: "/images/products/2026-paket-1-shaker-hediyeli.png",
    accent: true,
  },
  {
    href: "/urunler/kategori/takviye-edici",
    label: "Takviye",
    blurb: "Vitamin ve mineral",
    image:
      "/images/products/formul-2-vitamin-ve-mineral-kompleks-kadinlar-icin-60-tablet.png",
  },
  {
    href: "/urunler/kategori/sporcu-urunleri",
    label: "Sporcu",
    blurb: "Protein ve performans",
    image: "/images/products/formul-1-shake.png",
  },
  {
    href: "/urunler/kategori/atistirmalik",
    label: "Atıştırmalık",
    blurb: "Pratik ara öğün",
    image: "/images/products/multi-fiber-multi-fiber-lifli-ve-aromali-icecek-tozu-elma-204-g.png",
  },
  {
    href: "/urunler/kategori/kisisel-bakim",
    label: "Cilt Bakım",
    blurb: "HL Skin serisi",
    image: "/images/products/hl-skin-yenileyici-jel-temizleyici-147-ml.png",
  },
  {
    href: "/urunler/kategori/tanitim-urunleri",
    label: "Tanıtım",
    blurb: "Başlangıç ürünleri",
    image: "/images/products/shaker-tekli.jpg",
  },
];

/** Masaüstü CMS menü için varsayılan (tekrarsız) */
export const DEFAULT_HEADER_NAV: NavItem[] = [
  { href: "/urunler", label: "Ürünler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/blog", label: "Yazılar" },
  { href: "/medya", label: "Medya" },
  { href: "/sss", label: "SSS" },
  { href: "/yorum", label: "Yorumlar" },
  { href: "/iletisim", label: "İletişim" },
];

export const ACCOUNT_LINKS: NavItem[] = [
  { href: "/hesabim", label: "Siparişlerim" },
  { href: "/hesabim/favoriler", label: "Favorilerim" },
  { href: "/hesabim/takip", label: "Beslenme Takibi" },
  { href: "/hesabim/olcumler", label: "Ölçümlerim" },
  { href: "/hesabim/rapor", label: "Gelişim Raporu" },
  { href: "/hesabim/bildirimler", label: "Bildirimler" },
];

export const SUPPORT_LINKS: NavItem[] = [
  { href: "/siparis-sorgula", label: "Sipariş Sorgula" },
  { href: "/takip", label: "Kargo Takip" },
  { href: "/odeme-bildirimi", label: "Ödeme Bildirimi" },
  { href: "/banka-hesaplari", label: "Banka Hesapları" },
  { href: "/sss", label: "SSS" },
  { href: "/yorum", label: "Google Yorum" },
];

/** CMS header’dan utility ile çakışanları çıkar */
export function dedupeHeaderNav(nav: NavItem[]): NavItem[] {
  const utilityHrefs = new Set(UTILITY_LINKS.map((l) => l.href));
  const categoryHrefs = new Set(CATEGORY_CHIPS.map((c) => c.href));
  const seen = new Set<string>();
  return nav.filter((item) => {
    if (utilityHrefs.has(item.href)) return false;
    if (categoryHrefs.has(item.href)) return false;
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}
