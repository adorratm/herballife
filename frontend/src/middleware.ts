import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import {
  CURRENCY_COOKIE,
  currencyByLocale,
  routing,
  type AppCurrency,
  type AppLocale,
} from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

function pickCurrency(raw: string | undefined, locale: AppLocale): AppCurrency {
  const upper = (raw || '').toUpperCase();
  if (upper === 'TRY' || upper === 'USD' || upper === 'EUR' || upper === 'GBP') {
    return upper;
  }
  return currencyByLocale[locale];
}

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const pathname = request.nextUrl.pathname;
  const segment = pathname.split('/')[1] || '';
  const locale = (
    routing.locales.includes(segment as AppLocale)
      ? segment
      : routing.defaultLocale
  ) as AppLocale;

  let currency = pickCurrency(
    request.cookies.get(CURRENCY_COOKIE)?.value,
    locale,
  );
  if (locale === 'tr') currency = 'TRY';

  const existing = request.cookies.get(CURRENCY_COOKIE)?.value;
  if (!existing || (locale === 'tr' && existing !== 'TRY')) {
    response.cookies.set(CURRENCY_COOKIE, currency, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: ['/', '/(tr|en|de|fr|es)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
