/** Referans mağaza + Botanical — tekrar etmeyen menü setleri */

export type NavItem = { href: string; label: string };

/** Üst ince şerit — sipariş/ödeme kısayolları (CMS menüde tekrarlanmaz) */
export const UTILITY_LINKS: NavItem[] = [
  { href: "/siparis-sorgula", label: "Track order" },
  { href: "/odeme-bildirimi", label: "Payment notification" },
  { href: "/banka-hesaplari", label: "Bank accounts" },
  { href: "/hesabim/favoriler", label: "My favorites" },
];

/** Kategori menü öğeleri — görsel + href; etiketler SiteHeader’da home.categoryHub ile locale’e göre */
export const CATEGORY_CHIPS: (NavItem & {
  accent?: boolean;
  image: string;
  blurb: string;
})[] = [
  {
    href: "/urunler/kategori/kilo-kontrolu",
    label: "Kilo Kontrolü",
    blurb: "Formül ve program ürünleri",
    image: "/images/products/thermo-complete-90-tablet.png",
  },
  {
    href: "/urunler/kategori/icecekler",
    label: "İçecekler",
    blurb: "Aloe, çay ve lifli içecekler",
    image: "/images/products/herbal-aloe-konsantre-icecek-473-ml.png",
  },
  {
    href: "/urunler/kategori/avantajli-setler",
    label: "Hediyeli Setler",
    blurb: "Karıştırıcı hediyeli paketler",
    image: "/images/products/2026-paket-1-shaker-hediyeli.png",
    accent: true,
  },
  {
    href: "/urunler/kategori/takviye-edici",
    label: "Takviye Edici",
    blurb: "Vitamin ve mineral",
    image:
      "/images/products/formul-2-vitamin-ve-mineral-kompleks-kadinlar-icin-60-tablet.png",
  },
  {
    href: "/urunler/kategori/sporcu-urunleri",
    label: "Sporcu Ürünleri",
    blurb: "Protein ve performans",
    image: "/images/products/formul-1-shake.png",
  },
  {
    href: "/urunler/kategori/atistirmalik",
    label: "Atıştırmalık",
    blurb: "Protein bar ve atıştırmalık",
    image: "/images/products/multi-fiber-multi-fiber-lifli-ve-aromali-icecek-tozu-elma-204-g.png",
  },
  {
    href: "/urunler/kategori/kisisel-bakim",
    label: "Kişisel Bakım",
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

/** Masaüstü CMS menü için varsayılan (tekrarsız) — SiteHeader navLabel() ile locale */
export const DEFAULT_HEADER_NAV: NavItem[] = [
  { href: "/urunler", label: "Products" },
  { href: "/hakkimizda", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/medya", label: "Media" },
  { href: "/sss", label: "FAQ" },
  { href: "/yorum", label: "Reviews" },
  { href: "/iletisim", label: "Contact" },
];

export const ACCOUNT_LINKS: NavItem[] = [
  { href: "/hesabim", label: "My orders" },
  { href: "/hesabim/favoriler", label: "My favorites" },
  { href: "/hesabim/takip", label: "Nutrition tracking" },
  { href: "/hesabim/olcumler", label: "My measurements" },
  { href: "/hesabim/rapor", label: "Progress report" },
  { href: "/hesabim/bildirimler", label: "Notifications" },
];

export const SUPPORT_LINKS: NavItem[] = [
  { href: "/siparis-sorgula", label: "Track order" },
  { href: "/takip", label: "Shipment tracking" },
  { href: "/odeme-bildirimi", label: "Payment notification" },
  { href: "/banka-hesaplari", label: "Bank accounts" },
  { href: "/sss", label: "FAQ" },
  { href: "/yorum", label: "Google review" },
];

/** Mobil hamburger — destek ve bilgi sayfaları */
export const MOBILE_SUPPORT_LINKS: NavItem[] = [
  { href: "/blog", label: "Blog" },
  { href: "/kocluk", label: "Coaching" },
  { href: "/medya", label: "Media" },
  { href: "/iletisim", label: "Contact" },
  { href: "/sss", label: "FAQ" },
  { href: "/siparis-sorgula", label: "Track order" },
];

/** CMS header'dan utility ile çakışanları çıkar */
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
