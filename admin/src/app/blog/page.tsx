'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { asArray, asPaged, slugify } from '@/lib/utils';
import { DataTable } from '@/components/DataTable';
import { MediaUpload } from '@/components/MediaUpload';
import { Checkbox } from '@/components/Checkbox';
import { AdminListThumb } from '@/components/AdminListThumb';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AdminFormPanel } from '@/components/AdminFormPanel';
import { RichTextEditor } from '@/components/RichTextEditor';
import type { BlogPost } from '@/lib/types';

type LocaleKey = 'en' | 'de' | 'fr' | 'es';

type BlogLocaleFields = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
};

const LOCALE_TABS: { key: LocaleKey; label: string }[] = [
  { key: 'en', label: 'EN' },
  { key: 'de', label: 'DE' },
  { key: 'fr', label: 'FR' },
  { key: 'es', label: 'ES' },
];

const emptyBlogTranslations = (): Record<LocaleKey, BlogLocaleFields> => ({
  en: {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
  },
  de: {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
  },
  fr: {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
  },
  es: {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
  },
});

type FormState = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  useSharedImage: boolean;
  imagesByLocale: Record<LocaleKey, string>;
  translationTab: LocaleKey;
  translations: Record<LocaleKey, BlogLocaleFields>;
  authorName: string;
  tags: string;
  relatedProductSlugs: string[];
  relatedCategorySlugs: string[];
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
};

const emptyForm = (): FormState => ({
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  useSharedImage: true,
  imagesByLocale: { en: '', de: '', fr: '', es: '' },
  translationTab: 'en',
  translations: emptyBlogTranslations(),
  authorName: 'Herbal Kapıda',
  tags: '',
  relatedProductSlugs: [],
  relatedCategorySlugs: [],
  seoTitle: '',
  seoDescription: '',
  isPublished: false,
});

function BlogAdminPageInner() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [rows, setRows] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [q, setQ] = useState(initialQ);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [highlightRowKey, setHighlightRowKey] = useState<string | null>(null);
  const [productOptions, setProductOptions] = useState<
    { slug: string; name: string }[]
  >([]);
  const [categoryOptions, setCategoryOptions] = useState<
    { slug: string; name: string }[]
  >([]);

  async function load(search = q) {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        includeDrafts: 'true',
        limit: '50',
        sort: 'updatedAt',
        order: 'desc',
      });
      if (search.trim()) qs.set('q', search.trim());
      const data = await api<unknown>(`/blog/admin/all?${qs}`);
      setRows(asPaged<BlogPost>(data).items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yazılar yüklenemedi');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setQ(initialQ);
    void load(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  useEffect(() => {
    void Promise.all([
      api<unknown>('/categories/admin/all').catch(() => []),
      api<unknown>('/products/admin/all?limit=500').catch(() => []),
    ]).then(([catsRaw, productsRaw]) => {
      const cats = asArray<{ slug: string; name: string }>(catsRaw);
      setCategoryOptions(
        cats
          .filter((c) => c.slug?.trim())
          .map((c) => ({ slug: c.slug, name: c.name }))
          .sort((a, b) => a.name.localeCompare(b.name, 'tr')),
      );
      const productsPage = asPaged<{ slug: string; name: string }>(productsRaw);
      setProductOptions(
        (productsPage.items || [])
          .filter((p) => p.slug?.trim())
          .map((p) => ({ slug: p.slug, name: p.name }))
          .sort((a, b) => a.name.localeCompare(b.name, 'tr')),
      );
    });
  }, []);

  function startCreate() {
    setForm(emptyForm());
    setEditing(true);
  }

  function startEdit(post: BlogPost) {
    setForm({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      coverImageUrl: post.coverImageUrl || '',
      useSharedImage: post.useSharedImage !== false,
      imagesByLocale: {
        en: post.imagesByLocale?.en || '',
        de: post.imagesByLocale?.de || '',
        fr: post.imagesByLocale?.fr || '',
        es: post.imagesByLocale?.es || '',
      },
      translationTab: 'en',
      translations: (() => {
        const tr = emptyBlogTranslations();
        for (const { key } of LOCALE_TABS) {
          const t = post.translations?.[key];
          tr[key] = {
            title: t?.title || '',
            slug: t?.slug || '',
            excerpt: t?.excerpt || '',
            content: t?.content || '',
            seoTitle: t?.seoTitle || '',
            seoDescription: t?.seoDescription || '',
          };
        }
        return tr;
      })(),
      authorName: post.authorName || '',
      tags: (post.tags || []).join(', '),
      relatedProductSlugs: post.relatedProductSlugs || [],
      relatedCategorySlugs: post.relatedCategorySlugs || [],
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      isPublished: post.isPublished,
    });
    setEditing(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    for (const { key, label } of LOCALE_TABS) {
      const row = form.translations[key];
      if (
        !row.title.trim() ||
        !row.slug.trim() ||
        !row.excerpt.trim() ||
        !row.content.trim()
      ) {
        setError(`${label}: başlık, slug, özet ve içerik zorunludur.`);
        setSaving(false);
        return;
      }
    }
    if (!form.useSharedImage) {
      for (const { key, label } of LOCALE_TABS) {
        if (!form.imagesByLocale[key]?.trim()) {
          setError(`${label} kapak görseli zorunludur.`);
          setSaving(false);
          return;
        }
      }
      if (!form.coverImageUrl.trim()) {
        setError('TR kapak görseli zorunludur.');
        setSaving(false);
        return;
      }
    }

    const translations: Record<string, BlogLocaleFields> = {};
    for (const { key } of LOCALE_TABS) {
      const row = form.translations[key];
      translations[key] = {
        title: row.title.trim(),
        slug: row.slug.trim() || slugify(row.title),
        excerpt: row.excerpt.trim(),
        content: row.content.trim(),
        seoTitle: row.seoTitle.trim(),
        seoDescription: row.seoDescription.trim(),
      };
    }

    const payload = {
      slug: form.slug || slugify(form.title),
      title: form.title,
      excerpt: form.excerpt || undefined,
      content: form.content,
      coverImageUrl: form.coverImageUrl || undefined,
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
      authorName: form.authorName || undefined,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      relatedProductSlugs: form.relatedProductSlugs,
      relatedCategorySlugs: form.relatedCategorySlugs,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      isPublished: form.isPublished,
    };
    try {
      let savedId = form.id;
      if (form.id) {
        await api(`/blog/${form.id}`, { method: 'PATCH', body: payload });
      } else {
        const created = await api<{ id: string }>('/blog', {
          method: 'POST',
          body: payload,
        });
        savedId = created.id;
      }
      setHighlightRowKey(savedId || null);
      setEditing(false);
      setForm(emptyForm());
      setMessage('Kaydedildi');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setError(null);
    try {
      await api(`/blog/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      setMessage('Silindi');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi');
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Yazılar — arama alanlarıyla</p>
        <button
          type="button"
          onClick={startCreate}
          className="btn-motion bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover"
        >
          Yeni yazı
        </button>
      </div>

      <div className="admin-toolbar">
        <label className="block min-w-48 flex-1 text-sm">
          <span className="mono text-[10px] uppercase text-muted">Ara</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void load(q);
            }}
            placeholder="Başlık, slug…"
            className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={() => void load(q)}
          className="admin-btn admin-btn-ghost"
        >
          Filtrele
        </button>
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

      <AdminFormPanel
        open={editing}
        onClose={() => {
          setEditing(false);
          setForm(emptyForm());
        }}
        title={form.id ? 'Yazı düzenle' : 'Yeni yazı'}
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
              form="blog-form"
              disabled={saving}
              className="admin-btn admin-btn-primary disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </>
        }
      >
        <form
          id="blog-form"
          onSubmit={onSubmit}
          className="grid gap-3 md:grid-cols-2"
        >
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">Başlık</span>
            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  title: e.target.value,
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
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2 mono"
            />
          </label>
          <div className="block text-sm md:col-span-2">
            <span className="mono text-[10px] uppercase text-muted">Özet</span>
            <div className="mt-1">
              <RichTextEditor
                value={form.excerpt}
                onChange={(html) =>
                  setForm((f) => ({ ...f, excerpt: html }))
                }
                placeholder="Yazı özeti…"
                minHeight="120px"
              />
            </div>
          </div>
          <div className="block text-sm md:col-span-2">
            <span className="mono text-[10px] uppercase text-muted">
              İçerik
            </span>
            <div className="mt-1">
              <RichTextEditor
                value={form.content}
                onChange={(html) =>
                  setForm((f) => ({ ...f, content: html }))
                }
                minHeight="280px"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <MediaUpload
              label="Kapak görseli (TR)"
              value={form.coverImageUrl}
              onChange={(url) =>
                setForm((f) => ({ ...f, coverImageUrl: url }))
              }
              folder="blog"
            />
            <div className="mt-3">
              <Checkbox
                label="Tüm dillerde ortak kapak görseli"
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
                      Kapak URL ({label})
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
          <div className="md:col-span-2 space-y-3 rounded border border-border-muted p-3">
            <p className="mono text-[10px] uppercase text-muted">
              Çeviriler — EN/DE/FR/ES zorunlu
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
                      Başlık ({tab})
                    </span>
                    <input
                      value={row.title}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          translations: {
                            ...f.translations,
                            [tab]: {
                              ...f.translations[tab],
                              title: e.target.value,
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
                  <div className="block text-sm">
                    <span className="mono text-[10px] uppercase text-muted">
                      Özet ({tab})
                    </span>
                    <div className="mt-1">
                      <RichTextEditor
                        value={row.excerpt}
                        onChange={(html) =>
                          setForm((f) => ({
                            ...f,
                            translations: {
                              ...f.translations,
                              [tab]: {
                                ...f.translations[tab],
                                excerpt: html,
                              },
                            },
                          }))
                        }
                        placeholder={`Özet (${tab})…`}
                        minHeight="120px"
                      />
                    </div>
                  </div>
                  <div className="block text-sm">
                    <span className="mono text-[10px] uppercase text-muted">
                      İçerik ({tab})
                    </span>
                    <div className="mt-1">
                      <RichTextEditor
                        value={row.content}
                        onChange={(html) =>
                          setForm((f) => ({
                            ...f,
                            translations: {
                              ...f.translations,
                              [tab]: { ...f.translations[tab], content: html },
                            },
                          }))
                        }
                        minHeight="220px"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">Yazar</span>
            <input
              value={form.authorName}
              onChange={(e) =>
                setForm((f) => ({ ...f, authorName: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Etiketler (virgülle)
            </span>
            <input
              value={form.tags}
              onChange={(e) =>
                setForm((f) => ({ ...f, tags: e.target.value }))
              }
              className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
            />
          </label>
          <div className="md:col-span-2 space-y-2">
            <span className="mono text-[10px] uppercase text-muted">
              İlgili ürünler
            </span>
            <div className="max-h-48 overflow-auto rounded border border-border-muted p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {productOptions.map((p) => (
                  <Checkbox
                    key={p.slug}
                    label={`${p.name} (${p.slug})`}
                    checked={form.relatedProductSlugs.includes(p.slug)}
                    onChange={(checked) =>
                      setForm((f) => ({
                        ...f,
                        relatedProductSlugs: checked
                          ? [...f.relatedProductSlugs, p.slug]
                          : f.relatedProductSlugs.filter((s) => s !== p.slug),
                      }))
                    }
                  />
                ))}
              </div>
            </div>
            <span className="block text-xs text-muted">
              Yazı sonunda “İlgili ürünler” olarak gösterilir.
            </span>
          </div>
          <div className="md:col-span-2 space-y-2">
            <span className="mono text-[10px] uppercase text-muted">
              İlgili kategoriler
            </span>
            <div className="max-h-40 overflow-auto rounded border border-border-muted p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {categoryOptions.map((c) => (
                  <Checkbox
                    key={c.slug}
                    label={`${c.name} (${c.slug})`}
                    checked={form.relatedCategorySlugs.includes(c.slug)}
                    onChange={(checked) =>
                      setForm((f) => ({
                        ...f,
                        relatedCategorySlugs: checked
                          ? [...f.relatedCategorySlugs, c.slug]
                          : f.relatedCategorySlugs.filter((s) => s !== c.slug),
                      }))
                    }
                  />
                ))}
              </div>
            </div>
            <span className="block text-xs text-muted">
              Yazıdan kategori sayfalarına köprü.
            </span>
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
            />
          </label>
          <div className="md:col-span-2">
            <Checkbox
              checked={form.isPublished}
              onChange={(isPublished) =>
                setForm((f) => ({ ...f, isPublished }))
              }
              label="Yayında"
              description="Sitede /blog altında görünür"
            />
          </div>
        </form>
      </AdminFormPanel>

      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        emptyMessage={loading ? 'Yükleniyor…' : 'Yazı yok'}
        selectedRowKey={editing ? form.id || null : null}
        highlightRowKey={!editing ? highlightRowKey : null}
        onRowClick={(r) => startEdit(r)}
        columns={[
          {
            key: 'thumb',
            header: '',
            render: (r) => (
              <AdminListThumb src={r.coverImageUrl} alt={r.title} />
            ),
          },
          {
            key: 'slug',
            header: 'Kısa ad',
            render: (r) => <span className="mono text-xs">{r.slug}</span>,
          },
          {
            key: 'title',
            header: 'Başlık',
            render: (r) => {
              const enTitle = r.translations?.en?.title?.trim();
              const i18nOk = Boolean(
                enTitle &&
                  r.translations?.de?.title?.trim() &&
                  r.translations?.fr?.title?.trim() &&
                  r.translations?.es?.title?.trim(),
              );
              return (
                <div>
                  <div className="font-medium">{r.title}</div>
                  {enTitle && enTitle !== r.title ? (
                    <div className="text-xs text-muted">EN: {enTitle}</div>
                  ) : null}
                  <div className="mono text-[10px] text-muted">
                    {i18nOk ? 'EN/DE/FR/ES ✓' : 'çeviri eksik'}
                  </div>
                </div>
              );
            },
          },
          {
            key: 'pub',
            header: 'Durum',
            render: (r) => (r.isPublished ? 'Yayında' : 'Taslak'),
          },
          {
            key: 'actions',
            header: '',
            render: (r) => (
              <div className="flex gap-2">
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
        title="Yazıyı sil"
        description="Bu blog yazısı kalıcı olarak silinecek."
        confirmLabel="Sil"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

export default function BlogAdminPage() {
  return (
    <Suspense
      fallback={<p className="mono text-sm text-muted">Yükleniyor…</p>}
    >
      <BlogAdminPageInner />
    </Suspense>
  );
}
