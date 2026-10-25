export type SupportedCurrency = 'TRY' | 'USD' | 'EUR' | 'GBP';

export type ProductPrices = Partial<Record<SupportedCurrency, number>>;

export type LocaleCode = 'tr' | 'en' | 'de' | 'fr' | 'es';

export type MandatoryLocale = Exclude<LocaleCode, 'tr'>;

export const MANDATORY_LOCALES: MandatoryLocale[] = ['en', 'de', 'fr', 'es'];

export type ImagesByLocale = Partial<Record<LocaleCode, string>>;

export type ProductLocaleFields = {
  name?: string;
  description?: string;
  shortDescription?: string;
  slug?: string;
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

export const SUPPORTED_LOCALES: LocaleCode[] = ['tr', 'en', 'de', 'fr', 'es'];
export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  'TRY',
  'USD',
  'EUR',
  'GBP',
];

export const DEFAULT_CURRENCY_BY_LOCALE: Record<LocaleCode, SupportedCurrency> =
  {
    tr: 'TRY',
    en: 'USD',
    de: 'EUR',
    fr: 'EUR',
    es: 'EUR',
  };
