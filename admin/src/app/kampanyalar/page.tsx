'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { asArray, asPaged } from '@/lib/utils';
import { DataTable } from '@/components/DataTable';
import { Checkbox } from '@/components/Checkbox';
import { AdminListThumb } from '@/components/AdminListThumb';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { GalleryMediaField } from '@/components/GalleryMediaField';
import type { Product } from '@/lib/types';

type ItemRule = { position: number; discountPercent: number };

type RuleMode = 'flat' | 'nth_item' | 'both';

type LocaleKey = 'en' | 'de' | 'fr' | 'es';

type CampaignLocaleFields = { name: string; headline: string; badge: string };

const LOCALE_TABS: { key: LocaleKey; label: string }[] = [
  { key: 'en', label: 'EN' },
  { key: 'de', label: 'DE' },
  { key: 'fr', label: 'FR' },
  { key: 'es', label: 'ES' },
];

const emptyCampaignTranslations = (): Record<
  LocaleKey,
  CampaignLocaleFields
> => ({
  en: { name: '', headline: '', badge: '' },
  de: { name: '', headline: '', badge: '' },
  fr: { name: '', headline: '', badge: '' },
  es: { name: '', headline: '', badge: '' },
});

type Campaign = {
  id: string;
  name: string;
  slug: string;
  discountPercent: string | number;
  itemRules?: ItemRule[];
  ruleMode?: RuleMode;
  badge?: string | null;
  theme?: string | null;
  headline?: string | null;
  imageUrl?: string | null;
  translations?: Record<string, CampaignLocaleFields> | null;
  imagesByLocale?: Partial<Record<LocaleKey, string>>;
  useSharedImage?: boolean;
  productIds: string[];
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
};

type FormState = {
  id?: string;
  name: string;
  slug: string;
  discountPercent: string;
  itemRules: ItemRule[];
  ruleMode: RuleMode;
  badge: string;
  theme: string;
  headline: string;
  imageUrl: string;
  useSharedImage: boolean;
  imagesByLocale: Record<LocaleKey, string>;
  translationTab: LocaleKey;
  translations: Record<LocaleKey, CampaignLocaleFields>;
  productIds: string[];
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

const THEMES = [
  { value: 'default', label: 'Varsayılan (yeşil)' },
  { value: 'singles-day', label: '11.11 / Singles Day' },
  { value: 'halloween', label: 'Cadılar Bayramı' },
  { value: 'black-friday', label: 'Black Friday' },
  { value: 'valentine', label: 'Sevgililer Günü' },
  { value: 'new-year', label: 'Yılbaşı' },
  { value: 'ramadan', label: 'Ramazan' },
  { value: 'kurban', label: 'Kurban Bayramı' },
] as const;

type Preset = {
  label: string;
  name: string;
  slug: string;
  discountPercent: string;
  badge: string;
  theme: string;
  headline: string;
  /** Ay-gün (1-indexed month); yıl çalışma zamanında */
  startMD: [number, number];
  endMD: [number, number];
};

const PRESETS: Preset[] = [
  {
    label: '11.11',
    name: '11.11 Süper İndirim',
    slug: '11-11',
    discountPercent: '20',
    badge: '11.11',
    theme: 'singles-day',
    headline: 'Singles Day — seçili ürünlerde ekstra indirim.',
    startMD: [11, 10],
    endMD: [11, 12],
  },
  {
    label: 'Cadılar Bayramı',
    name: 'Cadılar Bayramı Fırsatı',
    slug: 'halloween',
    discountPercent: '15',
    badge: 'HALLOWEEN',
    theme: 'halloween',
    headline: 'Cadılar Bayramı özel indirimleri — sınırlı süre.',
    startMD: [10, 25],
    endMD: [11, 1],
  },
  {
    label: 'Black Friday',
    name: 'Black Friday',
    slug: 'black-friday',
    discountPercent: '25',
    badge: 'BLACK FRIDAY',
    theme: 'black-friday',
    headline: 'Yılın en büyük indirimleri — stoklar tükenmeden.',
    startMD: [11, 24],
    endMD: [11, 30],
  },
  {
    label: 'Sevgililer',
    name: 'Sevgililer Günü',
    slug: 'sevgililer-gunu',
    discountPercent: '12',
    badge: '14 ŞUBAT',
    theme: 'valentine',
    headline: 'Sevdikleriniz için setlerde özel fiyat.',
    startMD: [2, 10],
    endMD: [2, 15],
  },
  {
    label: 'Yılbaşı',
    name: 'Yılbaşı Kampanyası',
    slug: 'yilbasi',
    discountPercent: '18',
    badge: 'YILBAŞI',
    theme: 'new-year',
    headline: 'Yeni yıla sağlıklı başlangıç — özel indirimler.',
    startMD: [12, 20],
    endMD: [1, 5],
  },
  {
    label: 'Ramazan',
    name: 'Ramazan Fırsatları',
    slug: 'ramazan',
    discountPercent: '10',
    badge: 'RAMAZAN',
    theme: 'ramadan',
    headline: 'Ramazan ayına özel set ve ürün indirimleri.',
    startMD: [3, 1],
    endMD: [3, 31],
  },
  {
    label: 'Kurban Bayramı',
    name: 'Kurban Bayramı Kampanyası',
    slug: 'kurban-bayrami',
    discountPercent: '15',
    badge: 'KURBAN',
    theme: 'kurban',
    headline: 'Kurban Bayramı’na özel set ve ürün indirimleri.',
    // Hicri takvim kayar — tarihleri kaydetmeden önce kontrol edin
    startMD: [5, 25],
    endMD: [6, 5],
  },
];

const emptyForm = (): FormState => ({
  name: '',
  slug: '',
  discountPercent: '15',
  itemRules: [],
  ruleMode: 'flat',
  badge: '',
  theme: 'default',
  headline: '',
  imageUrl: '',
  useSharedImage: true,
  imagesByLocale: { en: '', de: '', fr: '', es: '' },
  translationTab: 'en',
  translations: emptyCampaignTranslations(),
  productIds: [],
  startsAt: '',
  endsAt: '',
  isActive: true,
});

const RULE_MODES: { value: RuleMode; label: string }[] = [
  { value: 'flat', label: 'Sabit % (tüm ürünler)' },
  { value: 'nth_item', label: 'Sadece sıra kuralları (N. ürün %)' },
  { value: 'both', label: 'Sabit % + sıra kuralları' },
];

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function rangeForPreset(p: Preset): { startsAt: string; endsAt: string } {
  const now = new Date();
  const year = now.getFullYear();
  const pad = (n: number) => String(n).padStart(2, '0');
  const [sm, sd] = p.startMD;
  const [em, ed] = p.endMD;
  let startYear = year;
  let endYear = year;
  if (em < sm || (em === sm && ed < sd)) {
    if (now.getMonth() + 1 <= em) {
      startYear = year - 1;
    } else {
      endYear = year + 1;
    }
  }
  return {
    startsAt: `${startYear}-${pad(sm)}-${pad(sd)}T00:00`,
    endsAt: `${endYear}-${pad(em)}-${pad(ed)}T23:59`,
  };
}

export default function CampaignsPage() {
  const [rows, setRows] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productQuery, setProductQuery] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [campaignData, productsData] = await Promise.all([
        api<unknown>('/campaigns/admin/all'),
        api<unknown>(
          '/products/admin/all?limit=100&includeInactive=true&sort=name&order=asc',
        ),
      ]);
      setRows(asArray<Campaign>(campaignData));
      setProducts(asPaged<Product>(productsData, 100).items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kampanyalar yüklenemedi');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLocaleLowerCase('tr');
    if (!q) return products;
    return products.filter((p) => {
      const hay = `${p.name} ${p.slug} ${p.badge || ''}`.toLocaleLowerCase(
        'tr',
      );
      return hay.includes(q);
    });
  }, [products, productQuery]);

  const selectedProducts = useMemo(
    () =>
      form.productIds
        .map((id) => productById.get(id))
        .filter((p): p is Product => Boolean(p)),
    [form.productIds, productById],
  );

  function startCreate() {
    setForm(emptyForm());
    setProductQuery('');
    setEditing(true);
    setMessage(null);
  }

  function applyPreset(p: Preset) {
    const range = rangeForPreset(p);
    setForm({
      ...emptyForm(),
      name: p.name,
      slug: p.slug,
      discountPercent: p.discountPercent,
      badge: p.badge,
      theme: p.theme,
      headline: p.headline,
      startsAt: range.startsAt,
      endsAt: range.endsAt,
      isActive: true,
    });
    setProductQuery('');
    setEditing(true);
    setMessage(
      p.theme === 'kurban'
        ? `Şablon: ${p.label} — hicri takvim kayar, tarihleri mutlaka kontrol edin.`
        : `Şablon: ${p.label} — tarihleri kontrol edip kaydedin.`,
    );
  }

  function startEdit(row: Campaign) {
    setForm({
      id: row.id,
      name: row.name,
      slug: row.slug,
      discountPercent: String(row.discountPercent),
      itemRules: [...(row.itemRules || [])].sort(
        (a, b) => a.position - b.position,
      ),
      ruleMode: row.ruleMode || 'flat',
      badge: row.badge || '',
      theme: row.theme || 'default',
      headline: row.headline || '',
      imageUrl: row.imageUrl || '',
      useSharedImage: row.useSharedImage !== false,
      imagesByLocale: {
        en: row.imagesByLocale?.en || '',
        de: row.imagesByLocale?.de || '',
        fr: row.imagesByLocale?.fr || '',
        es: row.imagesByLocale?.es || '',
      },
      translationTab: 'en',
      translations: (() => {
        const tr = emptyCampaignTranslations();
        for (const { key } of LOCALE_TABS) {
          const t = row.translations?.[key];
          tr[key] = {
            name: t?.name || '',
            headline: t?.headline || '',
            badge: t?.badge || '',
          };
        }
        return tr;
      })(),
      productIds: [...(row.productIds || [])],
      startsAt: toLocalInput(row.startsAt),
      endsAt: toLocalInput(row.endsAt),
      isActive: row.isActive,
    });
    setProductQuery('');
    setEditing(true);
    setMessage(null);
  }

  function toggleProduct(id: string) {
    setForm((f) => {
      const has = f.productIds.includes(id);
      return {
        ...f,
        productIds: has
          ? f.productIds.filter((x) => x !== id)
          : [...f.productIds, id],
      };
    });
  }

  function selectAllFiltered() {
    setForm((f) => {
      const next = new Set(f.productIds);
      for (const p of filteredProducts) next.add(p.id);
      return { ...f, productIds: [...next] };
    });
  }

  function clearProducts() {
    setForm((f) => ({ ...f, productIds: [] }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      for (const { key, label } of LOCALE_TABS) {
        const row = form.translations[key];
        if (!row.name.trim() || !row.headline.trim()) {
          setError(`${label}: kampanya adı ve vitrin metni zorunludur.`);
          setSaving(false);
          return;
        }
      }
      if (!form.useSharedImage) {
        for (const { key, label } of LOCALE_TABS) {
          if (!form.imagesByLocale[key]?.trim()) {
            setError(`${label} banner görseli zorunludur.`);
            setSaving(false);
            return;
          }
        }
        if (!form.imageUrl.trim()) {
          setError('TR banner görseli zorunludur.');
          setSaving(false);
          return;
        }
      }

      const translations: Record<string, CampaignLocaleFields> = {};
      for (const { key } of LOCALE_TABS) {
        const row = form.translations[key];
        translations[key] = {
          name: row.name.trim(),
          headline: row.headline.trim(),
          badge: row.badge.trim(),
        };
      }

      const body = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        discountPercent: Number(form.discountPercent),
        itemRules: form.itemRules
          .map((r) => ({
            position: Number(r.position),
            discountPercent: Number(r.discountPercent),
          }))
          .filter(
            (r) =>
              r.position >= 1 &&
              Number.isFinite(r.discountPercent) &&
              r.discountPercent >= 0,
          ),
        ruleMode: form.ruleMode,
        badge: form.badge.trim() || undefined,
        theme: form.theme || 'default',
        headline: form.headline.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        translations,
        useSharedImage: form.useSharedImage,
        imagesByLocale: form.useSharedImage
          ? {}
          : {
              en: form.imagesByLocale.en.trim(),
              de: form.imagesByLocale.de.trim(),
              fr: form.imagesByLocale.fr.trim(),
              es: form.imagesByLocale.es.trim(),
            },
        productIds: form.productIds,
        startsAt: form.startsAt
          ? new Date(form.startsAt).toISOString()
          : undefined,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        isActive: form.isActive,
      };
      if (form.id) {
        await api(`/campaigns/${form.id}`, { method: 'PATCH', body });
        setMessage('Kampanya güncellendi');
      } else {
        await api('/campaigns', { method: 'POST', body });
        setMessage('Kampanya oluşturuldu');
      }
      setEditing(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await api(`/campaigns/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      setMessage('Kampanya silindi');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase text-muted">Pazarlama</p>
          <h2 className="text-xl font-semibold">
            Özel gün &amp; flash kampanyalar
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            11.11, Kurban Bayramı, Cadılar Bayramı vb. Tarih + indirim %; ürün
            seçmezseniz tüm kataloga uygulanır.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover"
        >
          Yeni kampanya
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs font-semibold uppercase tracking-wide text-muted">
          Hızlı şablon:
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => applyPreset(p)}
            className="rounded-full border border-border-muted bg-surface px-3 py-1.5 text-xs font-semibold hover:border-accent hover:text-accent"
          >
            {p.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="border border-danger/40 bg-surface px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="border border-success/40 bg-surface px-3 py-2 text-sm text-success">
          {message}
        </p>
      ) : null}

      {editing ? (
        <form
          onSubmit={onSubmit}
          className="space-y-3 border border-border-muted bg-surface p-4"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              Ad
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Kısa ad / slug (opsiyonel)
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Temel indirim %
              <input
                required
                type="number"
                min={1}
                max={90}
                value={form.discountPercent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discountPercent: e.target.value }))
                }
                className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              />
            </label>
            <label className="text-sm">
              İndirim modu
              <select
                value={form.ruleMode}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ruleMode: e.target.value as RuleMode,
                  }))
                }
                className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              >
                {RULE_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="md:col-span-2 space-y-2 rounded border border-dashed border-border-muted p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  Sepet sırası indirimleri (1. ürün, 2. ürün…)
                </p>
                <button
                  type="button"
                  className="text-xs font-semibold text-accent hover:underline"
                  onClick={() =>
                    setForm((f) => {
                      const nextPos =
                        f.itemRules.reduce(
                          (m, r) => Math.max(m, r.position),
                          0,
                        ) + 1;
                      return {
                        ...f,
                        itemRules: [
                          ...f.itemRules,
                          { position: nextPos, discountPercent: 10 },
                        ],
                      };
                    })
                  }
                >
                  + Kural ekle
                </button>
              </div>
              <p className="text-xs text-muted">
                Sepetteki her adet ayrı sıra sayılır (1 tabanlı). Mod
                &quot;sadece sıra&quot; ise yalnız buradaki yüzdeler uygulanır;
                &quot;both&quot; modunda temel % ile toplanır (max 90).
              </p>
              {form.itemRules.length === 0 ? (
                <p className="text-xs text-muted">Henüz sıra kuralı yok.</p>
              ) : (
                <ul className="space-y-2">
                  {form.itemRules.map((rule, idx) => (
                      <li
                        key={`rule-${idx}`}
                        className="flex flex-wrap items-end gap-2"
                      >
                        <label className="text-xs">
                          {rule.position}. ürün %
                          <input
                            type="number"
                            min={1}
                            max={999}
                            value={rule.position}
                            onChange={(e) =>
                              setForm((f) => {
                                const next = [...f.itemRules];
                                next[idx] = {
                                  ...next[idx],
                                  position: Number(e.target.value),
                                };
                                return { ...f, itemRules: next };
                              })
                            }
                            className="mt-1 w-20 border border-border-muted bg-background px-2 py-1"
                          />
                        </label>
                        <label className="text-xs">
                          İndirim
                          <input
                            type="number"
                            min={0}
                            max={90}
                            value={rule.discountPercent}
                            onChange={(e) =>
                              setForm((f) => {
                                const next = [...f.itemRules];
                                next[idx] = {
                                  ...next[idx],
                                  discountPercent: Number(e.target.value),
                                };
                                return { ...f, itemRules: next };
                              })
                            }
                            className="mt-1 w-20 border border-border-muted bg-background px-2 py-1"
                          />
                        </label>
                        <button
                          type="button"
                          className="mb-0.5 text-xs text-danger hover:underline"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              itemRules: f.itemRules.filter(
                                (_, i) => i !== idx,
                              ),
                            }))
                          }
                        >
                          Kaldır
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <label className="text-sm">
              Rozet (vitrin)
              <input
                value={form.badge}
                onChange={(e) =>
                  setForm((f) => ({ ...f, badge: e.target.value }))
                }
                placeholder="11.11, KURBAN…"
                className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Tema
              <select
                value={form.theme}
                onChange={(e) =>
                  setForm((f) => ({ ...f, theme: e.target.value }))
                }
                className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              >
                {THEMES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm md:col-span-2">
              Vitrin metni
              <input
                value={form.headline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, headline: e.target.value }))
                }
                placeholder="Kısa açıklama — ana sayfa countdown’da görünür"
                className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              />
            </label>
            <div className="md:col-span-2 space-y-1">
              <GalleryMediaField
                label="Kampanya görseli (flash banner)"
                folder="campaigns"
                urls={form.imageUrl ? [form.imageUrl] : []}
                onChange={(urls) =>
                  setForm((f) => ({ ...f, imageUrl: urls[0] || '' }))
                }
              />
              <p className="text-[11px] text-muted">
                Ana sayfa flash şeridinde görünür; tek görsel yeterli.
              </p>
              <Checkbox
                label="Tüm dillerde ortak görsel"
                checked={form.useSharedImage}
                onChange={(useSharedImage) =>
                  setForm((f) => ({ ...f, useSharedImage }))
                }
              />
              {!form.useSharedImage ? (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {LOCALE_TABS.map(({ key, label }) => (
                    <label key={key} className="block text-sm">
                      <span className="text-xs text-muted">Banner ({label})</span>
                      <input
                        value={form.imagesByLocale[key]}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            imagesByLocale: {
                              ...f.imagesByLocale,
                              [key]: e.target.value,
                            },
                          }))
                        }
                        className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
                      />
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="md:col-span-2 space-y-3 rounded border border-border-muted p-3">
              <p className="mono text-[10px] uppercase text-muted">
                Çeviriler (TR ana alanlarda) — EN/DE/FR/ES zorunlu
              </p>
              <div className="flex flex-wrap gap-2">
                {LOCALE_TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, translationTab: key }))
                    }
                    className={`border px-3 py-1 text-xs uppercase ${
                      form.translationTab === key
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-muted'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {(() => {
                const tab = form.translationTab;
                const row = form.translations[tab];
                return (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="text-xs text-muted">Ad ({tab})</span>
                      <input
                        value={row.name}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            translations: {
                              ...f.translations,
                              [tab]: { ...f.translations[tab], name: e.target.value },
                            },
                          }))
                        }
                        className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
                      />
                    </label>
                    <label className="block text-sm sm:col-span-2">
                      <span className="text-xs text-muted">Vitrin metni ({tab})</span>
                      <input
                        value={row.headline}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            translations: {
                              ...f.translations,
                              [tab]: {
                                ...f.translations[tab],
                                headline: e.target.value,
                              },
                            },
                          }))
                        }
                        className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="text-xs text-muted">Rozet ({tab})</span>
                      <input
                        value={row.badge}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            translations: {
                              ...f.translations,
                              [tab]: {
                                ...f.translations[tab],
                                badge: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="TR rozet boş bırakılırsa kullanılır"
                        className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
                      />
                    </label>
                  </div>
                );
              })()}
            </div>
            <label className="text-sm">
              Başlangıç
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startsAt: e.target.value }))
                }
                className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Bitiş
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endsAt: e.target.value }))
                }
                className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              />
            </label>
          </div>

          {/* Ürün çoklu seçim */}
          <div className="border border-border-muted bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">Ürün kapsamı</p>
                <p className="text-xs text-muted">
                  Seçim yoksa tüm ürünlere uygulanır. Çoklu seçim + arama.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="border border-border-muted px-2.5 py-1 text-xs hover:border-accent"
                >
                  Filtrelenenleri seç
                </button>
                <button
                  type="button"
                  onClick={clearProducts}
                  className="border border-border-muted px-2.5 py-1 text-xs hover:border-danger hover:text-danger"
                >
                  Seçimi temizle
                </button>
              </div>
            </div>

            {selectedProducts.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent"
                    title="Kaldır"
                  >
                    {p.name}
                    <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs font-medium text-muted">
                Seçili ürün yok → tüm katalog
              </p>
            )}

            <input
              type="search"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Ürün ara (ad, slug…)"
              className="mt-3 w-full border border-border-muted bg-surface px-3 py-2 text-sm"
            />

            <div className="mt-2 max-h-56 overflow-auto border border-border-muted">
              {filteredProducts.length === 0 ? (
                <p className="p-3 text-xs text-muted">Ürün bulunamadı</p>
              ) : (
                <ul className="divide-y divide-border-muted">
                  {filteredProducts.map((p) => {
                    const checked = form.productIds.includes(p.id);
                    return (
                      <li key={p.id}>
                        <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-surface">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProduct(p.id)}
                            className="accent-accent"
                          />
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {p.name}
                          </span>
                          <span className="shrink-0 mono text-[10px] text-muted">
                            {p.slug}
                          </span>
                          <span className="shrink-0 text-xs text-muted">
                            {p.basePrice} ₺
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <p className="mt-2 text-[11px] text-muted">
              {form.productIds.length} seçili · {filteredProducts.length}{' '}
              listelenen · {products.length} toplam
            </p>
          </div>

          <Checkbox
            checked={form.isActive}
            onChange={(isActive) => setForm((f) => ({ ...f, isActive }))}
            label="Aktif"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-accent px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="border border-border-muted px-4 py-2 text-sm"
            >
              İptal
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <p className="mono text-sm text-muted">Yükleniyor…</p>
      ) : (
        <DataTable
          rowKey={(r) => r.id}
          columns={[
            {
              key: 'thumb',
              header: '',
              render: (r) => (
                <AdminListThumb src={r.imageUrl} alt={r.name} size={48} />
              ),
            },
            {
              key: 'name',
              header: 'Ad',
              render: (r) => (
                <div>
                  <p className="font-medium">{r.name}</p>
                  {r.badge ? (
                    <p className="mt-0.5 text-[11px] text-muted">{r.badge}</p>
                  ) : null}
                </div>
              ),
            },
            {
              key: 'discount',
              header: '%',
              render: (r) => `${r.discountPercent}%`,
            },
            {
              key: 'theme',
              header: 'Tema',
              render: (r) => r.theme || 'default',
            },
            {
              key: 'scope',
              header: 'Kapsam',
              render: (r) =>
                r.productIds?.length
                  ? `${r.productIds.length} ürün`
                  : 'Tüm ürünler',
            },
            {
              key: 'window',
              header: 'Tarih',
              render: (r) => {
                const a = r.startsAt
                  ? new Date(r.startsAt).toLocaleDateString('tr-TR')
                  : '—';
                const b = r.endsAt
                  ? new Date(r.endsAt).toLocaleDateString('tr-TR')
                  : '—';
                return (
                  <span className="text-xs text-muted">
                    {a} → {b}
                  </span>
                );
              },
            },
            {
              key: 'active',
              header: 'Durum',
              render: (r) => (r.isActive ? 'Aktif' : 'Kapalı'),
            },
            {
              key: 'actions',
              header: '',
              render: (r) => (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(r)}
                    className="text-sm text-accent hover:underline"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(r.id)}
                    className="text-sm text-danger hover:underline"
                  >
                    Sil
                  </button>
                </div>
              ),
            },
          ]}
          rows={rows}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Kampanyayı sil?"
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
