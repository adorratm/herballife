import type { AppPathname } from '@/i18n/pathnames';

/** Typed internal href helpers for next-intl Link / getPathname. */

export function productHref(slug: string): {
  pathname: '/urunler/[slug]';
  params: { slug: string };
} {
  return { pathname: '/urunler/[slug]', params: { slug } };
}

export function categoryHref(slug: string): {
  pathname: '/urunler/kategori/[slug]';
  params: { slug: string };
} {
  return { pathname: '/urunler/kategori/[slug]', params: { slug } };
}

export function blogPostHref(slug: string): {
  pathname: '/blog/[slug]';
  params: { slug: string };
} {
  return { pathname: '/blog/[slug]', params: { slug } };
}

export function orderHref(id: string): {
  pathname: '/hesabim/siparisler/[id]';
  params: { id: string };
} {
  return { pathname: '/hesabim/siparisler/[id]', params: { id } };
}

export function trackingHref(kod: string): {
  pathname: '/takip/[kod]';
  params: { kod: string };
} {
  return { pathname: '/takip/[kod]', params: { kod } };
}

export function staticHref(path: AppPathname): AppPathname {
  return path;
}
