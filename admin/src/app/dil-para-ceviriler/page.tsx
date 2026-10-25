'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { DataTable } from '@/components/DataTable';
import { AdminFormPanel } from '@/components/AdminFormPanel';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const ALL_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'] as const;
const CURRENCY_LABELS: Record<(typeof ALL_CURRENCIES)[number], string> = {
  TRY: 'Türk Lirası (₺)',
  USD: 'ABD Doları ($)',
  EUR: 'Euro (€)',
  GBP: 'İngiliz Sterlini (£)',
};

type CurrencyCode = (typeof ALL_CURRENCIES)[number];

type LanguageRecord = {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  currency: CurrencyCode;
  sortOrder: number;
};

type CatalogEntry = {
  code: string;
  name: string;
  nativeName: string;
  defaultCurrency: CurrencyCode;
};

type LanguagesAdminResponse = {
  languages: LanguageRecord[];
  catalog: CatalogEntry[];
  availableToAdd: CatalogEntry[];
};

type LanguageMutationResponse = {
  languages: LanguageRecord[];
  localization: Record<string, unknown>;
};

type LocalizationForm = {
  defaultLocale: string;
  enabledLocales: string[];
  defaultCurrency: CurrencyCode;
  currencies: CurrencyCode[];
  currencyByLocale: Record<string, CurrencyCode>;
};

type Tab = 'locales' | 'currencies' | 'ui';

type AddLanguageForm = {
  code: string;
  name: string;
  nativeName: string;
  currency: CurrencyCode;
  enabled: boolean;
  copyMessagesFrom: string;
};

type EditLanguageForm = {
  code: string;
  name: string;
  nativeName: string;
  currency: CurrencyCode;
  enabled: boolean;
  sortOrder: string;
};

function emptyAddForm(available: CatalogEntry[]): AddLanguageForm {
  const first = available[0];
  return {
    code: first?.code || '',
    name: first?.name || '',
    nativeName: first?.nativeName || '',
    currency: first?.defaultCurrency || 'USD',
    enabled: true,
    copyMessagesFrom: 'en',
  };
}

function editFormFromRow(row: LanguageRecord): EditLanguageForm {
  return {
    code: row.code,
    name: row.name,
    nativeName: row.nativeName,
    currency: row.currency,
    enabled: row.enabled,
    sortOrder: String(row.sortOrder),
  };
}

function defaultLocalization(langs: LanguageRecord[]): LocalizationForm {
  const codes = langs.map((l) => l.code);
  const currencyByLocale: Record<string, CurrencyCode> = {};
  for (const l of langs) currencyByLocale[l.code] = l.currency;
  return {
    defaultLocale: 'tr',
    enabledLocales: langs.filter((l) => l.enabled).map((l) => l.code),
    defaultCurrency: 'TRY',
    currencies: [...ALL_CURRENCIES],
    currencyByLocale:
      codes.length > 0
        ? currencyByLocale
        : { tr: 'TRY', en: 'USD', de: 'EUR', fr: 'EUR', es: 'EUR' },
  };
}

function parseLocalization(
  raw: Record<string, unknown>,
  langs: LanguageRecord[],
): LocalizationForm {
  const base = defaultLocalization(langs);
  const codes = langs.map((l) => l.code);
  const enabledFromLangs = langs.filter((l) => l.enabled).map((l) => l.code);
  const enabled = Array.isArray(raw.enabledLocales)
    ? (raw.enabledLocales as string[]).filter((c) => codes.includes(c))
    : enabledFromLangs;
  const currencies = Array.isArray(raw.currencies)
    ? (raw.currencies as string[]).filter((c): c is CurrencyCode =>
        (ALL_CURRENCIES as readonly string[]).includes(c),
      )
    : base.currencies;
  const map = (raw.currencyByLocale || {}) as Record<string, string>;
  const currencyByLocale = { ...base.currencyByLocale };
  for (const l of langs) {
    const cur = map[l.code];
    if (cur && (ALL_CURRENCIES as readonly string[]).includes(cur)) {
      currencyByLocale[l.code] = cur as CurrencyCode;
    } else {
      currencyByLocale[l.code] = l.currency;
    }
  }
  const defaultLocaleRaw = String(raw.defaultLocale || 'tr');
  return {
    defaultLocale: codes.includes(defaultLocaleRaw) ? defaultLocaleRaw : 'tr',
    enabledLocales: enabled.includes('tr')
      ? enabled
      : (['tr', ...enabled] as string[]),
    defaultCurrency: (ALL_CURRENCIES as readonly string[]).includes(
      String(raw.defaultCurrency),
    )
      ? (raw.defaultCurrency as CurrencyCode)
      : 'TRY',
    currencies: currencies.includes('TRY')
      ? currencies
      : (['TRY', ...currencies] as CurrencyCode[]),
    currencyByLocale,
  };
}

function flattenMessages(
  obj: Record<string, unknown>,
  prefix = '',
): { path: string; value: string }[] {
  const rows: { path: string; value: string }[] = [];
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      rows.push(...flattenMessages(val as Record<string, unknown>, path));
    } else if (Array.isArray(val)) {
      val.forEach((item, i) => {
        if (typeof item === 'string') {
          rows.push({ path: `${path}.${i}`, value: item });
        } else if (item && typeof item === 'object') {
          rows.push(
            ...flattenMessages(item as Record<string, unknown>, `${path}.${i}`),
          );
        }
      });
    } else if (typeof val === 'string') {
      rows.push({ path, value: val });
    } else if (val != null) {
      rows.push({ path, value: String(val) });
    }
  }
  return rows;
}

function setPath(
  root: Record<string, unknown>,
  path: string,
  value: string,
): void {
  const parts = path.split('.');
  let cursor: Record<string, unknown> | unknown[] = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const next = parts[i + 1];
    const nextIsIndex = /^\d+$/.test(next);
    if (Array.isArray(cursor)) {
      const idx = Number(part);
      if (cursor[idx] == null || typeof cursor[idx] !== 'object') {
        cursor[idx] = nextIsIndex ? [] : {};
      }
      cursor = cursor[idx] as Record<string, unknown> | unknown[];
    } else {
      if (cursor[part] == null || typeof cursor[part] !== 'object') {
        cursor[part] = nextIsIndex ? [] : {};
      }
      cursor = cursor[part] as Record<string, unknown> | unknown[];
    }
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(cursor)) {
    cursor[Number(last)] = value;
  } else {
    cursor[last] = value;
  }
}

export default function LocaleCurrencyTranslationsPage() {
  const [tab, setTab] = useState<Tab>('locales');
  const [languages, setLanguages] = useState<LanguageRecord[]>([]);
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [availableToAdd, setAvailableToAdd] = useState<CatalogEntry[]>([]);
  const [locForm, setLocForm] = useState<LocalizationForm>(() =>
    defaultLocalization([]),
  );
  const [uiLocales, setUiLocales] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const [editLocale, setEditLocale] = useState('tr');
  const [flatEdits, setFlatEdits] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingCode, setTogglingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddLanguageForm>(() =>
    emptyAddForm([]),
  );
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditLanguageForm | null>(null);
  const [deleteCode, setDeleteCode] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sortedLanguages = useMemo(
    () =>
      [...languages].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code),
      ),
    [languages],
  );

  const localeLabel = useCallback(
    (code: string) => {
      const lang = languages.find((l) => l.code === code);
      return lang?.name || code;
    },
    [languages],
  );

  const applyLanguageMutation = useCallback(
    (res: LanguageMutationResponse) => {
      setLanguages(res.languages);
      setLocForm(parseLocalization(res.localization || {}, res.languages));
      const used = new Set(res.languages.map((l) => l.code));
      setAvailableToAdd(catalog.filter((c) => !used.has(c.code)));
    },
    [catalog],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [langRes, loc, ui] = await Promise.all([
        api<LanguagesAdminResponse>('/cms/admin/languages'),
        api<Record<string, unknown>>('/cms/admin/localization'),
        api<{ locales: Record<string, Record<string, unknown>> }>(
          '/cms/admin/ui-messages',
        ),
      ]);
      setLanguages(langRes.languages);
      setCatalog(langRes.catalog);
      setAvailableToAdd(langRes.availableToAdd);
      setLocForm(parseLocalization(loc || {}, langRes.languages));
      setUiLocales(ui?.locales || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yükleme başarısız');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const codes = sortedLanguages.map((l) => l.code);
    if (codes.length && !codes.includes(editLocale)) {
      setEditLocale(codes[0]);
    }
  }, [sortedLanguages, editLocale]);

  useEffect(() => {
    const tree = uiLocales[editLocale] || {};
    const flat = flattenMessages(tree);
    const map: Record<string, string> = {};
    for (const row of flat) map[row.path] = row.value;
    setFlatEdits(map);
  }, [editLocale, uiLocales]);

  const filteredPaths = useMemo(() => {
    const q = search.trim().toLowerCase();
    const paths = Object.keys(flatEdits).sort();
    if (!q) return paths;
    return paths.filter(
      (p) =>
        p.toLowerCase().includes(q) ||
        (flatEdits[p] || '').toLowerCase().includes(q),
    );
  }, [flatEdits, search]);

  const copyFromOptions = useMemo(
    () => sortedLanguages.map((l) => l.code),
    [sortedLanguages],
  );

  function openAddModal() {
    const form = emptyAddForm(availableToAdd);
    const fromOpts = sortedLanguages.map((l) => l.code);
    form.copyMessagesFrom = fromOpts.includes('en')
      ? 'en'
      : fromOpts[0] || 'en';
    setAddForm(form);
    setAddOpen(true);
  }

  function onAddCodeChange(code: string) {
    const entry =
      availableToAdd.find((c) => c.code === code) ||
      catalog.find((c) => c.code === code);
    setAddForm((f) => ({
      ...f,
      code,
      name: entry?.name || f.name,
      nativeName: entry?.nativeName || f.nativeName,
      currency: entry?.defaultCurrency || f.currency,
    }));
  }

  async function submitAddLanguage(e: FormEvent) {
    e.preventDefault();
    if (!addForm.code) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api<LanguageMutationResponse>('/cms/admin/languages', {
        method: 'POST',
        body: {
          code: addForm.code,
          name: addForm.name,
          nativeName: addForm.nativeName,
          currency: addForm.currency,
          enabled: addForm.enabled,
          copyMessagesFrom: addForm.copyMessagesFrom || 'en',
        },
      });
      applyLanguageMutation(res);
      setAddOpen(false);
      setMessage(`${addForm.name || addForm.code} dili eklendi`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dil eklenemedi');
    } finally {
      setSaving(false);
    }
  }

  function openEditModal(row: LanguageRecord) {
    setEditForm(editFormFromRow(row));
    setEditOpen(true);
  }

  async function submitEditLanguage(e: FormEvent) {
    e.preventDefault();
    if (!editForm) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api<LanguageMutationResponse>(
        `/cms/admin/languages/${editForm.code}`,
        {
          method: 'PATCH',
          body: {
            name: editForm.name,
            nativeName: editForm.nativeName,
            currency: editForm.currency,
            enabled: editForm.enabled,
            sortOrder: Number(editForm.sortOrder),
          },
        },
      );
      applyLanguageMutation(res);
      setEditOpen(false);
      setEditForm(null);
      setMessage(`${editForm.name} güncellendi`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  }

  async function toggleLanguageEnabled(row: LanguageRecord, enabled: boolean) {
    if (row.code === 'tr') return;
    setTogglingCode(row.code);
    setError(null);
    try {
      const res = await api<LanguageMutationResponse>(
        `/cms/admin/languages/${row.code}`,
        { method: 'PATCH', body: { enabled } },
      );
      applyLanguageMutation(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Durum güncellenemedi');
    } finally {
      setTogglingCode(null);
    }
  }

  async function confirmDeleteLanguage() {
    if (!deleteCode) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await api<LanguageMutationResponse>(
        `/cms/admin/languages/${deleteCode}`,
        { method: 'DELETE' },
      );
      applyLanguageMutation(res);
      if (editLocale === deleteCode) {
        const next = res.languages[0]?.code || 'tr';
        setEditLocale(next);
      }
      setDeleteCode(null);
      setMessage('Dil silindi');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi');
    } finally {
      setDeleting(false);
    }
  }

  async function saveLocalization(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const enabled = languages
        .filter((l) => l.enabled)
        .map((l) => l.code);
      const enabledLocales = enabled.includes('tr')
        ? enabled
        : (['tr', ...enabled] as string[]);
      const currencies = locForm.currencies.includes('TRY')
        ? locForm.currencies
        : (['TRY', ...locForm.currencies] as CurrencyCode[]);
      const saved = await api<Record<string, unknown>>(
        '/cms/admin/localization',
        {
          method: 'PATCH',
          body: {
            defaultLocale: locForm.defaultLocale,
            enabledLocales,
            defaultCurrency: locForm.defaultCurrency,
            currencies,
            currencyByLocale: locForm.currencyByLocale,
          },
        },
      );
      setLocForm(parseLocalization(saved || {}, languages));
      setMessage('Para birimi ayarları kaydedildi');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  }

  async function saveUiMessages(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const tree: Record<string, unknown> = structuredClone(
        uiLocales[editLocale] || {},
      );
      for (const [path, value] of Object.entries(flatEdits)) {
        setPath(tree, path, value);
      }
      const saved = await api<{
        locales: Record<string, Record<string, unknown>>;
      }>('/cms/admin/ui-messages', {
        method: 'PATCH',
        body: { locale: editLocale, messages: tree },
      });
      setUiLocales(saved.locales || {});
      setMessage(
        `${localeLabel(editLocale)} UI çevirileri kaydedildi (${Object.keys(flatEdits).length} anahtar)`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Çeviri kaydı başarısız');
    } finally {
      setSaving(false);
    }
  }

  function toggleCurrency(code: CurrencyCode) {
    if (code === 'TRY') return;
    setLocForm((f) => {
      const on = f.currencies.includes(code);
      return {
        ...f,
        currencies: on
          ? f.currencies.filter((c) => c !== code)
          : [...f.currencies, code],
      };
    });
  }

  if (loading) {
    return <p className="text-sm text-muted">Yükleniyor…</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-display text-2xl text-ink">
          Dil, Para Birimi & Çeviriler
        </h1>
        <p className="mt-1 text-sm text-muted">
          Mağazada açık dilleri, para birimlerini ve arayüz çeviri metinlerini
          buradan kontrol edin. Değişiklikler API üzerinden saklanır; vitrin{' '}
          <code className="rounded bg-surface-high px-1 text-xs">
            /cms/ui-messages
          </code>{' '}
          ve localization ayarından okur.
        </p>
      </header>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['locales', 'Diller'],
            ['currencies', 'Para birimleri'],
            ['ui', 'UI çevirileri'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              tab === id
                ? 'bg-accent text-white'
                : 'border border-border-muted bg-surface text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'locales' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {sortedLanguages.length} yapılandırılmış dil
            </p>
            <button
              type="button"
              onClick={openAddModal}
              disabled={availableToAdd.length === 0}
              className="admin-btn admin-btn-primary disabled:opacity-50"
            >
              Dil ekle
            </button>
          </div>
          {availableToAdd.length === 0 ? (
            <p className="text-xs text-muted">
              Sistem havuzundaki tüm diller zaten ekli.
            </p>
          ) : null}

          <DataTable
            rows={sortedLanguages}
            rowKey={(r) => r.code}
            emptyMessage="Henüz dil tanımı yok"
            columns={[
              {
                key: 'code',
                header: 'Kod',
                render: (r) => (
                  <span className="mono text-xs uppercase text-muted">
                    {r.code}
                  </span>
                ),
              },
              {
                key: 'name',
                header: 'Ad',
                render: (r) => (
                  <span className="font-medium text-ink">{r.name}</span>
                ),
              },
              {
                key: 'nativeName',
                header: 'Yerel ad',
                render: (r) => r.nativeName,
              },
              {
                key: 'currency',
                header: 'Para birimi',
                render: (r) => r.currency,
              },
              {
                key: 'enabled',
                header: 'Aktif',
                render: (r) => (
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={r.enabled}
                      disabled={
                        r.code === 'tr' || togglingCode === r.code
                      }
                      onChange={(e) =>
                        void toggleLanguageEnabled(r, e.target.checked)
                      }
                    />
                    {togglingCode === r.code ? (
                      <span className="text-xs text-muted">…</span>
                    ) : null}
                  </label>
                ),
              },
              {
                key: 'sortOrder',
                header: 'Sıra',
                render: (r) => (
                  <span className="mono text-xs">{r.sortOrder}</span>
                ),
              },
              {
                key: 'actions',
                header: '',
                className: 'text-right',
                render: (r) => (
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(r)}
                      className="admin-btn admin-btn-ghost text-xs"
                    >
                      Düzenle
                    </button>
                    {r.code !== 'tr' ? (
                      <button
                        type="button"
                        onClick={() => setDeleteCode(r.code)}
                        className="admin-btn admin-btn-ghost border-danger/40 text-xs text-danger"
                      >
                        Sil
                      </button>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />

          <p className="text-xs text-muted">
            Türkçe (tr) her zaman aktiftir ve silinemez. Kapalı diller vitrin
            dil seçicisinde gizlenir.
          </p>
        </section>
      )}

      {tab === 'currencies' && (
        <form onSubmit={saveLocalization} className="space-y-5">
          <fieldset className="space-y-4 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
            <legend className="mono px-2 text-xs uppercase text-muted">
              Para birimleri
            </legend>
            <p className="text-xs text-muted">
              TRY her zaman açıktır (TR mağaza). Diğerlerini vitrin seçicisinde
              gösterebilir veya gizleyebilirsiniz.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {ALL_CURRENCIES.map((code) => {
                const enabled = locForm.currencies.includes(code);
                return (
                  <label
                    key={code}
                    className="flex items-center gap-3 rounded-lg border border-border-muted bg-surface-high px-3 py-2.5"
                  >
                    <input
                      type="checkbox"
                      checked={enabled}
                      disabled={code === 'TRY'}
                      onChange={() => toggleCurrency(code)}
                    />
                    <span className="text-sm font-medium text-ink">
                      {CURRENCY_LABELS[code]}
                    </span>
                  </label>
                );
              })}
            </div>
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                Varsayılan para birimi
              </span>
              <select
                value={locForm.defaultCurrency}
                onChange={(e) =>
                  setLocForm((f) => ({
                    ...f,
                    defaultCurrency: e.target.value as CurrencyCode,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              >
                {locForm.currencies.map((code) => (
                  <option key={code} value={code}>
                    {CURRENCY_LABELS[code]}
                  </option>
                ))}
              </select>
            </label>
            <div className="space-y-2">
              <p className="mono text-[10px] uppercase text-muted">
                Dil → varsayılan para birimi
              </p>
              {sortedLanguages.map((lang) => (
                <label
                  key={lang.code}
                  className="flex flex-wrap items-center gap-2 text-sm"
                >
                  <span className="w-36 font-medium">
                    {lang.name}{' '}
                    <span className="mono text-[10px] text-muted">
                      ({lang.code})
                    </span>
                  </span>
                  <select
                    value={locForm.currencyByLocale[lang.code] || lang.currency}
                    onChange={(e) =>
                      setLocForm((f) => ({
                        ...f,
                        currencyByLocale: {
                          ...f.currencyByLocale,
                          [lang.code]: e.target.value as CurrencyCode,
                        },
                      }))
                    }
                    className="rounded-lg border border-border-muted bg-surface-high px-3 py-1.5"
                  >
                    {ALL_CURRENCIES.map((cur) => (
                      <option
                        key={cur}
                        value={cur}
                        disabled={!locForm.currencies.includes(cur)}
                      >
                        {cur}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={saving}
            className="admin-btn admin-btn-primary disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor…' : 'Para birimi ayarlarını kaydet'}
          </button>
        </form>
      )}

      {tab === 'ui' && (
        <form onSubmit={saveUiMessages} className="space-y-4">
          <fieldset className="space-y-3 rounded-xl border border-border-muted bg-surface p-5 shadow-sm">
            <legend className="mono px-2 text-xs uppercase text-muted">
              UI mesaj ağacı (next-intl)
            </legend>
            <p className="text-xs text-muted">
              Veritabanındaki{' '}
              <code className="rounded bg-surface-high px-1">ui_messages</code>{' '}
              kaydını düzenlersiniz. Kaydettiğiniz dil için tüm anahtarlar API
              üzerinden vitrine yansır.
            </p>
            <div className="flex flex-wrap gap-2">
              {sortedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setEditLocale(lang.code)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase ${
                    editLocale === lang.code
                      ? 'bg-accent text-white'
                      : 'border border-border-muted bg-surface-high text-muted'
                  }`}
                >
                  {lang.code} · {lang.name}
                </button>
              ))}
            </div>
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                Ara (anahtar veya metin)
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="örn. checkout.paySecure"
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              />
            </label>
            <p className="text-xs text-muted">
              {filteredPaths.length} / {Object.keys(flatEdits).length} anahtar
              gösteriliyor
            </p>
            <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-lg border border-border-muted bg-surface-high p-3">
              {filteredPaths.length === 0 ? (
                <p className="text-sm text-muted">
                  Bu dil için çeviri kaydı yok. Yeni dil eklerken başka dilden
                  kopyalayabilir veya{' '}
                  <code className="text-xs">yarn seed</code> çalıştırın.
                </p>
              ) : (
                filteredPaths.map((path) => (
                  <label key={path} className="block text-sm">
                    <span className="mono text-[10px] text-muted">{path}</span>
                    {(flatEdits[path] || '').length > 80 ? (
                      <textarea
                        rows={3}
                        value={flatEdits[path] || ''}
                        onChange={(e) =>
                          setFlatEdits((prev) => ({
                            ...prev,
                            [path]: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-border-muted bg-surface px-3 py-2"
                      />
                    ) : (
                      <input
                        value={flatEdits[path] || ''}
                        onChange={(e) =>
                          setFlatEdits((prev) => ({
                            ...prev,
                            [path]: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-border-muted bg-surface px-3 py-2"
                      />
                    )}
                  </label>
                ))
              )}
            </div>
          </fieldset>
          <button
            type="submit"
            disabled={saving || Object.keys(flatEdits).length === 0}
            className="admin-btn admin-btn-primary disabled:opacity-50"
          >
            {saving
              ? 'Kaydediliyor…'
              : `${localeLabel(editLocale)} çevirilerini kaydet`}
          </button>
        </form>
      )}

      <AdminFormPanel
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Dil ekle"
        description="Sistem havuzundan yeni bir vitrin dili ekleyin."
        footer={
          <>
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="admin-btn admin-btn-ghost"
            >
              İptal
            </button>
            <button
              type="submit"
              form="add-language-form"
              disabled={saving || !addForm.code}
              className="admin-btn admin-btn-primary disabled:opacity-50"
            >
              {saving ? 'Ekleniyor…' : 'Ekle'}
            </button>
          </>
        }
      >
        <form
          id="add-language-form"
          onSubmit={submitAddLanguage}
          className="grid gap-4 sm:grid-cols-2"
        >
          <label className="block text-sm sm:col-span-2">
            <span className="mono text-[10px] uppercase text-muted">Dil</span>
            <select
              value={addForm.code}
              onChange={(e) => onAddCodeChange(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
            >
              {availableToAdd.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name} ({c.nativeName})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Panel adı
            </span>
            <input
              value={addForm.name}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, name: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Yerel ad
            </span>
            <input
              value={addForm.nativeName}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, nativeName: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              Para birimi
            </span>
            <select
              value={addForm.currency}
              onChange={(e) =>
                setAddForm((f) => ({
                  ...f,
                  currency: e.target.value as CurrencyCode,
                }))
              }
              className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
            >
              {ALL_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {CURRENCY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mono text-[10px] uppercase text-muted">
              UI mesajlarını kopyala
            </span>
            <select
              value={addForm.copyMessagesFrom}
              onChange={(e) =>
                setAddForm((f) => ({
                  ...f,
                  copyMessagesFrom: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
            >
              {copyFromOptions.map((code) => (
                <option key={code} value={code}>
                  {code} — {localeLabel(code)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-3 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={addForm.enabled}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, enabled: e.target.checked }))
              }
            />
            <span>Vitrinde aktif olarak başlat</span>
          </label>
        </form>
      </AdminFormPanel>

      <AdminFormPanel
        open={editOpen && editForm !== null}
        onClose={() => {
          setEditOpen(false);
          setEditForm(null);
        }}
        title={editForm ? `${editForm.name} — düzenle` : 'Dil düzenle'}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setEditOpen(false);
                setEditForm(null);
              }}
              className="admin-btn admin-btn-ghost"
            >
              İptal
            </button>
            <button
              type="submit"
              form="edit-language-form"
              disabled={saving || !editForm}
              className="admin-btn admin-btn-primary disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </>
        }
      >
        {editForm ? (
          <form
            id="edit-language-form"
            onSubmit={submitEditLanguage}
            className="grid gap-4 sm:grid-cols-2"
          >
            <p className="mono text-xs uppercase text-muted sm:col-span-2">
              Kod: {editForm.code}
            </p>
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                Panel adı
              </span>
              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) =>
                    f ? { ...f, name: e.target.value } : f,
                  )
                }
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                Yerel ad
              </span>
              <input
                value={editForm.nativeName}
                onChange={(e) =>
                  setEditForm((f) =>
                    f ? { ...f, nativeName: e.target.value } : f,
                  )
                }
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                Para birimi
              </span>
              <select
                value={editForm.currency}
                disabled={editForm.code === 'tr'}
                onChange={(e) =>
                  setEditForm((f) =>
                    f
                      ? { ...f, currency: e.target.value as CurrencyCode }
                      : f,
                  )
                }
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2 disabled:opacity-60"
              >
                {ALL_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {CURRENCY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">Sıra</span>
              <input
                type="number"
                value={editForm.sortOrder}
                onChange={(e) =>
                  setEditForm((f) =>
                    f ? { ...f, sortOrder: e.target.value } : f,
                  )
                }
                className="mt-1 w-full rounded-lg border border-border-muted bg-surface-high px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-3 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={editForm.enabled}
                disabled={editForm.code === 'tr'}
                onChange={(e) =>
                  setEditForm((f) =>
                    f ? { ...f, enabled: e.target.checked } : f,
                  )
                }
              />
              <span>Vitrinde aktif</span>
            </label>
          </form>
        ) : null}
      </AdminFormPanel>

      <ConfirmDialog
        open={deleteCode !== null}
        title="Dili sil"
        description={
          deleteCode
            ? `${localeLabel(deleteCode)} (${deleteCode}) dilini kaldırmak istediğinize emin misiniz? UI çevirileri veritabanında kalabilir.`
            : undefined
        }
        confirmLabel="Sil"
        loading={deleting}
        onCancel={() => setDeleteCode(null)}
        onConfirm={() => void confirmDeleteLanguage()}
      />
    </div>
  );
}
