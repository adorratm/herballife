import { getApiBase } from "@/lib/api";
import { stockImage } from "@/lib/stock-images";
import {
  DEFAULT_WHATSAPP_SETTINGS,
  mergeWhatsAppSettings,
  type WhatsAppSettings,
} from "@/lib/whatsapp";

export type NavLink = { href: string; label: string };

export type SiteSettings = {
  brand: {
    name: string;
    slogan: string;
    tagline: string;
    established: string;
    location: string;
    logoUrl: string;
    distributorName: string;
    distributorTitle: string;
    legalDisclaimer: string;
  };
  contact: {
    address: string;
    email: string;
    phone: string;
    hours: string;
    locationLabel: string;
    latitude?: string;
    longitude?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
  navigation: {
    header: NavLink[];
    footerNav: NavLink[];
    footerLegal: NavLink[];
  };
  social: {
    instagram: string;
    facebook: string;
    googleMaps: string;
    googleReviewUrl: string;
  };
  whatsapp: WhatsAppSettings;
  footer: {
    description: string;
    copyrightSuffix: string;
  };
};

export type ContentSection = {
  id: string;
  page: string;
  sectionKey: string;
  title: string | null;
  content: Record<string, unknown>;
  sortOrder: number;
  isPublished: boolean;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  brand: {
    name: "Herbal Ürünleri",
    slogan: "Daha sağlıklı, daha mutlu bir yaşam",
    tagline:
      "Bağımsız distribütör rehberliğinde orijinal Herbalife ürünleri ve kişiselleştirilmiş beslenme desteği.",
    established: "2024’ten beri",
    location: "Türkiye",
    logoUrl: "",
    distributorName: "Emine Özberk",
    distributorTitle: "Bağımsız Distribütör",
    legalDisclaimer:
      "Bu site bağımsız bir Herbalife Nutrition distribütörüne aittir. Herbalife Nutrition resmi sitesi değildir. Ürünler orijinal Herbalife ürünleridir.",
  },
  contact: {
    address: "Türkiye",
    email: "info@ornek.com",
    phone: "+90 500 000 00 00",
    hours: "Pzt — Paz / 09:00 — 20:00",
    locationLabel: "Türkiye",
    latitude: "",
    longitude: "",
  },
  seo: {
    title: "Herbal Ürünleri | Orijinal Herbalife Ürünleri",
    description:
      "Orijinal Herbalife ürünleri, avantajlı setler ve kişiselleştirilmiş beslenme danışmanlığı. Bağımsız distribütör Emine Özberk.",
    keywords: [
      "Herbalife",
      "Formül 1",
      "kilo kontrolü",
      "protein içeceği",
      "avantajlı setler",
      "beslenme",
      "Emine Özberk",
    ],
    ogImage: stockImage("og"),
  },
  navigation: {
    header: [
      { href: "/urunler", label: "Ürünler" },
      { href: "/hakkimizda", label: "Hakkımızda" },
      { href: "/blog", label: "Yazılar" },
      { href: "/medya", label: "Medya" },
      { href: "/sss", label: "SSS" },
      { href: "/yorum", label: "Yorumlar" },
      { href: "/iletisim", label: "İletişim" },
    ],
    footerNav: [
      { href: "/urunler", label: "Ürünler" },
      { href: "/urunler/kategori/avantajli-setler", label: "Avantajlı Setler" },
      { href: "/hakkimizda", label: "Hakkımızda" },
      { href: "/blog", label: "Yazılar" },
      { href: "/medya", label: "Medya" },
      { href: "/sss", label: "SSS" },
      { href: "/iletisim", label: "İletişim" },
      { href: "/siparis-sorgula", label: "Sipariş Sorgula" },
      { href: "/odeme-bildirimi", label: "Ödeme Bildirimi" },
      { href: "/banka-hesaplari", label: "Banka Hesapları" },
      { href: "/takip", label: "Kargo Takip" },
      { href: "/yorum", label: "Google Yorum" },
      { href: "/hesabim", label: "Hesabım" },
      { href: "/hesabim/favoriler", label: "Favorilerim" },
      { href: "/hesabim/takip", label: "Beslenme Takibi" },
      { href: "/hesabim/rapor", label: "Gelişim Raporu" },
      { href: "/sepet", label: "Sepet" },
    ],
    footerLegal: [
      { href: "/kvkk", label: "KVKK" },
      { href: "/gizlilik", label: "Gizlilik" },
      { href: "/cerez-politikasi", label: "Çerez Kullanımı" },
      { href: "/mesafeli-satis", label: "Mesafeli Satış" },
      { href: "/on-bilgilendirme", label: "Ön Bilgilendirme" },
      { href: "/iptal-iade", label: "İade Politikası" },
      { href: "/musteri-memnuniyeti", label: "Müşteri Memnuniyeti" },
      { href: "/guvenli-alisveris", label: "Güvenli Alışveriş" },
      { href: "/aydinlatma-metni", label: "Aydınlatma Metni" },
    ],
  },
  social: {
    instagram: "",
    facebook: "",
    googleMaps: "",
    googleReviewUrl: "",
  },
  whatsapp: {
    ...DEFAULT_WHATSAPP_SETTINGS,
    presets: [...DEFAULT_WHATSAPP_SETTINGS.presets],
  },
  footer: {
    description:
      "Bağımsız distribütör Emine Özberk ile orijinal Herbalife ürünleri ve birebir beslenme desteği.",
    copyrightSuffix: "Bağımsız Distribütör",
  },
};

const CMS_REVALIDATE = 60;

function mergeSettings(
  raw: Record<string, Record<string, unknown>> | null,
): SiteSettings {
  if (!raw) return DEFAULT_SETTINGS;
  return {
    brand: { ...DEFAULT_SETTINGS.brand, ...(raw.brand as object) },
    contact: { ...DEFAULT_SETTINGS.contact, ...(raw.contact as object) },
    seo: { ...DEFAULT_SETTINGS.seo, ...(raw.seo as object) },
    navigation: {
      header:
        (raw.navigation as SiteSettings["navigation"])?.header ??
        DEFAULT_SETTINGS.navigation.header,
      footerNav:
        (raw.navigation as SiteSettings["navigation"])?.footerNav ??
        DEFAULT_SETTINGS.navigation.footerNav,
      footerLegal:
        (raw.navigation as SiteSettings["navigation"])?.footerLegal ??
        DEFAULT_SETTINGS.navigation.footerLegal,
    },
    social: { ...DEFAULT_SETTINGS.social, ...(raw.social as object) },
    whatsapp: mergeWhatsAppSettings(raw.whatsapp),
    footer: { ...DEFAULT_SETTINGS.footer, ...(raw.footer as object) },
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${getApiBase()}/cms/settings`, {
      next: { revalidate: CMS_REVALIDATE },
    });
    if (!res.ok) return DEFAULT_SETTINGS;
    const data = (await res.json()) as Record<string, Record<string, unknown>>;
    return mergeSettings(data);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getContentSections(
  page: string,
): Promise<ContentSection[]> {
  try {
    const res = await fetch(
      `${getApiBase()}/cms/sections?page=${encodeURIComponent(page)}`,
      { next: { revalidate: CMS_REVALIDATE } },
    );
    if (!res.ok) return [];
    return (await res.json()) as ContentSection[];
  } catch {
    return [];
  }
}

export function sectionContent<T extends Record<string, unknown>>(
  sections: ContentSection[],
  key: string,
  fallback: T,
): T {
  const section = sections.find((s) => s.sectionKey === key);
  if (!section?.content) return fallback;
  return { ...fallback, ...section.content } as T;
}

export function cmsImageUrl(url: string | null | undefined, fallback: string) {
  if (!url) return fallback;
  if (
    url.includes("unsplash.com") ||
    url.includes("aida-public") ||
    url.includes("lh3.googleusercontent.com/aida")
  ) {
    return fallback;
  }
  return url;
}
