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
    distributorCode: string;
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
  localization?: {
    defaultLocale?: string;
    enabledLocales?: string[];
    defaultCurrency?: string;
    currencies?: string[];
    currencyByLocale?: Record<string, string>;
  };
  shipping?: {
    defaultFee?: number;
    freeShippingOver?: number;
  };
  promises?: {
    sameDayCutoff?: string;
    sameDayShipping?: boolean;
    freeCoaching?: boolean;
    returnDays?: number;
  };
  legal?: {
    supplementDisclaimer?: string;
    weightDisclaimer?: string;
  };
  membership?: {
    ctaLabel?: string;
    ctaUrl?: string;
    disclaimer?: string;
  };
  analytics?: {
    ga4Id?: string;
    gtmId?: string;
    googleAdsId?: string;
    metaPixelId?: string;
    facebookPixelId?: string;
    yandexMetrikaId?: string;
    tiktokPixelId?: string;
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

/**
 * Last-resort fallback when `/cms/settings` fails. Callers pass `locale` to the API;
 * localized copy normally comes from CMS. Keep English-neutral here so non-`tr`
 * routes do not show Turkish chrome when the API is down.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  brand: {
    name: "Herbal Kapıda",
    slogan: "A healthier, happier life",
    tagline:
      "Original Herbalife products and personalized nutrition support with an independent distributor.",
    established: "Since 2024",
    location: "Turkey",
    logoUrl: "",
    distributorName: "Herbal Kapıda",
    distributorTitle: "Independent Distributor",
    distributorCode: "",
    legalDisclaimer:
      "This site belongs to an independent Herbalife Nutrition distributor. It is not the official Herbalife Nutrition website. Products are original Herbalife products.",
  },
  contact: {
    address: "Turkey",
    email: "info@herbalkapida.com",
    phone: "+90 500 000 00 00",
    hours: "Mon — Sun / 09:00 — 20:00",
    locationLabel: "Turkey",
    latitude: "",
    longitude: "",
  },
  seo: {
    title: "Herbal Kapıda | Original Herbalife Products",
    description:
      "Original Herbalife products, value bundles, and personalized nutrition coaching. Independent distributor Herbal Kapıda — herbalkapida.com.",
    keywords: [
      "Herbal Kapıda",
      "Herbalife",
      "Formula 1",
      "weight management",
      "protein shake",
      "bundles",
      "nutrition",
    ],
    ogImage: stockImage("og"),
  },
  navigation: {
    header: [
      { href: "/urunler", label: "Products" },
      { href: "/hakkimizda", label: "About" },
      { href: "/blog", label: "Articles" },
      { href: "/medya", label: "Media" },
      { href: "/sss", label: "FAQ" },
      { href: "/yorum", label: "Reviews" },
      { href: "/iletisim", label: "Contact" },
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
      "Herbal Kapıda ile orijinal Herbalife ürünleri, avantajlı setler ve birebir beslenme desteği.",
    copyrightSuffix: "Bağımsız Distribütör",
  },
  promises: {
    sameDayCutoff: "13:00",
    sameDayShipping: true,
    freeCoaching: true,
    returnDays: 30,
  },
  legal: {
    supplementDisclaimer:
      "Bu ürünler gıda takviyesidir; hastalıkların teşhis, tedavi veya önlenmesi amacıyla kullanılmaz. Dengeli ve çeşitli beslenme ile sağlıklı yaşam tarzı önemlidir. Hamileler, emzirenler ve kronik rahatsızlığı olanlar kullanmadan önce hekimine danışmalıdır.",
    weightDisclaimer:
      "Kilo kontrolü ve vücut kompozisyonu sonuçları kişiden kişiye değişir; tek başına ürün kullanımı yeterli değildir. Kalori alımı, fiziksel aktivite ve düzenli takip birlikte değerlendirilmelidir. Bu site bağımsız bir Herbalife Nutrition distribütörüne aittir.",
  },
  membership: {
    ctaLabel: "Resmi Herbalife üyeliği",
    ctaUrl: "https://www.myherbalife.com",
    disclaimer:
      "Herbalife Nutrition distribütörü olmak için kayıt yalnızca resmi myHerbalife platformu üzerinden yapılır. Bu site bağımsız bir distribütör sitesidir.",
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
    promises: {
      ...DEFAULT_SETTINGS.promises,
      ...(raw.promises as SiteSettings["promises"]),
    },
    legal: {
      ...DEFAULT_SETTINGS.legal,
      ...(raw.legal as SiteSettings["legal"]),
    },
    membership: {
      ...DEFAULT_SETTINGS.membership,
      ...(raw.membership as SiteSettings["membership"]),
    },
    localization: raw.localization as SiteSettings["localization"],
    shipping: raw.shipping as SiteSettings["shipping"],
    analytics: raw.analytics as SiteSettings["analytics"],
  };
}

export async function getSiteSettings(locale = "tr"): Promise<SiteSettings> {
  try {
    const res = await fetch(
      `${getApiBase()}/cms/settings?locale=${encodeURIComponent(locale)}`,
      {
        next: { revalidate: CMS_REVALIDATE, tags: [`cms-settings-${locale}`] },
      },
    );
    if (!res.ok) return DEFAULT_SETTINGS;
    const data = (await res.json()) as Record<string, Record<string, unknown>>;
    return mergeSettings(data);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getContentSections(
  page: string,
  locale = "tr",
): Promise<ContentSection[]> {
  try {
    const res = await fetch(
      `${getApiBase()}/cms/sections?page=${encodeURIComponent(page)}&locale=${encodeURIComponent(locale)}`,
      {
        next: { revalidate: CMS_REVALIDATE, tags: [`cms-sections-${page}-${locale}`] },
      },
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
