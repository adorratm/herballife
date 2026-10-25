import "server-only";

import {
  getCategories as getCategoriesBase,
  getCategoryBySlug as getCategoryBySlugBase,
  getProductBySlug as getProductBySlugBase,
  getProductsPaged as getProductsPagedBase,
} from "@/lib/api";
import { getServerLocaleCurrency } from "@/lib/locale-currency.server";
import type { Category, Paginated, Product, ProductQuery } from "@/lib/types";

async function ctx() {
  return getServerLocaleCurrency();
}

export async function getProductsPaged(
  params?: ProductQuery,
): Promise<Paginated<Product>> {
  const { locale, currency } = await ctx();
  return getProductsPagedBase({ locale, currency, ...params });
}

export async function getCategories(): Promise<Category[]> {
  const { locale, currency } = await ctx();
  return getCategoriesBase({ locale, currency });
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { locale, currency } = await ctx();
  return getCategoryBySlugBase(slug, { locale, currency });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { locale, currency } = await ctx();
  return getProductBySlugBase(slug, { locale, currency });
}
