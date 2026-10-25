'use client';

import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { asArray, slugify } from '@/lib/utils';
import { DataTable } from '@/components/DataTable';
import { Checkbox } from '@/components/Checkbox';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AdminFormPanel } from '@/components/AdminFormPanel';

type LocaleKey = 'en' | 'de' | 'fr' | 'es';

type LocaleFields = { name: string; slug: string; description: string };

const LOCALE_TABS: { key: LocaleKey; label: string }[] = [
  { key: 'en', label: 'EN' },
  { key: 'de', label: 'DE' },
  { key: 'fr', label: 'FR' },
  { key: 'es', label: 'ES' },
];

const emptyTranslations = (): Record<LocaleKey, LocaleFields> => ({
  en: { name: '', slug: '', description: '' },
  de: { name: '', slug: '', description: '' },
  fr: { name: '', slug: '', description: '' },
  es: { name: '', slug: '', description: '' },
});

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  translations?: Record<string, LocaleFields> | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sortOrder: number;
  isActive: boolean;
};

type FormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  translationTab: LocaleKey;
  translations: Record<LocaleKey, LocaleFields>;
  seoTitle: string;
  seoDescription: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  name: '',
  slug: '',
  description: '',
  translationTab: 'en',
  translations: emptyTranslations(),
  seoTitle: '',
  seoDescription: '',
  sortOrder: '0',
  isActive: true,
});

function formFromCategory(r: Category): FormState {
  const translations = emptyTranslations();
  for (const { key } of LOCALE_TABS) {
    const t = r.translations?.[key];
    translations[key] = {
      name: t?.name || '',
      slug: t?.slug || '',
      description: t?.description || '',
    };
  }
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description || '',
    translationTab: 'en',
    translations,
    seoTitle: r.seoTitle || '',
    seoDescription: r.seoDescription || '',
    sortOrder: String(r.sortOrder),
    isActive: r.isActive,
  };
}

function CategoriesPageInner() {
  const searchParams = useSearchParams();
  const filterQ = (searchParams.get('q') || '').trim().toLowerCase();

  const [rows, setRows] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [highlightRowKey, setHighlightRowKey] = useState<string | null>(null);
  const openedFromQuery = useRef(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api<unknown>('/categories/admin/all');
      setRows(asArray<Category>(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    openedFromQuery.current = false;
  }, [filterQ]);

  useEffect(() => {
    if (!filterQ || !rows.length || openedFromQuery.current) return;
    const match = rows.find(
      (c) =>
        c.name.toLowerCase().includes(filterQ) ||
        c.slug.toLowerCase().includes(filterQ),
    );
    if (!match) return;
    openedFromQuery.current = true;
    setForm({
      id: match.id,
      name: match.name,
      slug: match.slug,
      description: match.description || '',
      translationTab: 'en',
      translations: (() => {
        const tr = emptyTranslations();
        for (const { key } of LOCALE_TABS) {
          const t = match.translations?.[key];
          tr[key] = {
            name: t?.name || '',
            slug: t?.slug || '',
            description: t?.description || '',
          };
        }
        return tr;
      })(),
      seoTitle: match.seoTitle || '',
      seoDescription: match.seoDescription || '',
      sortOrder: String(match.sortOrder),
      isActive: match.isActive,
    });
    setEditing(true);
  }, [filterQ, rows]);

  const visible = useMemo(() => {
    if (!filterQ) return rows;
    return rows.filter(
      (c) =>
        c.name.toLowerCase().includes(filterQ) ||
        c.slug.toLowerCase().includes(filterQ),
    );
  }, [rows, filterQ]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
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
    const translations: Record<string, LocaleFields> = {};
    for (const { key } of LOCALE_TABS) {
      const row = form.translations[key];
      translations[key] = {
        name: row.name.trim(),
        slug: row.slug.trim() || slugify(row.name),
        description: row.description.trim(),
      };
    }
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description || undefined,
      translations,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    };
    try {
      let savedId = form.id;
      if (form.id) {
        await api(`/categories/${form.id}`, { method: 'PATCH', body: payload });
      } else {
        const created = await api<{ id: string }>('/categories', {
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

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    setError(null);
    try {
      await api(`/categories/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      if (highlightRowKey === deleteId) setHighlightRowKey(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi');
    } finally {
      setDeleting(false);
    }
  }

  const formTitle = form.id ? 'Kategori düzenle' : 'Yeni kategori';

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-3">
        <p className="text-sm text-muted">
          {loading
            ? 'Yükleniyor…'
            : filterQ
              ? `${visible.length} / ${rows.length} kategori`
              : `${rows.length} kategori`}
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(emptyForm());
            setEditing(true);
          }}
          className="btn-motion bg-accent px-4 py-2 text-sm text-white"
        >
          Yeni kategori
        </button>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <AdminFormPanel
        open={editing}
        onClose={() => setEditing(false)}
        title={formTitle}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="admin-btn admin-btn-ghost"
            >
              İptal
            </button>
            <button
              type="submit"
              form="category-form"
              disabled={saving}
              className="admin-btn admin-btn-primary disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </>
        }
      >
        <form
          id="category-form"
          onSubmit={onSubmit}
          className="grid gap-3 md:grid-cols-2"
        >
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
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mono text-[10px] uppercase text-muted">
              Açıklama
            </span>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              rows={8}
            />
            <span className="mt-1 block text-xs text-muted">
              Kategori sayfasında H1 altında görünür (200–400 kelime önerilir).
            </span>
          </label>
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
                <div className="grid gap-3">
                  <label className="block text-sm">
                    <span className="mono text-[10px] uppercase text-muted">
                      Ad ({tab})
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
                      Açıklama ({tab})
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
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Arama açıklaması
            </span>
            <textarea
              value={form.seoDescription}
              onChange={(e) =>
                setForm((f) => ({ ...f, seoDescription: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              rows={3}
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">Sıra</span>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((f) => ({ ...f, sortOrder: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <Checkbox
            checked={form.isActive}
            onChange={(isActive) => setForm((f) => ({ ...f, isActive }))}
            label="Aktif"
            description="Kategori vitrinde görünür"
          />
        </form>
      </AdminFormPanel>

      <DataTable
        rows={visible}
        rowKey={(r) => r.id}
        emptyMessage="Kategori yok"
        selectedRowKey={editing ? form.id || null : null}
        highlightRowKey={!editing ? highlightRowKey : null}
        onRowClick={(r) => {
          setForm(formFromCategory(r));
          setEditing(true);
        }}
        columns={[
          { key: 'name', header: 'Kategori', render: (r) => r.name },
          { key: 'slug', header: 'Kısa ad', render: (r) => r.slug },
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
                  onClick={() => {
                    setForm(formFromCategory(r));
                    setEditing(true);
                  }}
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
        title="Kategoriyi sil?"
        description="Bu kategori kalıcı olarak kaldırılır. İlişkili ürünler varsa işlem başarısız olabilir."
        confirmLabel="Kategoriyi sil"
        loading={deleting}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={<p className="mono text-sm text-muted">Yükleniyor…</p>}
    >
      <CategoriesPageInner />
    </Suspense>
  );
}
