'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { MediaUpload } from '@/components/MediaUpload';
import { LinkListEditor } from '@/components/LinkListEditor';
import { RichTextEditor } from '@/components/RichTextEditor';
import {
  WhatsAppPresetEditor,
  type WhatsAppPresetRow,
} from '@/components/WhatsAppPresetEditor';

type SettingRow = {
  key: string;
  value: Record<string, unknown>;
};

type NavLink = { href: string; label: string };

type Navigation = {
  header: NavLink[];
  footerNav: NavLink[];
  footerLegal: NavLink[];
};

type Social = {
  instagram: string;
  facebook: string;
  googleMaps: string;
  googleReviewUrl: string;
};

type WhatsAppSettings = {
  enabled: boolean;
  phone: string;
  greeting: string;
  presets: WhatsAppPresetRow[];
};

type AnalyticsSettings = {
  ga4Id: string;
  gtmId: string;
  googleAdsId: string;
  metaPixelId: string;
  facebookPixelId: string;
  yandexMetrikaId: string;
  tiktokPixelId: string;
};

type ShippingSettings = {
  defaultFee: string;
  freeShippingOver: string;
};

type BrandFields = {
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

type ContactFields = {
  address: string;
  email: string;
  phone: string;
  hours: string;
  locationLabel: string;
  latitude: string;
  longitude: string;
};

type SeoFields = {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
};

type FooterFields = {
  description: string;
  copyrightSuffix: string;
};

const FORM_LOCALES = ['tr', 'en', 'de', 'fr', 'es'] as const;
type FormLocale = (typeof FORM_LOCALES)[number];
const EXTRA_LOCALES = ['en', 'de', 'fr', 'es'] as const;
type ExtraLocale = (typeof EXTRA_LOCALES)[number];

type LocaleBundle = {
  brand: Pick<
    BrandFields,
    | 'name'
    | 'slogan'
    | 'tagline'
    | 'established'
    | 'location'
    | 'distributorName'
    | 'distributorTitle'
    | 'legalDisclaimer'
  >;
  contact: Pick<ContactFields, 'address' | 'hours' | 'locationLabel'>;
  seo: Pick<SeoFields, 'title' | 'description' | 'keywords'>;
  footer: FooterFields;
  whatsapp: { greeting: string; presets: WhatsAppPresetRow[] };
  navigation: Navigation;
};

const DEFAULT_ANALYTICS: AnalyticsSettings = {
  ga4Id: '',
  gtmId: '',
  googleAdsId: '',
  metaPixelId: '',
  facebookPixelId: '',
  yandexMetrikaId: '',
  tiktokPixelId: '',
};

const DEFAULT_SHIPPING: ShippingSettings = {
  defaultFee: '89.90',
  freeShippingOver: '750',
};

const DEFAULT_WHATSAPP: WhatsAppSettings = {
  enabled: true,
  phone: '',
  greeting: 'Merhaba — Herbal Kapıda. Size nasıl yardımcı olabiliriz?',
  presets: [
    {
      label: 'Sipariş durumu',
      message: 'Merhaba, sipariş durumum hakkında bilgi almak istiyorum.',
    },
    {
      label: 'Ürün danışmanlığı',
      message:
        'Merhaba, hedeflerime uygun ürün / paket önerisi alabilir miyim?',
    },
    {
      label: 'Beslenme takibi',
      message: 'Merhaba, beslenme ve takip programı hakkında yazıyorum.',
    },
    {
      label: 'Kargo & teslimat',
      message:
        'Merhaba, kargo süresi ve teslimat seçenekleri hakkında yazıyorum.',
    },
    {
      label: 'Başka bir konu',
      message: 'Merhaba, yazıyorum.',
    },
  ],
};

function emptyLocaleBundle(): LocaleBundle {
  return {
    brand: {
      name: '',
      slogan: '',
      tagline: '',
      established: '',
      location: '',
      distributorName: '',
      distributorTitle: '',
      legalDisclaimer: '',
    },
    contact: { address: '', hours: '', locationLabel: '' },
    seo: { title: '', description: '', keywords: '' },
    footer: { description: '', copyrightSuffix: '' },
    whatsapp: {
      greeting: '',
      presets: DEFAULT_WHATSAPP.presets.map((p) => ({ ...p })),
    },
    navigation: { header: [], footerNav: [], footerLegal: [] },
  };
}

function initialLocaleBundles(): Record<ExtraLocale, LocaleBundle> {
  return {
    en: emptyLocaleBundle(),
    de: emptyLocaleBundle(),
    fr: emptyLocaleBundle(),
    es: emptyLocaleBundle(),
  };
}

function asNavLinks(value: unknown): NavLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const link = item as { href?: unknown; label?: unknown };
      if (typeof link.href !== 'string' || typeof link.label !== 'string') {
        return null;
      }
      return { href: link.href, label: link.label };
    })
    .filter((item): item is NavLink => item !== null);
}

function asWhatsApp(value: unknown): WhatsAppSettings {
  if (!value || typeof value !== 'object') {
    return {
      ...DEFAULT_WHATSAPP,
      presets: DEFAULT_WHATSAPP.presets.map((p) => ({ ...p })),
    };
  }
  const row = value as Record<string, unknown>;
  const presets = Array.isArray(row.presets)
    ? row.presets
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const p = item as { label?: unknown; message?: unknown };
          if (typeof p.label !== 'string' || typeof p.message !== 'string') {
            return null;
          }
          return { label: p.label, message: p.message };
        })
        .filter((item): item is WhatsAppPresetRow => item !== null)
    : [];
  return {
    enabled: typeof row.enabled === 'boolean' ? row.enabled : true,
    phone: typeof row.phone === 'string' ? row.phone : '',
    greeting:
      typeof row.greeting === 'string' && row.greeting.trim()
        ? row.greeting
        : DEFAULT_WHATSAPP.greeting,
    presets: presets.length
      ? presets
      : DEFAULT_WHATSAPP.presets.map((p) => ({ ...p })),
  };
}

function omitTranslations(
  value: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!value) return {};
  const { translations: _t, ...rest } = value;
  return rest;
}

function readLocaleBundles(
  map: Record<string, Record<string, unknown>>,
): Record<ExtraLocale, LocaleBundle> {
  const out = initialLocaleBundles();
  const brandT = (map.brand?.translations || {}) as Record<
    string,
    Record<string, unknown>
  >;
  const contactT = (map.contact?.translations || {}) as Record<
    string,
    Record<string, unknown>
  >;
  const seoT = (map.seo?.translations || {}) as Record<
    string,
    Record<string, unknown>
  >;
  const footerT = (map.footer?.translations || {}) as Record<
    string,
    Record<string, unknown>
  >;
  const whatsappT = (map.whatsapp?.translations || {}) as Record<
    string,
    Record<string, unknown>
  >;
  const navigationT = (map.navigation?.translations || {}) as Record<
    string,
    Record<string, unknown>
  >;

  const trNavRoot = omitTranslations(
    (map.navigation || {}) as Record<string, unknown>,
  );
  const trNav: Navigation = {
    header: asNavLinks(trNavRoot.header),
    footerNav: asNavLinks(trNavRoot.footerNav),
    footerLegal: asNavLinks(trNavRoot.footerLegal),
  };
  const trWa = asWhatsApp(
    omitTranslations((map.whatsapp || {}) as Record<string, unknown>),
  );

  for (const loc of EXTRA_LOCALES) {
    const b = brandT[loc] || {};
    const c = contactT[loc] || {};
    const s = seoT[loc] || {};
    const f = footerT[loc] || {};
    const w = whatsappT[loc] || {};
    const n = navigationT[loc] || {};
    const wa = asWhatsApp({
      greeting: w.greeting || trWa.greeting,
      presets: Array.isArray(w.presets) && w.presets.length ? w.presets : trWa.presets,
      enabled: true,
      phone: '',
    });
    const header = asNavLinks(n.header);
    const footerNav = asNavLinks(n.footerNav);
    const footerLegal = asNavLinks(n.footerLegal);
    out[loc] = {
      brand: {
        name: String(b.name || ''),
        slogan: String(b.slogan || ''),
        tagline: String(b.tagline || ''),
        established: String(b.established || ''),
        location: String(b.location || ''),
        distributorName: String(b.distributorName || ''),
        distributorTitle: String(b.distributorTitle || ''),
        legalDisclaimer: String(b.legalDisclaimer || ''),
      },
      contact: {
        address: String(c.address || ''),
        hours: String(c.hours || ''),
        locationLabel: String(c.locationLabel || ''),
      },
      seo: {
        title: String(s.title || ''),
        description: String(s.description || ''),
        keywords: Array.isArray(s.keywords)
          ? s.keywords.map(String).join(', ')
          : String(s.keywords || ''),
      },
      footer: {
        description: String(f.description || ''),
        copyrightSuffix: String(f.copyrightSuffix || ''),
      },
      whatsapp: {
        greeting: wa.greeting,
        presets: wa.presets,
      },
      navigation: {
        header: header.length ? header : trNav.header.map((l) => ({ ...l })),
        footerNav: footerNav.length
          ? footerNav
          : trNav.footerNav.map((l) => ({ ...l })),
        footerLegal: footerLegal.length
          ? footerLegal
          : trNav.footerLegal.map((l) => ({ ...l })),
      },
    };
  }
  return out;
}

const LOCALE_LABELS: Record<FormLocale, string> = {
  tr: 'TR',
  en: 'EN',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
};

type WelcomePopupFields = {
  enabled: boolean;
  delayMs: string;
  frequency: 'once' | 'session' | 'always';
  showOnPaths: string;
  excludePaths: string;
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

const DEFAULT_WELCOME_POPUP: WelcomePopupFields = {
  enabled: true,
  delayMs: '600',
  frequency: 'once',
  showOnPaths: '/',
  excludePaths: '/giris, /kayit, /odeme, /auth',
  storageKey: 'hk_welcome_popup_v1',
  distributorName: 'Büşra Özberk',
  headline:
    'Bu internet sitesi Herbalife Nutrition Bağımsız Distribütörü tarafından yönetilmektedir: Büşra Özberk',
  leftTitle: 'MEVCUT MÜŞTERİ ?',
  leftBody:
    'Beslenme hedeflerinize ulaşmada kişisel Distribütörünüzle kuracağınız birebir ilişki çok önemlidir. Eğer Büşra Özberk mevcut distribütörünüz değil ise, ürünlerinizi mevcut distribütörünüzden almanızı öneririz. Mevcut Distribütörünüzü bulmak için',
  leftLinkLabel: 'buraya tıklayınız.',
  leftLinkUrl: 'https://www.herbalife.com/tr-tr/',
  rightTitle:
    'HALİHAZIRDA HERBALIFE NUTRITION DİSTRİBÜTÖRÜ YA DA AYRICALIKLI MÜŞTERİ MİSİNİZ?',
  rightBody:
    'Eğer kendi Distribütör hesabınız varsa, lütfen sipariş vermek ve tüm haklardan yararlanmak için',
  rightLinkLabel: 'myherbalife.com',
  rightLinkUrl: 'https://www.myherbalife.com',
  closeLabel: 'Kapat',
};

type SettingsSection =
  | 'marka'
  | 'seo'
  | 'iletisim'
  | 'whatsapp'
  | 'popup'
  | 'teknik'
  | 'navigasyon';

const SETTINGS_SECTIONS: { key: SettingsSection; label: string }[] = [
  { key: 'marka', label: 'Marka' },
  { key: 'seo', label: 'SEO' },
  { key: 'iletisim', label: 'İletişim' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'popup', label: 'Karşılama popup' },
  { key: 'teknik', label: 'Kargo & analitik' },
  { key: 'navigasyon', label: 'Menü & footer' },
];

export default function SiteSettingsPage() {
  const [formLocale, setFormLocale] = useState<FormLocale>('tr');
  const [settingsSection, setSettingsSection] =
    useState<SettingsSection>('marka');
  const [brand, setBrand] = useState<BrandFields>({
    name: '',
    slogan: '',
    tagline: '',
    established: '',
    location: '',
    logoUrl: '',
    distributorName: '',
    distributorTitle: '',
    distributorCode: '',
    legalDisclaimer: '',
  });
  const [contact, setContact] = useState<ContactFields>({
    address: '',
    email: '',
    phone: '',
    hours: '',
    locationLabel: '',
    latitude: '',
    longitude: '',
  });
  const [seo, setSeo] = useState<SeoFields>({
    title: '',
    description: '',
    keywords: '',
    ogImage: '',
  });
  const [welcomePopup, setWelcomePopup] =
    useState<WelcomePopupFields>(DEFAULT_WELCOME_POPUP);
  const [social, setSocial] = useState<Social>({
    instagram: '',
    facebook: '',
    googleMaps: '',
    googleReviewUrl: 'https://g.page/r/CdfE3W3I-W53EAI/review',
  });
  const [whatsapp, setWhatsapp] = useState<WhatsAppSettings>(() =>
    asWhatsApp(null),
  );
  const [footer, setFooter] = useState<FooterFields>({
    description: '',
    copyrightSuffix: '',
  });
  const [navigation, setNavigation] = useState<Navigation>({
    header: [],
    footerNav: [],
    footerLegal: [],
  });
  const [analytics, setAnalytics] = useState<AnalyticsSettings>({
    ...DEFAULT_ANALYTICS,
  });
  const [shipping, setShipping] = useState<ShippingSettings>({
    ...DEFAULT_SHIPPING,
  });
  const [localeBundles, setLocaleBundles] =
    useState<Record<ExtraLocale, LocaleBundle>>(initialLocaleBundles);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isTr = formLocale === 'tr';

  const brandView = useMemo(
    () => (isTr ? brand : { ...brand, ...localeBundles[formLocale].brand }),
    [isTr, brand, localeBundles, formLocale],
  );
  const contactView = useMemo(
    () =>
      isTr ? contact : { ...contact, ...localeBundles[formLocale].contact },
    [isTr, contact, localeBundles, formLocale],
  );
  const seoView = useMemo(
    () => (isTr ? seo : { ...seo, ...localeBundles[formLocale].seo }),
    [isTr, seo, localeBundles, formLocale],
  );
  const footerView = useMemo(
    () => (isTr ? footer : localeBundles[formLocale].footer),
    [isTr, footer, localeBundles, formLocale],
  );
  const whatsappView = useMemo(
    () =>
      isTr
        ? whatsapp
        : {
            ...whatsapp,
            greeting: localeBundles[formLocale].whatsapp.greeting,
            presets: localeBundles[formLocale].whatsapp.presets,
          },
    [isTr, whatsapp, localeBundles, formLocale],
  );
  const navigationView = useMemo(
    () => (isTr ? navigation : localeBundles[formLocale].navigation),
    [isTr, navigation, localeBundles, formLocale],
  );

  function patchBrand(
    patch: Partial<BrandFields> | ((prev: BrandFields) => BrandFields),
  ) {
    if (isTr) {
      setBrand((s) =>
        typeof patch === 'function' ? patch(s) : { ...s, ...patch },
      );
      return;
    }
    setLocaleBundles((prev) => {
      const cur = prev[formLocale];
      const nextBrand =
        typeof patch === 'function'
          ? patch({ ...brand, ...cur.brand })
          : { ...cur.brand, ...patch };
      return {
        ...prev,
        [formLocale]: {
          ...cur,
          brand: {
            name: nextBrand.name,
            slogan: nextBrand.slogan,
            tagline: nextBrand.tagline,
            established: nextBrand.established,
            location: nextBrand.location,
            distributorName: nextBrand.distributorName,
            distributorTitle: nextBrand.distributorTitle,
            legalDisclaimer: nextBrand.legalDisclaimer,
          },
        },
      };
    });
  }

  function patchContact(
    patch: Partial<ContactFields> | ((prev: ContactFields) => ContactFields),
  ) {
    if (isTr) {
      setContact((s) =>
        typeof patch === 'function' ? patch(s) : { ...s, ...patch },
      );
      return;
    }
    setLocaleBundles((prev) => {
      const cur = prev[formLocale];
      const next =
        typeof patch === 'function'
          ? patch({ ...contact, ...cur.contact })
          : { ...cur.contact, ...patch };
      return {
        ...prev,
        [formLocale]: {
          ...cur,
          contact: {
            address: next.address,
            hours: next.hours,
            locationLabel: next.locationLabel,
          },
        },
      };
    });
  }

  function patchSeo(
    patch: Partial<SeoFields> | ((prev: SeoFields) => SeoFields),
  ) {
    if (isTr) {
      setSeo((s) =>
        typeof patch === 'function' ? patch(s) : { ...s, ...patch },
      );
      return;
    }
    setLocaleBundles((prev) => {
      const cur = prev[formLocale];
      const next =
        typeof patch === 'function'
          ? patch({ ...seo, ...cur.seo })
          : { ...cur.seo, ...patch };
      return {
        ...prev,
        [formLocale]: {
          ...cur,
          seo: {
            title: next.title,
            description: next.description,
            keywords: next.keywords,
          },
        },
      };
    });
  }

  function patchFooter(
    patch: Partial<FooterFields> | ((prev: FooterFields) => FooterFields),
  ) {
    if (isTr) {
      setFooter((s) =>
        typeof patch === 'function' ? patch(s) : { ...s, ...patch },
      );
      return;
    }
    setLocaleBundles((prev) => {
      const cur = prev[formLocale];
      const next =
        typeof patch === 'function'
          ? patch(cur.footer)
          : { ...cur.footer, ...patch };
      return { ...prev, [formLocale]: { ...cur, footer: next } };
    });
  }

  function patchWhatsappLocal(
    patch: Partial<Pick<WhatsAppSettings, 'greeting' | 'presets'>>,
  ) {
    if (isTr) {
      setWhatsapp((s) => ({ ...s, ...patch }));
      return;
    }
    setLocaleBundles((prev) => {
      const cur = prev[formLocale];
      return {
        ...prev,
        [formLocale]: {
          ...cur,
          whatsapp: { ...cur.whatsapp, ...patch },
        },
      };
    });
  }

  function patchNavigation(next: Navigation) {
    if (isTr) {
      setNavigation(next);
      return;
    }
    setLocaleBundles((prev) => ({
      ...prev,
      [formLocale]: { ...prev[formLocale], navigation: next },
    }));
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const rows = await api<SettingRow[]>('/cms/admin/settings');
        const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
        if (map.brand) {
          const b = omitTranslations(map.brand as Record<string, unknown>);
          setBrand((s) => ({ ...s, ...(b as Partial<BrandFields>) }));
        }
        if (map.contact) {
          const c = omitTranslations(map.contact as Record<string, unknown>);
          setContact((s) => ({ ...s, ...(c as Partial<ContactFields>) }));
        }
        if (map.seo) {
          const raw = omitTranslations(map.seo as Record<string, unknown>);
          setSeo({
            title: String(raw.title || ''),
            description: String(raw.description || ''),
            keywords: Array.isArray(raw.keywords)
              ? raw.keywords.map(String).join(', ')
              : '',
            ogImage: String(raw.ogImage || ''),
          });
        }
        if (map.social)
          setSocial((s) => ({ ...s, ...(map.social as typeof s) }));
        setWhatsapp(asWhatsApp(omitTranslations(map.whatsapp as Record<string, unknown>)));
        if (map.footer) {
          const f = omitTranslations(map.footer as Record<string, unknown>);
          setFooter((s) => ({ ...s, ...(f as Partial<FooterFields>) }));
        }
        if (map.navigation) {
          const nav = omitTranslations(
            map.navigation as Record<string, unknown>,
          );
          setNavigation({
            header: asNavLinks(nav.header),
            footerNav: asNavLinks(nav.footerNav),
            footerLegal: asNavLinks(nav.footerLegal),
          });
        }
        if (map.analytics) {
          const a = map.analytics as Record<string, unknown>;
          setAnalytics({
            ga4Id: String(a.ga4Id || ''),
            gtmId: String(a.gtmId || ''),
            googleAdsId: String(a.googleAdsId || ''),
            metaPixelId: String(a.metaPixelId || ''),
            facebookPixelId: String(a.facebookPixelId || ''),
            yandexMetrikaId: String(a.yandexMetrikaId || ''),
            tiktokPixelId: String(a.tiktokPixelId || ''),
          });
        }
        if (map.shipping) {
          const s = map.shipping as Record<string, unknown>;
          setShipping({
            defaultFee:
              s.defaultFee != null
                ? String(s.defaultFee)
                : DEFAULT_SHIPPING.defaultFee,
            freeShippingOver:
              s.freeShippingOver != null
                ? String(s.freeShippingOver)
                : DEFAULT_SHIPPING.freeShippingOver,
          });
        }
        if (map.welcomePopup) {
          const p = map.welcomePopup as Record<string, unknown>;
          setWelcomePopup({
            enabled: p.enabled !== false,
            delayMs: String(p.delayMs ?? DEFAULT_WELCOME_POPUP.delayMs),
            frequency:
              p.frequency === 'session' || p.frequency === 'always'
                ? p.frequency
                : 'once',
            showOnPaths: Array.isArray(p.showOnPaths)
              ? p.showOnPaths.map(String).join(', ')
              : DEFAULT_WELCOME_POPUP.showOnPaths,
            excludePaths: Array.isArray(p.excludePaths)
              ? p.excludePaths.map(String).join(', ')
              : DEFAULT_WELCOME_POPUP.excludePaths,
            storageKey: String(
              p.storageKey || DEFAULT_WELCOME_POPUP.storageKey,
            ),
            distributorName: String(
              p.distributorName || DEFAULT_WELCOME_POPUP.distributorName,
            ),
            headline: String(p.headline || DEFAULT_WELCOME_POPUP.headline),
            leftTitle: String(p.leftTitle || DEFAULT_WELCOME_POPUP.leftTitle),
            leftBody: String(p.leftBody || DEFAULT_WELCOME_POPUP.leftBody),
            leftLinkLabel: String(
              p.leftLinkLabel || DEFAULT_WELCOME_POPUP.leftLinkLabel,
            ),
            leftLinkUrl: String(
              p.leftLinkUrl || DEFAULT_WELCOME_POPUP.leftLinkUrl,
            ),
            rightTitle: String(p.rightTitle || DEFAULT_WELCOME_POPUP.rightTitle),
            rightBody: String(p.rightBody || DEFAULT_WELCOME_POPUP.rightBody),
            rightLinkLabel: String(
              p.rightLinkLabel || DEFAULT_WELCOME_POPUP.rightLinkLabel,
            ),
            rightLinkUrl: String(
              p.rightLinkUrl || DEFAULT_WELCOME_POPUP.rightLinkUrl,
            ),
            closeLabel: String(p.closeLabel || DEFAULT_WELCOME_POPUP.closeLabel),
          });
        }
        setLocaleBundles(readLocaleBundles(map));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ayarlar yüklenemedi');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const brandTranslations: Record<string, unknown> = {};
      const contactTranslations: Record<string, unknown> = {};
      const seoTranslations: Record<string, unknown> = {};
      const footerTranslations: Record<string, unknown> = {};
      const whatsappTranslations: Record<string, unknown> = {};
      const navigationTranslations: Record<string, unknown> = {};

      for (const loc of EXTRA_LOCALES) {
        const copy = localeBundles[loc];
        brandTranslations[loc] = {
          name: copy.brand.name.trim() || brand.name,
          slogan: copy.brand.slogan.trim(),
          tagline: copy.brand.tagline.trim(),
          established: copy.brand.established.trim(),
          location: copy.brand.location.trim(),
          distributorName: copy.brand.distributorName.trim(),
          distributorTitle: copy.brand.distributorTitle.trim(),
          legalDisclaimer: copy.brand.legalDisclaimer.trim(),
        };
        contactTranslations[loc] = {
          address: copy.contact.address.trim(),
          hours: copy.contact.hours.trim(),
          locationLabel: copy.contact.locationLabel.trim(),
        };
        seoTranslations[loc] = {
          title: copy.seo.title.trim(),
          description: copy.seo.description.trim(),
          keywords: copy.seo.keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        };
        footerTranslations[loc] = {
          description: copy.footer.description.trim(),
          copyrightSuffix: copy.footer.copyrightSuffix.trim(),
        };
        const presets = copy.whatsapp.presets
          .map((p) => ({
            label: p.label.trim(),
            message: p.message.trim(),
          }))
          .filter((p) => p.label && p.message);
        whatsappTranslations[loc] = {
          greeting: copy.whatsapp.greeting.trim(),
          presets,
        };
        // Boş dizi gönderme — resolveLocalizedRecord TR menüyü silmesin
        const navBlock: Record<string, NavLink[]> = {};
        if (copy.navigation.header.length) {
          navBlock.header = copy.navigation.header;
        }
        if (copy.navigation.footerNav.length) {
          navBlock.footerNav = copy.navigation.footerNav;
        }
        if (copy.navigation.footerLegal.length) {
          navBlock.footerLegal = copy.navigation.footerLegal;
        }
        if (Object.keys(navBlock).length) {
          navigationTranslations[loc] = navBlock;
        }
      }

      const cleanedPresets = whatsapp.presets
        .map((p) => ({
          label: p.label.trim(),
          message: p.message.trim(),
        }))
        .filter((p) => p.label && p.message);

      await api('/cms/admin/settings', {
        method: 'PATCH',
        body: {
          settings: [
            {
              key: 'brand',
              value: { ...brand, translations: brandTranslations },
              group: 'brand',
            },
            {
              key: 'contact',
              value: { ...contact, translations: contactTranslations },
              group: 'contact',
            },
            {
              key: 'seo',
              value: {
                ...seo,
                keywords: seo.keywords
                  .split(',')
                  .map((k) => k.trim())
                  .filter(Boolean),
                translations: seoTranslations,
              },
              group: 'seo',
            },
            { key: 'social', value: social, group: 'social' },
            {
              key: 'whatsapp',
              value: {
                enabled: whatsapp.enabled,
                phone: whatsapp.phone.trim(),
                greeting: whatsapp.greeting.trim(),
                presets: cleanedPresets,
                translations: whatsappTranslations,
              },
              group: 'whatsapp',
            },
            {
              key: 'footer',
              value: { ...footer, translations: footerTranslations },
              group: 'footer',
            },
            {
              key: 'navigation',
              value: { ...navigation, translations: navigationTranslations },
              group: 'navigation',
            },
            {
              key: 'analytics',
              value: {
                ga4Id: analytics.ga4Id.trim(),
                gtmId: analytics.gtmId.trim(),
                googleAdsId: analytics.googleAdsId.trim(),
                metaPixelId: analytics.metaPixelId.trim(),
                facebookPixelId: analytics.facebookPixelId.trim(),
                yandexMetrikaId: analytics.yandexMetrikaId.trim(),
                tiktokPixelId: analytics.tiktokPixelId.trim(),
              },
              group: 'analytics',
            },
            {
              key: 'shipping',
              value: {
                defaultFee: Number(shipping.defaultFee) || 89.9,
                freeShippingOver: Number(shipping.freeShippingOver) || 0,
              },
              group: 'shipping',
            },
            {
              key: 'welcomePopup',
              value: {
                enabled: welcomePopup.enabled,
                delayMs: Number(welcomePopup.delayMs) || 0,
                frequency: welcomePopup.frequency,
                showOnPaths: welcomePopup.showOnPaths
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
                excludePaths: welcomePopup.excludePaths
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
                storageKey:
                  welcomePopup.storageKey.trim() ||
                  DEFAULT_WELCOME_POPUP.storageKey,
                distributorName: welcomePopup.distributorName.trim(),
                headline: welcomePopup.headline.trim(),
                leftTitle: welcomePopup.leftTitle.trim(),
                leftBody: welcomePopup.leftBody.trim(),
                leftLinkLabel: welcomePopup.leftLinkLabel.trim(),
                leftLinkUrl: welcomePopup.leftLinkUrl.trim(),
                rightTitle: welcomePopup.rightTitle.trim(),
                rightBody: welcomePopup.rightBody.trim(),
                rightLinkLabel: welcomePopup.rightLinkLabel.trim(),
                rightLinkUrl: welcomePopup.rightLinkUrl.trim(),
                closeLabel:
                  welcomePopup.closeLabel.trim() ||
                  DEFAULT_WELCOME_POPUP.closeLabel,
              },
              group: 'welcomePopup',
            },
          ],
        },
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Yükleniyor…</p>;

  return (
    <form onSubmit={onSubmit} className="max-w-6xl space-y-6">
      <div>
        <h2 className="admin-page-title text-xl">Site Ayarları</h2>
        <p className="admin-page-sub">
          Marka, iletişim, SEO, sosyal, WhatsApp ve navigasyon — dil sekmesiyle
          TR ve diğer diller ayrı düzenlenir.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border-muted bg-surface p-3">
        <span className="mono text-[10px] uppercase text-muted">Dil</span>
        {FORM_LOCALES.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => setFormLocale(loc)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase ${
              formLocale === loc
                ? 'bg-accent text-white'
                : 'border border-border-muted bg-surface-high text-muted'
            }`}
          >
            {LOCALE_LABELS[loc]}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted">
          {isTr
            ? 'Türkçe (ana alanlar)'
            : `${LOCALE_LABELS[formLocale]} çevirileri düzenleniyor`}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SETTINGS_SECTIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSettingsSection(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              settingsSection === key
                ? 'bg-accent text-white'
                : 'border border-border-muted text-muted hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="rounded-xl border border-accent/40 bg-accent/5 px-3 py-2 text-sm text-accent">
          Kaydedildi
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {settingsSection === 'marka' ? (
        <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm lg:col-span-2">
          <legend className="px-2 text-xs font-bold uppercase tracking-wide text-muted">
            Marka ({LOCALE_LABELS[formLocale]})
          </legend>
          {(
            [
              ['name', 'Marka adı'],
              ['slogan', 'Slogan'],
              ['tagline', 'Tagline'],
              ['established', 'Kuruluş etiketi'],
              ['location', 'Konum'],
              ['distributorName', 'Distribütör adı'],
              ['distributorTitle', 'Distribütör ünvanı'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                {label}
              </span>
              <input
                value={brandView[key]}
                onChange={(e) => patchBrand({ [key]: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              />
            </label>
          ))}
          {isTr ? (
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                Herbal Kapıda ID / distribütör kodu
              </span>
              <input
                value={brand.distributorCode}
                onChange={(e) =>
                  setBrand((s) => ({ ...s, distributorCode: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              />
            </label>
          ) : null}
          <div className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Yasal uyarı (disclaimer)
            </span>
            <div className="mt-1">
              <RichTextEditor
                value={brandView.legalDisclaimer}
                onChange={(html) => patchBrand({ legalDisclaimer: html })}
                placeholder="Yasal uyarı metni…"
                minHeight="140px"
              />
            </div>
          </div>
          {isTr ? (
            <div>
              <span className="mono text-[10px] uppercase text-muted">Logo</span>
              <MediaUpload
                value={brand.logoUrl}
                onChange={(url) => setBrand((s) => ({ ...s, logoUrl: url }))}
                folder="brand"
              />
            </div>
          ) : (
            <p className="text-xs text-muted">
              Logo tüm dillerde ortaktır — TR sekmesinden değiştirin.
            </p>
          )}
        </fieldset>
        ) : null}

        {settingsSection === 'seo' ? (
        <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm lg:col-span-2">
          <legend className="mono px-2 text-xs uppercase text-muted">
            SEO ({LOCALE_LABELS[formLocale]})
          </legend>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Sayfa başlığı
            </span>
            <input
              value={seoView.title}
              onChange={(e) => patchSeo({ title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
            />
          </label>
          <div className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Meta açıklama
            </span>
            <div className="mt-1">
              <RichTextEditor
                value={seoView.description}
                onChange={(html) => patchSeo({ description: html })}
                placeholder="Arama motoru açıklaması…"
                minHeight="120px"
              />
            </div>
          </div>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Anahtar kelimeler (virgülle)
            </span>
            <input
              value={seoView.keywords}
              onChange={(e) => patchSeo({ keywords: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
            />
          </label>
          {isTr ? (
            <MediaUpload
              label="OG görseli (boşsa marka opengraph-image kullanılır)"
              value={seo.ogImage}
              onChange={(url) => setSeo((s) => ({ ...s, ogImage: url }))}
              folder="seo"
            />
          ) : (
            <p className="text-xs text-muted">
              OG görseli ortaktır — TR sekmesinden değiştirin.
            </p>
          )}
        </fieldset>
        ) : null}

        {settingsSection === 'iletisim' ? (
        <>
        <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
          <legend className="mono px-2 text-xs uppercase text-muted">
            İletişim ({LOCALE_LABELS[formLocale]})
          </legend>
          {(
            [
              ['address', 'Adres', true],
              ['hours', 'Çalışma saatleri', true],
              ['locationLabel', 'Konum etiketi', true],
              ['email', 'E-posta', false],
              ['phone', 'Telefon (görünen / tel: link)', false],
              ['latitude', 'Enlem (geo)', false],
              ['longitude', 'Boylam (geo)', false],
            ] as const
          ).map(([key, label, localized]) => {
            const editable = isTr || localized;
            return (
              <label key={key} className="block text-sm">
                <span className="mono text-[10px] uppercase text-muted">
                  {label}
                  {!editable ? ' (ortak)' : ''}
                </span>
                <input
                  value={contactView[key]}
                  disabled={!editable}
                  onChange={(e) => {
                    if (!editable) return;
                    if (localized) patchContact({ [key]: e.target.value });
                    else
                      setContact((s) => ({ ...s, [key]: e.target.value }));
                  }}
                  className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2 disabled:opacity-60"
                />
              </label>
            );
          })}
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
          <legend className="mono px-2 text-xs uppercase text-muted">
            Sosyal / sameAs
          </legend>
          <p className="text-xs text-muted">
            Sosyal URL’ler tüm dillerde ortaktır.
          </p>
          {(
            [
              ['instagram', 'Instagram bağlantısı'],
              ['facebook', 'Facebook bağlantısı'],
              ['googleMaps', 'Google Maps / GBP URL'],
              ['googleReviewUrl', 'Google yorum bağlantısı'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                {label}
              </span>
              <input
                type="url"
                placeholder="https://"
                value={social[key]}
                onChange={(e) =>
                  setSocial((s) => ({ ...s, [key]: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              />
            </label>
          ))}
        </fieldset>
        </>
        ) : null}

        {settingsSection === 'popup' ? (
        <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm lg:col-span-2">
          <legend className="mono px-2 text-xs uppercase text-muted">
            Karşılama / distribütör popup
          </legend>
          <p className="text-xs text-muted">
            İlk açılışta gösterilen yasal bilgilendirme. Zamanlama, sıklık ve
            hangi sayfalarda çıkacağı buradan yönetilir.
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={welcomePopup.enabled}
              onChange={(e) =>
                setWelcomePopup((s) => ({ ...s, enabled: e.target.checked }))
              }
            />
            Popup aktif
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                Gecikme (ms)
              </span>
              <input
                value={welcomePopup.delayMs}
                onChange={(e) =>
                  setWelcomePopup((s) => ({ ...s, delayMs: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                Sıklık
              </span>
              <select
                value={welcomePopup.frequency}
                onChange={(e) =>
                  setWelcomePopup((s) => ({
                    ...s,
                    frequency: e.target.value as WelcomePopupFields['frequency'],
                  }))
                }
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              >
                <option value="once">Bir kez (localStorage)</option>
                <option value="session">Oturum başına</option>
                <option value="always">Her ziyarette</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                Storage key
              </span>
              <input
                value={welcomePopup.storageKey}
                onChange={(e) =>
                  setWelcomePopup((s) => ({
                    ...s,
                    storageKey: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Gösterilecek yollar (virgülle, boş = tümü; örn. /)
            </span>
            <input
              value={welcomePopup.showOnPaths}
              onChange={(e) =>
                setWelcomePopup((s) => ({
                  ...s,
                  showOnPaths: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Hariç tutulan yollar (virgülle)
            </span>
            <input
              value={welcomePopup.excludePaths}
              onChange={(e) =>
                setWelcomePopup((s) => ({
                  ...s,
                  excludePaths: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
            />
          </label>
          {(
            [
              ['distributorName', 'Distribütör adı'],
              ['headline', 'Üst başlık'],
              ['leftTitle', 'Sol başlık'],
              ['leftBody', 'Sol metin'],
              ['leftLinkLabel', 'Sol link yazısı'],
              ['leftLinkUrl', 'Sol link URL'],
              ['rightTitle', 'Sağ başlık'],
              ['rightBody', 'Sağ metin'],
              ['rightLinkLabel', 'Sağ link yazısı'],
              ['rightLinkUrl', 'Sağ link URL'],
              ['closeLabel', 'Kapat etiketi'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                {label}
              </span>
              {key.endsWith('Body') || key === 'headline' || key === 'rightTitle' ? (
                <textarea
                  value={welcomePopup[key]}
                  onChange={(e) =>
                    setWelcomePopup((s) => ({ ...s, [key]: e.target.value }))
                  }
                  rows={key.endsWith('Body') ? 4 : 2}
                  className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
                />
              ) : (
                <input
                  value={welcomePopup[key]}
                  onChange={(e) =>
                    setWelcomePopup((s) => ({ ...s, [key]: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
                />
              )}
            </label>
          ))}
        </fieldset>
        ) : null}

        {settingsSection === 'whatsapp' ? (
        <fieldset className="space-y-4 rounded-xl border border-border-muted bg-surface p-5 shadow-sm lg:col-span-2">
          <legend className="mono px-2 text-xs uppercase text-muted">
            WhatsApp sohbet ({LOCALE_LABELS[formLocale]})
          </legend>
          {isTr ? (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={whatsapp.enabled}
                  onChange={(e) =>
                    setWhatsapp((s) => ({ ...s, enabled: e.target.checked }))
                  }
                  className="accent-accent"
                />
                Sitede WhatsApp sohbetini göster
              </label>
              <label className="block text-sm">
                <span className="mono text-[10px] uppercase text-muted">
                  WhatsApp numarası (opsiyonel)
                </span>
                <input
                  value={whatsapp.phone}
                  onChange={(e) =>
                    setWhatsapp((s) => ({ ...s, phone: e.target.value }))
                  }
                  placeholder={contact.phone || '+90 5xx xxx xx xx'}
                  className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
                />
              </label>
            </>
          ) : (
            <p className="text-xs text-muted">
              Numara ve açık/kapalı ayarı ortaktır — yalnızca karşılama ve hazır
              mesajları bu dilde düzenleyin.
            </p>
          )}
          <div className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Panel karşılama metni
            </span>
            <div className="mt-1">
              <RichTextEditor
                value={whatsappView.greeting}
                onChange={(html) => patchWhatsappLocal({ greeting: html })}
                placeholder="WhatsApp panel karşılama…"
                minHeight="100px"
              />
            </div>
          </div>
          <WhatsAppPresetEditor
            presets={whatsappView.presets}
            onChange={(presets) => patchWhatsappLocal({ presets })}
          />
        </fieldset>
        ) : null}

        {settingsSection === 'teknik' ? (
        <>
        <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
          <legend className="mono px-2 text-xs uppercase text-muted">
            Kargo varsayılanları
          </legend>
          <p className="text-xs text-muted">Tüm dillerde ortaktır.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                Varsayılan kargo ücreti (TRY)
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={shipping.defaultFee}
                onChange={(e) =>
                  setShipping((s) => ({ ...s, defaultFee: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                Ücretsiz kargo eşiği (TRY)
              </span>
              <input
                type="number"
                min={0}
                step="1"
                value={shipping.freeShippingOver}
                onChange={(e) =>
                  setShipping((s) => ({
                    ...s,
                    freeShippingOver: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm lg:col-span-2">
          <legend className="mono px-2 text-xs uppercase text-muted">
            Analitik & piksel
          </legend>
          <p className="text-xs text-muted">Tüm dillerde ortaktır.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {(
              [
                ['ga4Id', 'Google Analytics 4 (G-…)'],
                ['gtmId', 'Google Tag Manager'],
                ['googleAdsId', 'Google Ads dönüşüm'],
                ['metaPixelId', 'Meta Pixel'],
                ['facebookPixelId', 'Facebook Pixel (Meta ile aynı olabilir)'],
                ['yandexMetrikaId', 'Yandex Metrika'],
                ['tiktokPixelId', 'TikTok Pixel'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm">
                <span className="mono text-[10px] uppercase text-muted">
                  {label}
                </span>
                <input
                  value={analytics[key]}
                  onChange={(e) =>
                    setAnalytics((s) => ({ ...s, [key]: e.target.value }))
                  }
                  placeholder="Boş = env"
                  className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2 mono text-sm"
                />
              </label>
            ))}
          </div>
        </fieldset>
        </>
        ) : null}

        {settingsSection === 'navigasyon' ? (
        <>
        <fieldset className="space-y-6 rounded-xl border border-border-muted bg-surface p-5 shadow-sm lg:col-span-2">
          <legend className="px-2 text-xs font-bold uppercase tracking-wide text-muted">
            Navigasyon ({LOCALE_LABELS[formLocale]})
          </legend>
          <p className="text-xs text-muted">
            Diğer dillerde etiketleri çevirin; bağlantı yolları genelde aynı
            kalır (next-intl pathnames ile lokalize edilir).
          </p>
          <LinkListEditor
            label="Header menü"
            links={navigationView.header}
            onChange={(header) =>
              patchNavigation({ ...navigationView, header })
            }
          />
          <LinkListEditor
            label="Alt bilgi menüsü"
            links={navigationView.footerNav}
            onChange={(footerNav) =>
              patchNavigation({ ...navigationView, footerNav })
            }
          />
          <LinkListEditor
            label="Alt bilgi yasal bağlantılar"
            links={navigationView.footerLegal}
            onChange={(footerLegal) =>
              patchNavigation({ ...navigationView, footerLegal })
            }
          />
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm lg:col-span-2">
          <legend className="mono px-2 text-xs uppercase text-muted">
            Alt bilgi ({LOCALE_LABELS[formLocale]})
          </legend>
          <div className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">Açıklama</span>
            <div className="mt-1">
              <RichTextEditor
                value={footerView.description}
                onChange={(html) => patchFooter({ description: html })}
                placeholder="Alt bilgi açıklaması…"
                minHeight="120px"
              />
            </div>
          </div>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Telif satırı eki
            </span>
            <input
              value={footerView.copyrightSuffix}
              onChange={(e) => patchFooter({ copyrightSuffix: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
            />
          </label>
        </fieldset>
        </>
        ) : null}
      </div>

      <p className="text-xs text-muted">
        Tam UI çeviri ağacı (butonlar, formlar vb.) için{' '}
        <a href="/dil-para-ceviriler" className="text-accent underline">
          Dil / Para / Çeviriler
        </a>{' '}
        sayfasını kullanın.
      </p>

      <button
        type="submit"
        disabled={saving}
        className="admin-btn admin-btn-primary disabled:opacity-50"
      >
        {saving ? 'Kaydediliyor…' : 'Kaydet'}
      </button>
    </form>
  );
}
