import "server-only";

import {
  getCategories as getCategoriesBase,
  getCategoryBySlug as getCategoryBySlugBase,
  getProductBySlug as getProductBySlugBase,
  getProductsPaged as getProductsPagedBase,
} from "@/lib/api";
import { getServerLocaleCurrency } from "@/lib/locale-currency.server";
import { locales, type AppLocale } from "@/i18n/routing";
import type { Category, Paginated, Product, ProductQuery } from "@/lib/types";

async function ctx(localeOverride?: string) {
  const base = await getServerLocaleCurrency();
  const loc = (localeOverride || "").toLowerCase().split("-")[0];
  if (loc && (locales as readonly string[]).includes(loc)) {
    return { ...base, locale: loc as AppLocale };
  }
  return base;
}

export async function getProductsPaged(
  params?: ProductQuery,
): Promise<Paginated<Product>> {
  const { locale, currency } = await ctx(params?.locale);
  return getProductsPagedBase(
    { ...params, locale, currency },
    { cache: "no-store" },
  );
}

export async function getCategories(localeOverride?: string): Promise<Category[]> {
  const { locale, currency } = await ctx(localeOverride);
  return getCategoriesBase({ locale, currency });
}

export async function getCategoryBySlug(
  slug: string,
  localeOverride?: string,
): Promise<Category | null> {
  const { locale, currency } = await ctx(localeOverride);
  return getCategoryBySlugBase(slug, { locale, currency });
}

export async function getProductBySlug(
  slug: string,
  localeOverride?: string,
): Promise<Product | null> {
  const { locale, currency } = await ctx(localeOverride);
  return getProductBySlugBase(slug, { locale, currency });
}
