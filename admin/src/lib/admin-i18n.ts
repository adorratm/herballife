'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

export const ADMIN_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'] as const;
export type AdminCurrency = (typeof ADMIN_CURRENCIES)[number];
export type ExtraAdminCurrency = Exclude<AdminCurrency, 'TRY'>;

export function isExtraAdminCurrency(
  value: string,
): value is ExtraAdminCurrency {
  return value === 'USD' || value === 'EUR' || value === 'GBP';
}

export type AdminLanguage = {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  currency: AdminCurrency;
  sortOrder: number;
};

export type LocaleTab = { key: string; label: string };

type LanguagesAdminResponse = {
  languages: AdminLanguage[];
};

const FALLBACK_EXTRA_LOCALES: LocaleTab[] = [
  { key: 'en', label: 'EN' },
  { key: 'de', label: 'DE' },
  { key: 'fr', label: 'FR' },
  { key: 'es', label: 'ES' },
];

const FALLBACK_CURRENCIES: AdminCurrency[] = ['TRY', 'USD', 'EUR', 'GBP'];

function isAdminCurrency(value: string): value is AdminCurrency {
  return (ADMIN_CURRENCIES as readonly string[]).includes(value);
}

export function localeTabFromCode(code: string, name?: string): LocaleTab {
  return {
    key: code,
    label: (name || code).slice(0, 2).toUpperCase() || code.toUpperCase(),
  };
}

/** Aktif dillerden TR dışındakiler → çeviri sekmeleri */
export function enabledExtraLocaleTabs(
  languages: AdminLanguage[],
): LocaleTab[] {
  return [...languages]
    .filter((l) => l.enabled && l.code !== 'tr')
    .sort(
      (a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code),
    )
    .map((l) => ({
      key: l.code,
      label: l.code.toUpperCase(),
    }));
}

export function parseEnabledCurrencies(
  localization: Record<string, unknown> | null | undefined,
): AdminCurrency[] {
  const raw = localization?.currencies;
  const list = Array.isArray(raw)
    ? raw.filter((c): c is AdminCurrency => typeof c === 'string' && isAdminCurrency(c))
    : [...FALLBACK_CURRENCIES];
  return list.includes('TRY') ? list : (['TRY', ...list] as AdminCurrency[]);
}

/** Pasif dil çevirilerini koruyarak aktif dil payload’ını birleştir */
export function mergeTranslations<T>(
  existing: Record<string, T> | null | undefined,
  nextActive: Record<string, T>,
  activeKeys: string[],
): Record<string, T> {
  const out: Record<string, T> = { ...(existing || {}) };
  const active = new Set(activeKeys);
  for (const key of Object.keys(out)) {
    if (active.has(key)) delete out[key];
  }
  return { ...out, ...nextActive };
}

export function ensureLocaleMap<T>(
  source: Partial<Record<string, T>> | null | undefined,
  keys: string[],
  empty: () => T,
): Record<string, T> {
  const out: Record<string, T> = {};
  for (const key of keys) {
    out[key] = source?.[key] ? ({ ...empty(), ...source[key] } as T) : empty();
  }
  return out;
}

export type AdminI18nState = {
  loading: boolean;
  languages: AdminLanguage[];
  localeTabs: LocaleTab[];
  enabledCurrencies: AdminCurrency[];
  /** TRY hariç gösterilecek paralar */
  extraCurrencies: ExtraAdminCurrency[];
  reload: () => Promise<void>;
};

export function useAdminI18n(): AdminI18nState {
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<AdminLanguage[]>([]);
  const [enabledCurrencies, setEnabledCurrencies] =
    useState<AdminCurrency[]>(FALLBACK_CURRENCIES);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [langRes, loc] = await Promise.all([
        api<LanguagesAdminResponse>('/cms/admin/languages'),
        api<Record<string, unknown>>('/cms/admin/localization').catch(
          () => ({}) as Record<string, unknown>,
        ),
      ]);
      setLanguages(Array.isArray(langRes?.languages) ? langRes.languages : []);
      setEnabledCurrencies(parseEnabledCurrencies(loc));
    } catch {
      setLanguages(
        FALLBACK_EXTRA_LOCALES.map((t, i) => ({
          code: t.key,
          name: t.label,
          nativeName: t.label,
          enabled: true,
          currency: 'USD' as AdminCurrency,
          sortOrder: i + 1,
        })),
      );
      setEnabledCurrencies(FALLBACK_CURRENCIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const localeTabs = useMemo(
    () => enabledExtraLocaleTabs(languages),
    [languages],
  );

  const extraCurrencies = useMemo(
    () => enabledCurrencies.filter(isExtraAdminCurrency),
    [enabledCurrencies],
  );

  return {
    loading,
    languages,
    localeTabs,
    enabledCurrencies,
    extraCurrencies,
    reload,
  };
}
