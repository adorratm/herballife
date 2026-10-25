export type LocaleCurrencyCode = 'TRY' | 'USD' | 'EUR' | 'GBP';

/** Vitrin + panelde kullanılabilir dil kodları (next-intl ile uyumlu havuz). */
export const STORE_LOCALE_CODES = [
  'tr',
  'en',
  'de',
  'fr',
  'es',
  'it',
  'nl',
  'pt',
  'pl',
  'ru',
  'az',
] as const;

export type StoreLocaleCode = (typeof STORE_LOCALE_CODES)[number];

export type LanguageRecord = {
  code: StoreLocaleCode;
  /** Panelde görünen ad (TR arayüz) */
  name: string;
  /** Dilin kendi adıyla */
  nativeName: string;
  enabled: boolean;
  currency: LocaleCurrencyCode;
  sortOrder: number;
};

export type LocaleCatalogEntry = {
  code: StoreLocaleCode;
  name: string;
  nativeName: string;
  defaultCurrency: LocaleCurrencyCode;
};

export const LOCALE_CATALOG: LocaleCatalogEntry[] = [
  { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe', defaultCurrency: 'TRY' },
  { code: 'en', name: 'İngilizce', nativeName: 'English', defaultCurrency: 'USD' },
  { code: 'de', name: 'Almanca', nativeName: 'Deutsch', defaultCurrency: 'EUR' },
  { code: 'fr', name: 'Fransızca', nativeName: 'Français', defaultCurrency: 'EUR' },
  { code: 'es', name: 'İspanyolca', nativeName: 'Español', defaultCurrency: 'EUR' },
  { code: 'it', name: 'İtalyanca', nativeName: 'Italiano', defaultCurrency: 'EUR' },
  { code: 'nl', name: 'Hollandaca', nativeName: 'Nederlands', defaultCurrency: 'EUR' },
  { code: 'pt', name: 'Portekizce', nativeName: 'Português', defaultCurrency: 'EUR' },
  { code: 'pl', name: 'Lehçe', nativeName: 'Polski', defaultCurrency: 'EUR' },
  { code: 'ru', name: 'Rusça', nativeName: 'Русский', defaultCurrency: 'USD' },
  { code: 'az', name: 'Azerbaycan Türkçesi', nativeName: 'Azərbaycan', defaultCurrency: 'USD' },
];

export function isStoreLocaleCode(value: string): value is StoreLocaleCode {
  return (STORE_LOCALE_CODES as readonly string[]).includes(value);
}

export function catalogEntry(code: string): LocaleCatalogEntry | undefined {
  return LOCALE_CATALOG.find((e) => e.code === code);
}

export function defaultLanguages(): LanguageRecord[] {
  return LOCALE_CATALOG.filter((e) =>
    ['tr', 'en', 'de', 'fr', 'es'].includes(e.code),
  ).map((e, i) => ({
    code: e.code,
    name: e.name,
    nativeName: e.nativeName,
    enabled: true,
    currency: e.defaultCurrency,
    sortOrder: i,
  }));
}

export function normalizeLanguages(
  raw: unknown,
): LanguageRecord[] {
  const list = Array.isArray(raw) ? raw : [];
  const byCode = new Map<string, LanguageRecord>();

  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const code = String(row.code || '')
      .toLowerCase()
      .split('-')[0];
    if (!isStoreLocaleCode(code)) continue;
    const cat = catalogEntry(code)!;
    const currencyRaw = String(row.currency || cat.defaultCurrency).toUpperCase();
    const currency = (['TRY', 'USD', 'EUR', 'GBP'].includes(currencyRaw)
      ? currencyRaw
      : cat.defaultCurrency) as LocaleCurrencyCode;
    byCode.set(code, {
      code,
      name: String(row.name || cat.name).trim() || cat.name,
      nativeName: String(row.nativeName || cat.nativeName).trim() || cat.nativeName,
      enabled: row.enabled !== false,
      currency,
      sortOrder: Number.isFinite(Number(row.sortOrder))
        ? Number(row.sortOrder)
        : byCode.size,
    });
  }

  // TR her zaman var ve açık
  const trCat = catalogEntry('tr')!;
  const tr = byCode.get('tr') || {
    code: 'tr' as const,
    name: trCat.name,
    nativeName: trCat.nativeName,
    enabled: true,
    currency: 'TRY' as const,
    sortOrder: 0,
  };
  tr.enabled = true;
  tr.currency = 'TRY';
  byCode.set('tr', tr);

  if (byCode.size === 1) {
    // Hiç dil yoksa varsayılan set
    return defaultLanguages();
  }

  return [...byCode.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code));
}

export function languagesToLocalizationFields(languages: LanguageRecord[]) {
  const enabled = languages.filter((l) => l.enabled).map((l) => l.code);
  const currencyByLocale = Object.fromEntries(
    languages.map((l) => [l.code, l.currency]),
    ) as Record<string, LocaleCurrencyCode>;
  return {
    languages,
    enabledLocales: enabled.includes('tr') ? enabled : (['tr', ...enabled] as string[]),
    currencyByLocale,
    defaultLocale: 'tr' as const,
  };
}
