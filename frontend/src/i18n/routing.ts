import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['tr', 'en', 'de', 'fr', 'es'] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = 'tr';

/** Language names shown in the current UI locale */
export const localeNames: Record<AppLocale, Record<AppLocale, string>> = {
  tr: {
    tr: 'Türkçe',
    en: 'İngilizce',
    de: 'Almanca',
    fr: 'Fransızca',
    es: 'İspanyolca',
  },
  en: {
    tr: 'Turkish',
    en: 'English',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
  },
  de: {
    tr: 'Türkisch',
    en: 'Englisch',
    de: 'Deutsch',
    fr: 'Französisch',
    es: 'Spanisch',
  },
  fr: {
    tr: 'Turc',
    en: 'Anglais',
    de: 'Allemand',
    fr: 'Français',
    es: 'Espagnol',
  },
  es: {
    tr: 'Turco',
    en: 'Inglés',
    de: 'Alemán',
    fr: 'Francés',
    es: 'Español',
  },
};

/** Unicode regional-indicator flags */
export const localeFlags: Record<AppLocale, string> = {
  tr: '🇹🇷',
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
};

export const currencies = ['TRY', 'USD', 'EUR', 'GBP'] as const;
export type AppCurrency = (typeof currencies)[number];

export const currencySymbols: Record<AppCurrency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const currencyLabels: Record<AppLocale, Record<AppCurrency, string>> = {
  tr: {
    TRY: 'Türk Lirası',
    USD: 'ABD Doları',
    EUR: 'Euro',
    GBP: 'İngiliz Sterlini',
  },
  en: {
    TRY: 'Turkish Lira',
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'Pound Sterling',
  },
  de: {
    TRY: 'Türkische Lira',
    USD: 'US-Dollar',
    EUR: 'Euro',
    GBP: 'Pfund Sterling',
  },
  fr: {
    TRY: 'Lire turque',
    USD: 'Dollar US',
    EUR: 'Euro',
    GBP: 'Livre sterling',
  },
  es: {
    TRY: 'Lira turca',
    USD: 'Dólar estadounidense',
    EUR: 'Euro',
    GBP: 'Libra esterlina',
  },
};

export const currencyByLocale: Record<AppLocale, AppCurrency> = {
  tr: 'TRY',
  en: 'USD',
  de: 'EUR',
  fr: 'EUR',
  es: 'EUR',
};

export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const CURRENCY_COOKIE = 'HERBAL_CURRENCY';

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
