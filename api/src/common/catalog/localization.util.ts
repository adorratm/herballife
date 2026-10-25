import { BadRequestException } from '@nestjs/common';
import {
  DEFAULT_CURRENCY_BY_LOCALE,
  type BlogTranslations,
  type CampaignTranslations,
  type CategoryTranslations,
  type ImagesByLocale,
  type LocaleCode,
  MANDATORY_LOCALES,
  type MandatoryLocale,
  type ProductPrices,
  type ProductTranslations,
  SUPPORTED_CURRENCIES,
  SUPPORTED_LOCALES,
  type SupportedCurrency,
} from '@common/catalog/localization.types';

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNavLinkArray(
  value: unknown,
): value is Array<{ href: string; label: string }> {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isPlainRecord(item) &&
        typeof item.href === 'string' &&
        typeof item.label === 'string',
    )
  );
}

function deepMergeLocalizedRecord(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const [key, overlayVal] of Object.entries(overlay)) {
    if (key === 'translations') continue;
    const baseVal = result[key];
    if (isNavLinkArray(overlayVal)) {
      result[key] = overlayVal.map((link) => ({ ...link }));
    } else if (Array.isArray(overlayVal)) {
      result[key] = overlayVal;
    } else if (isPlainRecord(overlayVal) && isPlainRecord(baseVal)) {
      result[key] = deepMergeLocalizedRecord(baseVal, overlayVal);
    } else {
      result[key] = overlayVal;
    }
  }
  return result;
}

/**
 * Metin alanları: çeviri yokken TR gövdeyi “yerelleşmiş” gibi döndürme.
 * Yapısal alanlar (URL, href, boolean, sayı, görsel) korunur.
 */
function isStructuralCmsValue(key: string, value: unknown): boolean {
  if (
    key.endsWith('Url') ||
    key.endsWith('Href') ||
    key.endsWith('Image') ||
    key === 'imageUrl' ||
    key === 'href' ||
    key === 'linkHref' ||
    key === 'showContactAside'
  ) {
    return true;
  }
  if (typeof value === 'boolean' || typeof value === 'number') return true;
  if (isPlainRecord(value)) {
    const keys = Object.keys(value);
    return (
      keys.includes('href') ||
      keys.includes('imageUrl') ||
      keys.includes('url')
    );
  }
  return false;
}

function structuralCmsOnly(
  base: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { _cmsUntranslated: true };
  for (const [key, value] of Object.entries(base)) {
    if (isStructuralCmsValue(key, value)) {
      if (isPlainRecord(value) && typeof value.label === 'string') {
        const { label: _label, ...rest } = value;
        out[key] = Object.keys(rest).length ? rest : value;
        if (typeof (out[key] as Record<string, unknown>).href === 'string') {
          // keep href-only CTA so next-intl labels win
          out[key] = { href: (value as { href: string }).href };
        }
      } else {
        out[key] = value;
      }
    }
  }
  return out;
}

/** CMS site ayarı / içerik jsonb — TR kök, diğer diller `translations[locale]`. */
export function resolveLocalizedRecord(
  value: Record<string, unknown>,
  locale: LocaleCode,
  opts?: {
    /**
     * Çeviri bloğu yokken:
     * - base: TR kökü döndür (site ayarları)
     * - structural: yalnızca URL/href/boolean (metin sayfaları → next-intl fallback)
     */
    missingLocale?: 'base' | 'structural';
  },
): Record<string, unknown> {
  if (locale === 'tr') {
    const { translations: _t, ...rest } = value;
    return rest;
  }
  const translations = value.translations as
    | Partial<Record<LocaleCode, Record<string, unknown>>>
    | undefined;
  const localeBlock = translations?.[locale];
  const { translations: _t, ...base } = value;
  if (!localeBlock || !isPlainRecord(localeBlock)) {
    return opts?.missingLocale === 'structural'
      ? structuralCmsOnly(base)
      : { ...base };
  }
  return deepMergeLocalizedRecord(base, localeBlock);
}

export function mergeCmsSettingPreserveTranslations(
  existing: Record<string, unknown> | null | undefined,
  incoming: Record<string, unknown>,
): Record<string, unknown> {
  const prev = existing && isPlainRecord(existing) ? existing : {};
  const { translations: incomingTranslations, ...incomingFields } = incoming;
  const merged: Record<string, unknown> = { ...prev, ...incomingFields };
  if (
    isPlainRecord(incomingTranslations) &&
    Object.keys(incomingTranslations).length > 0
  ) {
    merged.translations = incomingTranslations;
  } else if (isPlainRecord(prev.translations)) {
    merged.translations = prev.translations;
  }
  return merged;
}

export function normalizeLocale(raw?: string | null): LocaleCode {
  const code = (raw || 'tr').toLowerCase().split('-')[0];
  return SUPPORTED_LOCALES.includes(code as LocaleCode)
    ? (code as LocaleCode)
    : 'tr';
}

export function normalizeCurrency(
  raw?: string | null,
  locale: LocaleCode = 'tr',
): SupportedCurrency {
  const upper = (raw || '').toUpperCase();
  if (SUPPORTED_CURRENCIES.includes(upper as SupportedCurrency)) {
    return upper as SupportedCurrency;
  }
  return DEFAULT_CURRENCY_BY_LOCALE[locale];
}

export function assertRequiredLocales<T extends Record<string, unknown>>(
  translations: Partial<Record<MandatoryLocale, T>> | null | undefined,
  fields: (keyof T & string)[],
  label = 'Çeviri',
): void {
  for (const loc of MANDATORY_LOCALES) {
    const block = translations?.[loc];
    if (!block || typeof block !== 'object') {
      throw new BadRequestException(`${label}: ${loc} çevirisi zorunludur`);
    }
    for (const field of fields) {
      const val = block[field];
      if (typeof val !== 'string' || !val.trim()) {
        throw new BadRequestException(
          `${label}: ${loc}.${String(field)} zorunludur`,
        );
      }
    }
  }
}

export function assertImagesByLocaleWhenNotShared(
  useSharedImage: boolean | undefined,
  imageUrl: string | null | undefined,
  imagesByLocale: ImagesByLocale | null | undefined,
): void {
  if (useSharedImage !== false) return;
  for (const loc of MANDATORY_LOCALES) {
    const url = imagesByLocale?.[loc]?.trim();
    if (!url) {
      throw new BadRequestException(
        `Ortak görsel kapalıyken ${loc} görsel URL zorunludur`,
      );
    }
  }
  if (!imageUrl?.trim() && !imagesByLocale?.tr?.trim()) {
    throw new BadRequestException('TR görsel (imageUrl) zorunludur');
  }
}

export function resolveLocalizedImage(
  imageUrl: string | null | undefined,
  imagesByLocale: ImagesByLocale | null | undefined,
  useSharedImage: boolean | undefined,
  locale: LocaleCode,
): string | null {
  const base = imageUrl?.trim() || null;
  if (useSharedImage !== false) {
    return base;
  }
  return imagesByLocale?.[locale]?.trim() || base;
}

/** Boş prices ise basePrice → TRY; seçilen para birimi için fiyat döner. */
/** 1 TRY = X foreign (yaklaşık; panel localization.exchangeRates ile override edilebilir) */
export const DEFAULT_FX_FROM_TRY: Record<SupportedCurrency, number> = {
  TRY: 1,
  USD: 0.029,
  EUR: 0.027,
  GBP: 0.023,
};

let runtimeFxFromTry: Record<SupportedCurrency, number> = {
  ...DEFAULT_FX_FROM_TRY,
};

export function setRuntimeExchangeRatesFromTry(
  rates: Partial<Record<SupportedCurrency, number>> | null | undefined,
) {
  runtimeFxFromTry = { ...DEFAULT_FX_FROM_TRY };
  if (!rates) return;
  for (const key of SUPPORTED_CURRENCIES) {
    const n = Number(rates[key]);
    if (Number.isFinite(n) && n > 0) {
      runtimeFxFromTry[key] = n;
    }
  }
}

export function convertTryToCurrency(
  amountTry: number,
  currency: SupportedCurrency,
): number {
  if (!Number.isFinite(amountTry)) return 0;
  if (currency === 'TRY') return amountTry;
  const rate = runtimeFxFromTry[currency] || DEFAULT_FX_FROM_TRY[currency];
  return amountTry * rate;
}

/** TR kök + zorunlu diller (+ mağaza dilleri EN’ye düşer) için slug haritası. */
export function buildLocaleSlugs(
  baseSlug: string,
  translations?:
    | ProductTranslations
    | CategoryTranslations
    | BlogTranslations
    | null,
): Record<string, string> {
  const root = (baseSlug || '').trim().toLowerCase();
  const en =
    (translations as ProductTranslations | undefined)?.en?.slug?.trim() ||
    root;
  const out: Record<string, string> = { tr: root };
  for (const loc of MANDATORY_LOCALES) {
    const s = translations?.[loc]?.slug?.trim();
    out[loc] = (s || en || root).toLowerCase();
  }
  for (const loc of SUPPORTED_LOCALES) {
    if (!out[loc]) out[loc] = en || root;
  }
  return out;
}

/** Herhangi bir dildeki slug ile eşleşme (dil değişiminde 404 önler). */
export function sqlMatchSlugAnyLocale(
  alias: string,
  param = 'slug',
): string {
  const parts = [
    `${alias}.slug = :${param}`,
    ...MANDATORY_LOCALES.map(
      (loc) =>
        `${alias}.translations -> '${loc}' ->> 'slug' = :${param}`,
    ),
  ];
  return `(${parts.join(' OR ')})`;
}

export function resolveProductPrices(
  basePrice: string | number,
  prices: ProductPrices | null | undefined,
  currency: SupportedCurrency,
): string {
  const map: ProductPrices = { ...(prices || {}) };
  const baseNum = Number(basePrice);
  if (!Number.isFinite(baseNum)) return '0.00';

  if (map.TRY == null || map.TRY === 0) {
    map.TRY = baseNum;
  }

  const picked = map[currency];
  if (picked != null && Number.isFinite(Number(picked)) && Number(picked) > 0) {
    return Number(picked).toFixed(2);
  }
  // Eksik currency fiyatı → TRY’den kur ile çevir (aynı rakamı farklı sembolle gösterme)
  const tryAmount = Number(map.TRY);
  if (Number.isFinite(tryAmount)) {
    return convertTryToCurrency(tryAmount, currency).toFixed(2);
  }
  return convertTryToCurrency(baseNum, currency).toFixed(2);
}

export function ensureProductPrices(
  basePrice: string | number,
  prices: ProductPrices | null | undefined,
): ProductPrices {
  const map: ProductPrices = { ...(prices || {}) };
  const baseNum = Number(basePrice);
  if (
    (map.TRY == null || map.TRY === 0) &&
    Number.isFinite(baseNum) &&
    baseNum > 0
  ) {
    map.TRY = baseNum;
  }
  return map;
}

function pickTranslationBlock<T extends Record<string, unknown>>(
  translations: Partial<Record<string, T>> | null | undefined,
  locale: LocaleCode,
): T | undefined {
  if (!translations || locale === 'tr') return undefined;
  const direct = translations[locale];
  if (direct && typeof direct === 'object') return direct;
  // Mağaza dilleri (it/nl/…) için EN yedeği
  const en = translations.en;
  if (en && typeof en === 'object') return en;
  return undefined;
}

export function applyProductLocale<
  T extends {
    slug: string;
    name: string;
    description: string;
    shortDescription?: string | null;
    badge?: string | null;
    translations?: ProductTranslations | null;
  },
>(product: T, locale: LocaleCode): T {
  if (locale === 'tr') {
    return product;
  }
  const block = pickTranslationBlock(
    product.translations as Partial<Record<string, Record<string, unknown>>>,
    locale,
  ) as ProductTranslations[MandatoryLocale] | undefined;
  if (!block) {
    // Çeviri yoksa TR köke düş (boş kart / TR sızıntısından iyidir)
    return product;
  }
  const localizedSlug = block.slug?.trim();
  return {
    ...product,
    slug: localizedSlug || product.slug,
    name: block.name?.trim() || product.name,
    description: block.description?.trim() || product.description,
    shortDescription:
      block.shortDescription?.trim() || product.shortDescription || '',
    badge: block.badge?.trim() || product.badge || null,
  };
}

export function applyCategoryLocale<
  T extends {
    slug: string;
    name: string;
    description?: string | null;
    translations?: CategoryTranslations | null;
  },
>(category: T, locale: LocaleCode): T & { localeSlugs: Record<string, string> } {
  const localeSlugs = buildLocaleSlugs(category.slug, category.translations);
  if (locale === 'tr') {
    return { ...category, localeSlugs };
  }
  const block = pickTranslationBlock(
    category.translations as Partial<Record<string, Record<string, unknown>>>,
    locale,
  ) as CategoryTranslations[MandatoryLocale] | undefined;
  if (!block) {
    return { ...category, localeSlugs };
  }
  const localizedSlug = block.slug?.trim();
  return {
    ...category,
    slug: localizedSlug || category.slug,
    name: block.name?.trim() || category.name,
    description: block.description?.trim() || category.description || '',
    localeSlugs,
  };
}

export function applyCampaignLocale<
  T extends {
    name: string;
    headline?: string | null;
    badge?: string | null;
    imageUrl?: string | null;
    translations?: CampaignTranslations | null;
    imagesByLocale?: ImagesByLocale | null;
    useSharedImage?: boolean;
  },
>(campaign: T, locale: LocaleCode): T {
  const imageUrl = resolveLocalizedImage(
    campaign.imageUrl,
    campaign.imagesByLocale,
    campaign.useSharedImage ?? true,
    locale,
  );
  if (locale === 'tr') {
    return { ...campaign, imageUrl };
  }
  const block = pickTranslationBlock(
    campaign.translations as Partial<Record<string, Record<string, unknown>>>,
    locale,
  ) as CampaignTranslations[MandatoryLocale] | undefined;
  if (!block) {
    return { ...campaign, imageUrl };
  }
  return {
    ...campaign,
    name: block.name?.trim() || campaign.name,
    headline: block.headline?.trim() || campaign.headline || '',
    badge: block.badge?.trim() || campaign.badge || null,
    imageUrl,
  };
}

export function applyBlogLocale<
  T extends {
    slug: string;
    title: string;
    excerpt?: string | null;
    content: string;
    coverImageUrl?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    translations?: BlogTranslations | null;
    imagesByLocale?: ImagesByLocale | null;
    useSharedImage?: boolean;
  },
>(
  post: T,
  locale: LocaleCode,
): T & { localeSlugs: Record<string, string> } {
  const localeSlugs = buildLocaleSlugs(post.slug, post.translations);
  const coverImageUrl = resolveLocalizedImage(
    post.coverImageUrl,
    post.imagesByLocale,
    post.useSharedImage ?? true,
    locale,
  );
  if (locale === 'tr') {
    return { ...post, coverImageUrl, localeSlugs };
  }
  const block = pickTranslationBlock(
    post.translations as Partial<Record<string, Record<string, unknown>>>,
    locale,
  ) as BlogTranslations[MandatoryLocale] | undefined;
  if (!block) {
    return { ...post, coverImageUrl, localeSlugs };
  }
  const localizedSlug = block.slug?.trim();
  return {
    ...post,
    slug: localizedSlug || post.slug,
    title: block.title?.trim() || post.title,
    excerpt: block.excerpt?.trim() || post.excerpt || '',
    content: block.content?.trim() || post.content,
    seoTitle: block.seoTitle?.trim() || post.seoTitle || null,
    seoDescription:
      block.seoDescription?.trim() || post.seoDescription || null,
    coverImageUrl,
    localeSlugs,
  };
}

export function localizeProductForCatalog<
  T extends {
    basePrice: string;
    currency: string;
    prices?: ProductPrices | null;
    translations?: ProductTranslations | null;
    name: string;
    description: string;
    shortDescription?: string | null;
    imageUrl?: string | null;
    imagesByLocale?: ImagesByLocale | null;
    useSharedImage?: boolean;
    variants?: Array<{
      price: string;
      prices?: ProductPrices | null;
      translations?: Partial<
        Record<
          MandatoryLocale | 'tr',
          { name?: string; categoryLabel?: string }
        >
      > | null;
      weightLabel: string;
      categoryKey?: string | null;
    }>;
    category?: {
      name: string;
      description?: string | null;
      translations?: CategoryTranslations | null;
    } | null;
  },
>(
  product: T,
  locale: LocaleCode,
  currency: SupportedCurrency,
): T & { localeSlugs: Record<string, string> } {
  const localeSlugs = buildLocaleSlugs(product.slug, product.translations);
  const localized = applyProductLocale(product, locale);
  const imageUrl = resolveLocalizedImage(
    localized.imageUrl,
    localized.imagesByLocale,
    localized.useSharedImage ?? true,
    locale,
  );
  const basePrice = resolveProductPrices(
    localized.basePrice,
    localized.prices,
    currency,
  );
  const variants = localized.variants?.map((v) => {
    const block =
      locale !== 'tr'
        ? v.translations?.[locale as MandatoryLocale | 'tr']
        : undefined;
    const vName = block?.name?.trim();
    const vCategory = block?.categoryLabel?.trim();
    const vLocalized = {
      ...v,
      weightLabel: vName || v.weightLabel,
      translations: {
        ...(v.translations || {}),
        // FE grup başlığı locale-first okusun diye istenen dili öne yaz
        ...(vCategory
          ? {
              [locale]: {
                ...(v.translations?.[locale as MandatoryLocale | 'tr'] || {}),
                categoryLabel: vCategory,
                ...(vName ? { name: vName } : {}),
              },
            }
          : {}),
      },
    };
    return {
      ...vLocalized,
      price: resolveProductPrices(v.price, v.prices, currency),
    };
  });
  const category =
    localized.category != null
      ? applyCategoryLocale(localized.category, locale)
      : localized.category;

  return {
    ...localized,
    imageUrl,
    basePrice,
    currency,
    variants,
    category,
    localeSlugs,
    prices: ensureProductPrices(localized.basePrice, localized.prices),
  };
}
