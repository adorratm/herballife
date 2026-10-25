export type SupportedCurrency = 'TRY' | 'USD' | 'EUR' | 'GBP';

export type ProductPrices = Partial<Record<SupportedCurrency, number>>;

import type { StoreLocaleCode } from '@common/catalog/locale-catalog';
import { STORE_LOCALE_CODES } from '@common/catalog/locale-catalog';

export type LocaleCode = StoreLocaleCode;

/** Ürün/kategori/blog için zorunlu çeviri dilleri (TR dışı çekirdek set) */
export type MandatoryLocale = 'en' | 'de' | 'fr' | 'es';

export const MANDATORY_LOCALES: MandatoryLocale[] = ['en', 'de', 'fr', 'es'];

export type ImagesByLocale = Partial<Record<LocaleCode, string>>;

export type ProductLocaleFields = {
  name?: string;
  description?: string;
  shortDescription?: string;
  slug?: string;
  /** Vitrin rozet metni */
  badge?: string;
};

export type ProductTranslations = Partial<
  Record<MandatoryLocale, ProductLocaleFields>
>;

export type CategoryLocaleFields = {
  name?: string;
  description?: string;
  slug?: string;
};

export type CategoryTranslations = Partial<
  Record<MandatoryLocale, CategoryLocaleFields>
>;

export type CampaignLocaleFields = {
  name?: string;
  headline?: string;
  /** Vitrin rozet metni */
  badge?: string;
};

export type CampaignTranslations = Partial<
  Record<MandatoryLocale, CampaignLocaleFields>
>;

export type BlogLocaleFields = {
  title?: string;
  excerpt?: string;
  content?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type BlogTranslations = Partial<
  Record<MandatoryLocale, BlogLocaleFields>
>;

export const SUPPORTED_LOCALES: LocaleCode[] = [...STORE_LOCALE_CODES];
export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  'TRY',
  'USD',
  'EUR',
  'GBP',
];

export const DEFAULT_CURRENCY_BY_LOCALE: Record<string, SupportedCurrency> = {
  tr: 'TRY',
  en: 'USD',
  de: 'EUR',
  fr: 'EUR',
  es: 'EUR',
  it: 'EUR',
  nl: 'EUR',
  pt: 'EUR',
  pl: 'EUR',
  ru: 'USD',
  az: 'USD',
};
