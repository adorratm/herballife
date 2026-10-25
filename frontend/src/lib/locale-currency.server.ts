import "server-only";

import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import {
  CURRENCY_COOKIE,
  defaultLocale,
  type AppCurrency,
  type AppLocale,
  locales,
} from "@/i18n/routing";
import { pickCurrency } from "@/lib/locale-currency.shared";

/**
 * Dil: URL `[locale]` (next-intl). Cookie yalnızca para birimi için.
 * Önceden cookie locale kullanılıyordu → /es altında TR katalog geliyordu.
 */
export async function getServerLocaleCurrency(): Promise<{
  locale: AppLocale;
  currency: AppCurrency;
}> {
  let locale: AppLocale = defaultLocale;
  try {
    const fromIntl = await getLocale();
    if (locales.includes(fromIntl as AppLocale)) {
      locale = fromIntl as AppLocale;
    }
  } catch {
    /* build-time / cookie-only contexts */
  }

  const cookieStore = await cookies();
  let currency = pickCurrency(cookieStore.get(CURRENCY_COOKIE)?.value, locale);
  if (locale === "tr") {
    currency = "TRY";
  }
  return { locale, currency };
}
