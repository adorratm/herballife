import {
  CURRENCY_COOKIE,
  LOCALE_COOKIE,
  currencyByLocale,
  defaultLocale,
  locales,
  type AppCurrency,
  type AppLocale,
} from "@/i18n/routing";

export function pickLocale(raw: string | undefined): AppLocale {
  const code = (raw || "").toLowerCase().split("-")[0];
  return locales.includes(code as AppLocale) ? (code as AppLocale) : defaultLocale;
}

export function pickCurrency(
  raw: string | undefined,
  locale: AppLocale,
): AppCurrency {
  const upper = (raw || "").toUpperCase();
  if (upper === "TRY" || upper === "USD" || upper === "EUR" || upper === "GBP") {
    return upper;
  }
  return currencyByLocale[locale];
}

export function readBrowserCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** Tarayıcı: çerezlerden locale + para birimi. */
export function getClientLocaleCurrency(): {
  locale: AppLocale;
  currency: AppCurrency;
} {
  const locale = pickLocale(readBrowserCookie(LOCALE_COOKIE));
  const currency = pickCurrency(readBrowserCookie(CURRENCY_COOKIE), locale);
  return { locale, currency };
}
