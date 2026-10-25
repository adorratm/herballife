import type { ComponentProps } from 'react';
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { pathnames, type AppPathname } from '@/i18n/pathnames';
import {
  blogPostHref,
  categoryHref,
  orderHref,
  productHref,
  trackingHref,
} from '@/i18n/hrefs';

export type { AppPathname };
export { pathnames };

export const locales = [
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
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = 'tr';

/** Native / display names (panel overrides via localization.languages) */
export const localeNativeNames: Record<AppLocale, string> = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  nl: 'Nederlands',
  pt: 'Português',
  pl: 'Polski',
  ru: 'Русский',
  az: 'Azərbaycan',
};

/** @deprecated Prefer localeNativeNames or CMS languages[].nativeName */
export const localeNames: Record<AppLocale, Record<AppLocale, string>> =
  Object.fromEntries(
    locales.map((ui) => [
      ui,
      Object.fromEntries(locales.map((code) => [code, localeNativeNames[code]])),
    ]),
  ) as Record<AppLocale, Record<AppLocale, string>>;

/** Unicode regional-indicator flags */
export const localeFlags: Record<AppLocale, string> = {
  tr: '🇹🇷',
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  it: '🇮🇹',
  nl: '🇳🇱',
  pt: '🇵🇹',
  pl: '🇵🇱',
  ru: '🇷🇺',
  az: '🇦🇿',
};

export const currencies = ['TRY', 'USD', 'EUR', 'GBP'] as const;
export type AppCurrency = (typeof currencies)[number];

export const currencySymbols: Record<AppCurrency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const CURRENCY_LABELS_EN: Record<AppCurrency, string> = {
  TRY: 'Turkish Lira',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'Pound Sterling',
};

export const currencyLabels: Record<AppLocale, Record<AppCurrency, string>> = {
  tr: {
    TRY: 'Türk Lirası',
    USD: 'ABD Doları',
    EUR: 'Euro',
    GBP: 'İngiliz Sterlini',
  },
  en: CURRENCY_LABELS_EN,
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
  it: CURRENCY_LABELS_EN,
  nl: CURRENCY_LABELS_EN,
  pt: CURRENCY_LABELS_EN,
  pl: CURRENCY_LABELS_EN,
  ru: CURRENCY_LABELS_EN,
  az: {
    TRY: 'Türk lirası',
    USD: 'ABŞ dolları',
    EUR: 'Avro',
    GBP: 'Funt sterlinq',
  },
};

export const currencyByLocale: Record<AppLocale, AppCurrency> = {
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

export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const CURRENCY_COOKIE = 'HERBAL_CURRENCY';

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
  pathnames,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

/** Cast CMS / legacy string hrefs to typed internal pathnames for Link. */
export function asHref(href: string): AppPathname {
  return href.split('?')[0].split('#')[0] as AppPathname;
}

export type AppLinkHref = ComponentProps<typeof Link>['href'];

function queryRecord(qs: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(qs));
}

function attachQuery(base: AppLinkHref, qs: string | undefined): AppLinkHref {
  if (!qs) return base;
  const query = queryRecord(qs);
  if (typeof base === 'string') {
    return { pathname: asHref(base), query } as AppLinkHref;
  }
  if (base && typeof base === 'object' && 'pathname' in base) {
    const prev =
      'query' in base && base.query && typeof base.query === 'object'
        ? (base.query as Record<string, string>)
        : {};
    return { ...base, query: { ...prev, ...query } } as AppLinkHref;
  }
  return base;
}

/** Parse internal TR path strings (optional query) into typed next-intl Link hrefs. */
export function toLinkHref(href: string): AppLinkHref {
  const hashIdx = href.indexOf('#');
  const withoutHash = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  const [path, qs] = withoutHash.split('?', 2);
  const normalized = path.startsWith('/') ? path : `/${path}`;

  let base: AppLinkHref;

  const category = normalized.match(/^\/urunler\/kategori\/([^/]+)\/?$/);
  if (category) {
    base = categoryHref(decodeURIComponent(category[1]));
  } else {
    const product = normalized.match(/^\/urunler\/([^/]+)\/?$/);
    if (product) {
      base = productHref(decodeURIComponent(product[1]));
    } else {
      const blog = normalized.match(/^\/blog\/([^/]+)\/?$/);
      if (blog) {
        base = blogPostHref(decodeURIComponent(blog[1]));
      } else {
        const order = normalized.match(/^\/hesabim\/siparisler\/([^/]+)\/?$/);
        if (order) {
          base = orderHref(decodeURIComponent(order[1]));
        } else {
          const tracking = normalized.match(/^\/takip\/([^/]+)\/?$/);
          if (tracking) {
            base = trackingHref(decodeURIComponent(tracking[1]));
          } else {
            base = asHref(normalized) as AppLinkHref;
          }
        }
      }
    }
  }

  return attachQuery(base, qs);
}

export type AppRouterHref = Parameters<
  ReturnType<typeof useRouter>['push']
>[0];

/** Same as {@link toLinkHref} but typed for `router.push` / `replace`. */
export function asRouterHref(href: string): AppRouterHref {
  return toLinkHref(href) as AppRouterHref;
}
