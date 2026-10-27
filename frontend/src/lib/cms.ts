import { getApiBase } from "@/lib/api";
import { contentImage } from "@/lib/format";
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
    languages?: Array<{
      code: string;
      name: string;
      nativeName: string;
      enabled?: boolean;
      currency?: string;
      sortOrder?: number;
    }>;
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
  welcomePopup?: WelcomePopupSettings;
};

export type WelcomePopupSettings = {
  enabled: boolean;
  delayMs: number;
  /** once = localStorage, session = sessionStorage, always = her ziyaret */
  frequency: "once" | "session" | "always";
  showOnPaths: string[];
  excludePaths: string[];
  storageKey: string;
  distributorName: string;
  headline: string;
  leftTitle: string;
  leftBody: string;
  leftLinkLabel: string;
  leftLinkUrl: string;
  rightTitle: string;
  rightBody: string;
  rightLinkLabel: string;
  rightLinkUrl: string;
  closeLabel: string;
};

export const DEFAULT_WELCOME_POPUP: WelcomePopupSettings = {
  enabled: true,
  delayMs: 600,
  frequency: "once",
  showOnPaths: ["/"],
  excludePaths: ["/giris", "/kayit", "/odeme", "/auth"],
  storageKey: "hk_welcome_popup_v1",
  distributorName: "Büşra Özberk",
  headline:
    "Bu internet sitesi Herbalife Nutrition Bağımsız Distribütörü tarafından yönetilmektedir: Büşra Özberk",
  leftTitle: "MEVCUT MÜŞTERİ ?",
  leftBody:
    "Beslenme hedeflerinize ulaşmada kişisel Distribütörünüzle kuracağınız birebir ilişki çok önemlidir. Eğer Büşra Özberk mevcut distribütörünüz değil ise, ürünlerinizi mevcut distribütörünüzden almanızı öneririz. Mevcut Distribütörünüzü bulmak için",
  leftLinkLabel: "buraya tıklayınız.",
  leftLinkUrl: "https://www.herbalife.com/tr-tr/",
  rightTitle:
    "HALİHAZIRDA HERBALIFE NUTRITION DİSTRİBÜTÖRÜ YA DA AYRICALIKLI MÜŞTERİ MİSİNİZ?",
  rightBody:
    "Eğer kendi Distribütör hesabınız varsa, lütfen sipariş vermek ve tüm haklardan yararlanmak için",
  rightLinkLabel: "myherbalife.com",
  rightLinkUrl: "https://www.myherbalife.com",
  closeLabel: "Kapat",
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
      "Original Herbal Kapıda products and personalized nutrition support with an independent distributor.",
    established: "Since 2024",
    location: "Buca / İzmir",
    logoUrl: "/brand/logo.png",
    distributorName: "Büşra Özberk",
    distributorTitle: "Independent Distributor",
    distributorCode: "",
    legalDisclaimer:
      "This site belongs to an independent Herbalife Nutrition / Herbal Kapıda distributor. It is not the official Herbalife website. Products are original Herbalife products.",
  },
  contact: {
    address: "Adatepe Mahallesi 73 Sokak No: 3 Daire: 9 Buca / İzmir",
    email: "info@herbalkapida.com",
    phone: "+90 505 142 07 10",
    hours: "Mon — Sun / 09:00 — 20:00",
    locationLabel: "Buca / İzmir",
    latitude: "",
    longitude: "",
  },
  seo: {
    title: "Herbal Kapıda | Büşra Özberk — Independent Distributor",
    description:
      "Original Herbalife / Herbal Kapıda products, value bundles, and personalized nutrition coaching. Independent distributor Büşra Özberk — herbalkapida.com.",
    keywords: [
      "Herbal Kapıda",
      "Herbalife",
      "Büşra Özberk",
      "Formula 1",
      "weight management",
      "protein shake",
      "bundles",
      "nutrition",
      "Izmir",
    ],
    ogImage: "/brand/og.jpg",
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
      "Herbal Kapıda ile orijinal Herbal Kapıda ürünleri, avantajlı setler ve birebir beslenme desteği.",
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
      "Kilo kontrolü ve vücut kompozisyonu sonuçları kişiden kişiye değişir; tek başına ürün kullanımı yeterli değildir. Kalori alımı, fiziksel aktivite ve düzenli takip birlikte değerlendirilmelidir. Bu site bağımsız bir Herbal Kapıda Nutrition distribütörüne aittir.",
  },
  membership: {
    ctaLabel: "Resmi Herbalife üyeliği",
    ctaUrl: "https://www.myherbalife.com",
    disclaimer:
      "Herbalife Nutrition distribütörü olmak için kayıt yalnızca resmi Herbalife platformu üzerinden yapılır. Bu site bağımsız bir distribütör sitesidir.",
  },
  /** freeShippingOver yoksa vitrin env yedeğine düşer */
  shipping: {
    defaultFee: 89.9,
  },
  welcomePopup: { ...DEFAULT_WELCOME_POPUP },
};

/** Kısa TTL; admin kayıt sonrası /api/revalidate ile hemen de temizlenir */
const CMS_REVALIDATE = 15;

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
    shipping: {
      ...DEFAULT_SETTINGS.shipping,
      ...(raw.shipping as SiteSettings["shipping"]),
    },
    analytics: raw.analytics as SiteSettings["analytics"],
    welcomePopup: {
      ...DEFAULT_WELCOME_POPUP,
      ...(raw.welcomePopup as Partial<WelcomePopupSettings>),
      showOnPaths: Array.isArray(
        (raw.welcomePopup as WelcomePopupSettings | undefined)?.showOnPaths,
      )
        ? (raw.welcomePopup as WelcomePopupSettings).showOnPaths
        : DEFAULT_WELCOME_POPUP.showOnPaths,
      excludePaths: Array.isArray(
        (raw.welcomePopup as WelcomePopupSettings | undefined)?.excludePaths,
      )
        ? (raw.welcomePopup as WelcomePopupSettings).excludePaths
        : DEFAULT_WELCOME_POPUP.excludePaths,
    },
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
  const raw = { ...section.content } as Record<string, unknown>;
  const untranslated = raw._cmsUntranslated === true;
  delete raw._cmsUntranslated;
  if (!untranslated) {
    return { ...fallback, ...raw } as T;
  }
  // Çeviri yok: next-intl metin fallback’i kalsın; yalnızca yapısal CMS alanları
  const merged: Record<string, unknown> = { ...fallback };
  for (const [k, v] of Object.entries(raw)) {
    if (v == null) continue;
    if (typeof v === "string") continue;
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) continue;
    if (
      typeof v === "object" &&
      !Array.isArray(v) &&
      typeof (v as { label?: unknown }).label === "string" &&
      typeof (fallback[k] as { label?: unknown } | undefined)?.label ===
        "string"
    ) {
      merged[k] = {
        ...(fallback[k] as object),
        ...(v as object),
        label: (fallback[k] as { label: string }).label,
      };
      continue;
    }
    merged[k] = v;
  }
  return merged as T;
}

export function cmsImageUrl(url: string | null | undefined, fallback: string) {
  return contentImage(url, fallback);
}
