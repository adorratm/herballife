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

/** CMS site ayarı / içerik jsonb — TR kök, diğer diller `translations[locale]`. */
export function resolveLocalizedRecord(
  value: Record<string, unknown>,
  locale: LocaleCode,
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
    return { ...base };
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
  if (picked != null && Number.isFinite(Number(picked))) {
    return Number(picked).toFixed(2);
  }
  if (currency !== 'TRY' && map.TRY != null) {
    return Number(map.TRY).toFixed(2);
  }
  return baseNum.toFixed(2);
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

export function applyProductLocale<
  T extends {
    slug: string;
    name: string;
    description: string;
    shortDescription?: string | null;
    translations?: ProductTranslations | null;
  },
>(product: T, locale: LocaleCode): T {
  if (locale === 'tr') {
    return product;
  }
  const block = product.translations?.[locale];
  if (!block) {
    return {
      ...product,
      name: '',
      description: '',
      shortDescription: '',
    };
  }
  const localizedSlug = block.slug?.trim();
  return {
    ...product,
    slug: localizedSlug || product.slug,
    name: block.name?.trim() || '',
    description: block.description?.trim() || '',
    shortDescription: block.shortDescription?.trim() || '',
  };
}

export function applyCategoryLocale<
  T extends {
    slug: string;
    name: string;
    description?: string | null;
    translations?: CategoryTranslations | null;
  },
>(category: T, locale: LocaleCode): T {
  if (locale === 'tr') {
    return category;
  }
  const block = category.translations?.[locale];
  if (!block) {
    return {
      ...category,
      name: '',
      description: '',
    };
  }
  const localizedSlug = block.slug?.trim();
  return {
    ...category,
    slug: localizedSlug || category.slug,
    name: block.name?.trim() || '',
    description: block.description?.trim() || '',
  };
}

export function applyCampaignLocale<
  T extends {
    name: string;
    headline?: string | null;
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
  const block = campaign.translations?.[locale];
  if (!block) {
    return {
      ...campaign,
      name: '',
      headline: '',
      imageUrl,
    };
  }
  return {
    ...campaign,
    name: block.name?.trim() || '',
    headline: block.headline?.trim() || '',
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
>(post: T, locale: LocaleCode): T {
  const coverImageUrl = resolveLocalizedImage(
    post.coverImageUrl,
    post.imagesByLocale,
    post.useSharedImage ?? true,
    locale,
  );
  if (locale === 'tr') {
    return { ...post, coverImageUrl };
  }
  const block = post.translations?.[locale];
  if (!block) {
    return {
      ...post,
      title: '',
      excerpt: '',
      content: '',
      seoTitle: null,
      seoDescription: null,
      coverImageUrl,
    };
  }
  const localizedSlug = block.slug?.trim();
  return {
    ...post,
    slug: localizedSlug || post.slug,
    title: block.title?.trim() || '',
    excerpt: block.excerpt?.trim() || '',
    content: block.content?.trim() || '',
    seoTitle: block.seoTitle?.trim() || null,
    seoDescription: block.seoDescription?.trim() || null,
    coverImageUrl,
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
      translations?: ProductTranslations | null;
      weightLabel: string;
    }>;
    category?: {
      name: string;
      description?: string | null;
      translations?: CategoryTranslations | null;
    } | null;
  },
>(product: T, locale: LocaleCode, currency: SupportedCurrency): T {
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
    const vLocalized =
      locale !== 'tr' && v.translations?.[locale]?.name
        ? {
            ...v,
            weightLabel: v.translations[locale]!.name!.trim() || v.weightLabel,
          }
        : v;
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
    prices: ensureProductPrices(localized.basePrice, localized.prices),
  };
}
