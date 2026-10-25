'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { asArray, asPaged, formatMoney, slugify } from '@/lib/utils';
import { DataTable } from '@/components/DataTable';
import { MediaUpload } from '@/components/MediaUpload';
import { GalleryMediaField } from '@/components/GalleryMediaField';
import { Checkbox } from '@/components/Checkbox';
import { AdminListThumb } from '@/components/AdminListThumb';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { RichTextEditor } from '@/components/RichTextEditor';
import { AdminFormPanel } from '@/components/AdminFormPanel';
import type { Category, Product, ProductVariant } from '@/lib/types';

type LocaleKey = 'en' | 'de' | 'fr' | 'es';

type LocaleFields = {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
};

type VariantForm = {
  id?: string;
  sku: string;
  weightLabel: string;
  categoryKey: string;
  categoryLabel: string;
  price: string;
  stock: string;
  isActive: boolean;
};

const LOCALE_TABS: { key: LocaleKey; label: string }[] = [
  { key: 'en', label: 'EN' },
  { key: 'de', label: 'DE' },
  { key: 'fr', label: 'FR' },
  { key: 'es', label: 'ES' },
];

const emptyLocaleFields = (): LocaleFields => ({
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
});

const emptyTranslations = (): Record<LocaleKey, LocaleFields> => ({
  en: emptyLocaleFields(),
  de: emptyLocaleFields(),
  fr: emptyLocaleFields(),
  es: emptyLocaleFields(),
});

type FormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  seoTitle: string;
  seoDescription: string;
  basePrice: string;
  priceUsd: string;
  priceEur: string;
  priceGbp: string;
  priceTaxIncluded: boolean;
  translationTab: LocaleKey;
  translations: Record<LocaleKey, LocaleFields>;
  stock: string;
  originCountry: string;
  originRegion: string;
  altitude: string;
  process: string;
  varietal: string;
  batchId: string;
  badge: string;
  flavorNotes: string;
  imageUrl: string;
  useSharedImage: boolean;
  imagesByLocale: Record<LocaleKey, string>;
  gallery: string;
  categoryId: string;
  hepsiburadaCategoryId: string;
  hepsiburadaAttributesJson: string;
  isActive: boolean;
  isFeatured: boolean;
  kind: string;
  unit: string;
  vatRate: string;
  brewMethod: string;
  brewRatio: string;
  brewNotes: string;
  storageNotes: string;
  variants: VariantForm[];
};

const emptyVariant = (_kind = 'other'): VariantForm => ({
  sku: '',
  weightLabel: '250g',
  categoryKey: '',
  categoryLabel: '',
  price: '',
  stock: '0',
  isActive: true,
});

/** Kategori slug → tür */
const CATEGORY_KIND_BY_SLUG: Record<string, { kind: string }> = {
  'kilo-kontrolu': { kind: 'supplement' },
  icecekler: { kind: 'beverage' },
  'avantajli-setler': { kind: 'supplement' },
  'takviye-edici': { kind: 'supplement' },
  'sporcu-urunleri': { kind: 'supplement' },
  atistirmalik: { kind: 'other' },
  'kisisel-bakim': { kind: 'other' },
  'tanitim-urunleri': { kind: 'other' },
};

const emptyForm = (): FormState => ({
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  seoTitle: '',
  seoDescription: '',
  basePrice: '',
  priceUsd: '',
  priceEur: '',
  priceGbp: '',
  priceTaxIncluded: true,
  translationTab: 'en',
  translations: emptyTranslations(),
  stock: '0',
  originCountry: '',
  originRegion: '',
  altitude: '',
  process: '',
  varietal: '',
  batchId: '',
  badge: '',
  flavorNotes: '',
  imageUrl: '',
  useSharedImage: true,
  imagesByLocale: { en: '', de: '', fr: '', es: '' },
  gallery: '',
  categoryId: '',
  hepsiburadaCategoryId: '',
  hepsiburadaAttributesJson: '',
  isActive: true,
  isFeatured: false,
  kind: 'supplement',
  unit: 'adet',
  vatRate: '20',
  brewMethod: '',
  brewRatio: '',
  brewNotes: '',
  storageNotes: '',
  variants: [emptyVariant()],
});

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [rows, setRows] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [highlightRowKey, setHighlightRowKey] = useState<string | null>(null);
  const [deleteVariantIndex, setDeleteVariantIndex] = useState<number | null>(
    null,
  );
  const [q, setQ] = useState(initialQ);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  async function load(opts?: { page?: number; q?: string }) {
    const nextPage = opts?.page ?? page;
    const nextQ = opts?.q ?? q;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(limit),
        sort,
        order,
        includeInactive: 'true',
      });
      if (nextQ.trim()) params.set('q', nextQ.trim());
      const [data, cats] = await Promise.all([
        api<unknown>(`/products/admin/all?${params}`),
        api<unknown>('/categories/admin/all').catch(() => []),
      ]);
      const paged = asPaged<Product>(data, limit);
      setRows(paged.items);
      setTotal(paged.total);
      setTotalPages(paged.totalPages);
      setCategories(asArray<Category>(cats));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ürünler yüklenemedi');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setQ(initialQ);
    setPage(1);
    void load({ page: 1, q: initialQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, order]);

  function categoryName(categoryId?: string | null) {
    if (!categoryId) return '—';
    return categories.find((c) => c.id === categoryId)?.name || '—';
  }

  function startCreate() {
    setForm(emptyForm());
    setEditing(true);
  }

  function startEdit(p: Product) {
    const variants: VariantForm[] =
      p.variants && p.variants.length
        ? p.variants.map((v: ProductVariant) => ({
            id: v.id,
            sku: v.sku || '',
            weightLabel: v.weightLabel || '',
            categoryKey: v.categoryKey || '',
            categoryLabel: v.translations?.tr?.categoryLabel || '',
            price: String(v.price ?? ''),
            stock: String(v.stock ?? 0),
            isActive: v.isActive !== false,
          }))
        : [emptyVariant(p.kind || 'other')];
    const tr = emptyTranslations();
    for (const { key } of LOCALE_TABS) {
      const row = p.translations?.[key];
      tr[key] = {
        name: row?.name || '',
        slug: row?.slug || '',
        description: row?.description || '',
        shortDescription: row?.shortDescription || '',
      };
    }
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      shortDescription: p.shortDescription || '',
      seoTitle: p.seoTitle || '',
      seoDescription: p.seoDescription || '',
      basePrice: String(p.prices?.TRY ?? p.basePrice ?? ''),
      priceUsd: p.prices?.USD != null ? String(p.prices.USD) : '',
      priceEur: p.prices?.EUR != null ? String(p.prices.EUR) : '',
      priceGbp: p.prices?.GBP != null ? String(p.prices.GBP) : '',
      priceTaxIncluded: p.priceTaxIncluded !== false,
      translationTab: 'en',
      translations: tr,
      stock: String(p.stock ?? 0),
      originCountry: p.originCountry || '',
      originRegion: p.originRegion || '',
      altitude: p.altitude || '',
      process: p.process || '',
      varietal: p.varietal || '',
      batchId: p.batchId || '',
      badge: p.badge || '',
      flavorNotes: (p.flavorNotes || []).join(', '),
      imageUrl: p.imageUrl || '',
      useSharedImage: p.useSharedImage !== false,
      imagesByLocale: {
        en: p.imagesByLocale?.en || '',
        de: p.imagesByLocale?.de || '',
        fr: p.imagesByLocale?.fr || '',
        es: p.imagesByLocale?.es || '',
      },
      gallery: (p.gallery || []).join('\n'),
      categoryId: p.categoryId || '',
      hepsiburadaCategoryId: p.hepsiburadaCategoryId || '',
      hepsiburadaAttributesJson: p.hepsiburadaAttributes
        ? JSON.stringify(p.hepsiburadaAttributes, null, 2)
        : '',
      isActive: p.isActive,
      isFeatured: Boolean(p.isFeatured),
      kind: p.kind || 'other',
      unit: p.unit || 'adet',
      vatRate: String(p.vatRate ?? '20'),
      brewMethod: p.brewGuide?.method || '',
      brewRatio: p.brewGuide?.ratio || '',
      brewNotes: p.brewGuide?.notes || '',
      storageNotes: p.storageNotes || '',
      variants,
    });
    setEditing(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let hepsiburadaAttributes: Record<
      string,
      string | number | boolean
    > | null = null;
    const hbAttrRaw = form.hepsiburadaAttributesJson.trim();
    if (hbAttrRaw) {
      try {
        const parsed = JSON.parse(hbAttrRaw) as unknown;
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('object bekleniyor');
        }
        hepsiburadaAttributes = parsed as Record<
          string,
          string | number | boolean
        >;
      } catch {
        setError(
          'Hepsiburada özellik alanları geçerli bir JSON nesnesi olmalı (örn. {"00001STC":"250 gr"})',
        );
        setSaving(false);
        return;
      }
    }

    const variants = form.variants
      .filter((v) => v.weightLabel.trim() && String(v.price).trim())
      .map((v, i) => ({
        ...(v.id ? { id: v.id } : {}),
        sku:
          v.sku.trim() ||
          [slugify(form.name) || 'urun', slugify(v.weightLabel) || String(i + 1)]
            .filter(Boolean)
            .join('-')
            .toUpperCase(),
        weightLabel: v.weightLabel.trim(),
        categoryKey: v.categoryKey.trim() || undefined,
        translations: v.categoryLabel.trim()
          ? { tr: { categoryLabel: v.categoryLabel.trim() } }
          : undefined,
        price: String(v.price),
        stock: Number(v.stock) || 0,
        isActive: v.isActive,
      }));
    if (!String(form.basePrice).trim()) {
      setError('TRY fiyatı zorunludur.');
      setSaving(false);
      return;
    }

    const prices: Record<string, number> = {
      TRY: Number(form.basePrice),
    };
    if (form.priceUsd.trim()) prices.USD = Number(form.priceUsd);
    if (form.priceEur.trim()) prices.EUR = Number(form.priceEur);
    if (form.priceGbp.trim()) prices.GBP = Number(form.priceGbp);

    for (const { key, label } of LOCALE_TABS) {
      const row = form.translations[key];
      if (
        !row.name.trim() ||
        !row.description.trim() ||
        !row.slug.trim()
      ) {
        setError(`${label}: ad, slug ve açıklama zorunludur.`);
        setSaving(false);
        return;
      }
    }
    if (!form.useSharedImage) {
      for (const { key, label } of LOCALE_TABS) {
        if (!form.imagesByLocale[key]?.trim()) {
          setError(`${label} görsel URL zorunludur (ortak görsel kapalı).`);
          setSaving(false);
          return;
        }
      }
      if (!form.imageUrl.trim()) {
        setError('TR ana görsel (imageUrl) zorunludur.');
        setSaving(false);
        return;
      }
    }

    const translations: Record<string, LocaleFields> = {};
    for (const { key } of LOCALE_TABS) {
      const row = form.translations[key];
      translations[key] = {
        name: row.name.trim(),
        slug: row.slug.trim() || slugify(row.name),
        description: row.description.trim(),
        shortDescription: row.shortDescription.trim(),
      };
    }

    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      shortDescription: form.shortDescription || null,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      basePrice: String(form.basePrice),
      prices,
      translations,
      priceTaxIncluded: form.priceTaxIncluded,
      stock: Number(form.stock),
      originCountry: form.originCountry || null,
      originRegion: form.originRegion || null,
      altitude: form.altitude || null,
      process: form.process || null,
      varietal: form.varietal || null,
      batchId: form.batchId || null,
      badge: form.badge || null,
      flavorNotes: form.flavorNotes
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean),
      imageUrl: form.imageUrl || null,
      useSharedImage: form.useSharedImage,
      imagesByLocale: form.useSharedImage
        ? {}
        : {
            en: form.imagesByLocale.en.trim(),
            de: form.imagesByLocale.de.trim(),
            fr: form.imagesByLocale.fr.trim(),
            es: form.imagesByLocale.es.trim(),
          },
      gallery: form.gallery
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean),
      categoryId: form.categoryId || null,
      hepsiburadaCategoryId: form.hepsiburadaCategoryId.trim() || null,
      hepsiburadaAttributes,
      kind: form.kind || 'other',
      unit: form.unit || 'adet',
      vatRate: Number(form.vatRate) || 20,
      brewGuide:
        form.brewMethod || form.brewRatio || form.brewNotes
          ? {
              method: form.brewMethod || undefined,
              ratio: form.brewRatio || undefined,
              notes: form.brewNotes || undefined,
            }
          : null,
      storageNotes: form.storageNotes || null,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      variants,
    };
    try {
      let savedId = form.id;
      if (form.id) {
        await api(`/products/${form.id}`, { method: 'PATCH', body: payload });
      } else {
        const created = await api<{ id: string }>('/products', {
          method: 'POST',
          body: payload,
        });
        savedId = created.id;
      }
      setHighlightRowKey(savedId || null);
      setEditing(false);
      setForm(emptyForm());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  }

  async function confirmRemove() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api(`/products/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {loading ? 'Yükleniyor…' : `${total} ürün · sayfa ${page}/${totalPages}`}
        </p>
        <button
          type="button"
          onClick={startCreate}
          className="admin-btn admin-btn-primary"
        >
          Yeni ürün
        </button>
      </div>

      <div className="admin-toolbar">
        <label className="block min-w-48 flex-1 text-sm">
          <span className="mono text-[10px] uppercase text-muted">Ara</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setPage(1);
                void load();
              }
            }}
            placeholder="Ad, kısa ad, parti, köken…"
            className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mono text-[10px] uppercase text-muted">Sıra</span>
          <select
            value={`${sort}:${order}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split(':') as [string, 'asc' | 'desc'];
              setSort(s);
              setOrder(o);
              setPage(1);
            }}
            className="mt-1 border border-border-muted bg-background px-3 py-2"
          >
            <option value="createdAt:desc">En yeni</option>
            <option value="name:asc">Ad A→Z</option>
            <option value="price:asc">Fiyat ↑</option>
            <option value="price:desc">Fiyat ↓</option>
            <option value="stock:desc">Stok</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            setPage(1);
            void load();
          }}
          className="btn-motion border border-border-muted px-4 py-2 text-sm hover:border-accent"
        >
          Filtrele
        </button>
      </div>

      {error ? (
        <p className="border border-danger/40 bg-surface px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <AdminFormPanel
        open={editing}
        onClose={() => {
          setEditing(false);
          setForm(emptyForm());
        }}
        title={form.id ? 'Ürün düzenle' : 'Yeni ürün'}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setForm(emptyForm());
              }}
              className="admin-btn admin-btn-ghost"
            >
              İptal
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={saving}
              className="admin-btn admin-btn-primary disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </>
        }
      >
        <form
          id="product-form"
          onSubmit={onSubmit}
          className="grid gap-3 md:grid-cols-2"
        >
          <h3 className="md:col-span-2 mono text-xs uppercase tracking-widest text-muted">
            {form.id ? 'Ürün düzenle' : 'Yeni ürün'}
          </h3>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">Ad</span>
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                  slug: f.id ? f.slug : slugify(e.target.value),
                }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Kısa ad (URL)
            </span>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2 mono"
            />
          </label>
          <div className="block text-sm md:col-span-2">
            <span className="mono text-[10px] uppercase text-muted">
              Açıklama
            </span>
            <div className="mt-1">
              <RichTextEditor
                value={form.description}
                onChange={(html) =>
                  setForm((f) => ({ ...f, description: html }))
                }
                minHeight="260px"
              />
            </div>
            <span className="mt-1 block text-xs text-muted">
              Zengin metin veya HTML görünümü ile düzenleyin.
            </span>
          </div>
          <label className="block text-sm md:col-span-2">
            <span className="mono text-[10px] uppercase text-muted">
              Kısa açıklama
            </span>
            <input
              value={form.shortDescription}
              onChange={(e) =>
                setForm((f) => ({ ...f, shortDescription: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              maxLength={400}
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Arama başlığı
            </span>
            <input
              value={form.seoTitle}
              onChange={(e) =>
                setForm((f) => ({ ...f, seoTitle: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              maxLength={220}
              placeholder="Boşsa ürün adı kullanılır"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Arama açıklaması
            </span>
            <input
              value={form.seoDescription}
              onChange={(e) =>
                setForm((f) => ({ ...f, seoDescription: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              placeholder="Boşsa kısa açıklama kullanılır"
            />
          </label>
          <div className="col-span-full space-y-2 rounded border border-border-muted p-3">
            <p className="mono text-[10px] uppercase text-muted">
              Fiyatlar (KDV dahil)
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ['TRY', 'basePrice', true],
                  ['USD', 'priceUsd', false],
                  ['EUR', 'priceEur', false],
                  ['GBP', 'priceGbp', false],
                ] as const
              ).map(([code, field, required]) => (
                <label key={code} className="block text-sm">
                  <span className="mono text-[10px] uppercase text-muted">
                    {code}
                    {required ? ' *' : ''}
                  </span>
                  <input
                    required={required}
                    type="number"
                    step="0.01"
                    value={form[field]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [field]: e.target.value }))
                    }
                    className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
                  />
                </label>
              ))}
            </div>
            {!form.priceUsd.trim() ||
            !form.priceEur.trim() ||
            !form.priceGbp.trim() ? (
              <p className="text-xs text-amber-700">
                USD, EUR veya GBP boş — yurtdışı ziyaretçilerde TRY fiyatına
                düşülür.
              </p>
            ) : null}
            <Checkbox
              label="Fiyat KDV dahil"
              checked={form.priceTaxIncluded}
              onChange={(priceTaxIncluded) =>
                setForm((f) => ({ ...f, priceTaxIncluded }))
              }
            />
            <p className="text-[11px] text-muted">
              Varsayılan açık. Kapatırsanız fiyat net (KDV hariç) kabul edilir;
              vitrin ve yasal metinlerde belirtin.
            </p>
          </div>
          <div className="col-span-full space-y-3 rounded border border-border-muted p-3">
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
                <div className="grid gap-3">
                  <label className="block text-sm">
                    <span className="mono text-[10px] uppercase text-muted">
                      Ad ({tab.toUpperCase()})
                    </span>
                    <input
                      value={row.name}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          translations: {
                            ...f.translations,
                            [tab]: {
                              ...f.translations[tab],
                              name: e.target.value,
                              slug:
                                f.translations[tab].slug ||
                                slugify(e.target.value),
                            },
                          },
                        }))
                      }
                      className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mono text-[10px] uppercase text-muted">
                      URL slug ({tab})
                    </span>
                    <input
                      value={row.slug}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          translations: {
                            ...f.translations,
                            [tab]: {
                              ...f.translations[tab],
                              slug: e.target.value,
                            },
                          },
                        }))
                      }
                      className="mt-1 w-full border border-border-muted bg-background px-3 py-2 font-mono text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mono text-[10px] uppercase text-muted">
                      Kısa açıklama
                    </span>
                    <input
                      value={row.shortDescription}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          translations: {
                            ...f.translations,
                            [tab]: {
                              ...f.translations[tab],
                              shortDescription: e.target.value,
                            },
                          },
                        }))
                      }
                      className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mono text-[10px] uppercase text-muted">
                      Açıklama
                    </span>
                    <textarea
                      rows={4}
                      value={row.description}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          translations: {
                            ...f.translations,
                            [tab]: {
                              ...f.translations[tab],
                              description: e.target.value,
                            },
                          },
                        }))
                      }
                      className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
                    />
                  </label>
                </div>
              );
            })()}
          </div>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">Tür</span>
            <select
              value={form.kind}
              onChange={(e) =>
                setForm((f) => ({ ...f, kind: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            >
              <option value="supplement">Takviye / Formül</option>
              <option value="beverage">İçecek</option>
              <option value="herbal_tea">Bitki Çayı</option>
              <option value="tea">Çay</option>
              <option value="other">Diğer</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">Birim</span>
            <select
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="adet">adet</option>
              <option value="paket">paket</option>
              <option value="lt">lt</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">KDV %</span>
            <input
              type="number"
              step="0.01"
              value={form.vatRate}
              onChange={(e) =>
                setForm((f) => ({ ...f, vatRate: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Kategori
            </span>
            <select
              value={form.categoryId}
              onChange={(e) => {
                const categoryId = e.target.value;
                const cat = categories.find((c) => c.id === categoryId);
                const mapped = cat
                  ? CATEGORY_KIND_BY_SLUG[cat.slug]
                  : undefined;
                setForm((f) => ({
                  ...f,
                  categoryId,
                  ...(mapped ? { kind: mapped.kind } : {}),
                }));
              }}
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            >
              <option value="">— Kategori yok —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mono text-[10px] uppercase text-muted">
              Hepsiburada alt kategori kimliği
            </span>
            <input
              value={form.hepsiburadaCategoryId}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  hepsiburadaCategoryId: e.target.value,
                }))
              }
              placeholder="Örn. 18021982 — HB geliştirici portalı alt kategori"
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2 mono text-sm"
            />
            <span className="mt-1 block text-[11px] text-muted">
              Opsiyonel. Boş bırakılırsa Hepsiburada’ya gönderilmez; ID
              girildiğinde pazaryeri gönderimi bu kategoriyi kullanır.
            </span>
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mono text-[10px] uppercase text-muted">
              Hepsiburada özellikler (JSON)
            </span>
            <textarea
              value={form.hepsiburadaAttributesJson}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  hepsiburadaAttributesJson: e.target.value,
                }))
              }
              rows={4}
              placeholder='{"00001STC":"250 gr"} — kategori zorunlu enum’ları'
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2 mono text-sm"
            />
            <span className="mt-1 block text-[11px] text-muted">
              Zorunlu enum değerlerini attribute.id ile yazın. Değerleri
              Pazaryeri → HB kategori şemasından alın.
            </span>
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">Stok</span>
            <input
              required
              type="number"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Üretim / menşei ülke
            </span>
            <input
              value={form.originCountry}
              onChange={(e) =>
                setForm((f) => ({ ...f, originCountry: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Hedef kullanım bölgesi
            </span>
            <input
              value={form.originRegion}
              onChange={(e) =>
                setForm((f) => ({ ...f, originRegion: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Porsiyon / servis
            </span>
            <input
              value={form.altitude}
              onChange={(e) =>
                setForm((f) => ({ ...f, altitude: e.target.value }))
              }
              placeholder="örn. 2 ölçek / gün"
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Form / tip
            </span>
            <input
              value={form.process}
              onChange={(e) => setForm((f) => ({ ...f, process: e.target.value }))}
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              İçerik vurgusu
            </span>
            <input
              value={form.varietal}
              onChange={(e) => setForm((f) => ({ ...f, varietal: e.target.value }))}
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Lot / parti no
            </span>
            <input
              value={form.batchId}
              onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))}
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2 mono"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">Rozet</span>
            <input
              value={form.badge}
              onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mono text-[10px] uppercase text-muted">
              Tat / lezzet seçenekleri (virgülle)
            </span>
            <input
              value={form.flavorNotes}
              onChange={(e) =>
                setForm((f) => ({ ...f, flavorNotes: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Kullanım önerisi — yöntem
            </span>
            <input
              value={form.brewMethod}
              onChange={(e) =>
                setForm((f) => ({ ...f, brewMethod: e.target.value }))
              }
              placeholder="İçecek, çay, karışım…"
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Kullanım önerisi — oran / miktar
            </span>
            <input
              value={form.brewRatio}
              onChange={(e) =>
                setForm((f) => ({ ...f, brewRatio: e.target.value }))
              }
              placeholder="2 ölçek / 250 ml…"
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mono text-[10px] uppercase text-muted">
              Kullanım önerisi — not
            </span>
            <input
              value={form.brewNotes}
              onChange={(e) =>
                setForm((f) => ({ ...f, brewNotes: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mono text-[10px] uppercase text-muted">
              Saklama
            </span>
            <textarea
              rows={3}
              value={form.storageNotes}
              onChange={(e) =>
                setForm((f) => ({ ...f, storageNotes: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>

          <div className="md:col-span-2">
            <MediaUpload
              label="Ana görsel (TR)"
              value={form.imageUrl}
              onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
              folder="products"
            />
            <div className="mt-3">
              <Checkbox
                label="Tüm dillerde ortak görsel"
                checked={form.useSharedImage}
                onChange={(useSharedImage) =>
                  setForm((f) => ({ ...f, useSharedImage }))
                }
              />
            </div>
            {!form.useSharedImage ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {LOCALE_TABS.map(({ key, label }) => (
                  <label key={key} className="block text-sm">
                    <span className="mono text-[10px] uppercase text-muted">
                      Görsel URL ({label})
                    </span>
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
          <div className="md:col-span-2">
            <GalleryMediaField
              label="Galeri"
              urls={form.gallery
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)}
              onChange={(urls) =>
                setForm((f) => ({ ...f, gallery: urls.join('\n') }))
              }
              folder="products"
            />
          </div>
          <div className="md:col-span-2 space-y-3 border border-border-muted p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="mono text-[10px] uppercase text-muted">
                Varyantlar (paket / stok kodu)
              </span>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    variants: [...f.variants, emptyVariant(f.kind)],
                  }))
                }
                className="text-xs text-accent hover:underline"
              >
                + Varyant
              </button>
            </div>
            <p className="text-[11px] text-muted">
              Her satır ayrı seçenektir. Grup anahtarı (ör. shake_flavor) ile
              vitrinde &quot;Shake tadı&quot; gibi gruplanır; grup başlığı TR
              etiket alanından gelir.
            </p>
            {form.variants.map((v, i) => (
              <div
                key={v.id || i}
                className="grid gap-2 border border-border-muted/60 p-2 md:grid-cols-3 lg:grid-cols-8"
              >
                <input
                  placeholder="Stok kodu (boş bırakılırsa otomatik)"
                  value={v.sku}
                  onChange={(e) =>
                    setForm((f) => {
                      const variants = [...f.variants];
                      variants[i] = { ...variants[i], sku: e.target.value };
                      return { ...f, variants };
                    })
                  }
                  className="border border-border-muted bg-background px-2 py-1.5 text-sm mono md:col-span-2 lg:col-span-2"
                />
                <input
                  placeholder="250g"
                  value={v.weightLabel}
                  onChange={(e) =>
                    setForm((f) => {
                      const variants = [...f.variants];
                      variants[i] = {
                        ...variants[i],
                        weightLabel: e.target.value,
                      };
                      return { ...f, variants };
                    })
                  }
                  className="border border-border-muted bg-background px-2 py-1.5 text-sm"
                />
                <input
                  placeholder="Grup anahtarı"
                  title="categoryKey — shake_flavor, size…"
                  value={v.categoryKey}
                  onChange={(e) =>
                    setForm((f) => {
                      const variants = [...f.variants];
                      variants[i] = {
                        ...variants[i],
                        categoryKey: e.target.value,
                      };
                      return { ...f, variants };
                    })
                  }
                  className="border border-border-muted bg-background px-2 py-1.5 text-sm mono"
                />
                <input
                  placeholder="Grup başlığı (TR)"
                  value={v.categoryLabel}
                  onChange={(e) =>
                    setForm((f) => {
                      const variants = [...f.variants];
                      variants[i] = {
                        ...variants[i],
                        categoryLabel: e.target.value,
                      };
                      return { ...f, variants };
                    })
                  }
                  className="border border-border-muted bg-background px-2 py-1.5 text-sm md:col-span-2"
                />
                <input
                  placeholder="Fiyat"
                  value={v.price}
                  onChange={(e) =>
                    setForm((f) => {
                      const variants = [...f.variants];
                      variants[i] = { ...variants[i], price: e.target.value };
                      return { ...f, variants };
                    })
                  }
                  className="border border-border-muted bg-background px-2 py-1.5 text-sm"
                />
                <input
                  placeholder="Stok"
                  value={v.stock}
                  onChange={(e) =>
                    setForm((f) => {
                      const variants = [...f.variants];
                      variants[i] = { ...variants[i], stock: e.target.value };
                      return { ...f, variants };
                    })
                  }
                  className="border border-border-muted bg-background px-2 py-1.5 text-sm"
                />
                <div className="flex flex-col gap-2 md:col-span-3 lg:col-span-8 md:flex-row md:items-center md:justify-between">
                  <Checkbox
                    checked={v.isActive}
                    onChange={(isActive) =>
                      setForm((f) => {
                        const variants = [...f.variants];
                        variants[i] = { ...variants[i], isActive };
                        return { ...f, variants };
                      })
                    }
                    label="Aktif"
                    description="Mağazada seçilebilir"
                  />
                  <button
                    type="button"
                    disabled={form.variants.length <= 1}
                    onClick={() => setDeleteVariantIndex(i)}
                    className="text-xs text-danger hover:underline disabled:opacity-30"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Checkbox
            checked={form.isActive}
            onChange={(isActive) => setForm((f) => ({ ...f, isActive }))}
            label="Aktif"
            description="Mağazada listelenir"
          />
          <Checkbox
            checked={form.isFeatured}
            onChange={(isFeatured) => setForm((f) => ({ ...f, isFeatured }))}
            label="Öne çıkan"
            description="Ana sayfada vurgulanır"
          />
        </form>
      </AdminFormPanel>

      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        emptyMessage={loading ? 'Yükleniyor…' : 'Henüz ürün yok'}
        selectedRowKey={editing ? form.id || null : null}
        highlightRowKey={!editing ? highlightRowKey : null}
        onRowClick={(r) => startEdit(r)}
        columns={[
          {
            key: 'thumb',
            header: '',
            render: (r) => (
              <AdminListThumb src={r.imageUrl} alt={r.name} />
            ),
          },
          {
            key: 'name',
            header: 'Ürün',
            render: (r) => (
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="mono text-[10px] text-muted">{r.slug}</div>
              </div>
            ),
          },
          {
            key: 'category',
            header: 'Kategori',
            render: (r) => (
              <span className="text-xs text-muted">
                {categoryName(r.categoryId)}
              </span>
            ),
          },
          {
            key: 'price',
            header: 'Fiyat',
            render: (r) => formatMoney(r.basePrice, r.currency || 'TRY'),
          },
          {
            key: 'stock',
            header: 'Stok',
            render: (r) => (
              <span className={r.stock <= 10 ? 'text-warning' : ''}>
                {r.stock}
              </span>
            ),
          },
          {
            key: 'active',
            header: 'Durum',
            render: (r) => (r.isActive ? 'Aktif' : 'Pasif'),
          },
          {
            key: 'actions',
            header: '',
            render: (r) => (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => startEdit(r)}
                  className="text-xs text-accent hover:underline"
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(r.id)}
                  className="text-xs text-danger hover:underline"
                >
                  Sil
                </button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Ürünü sil?"
        description="Bu işlem geri alınamaz. Ürün katalogdan kaldırılır."
        confirmLabel="Ürünü sil"
        loading={deleting}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void confirmRemove()}
      />

      <ConfirmDialog
        open={deleteVariantIndex !== null}
        title="Varyantı sil?"
        description={
          deleteVariantIndex !== null
            ? `"${form.variants[deleteVariantIndex]?.weightLabel || form.variants[deleteVariantIndex]?.sku || 'Bu varyant'}" formdan kaldırılacak. Kaydetmeden kalıcı olmaz.`
            : undefined
        }
        confirmLabel="Varyantı sil"
        onCancel={() => setDeleteVariantIndex(null)}
        onConfirm={() => {
          if (deleteVariantIndex === null) return;
          setForm((f) => ({
            ...f,
            variants:
              f.variants.length > 1
                ? f.variants.filter((_, idx) => idx !== deleteVariantIndex)
                : f.variants,
          }));
          setDeleteVariantIndex(null);
        }}
      />

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-motion border px-3 py-1.5 text-xs disabled:opacity-30"
          >
            Önceki
          </button>
          <span className="mono text-xs text-muted">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-motion border px-3 py-1.5 text-xs disabled:opacity-30"
          >
            Sonraki
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={<p className="mono text-sm text-muted">Yükleniyor…</p>}
    >
      <ProductsPageInner />
    </Suspense>
  );
}
