'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { MediaUpload } from '@/components/MediaUpload';
import { LinkListEditor } from '@/components/LinkListEditor';
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

const EXTRA_LOCALES = ['en', 'de', 'fr', 'es'] as const;
type ExtraLocale = (typeof EXTRA_LOCALES)[number];

type LocaleCopyFields = {
  brandName: string;
  brandSlogan: string;
  brandTagline: string;
  seoTitle: string;
  seoDescription: string;
  footerDescription: string;
};

function emptyLocaleCopy(): LocaleCopyFields {
  return {
    brandName: '',
    brandSlogan: '',
    brandTagline: '',
    seoTitle: '',
    seoDescription: '',
    footerDescription: '',
  };
}

function initialLocaleCopies(): Record<ExtraLocale, LocaleCopyFields> {
  return {
    en: emptyLocaleCopy(),
    de: emptyLocaleCopy(),
    fr: emptyLocaleCopy(),
    es: emptyLocaleCopy(),
  };
}

function readLocaleCopiesFromSettings(
  map: Record<string, Record<string, unknown>>,
): Record<ExtraLocale, LocaleCopyFields> {
  const out = initialLocaleCopies();
  for (const loc of EXTRA_LOCALES) {
    const brand = map.brand?.translations as
      | Record<string, Record<string, unknown>>
      | undefined;
    const seo = map.seo?.translations as
      | Record<string, Record<string, unknown>>
      | undefined;
    const footer = map.footer?.translations as
      | Record<string, Record<string, unknown>>
      | undefined;
    const b = brand?.[loc];
    const s = seo?.[loc];
    const f = footer?.[loc];
    out[loc] = {
      brandName: String(b?.name || ''),
      brandSlogan: String(b?.slogan || ''),
      brandTagline: String(b?.tagline || ''),
      seoTitle: String(s?.title || ''),
      seoDescription: String(s?.description || ''),
      footerDescription: String(f?.description || ''),
    };
  }
  return out;
}

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

export default function SiteSettingsPage() {
  const [brand, setBrand] = useState({
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
  const [contact, setContact] = useState({
    address: '',
    email: '',
    phone: '',
    hours: '',
    locationLabel: '',
    latitude: '',
    longitude: '',
  });
  const [seo, setSeo] = useState({
    title: '',
    description: '',
    keywords: '',
    ogImage: '',
  });
  const [social, setSocial] = useState<Social>({
    instagram: '',
    facebook: '',
    googleMaps: '',
    googleReviewUrl: 'https://g.page/r/CdfE3W3I-W53EAI/review',
  });
  const [whatsapp, setWhatsapp] = useState<WhatsAppSettings>(() =>
    asWhatsApp(null),
  );
  const [footer, setFooter] = useState({
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
  const [copyLocale, setCopyLocale] = useState<ExtraLocale>('en');
  const [localeCopies, setLocaleCopies] =
    useState<Record<ExtraLocale, LocaleCopyFields>>(initialLocaleCopies);
  const [storedTranslations, setStoredTranslations] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const rows = await api<SettingRow[]>('/cms/admin/settings');
        const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
        if (map.brand) setBrand((s) => ({ ...s, ...(map.brand as typeof s) }));
        if (map.contact)
          setContact((s) => ({ ...s, ...(map.contact as typeof s) }));
        if (map.seo) {
          const s = map.seo as {
            title?: string;
            description?: string;
            keywords?: string[];
            ogImage?: string;
          };
          setSeo({
            title: String(s.title || ''),
            description: String(s.description || ''),
            keywords: Array.isArray(s.keywords) ? s.keywords.join(', ') : '',
            ogImage: String(s.ogImage || ''),
          });
        }
        if (map.social)
          setSocial((s) => ({ ...s, ...(map.social as typeof s) }));
        setWhatsapp(asWhatsApp(map.whatsapp));
        if (map.footer)
          setFooter((s) => ({ ...s, ...(map.footer as typeof s) }));
        if (map.navigation) {
          const nav = map.navigation as Record<string, unknown>;
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
        setLocaleCopies(readLocaleCopiesFromSettings(map));
        setStoredTranslations({
          brand: (map.brand?.translations as Record<string, unknown>) || {},
          seo: (map.seo?.translations as Record<string, unknown>) || {},
          footer: (map.footer?.translations as Record<string, unknown>) || {},
        });
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
      const cleanedPresets = whatsapp.presets
        .map((p) => ({
          label: p.label.trim(),
          message: p.message.trim(),
        }))
        .filter((p) => p.label && p.message);

      const brandTranslations = { ...storedTranslations.brand };
      const seoTranslations = { ...storedTranslations.seo };
      const footerTranslations = { ...storedTranslations.footer };
      for (const loc of EXTRA_LOCALES) {
        const copy = localeCopies[loc];
        brandTranslations[loc] = {
          ...(brandTranslations[loc] as object),
          name: copy.brandName.trim() || brand.name,
          slogan: copy.brandSlogan.trim(),
          tagline: copy.brandTagline.trim(),
        };
        seoTranslations[loc] = {
          ...(seoTranslations[loc] as object),
          title: copy.seoTitle.trim(),
          description: copy.seoDescription.trim(),
        };
        footerTranslations[loc] = {
          ...(footerTranslations[loc] as object),
          description: copy.footerDescription.trim(),
        };
      }

      await api('/cms/admin/settings', {
        method: 'PATCH',
        body: {
          settings: [
            {
              key: 'brand',
              value: { ...brand, translations: brandTranslations },
              group: 'brand',
            },
            { key: 'contact', value: contact, group: 'contact' },
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
              },
              group: 'whatsapp',
            },
            {
              key: 'footer',
              value: { ...footer, translations: footerTranslations },
              group: 'footer',
            },
            { key: 'navigation', value: navigation, group: 'navigation' },
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
          Marka, iletişim, SEO, sosyal, WhatsApp ve navigasyon bilgileri
          frontend&apos;de dinamik kullanılır.
        </p>
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
      <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
        <legend className="px-2 text-xs font-bold uppercase tracking-wide text-muted">
          Marka
        </legend>
        <p className="text-xs text-muted">
          Marka adı, logo ve distribütör bilgileri sonradan kolayca
          değiştirilebilir. Domain yalnızca sunucu env ile ayarlanır.
        </p>
        {(
          [
            ['name', 'Marka adı'],
            ['slogan', 'Slogan'],
            ['tagline', 'Tagline'],
            ['established', 'Kuruluş etiketi'],
            ['location', 'Konum'],
            ['distributorName', 'Distribütör adı'],
            ['distributorTitle', 'Distribütör ünvanı'],
            ['distributorCode', 'Herbalife ID / distribütör kodu'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">{label}</span>
            <input
              value={brand[key]}
              onChange={(e) => setBrand((s) => ({ ...s, [key]: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
            />
          </label>
        ))}
        <label className="block text-sm">
          <span className="mono text-[10px] uppercase text-muted">
            Yasal uyarı (disclaimer)
          </span>
          <textarea
            rows={3}
            value={brand.legalDisclaimer}
            onChange={(e) =>
              setBrand((s) => ({ ...s, legalDisclaimer: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
          />
        </label>
        <div>
          <span className="mono text-[10px] uppercase text-muted">Logo</span>
          <MediaUpload
            value={brand.logoUrl}
            onChange={(url) => setBrand((s) => ({ ...s, logoUrl: url }))}
            folder="brand"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
        <legend className="mono px-2 text-xs uppercase text-muted">SEO</legend>
        <label className="block text-sm">
          <span className="mono text-[10px] uppercase text-muted">
            Sayfa başlığı
          </span>
          <input
            value={seo.title}
            onChange={(e) => setSeo((s) => ({ ...s, title: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mono text-[10px] uppercase text-muted">
            Meta açıklama
          </span>
          <textarea
            rows={3}
            value={seo.description}
            onChange={(e) =>
              setSeo((s) => ({ ...s, description: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mono text-[10px] uppercase text-muted">
            Anahtar kelimeler (virgülle)
          </span>
          <input
            value={seo.keywords}
            onChange={(e) => setSeo((s) => ({ ...s, keywords: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
          />
        </label>
        <MediaUpload
          label="OG görseli (boşsa marka opengraph-image kullanılır)"
          value={seo.ogImage}
          onChange={(url) => setSeo((s) => ({ ...s, ogImage: url }))}
          folder="seo"
        />
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
        <legend className="mono px-2 text-xs uppercase text-muted">
          İletişim
        </legend>
        {(
          [
            ['address', 'Adres'],
            ['email', 'E-posta'],
            ['phone', 'Telefon (görünen / tel: link)'],
            ['hours', 'Çalışma saatleri'],
            ['locationLabel', 'Konum etiketi'],
            ['latitude', 'Enlem (geo)'],
            ['longitude', 'Boylam (geo)'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">{label}</span>
            <input
              value={contact[key]}
              onChange={(e) =>
                setContact((s) => ({ ...s, [key]: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
            />
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
        <legend className="mono px-2 text-xs uppercase text-muted">
          Sosyal / sameAs
        </legend>
        <p className="text-xs text-muted">
          Dolu URL&apos;ler schema.org sameAs ve footer&apos;da görünür. Maps
          profil bağlantısı (işletme hazır olunca) yerel arama için önemlidir. Google
          yorum URL&apos;si /yorum sayfası ve QR için kullanılır.
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
            <span className="mono text-[10px] uppercase text-muted">{label}</span>
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

      <fieldset className="space-y-4 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
        <legend className="mono px-2 text-xs uppercase text-muted">
          WhatsApp sohbet
        </legend>
        <p className="text-xs text-muted">
          Numara boş bırakılırsa yukarıdaki iletişim telefonu kullanılır.
          Kurumsal WhatsApp hattı farklıysa yalnızca buraya yazın.
        </p>
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
        <label className="block text-sm">
          <span className="mono text-[10px] uppercase text-muted">
            Panel karşılama metni
          </span>
          <textarea
            rows={2}
            value={whatsapp.greeting}
            onChange={(e) =>
              setWhatsapp((s) => ({ ...s, greeting: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
          />
        </label>
        <WhatsAppPresetEditor
          presets={whatsapp.presets}
          onChange={(presets) => setWhatsapp((s) => ({ ...s, presets }))}
        />
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
        <legend className="mono px-2 text-xs uppercase text-muted">
          Kargo varsayılanları
        </legend>
        <p className="text-xs text-muted">
          Sipariş hesaplamasında kullanılır. Sağlayıcı kartındaki ücret boşsa
          varsayılan kargo ücreti uygulanır. Ücretsiz kargo eşiği 0 ise kapalıdır.
        </p>
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

      <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
        <legend className="mono px-2 text-xs uppercase text-muted">
          Analitik & piksel
        </legend>
        <p className="text-xs text-muted">
          Boş bırakılan alanlar için sunucu / NEXT_PUBLIC env değerleri kullanılır.
          GTM doluysa gtag doğrudan yüklenmez (GTM içinden yönetin).
        </p>
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
            <span className="mono text-[10px] uppercase text-muted">{label}</span>
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
      </fieldset>

      <fieldset className="space-y-6 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
        <legend className="px-2 text-xs font-bold uppercase tracking-wide text-muted">
          Navigasyon
        </legend>
        <LinkListEditor
          label="Header menü"
          links={navigation.header}
          onChange={(header) => setNavigation((n) => ({ ...n, header }))}
        />
        <LinkListEditor
          label="Alt bilgi menüsü"
          links={navigation.footerNav}
          onChange={(footerNav) => setNavigation((n) => ({ ...n, footerNav }))}
        />
        <LinkListEditor
          label="Alt bilgi yasal bağlantılar"
          links={navigation.footerLegal}
          onChange={(footerLegal) =>
            setNavigation((n) => ({ ...n, footerLegal }))
          }
        />
      </fieldset>
      </div>

      <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
        <legend className="mono px-2 text-xs uppercase text-muted">
          Alt bilgi
        </legend>
        <label className="block text-sm">
          <span className="mono text-[10px] uppercase text-muted">Açıklama</span>
          <textarea
            rows={3}
            value={footer.description}
            onChange={(e) =>
              setFooter((s) => ({ ...s, description: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mono text-[10px] uppercase text-muted">
            Telif satırı eki
          </span>
          <input
            value={footer.copyrightSuffix}
            onChange={(e) =>
              setFooter((s) => ({ ...s, copyrightSuffix: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
          />
        </label>
      </fieldset>

      <fieldset className="col-span-full space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
        <legend className="mono px-2 text-xs uppercase text-muted">
          Çeviriler (EN / DE / FR / ES)
        </legend>
        <p className="text-xs text-muted">
          Türkçe alanlar yukarıdaki formlarda kalır. Diğer diller için marka,
          SEO ve footer metinlerini buradan düzenleyin. Aktif diller, para
          birimleri ve tam UI çeviri ağacı için{' '}
          <a href="/dil-para-ceviriler" className="text-accent underline">
            Dil / Para / Çeviriler
          </a>{' '}
          sayfasını kullanın.
        </p>
        <div className="flex flex-wrap gap-2">
          {EXTRA_LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setCopyLocale(loc)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase ${
                copyLocale === loc
                  ? 'bg-accent text-white'
                  : 'border border-border-muted bg-surface-high text-muted'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
        {(
          [
            ['brandName', 'Marka adı'],
            ['brandSlogan', 'Slogan'],
            ['brandTagline', 'Tagline'],
            ['seoTitle', 'SEO başlığı'],
            ['seoDescription', 'SEO açıklama'],
            ['footerDescription', 'Footer açıklama'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              {label} ({copyLocale})
            </span>
            {key === 'seoDescription' || key === 'footerDescription' ? (
              <textarea
                rows={3}
                value={localeCopies[copyLocale][key]}
                onChange={(e) =>
                  setLocaleCopies((prev) => ({
                    ...prev,
                    [copyLocale]: {
                      ...prev[copyLocale],
                      [key]: e.target.value,
                    },
                  }))
                }
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              />
            ) : (
              <input
                value={localeCopies[copyLocale][key]}
                onChange={(e) =>
                  setLocaleCopies((prev) => ({
                    ...prev,
                    [copyLocale]: {
                      ...prev[copyLocale],
                      [key]: e.target.value,
                    },
                  }))
                }
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              />
            )}
          </label>
        ))}
      </fieldset>

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
