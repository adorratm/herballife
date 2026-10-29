'use client';

import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { asArray, slugify } from '@/lib/utils';
import { DataTable } from '@/components/DataTable';
import type { LegalDocument } from '@/lib/types';
import { RichTextEditor } from '@/components/RichTextEditor';

const LOCALES = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
] as const;

type FormState = {
  id?: string;
  slug: string;
  title: string;
  content: string;
  version: string;
  locale: string;
};

const emptyForm = (locale = 'tr'): FormState => ({
  slug: '',
  title: '',
  content: '',
  version: '1.0',
  locale,
});

function LegalPageInner() {
  const searchParams = useSearchParams();
  const filterQ = (searchParams.get('q') || '').trim().toLowerCase();

  const [rows, setRows] = useState<LegalDocument[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [listLocale, setListLocale] = useState<string>('all');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const openedFromQuery = useRef(false);

  const visible = useMemo(() => {
    let list = rows;
    if (listLocale !== 'all') {
      list = list.filter(
        (d) => (d.locale || 'tr').toLowerCase() === listLocale,
      );
    }
    if (!filterQ) return list;
    return list.filter(
      (d) =>
        d.title.toLowerCase().includes(filterQ) ||
        d.slug.toLowerCase().includes(filterQ) ||
        (d.locale || '').toLowerCase().includes(filterQ),
    );
  }, [rows, filterQ, listLocale]);

  useEffect(() => {
    openedFromQuery.current = false;
  }, [filterQ]);

  useEffect(() => {
    if (!filterQ || !rows.length || openedFromQuery.current) return;
    const match = rows.find(
      (d) =>
        d.slug.toLowerCase() === filterQ ||
        d.title.toLowerCase().includes(filterQ) ||
        d.slug.toLowerCase().includes(filterQ),
    );
    if (!match) return;
    openedFromQuery.current = true;
    startEdit(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterQ, rows]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<unknown>('/legal/documents').catch(() =>
        api<unknown>('/legal'),
      );
      setRows(asArray<LegalDocument>(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Belgeler yüklenemedi');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startCreate() {
    setForm(
      emptyForm(listLocale !== 'all' ? listLocale : 'tr'),
    );
    setEditing(true);
  }

  function startEdit(doc: LegalDocument) {
    setForm({
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      content: doc.content,
      version: doc.version,
      locale: doc.locale || 'tr',
    });
    setEditing(true);
  }

  function startLocaleCopy(doc: LegalDocument, locale: string) {
    setForm({
      id: undefined,
      slug: doc.slug,
      title: doc.title,
      content: doc.content,
      version: doc.version,
      locale,
    });
    setEditing(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const payload = {
      slug: form.slug || slugify(form.title),
      title: form.title,
      content: form.content,
      version: form.version,
      locale: form.locale || 'tr',
      isPublished: true,
    };
    try {
      if (form.id) {
        await api(`/legal/documents/${form.id}`, {
          method: 'PATCH',
          body: payload,
        }).catch(() =>
          api(`/legal/${form.id}`, { method: 'PATCH', body: payload }),
        );
      } else {
        await api('/legal/documents', { method: 'POST', body: payload }).catch(
          () => api('/legal', { method: 'POST', body: payload }),
        );
      }
      setEditing(false);
      setForm(emptyForm());
      setMessage(`Kaydedildi (${payload.locale.toUpperCase()})`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  }

  async function publish(id: string) {
    setError(null);
    setMessage(null);
    try {
      await api(`/legal/documents/${id}/publish`, { method: 'POST' }).catch(
        () =>
          api(`/legal/${id}`, {
            method: 'PATCH',
            body: { isPublished: true },
          }),
      );
      setMessage('Yayınlandı');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yayınlanamadı');
    }
  }

  async function syncDefaults(opts: {
    force?: boolean;
    locales?: string[];
  } = {}) {
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const result = await api<{
        created: string[];
        updated: string[];
        skipped: string[];
      }>('/legal/documents/sync-defaults', {
        method: 'POST',
        body: {
          force: Boolean(opts.force),
          locales: opts.locales,
        },
      });
      const parts = [
        result.created.length
          ? `${result.created.length} oluşturuldu`
          : null,
        result.updated.length ? `${result.updated.length} güncellendi` : null,
        result.skipped.length
          ? `${result.skipped.length} atlandı (zaten düzenlenmiş)`
          : null,
      ].filter(Boolean);
      setMessage(parts.join(' · ') || 'Senkron tamam');
      setEditing(false);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Varsayılan metinler yüklenemedi',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted max-w-2xl">
          Yasal belge editörü — her dil için ayrı kayıt (TR / EN / DE / FR /
          ES). Normal deploy dolu veritabanında seed çalıştırmaz; kod
          güncellemelerinden sonra yayını yenilemek için{' '}
          <strong>TR’yi seed ile zorla yenile</strong> kullanın.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void syncDefaults({ locales: ['tr'] })}
            className="btn-motion border border-border-muted px-4 py-2 text-sm text-foreground hover:bg-background disabled:opacity-50"
            title="Yalnızca eksik / yer tutuculu TR metinlerini doldurur"
          >
            TR eksikleri doldur
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (
                !window.confirm(
                  'TR yasal metinleri kod seed’indeki güncel metinlerle üzerine yazılsın mı? Panelde elle düzenlediğiniz içerik silinir.',
                )
              ) {
                return;
              }
              void syncDefaults({ force: true, locales: ['tr'] });
            }}
            className="btn-motion border border-amber-600/40 bg-amber-50 px-4 py-2 text-sm text-amber-900 hover:bg-amber-100 disabled:opacity-50"
            title="Deploy sonrası seed çalışmasa bile yayındaki TR sözleşmeleri günceller"
          >
            TR’yi seed ile zorla yenile
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              void syncDefaults({ locales: ['en', 'de', 'fr', 'es'] })
            }
            className="btn-motion border border-border-muted px-4 py-2 text-sm text-foreground hover:bg-background disabled:opacity-50"
            title="Mevcut metinlerin EN/DE/FR/ES çevirilerini oluşturur"
          >
            Diğer dillere çevir
          </button>
          <button
            type="button"
            onClick={startCreate}
            className="btn-motion bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover"
          >
            Yeni belge
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setListLocale('all')}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            listLocale === 'all'
              ? 'bg-accent text-white'
              : 'border border-border-muted text-muted'
          }`}
        >
          Tümü
        </button>
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setListLocale(l.code)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              listLocale === l.code
                ? 'bg-accent text-white'
                : 'border border-border-muted text-muted'
            }`}
          >
            {l.label}
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
          className="grid gap-3 border border-border-muted bg-surface p-4"
        >
          <div className="grid gap-3 md:grid-cols-4">
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">Dil</span>
              <select
                required
                value={form.locale}
                onChange={(e) =>
                  setForm((f) => ({ ...f, locale: e.target.value }))
                }
                className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
              >
                {LOCALES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label} ({l.code})
                  </option>
                ))}
              </select>
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
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                Başlık
              </span>
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
                Versiyon
              </span>
              <input
                required
                value={form.version}
                onChange={(e) =>
                  setForm((f) => ({ ...f, version: e.target.value }))
                }
                className="mt-1 w-full border border-border-muted bg-background px-3 py-2 mono"
              />
            </label>
          </div>
          <div className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">İçerik</span>
            <div className="mt-1">
              <RichTextEditor
                value={form.content}
                onChange={(html) =>
                  setForm((f) => ({ ...f, content: html }))
                }
                minHeight="320px"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-motion bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setForm(emptyForm());
              }}
              className="border border-border-muted px-4 py-2 text-sm text-muted"
            >
              İptal
            </button>
          </div>
        </form>
      ) : null}

      <DataTable
        rows={visible}
        rowKey={(r) => r.id}
        emptyMessage={loading ? 'Yükleniyor…' : 'Belge yok'}
        selectedRowKey={editing ? form.id || null : null}
        onRowClick={(r) => startEdit(r)}
        columns={[
          {
            key: 'locale',
            header: 'Dil',
            render: (r) => (
              <span className="mono text-xs uppercase">
                {r.locale || 'tr'}
              </span>
            ),
          },
          {
            key: 'slug',
            header: 'Kısa ad',
            render: (r) => <span className="mono text-xs">{r.slug}</span>,
          },
          { key: 'title', header: 'Başlık', render: (r) => r.title },
          {
            key: 'version',
            header: 'Ver',
            render: (r) => <span className="mono text-xs">{r.version}</span>,
          },
          {
            key: 'pub',
            header: 'Yayın',
            render: (r) => (r.isPublished ? 'Yayında' : 'Taslak'),
          },
          {
            key: 'actions',
            header: '',
            render: (r) => (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(r)}
                  className="text-xs text-accent hover:underline"
                >
                  Düzenle
                </button>
                {(r.locale || 'tr') === 'tr' ? (
                  <button
                    type="button"
                    onClick={() => startLocaleCopy(r, 'en')}
                    className="text-xs text-muted hover:underline"
                    title="Aynı slug ile başka dil kaydı oluştur"
                  >
                    + Dil
                  </button>
                ) : null}
                {!r.isPublished ? (
                  <button
                    type="button"
                    onClick={() => void publish(r.id)}
                    className="text-xs text-success hover:underline"
                  >
                    Yayınla
                  </button>
                ) : null}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

export default function LegalPage() {
  return (
    <Suspense
      fallback={<p className="mono text-sm text-muted">Yükleniyor…</p>}
    >
      <LegalPageInner />
    </Suspense>
  );
}
