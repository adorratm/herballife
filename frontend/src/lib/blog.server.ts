import "server-only";

import {
  getBlogPostBySlug as getBlogPostBySlugBase,
  getBlogPosts as getBlogPostsBase,
} from "@/lib/api";
import { getServerLocaleCurrency } from "@/lib/locale-currency.server";
import type { AppLocale } from "@/i18n/routing";
import type { BlogPost, BlogQuery, Paginated } from "@/lib/types";

export async function getBlogPosts(
  params?: BlogQuery & { locale?: AppLocale | string },
): Promise<Paginated<BlogPost>> {
  const locale =
    params?.locale ?? (await getServerLocaleCurrency()).locale;
  const { locale: _ignored, ...rest } = params || {};
  return getBlogPostsBase({ ...rest, locale });
}

export async function getBlogPostBySlug(
  slug: string,
  locale?: AppLocale | string,
): Promise<BlogPost | null> {
  const resolved =
    locale ?? (await getServerLocaleCurrency()).locale;
  return getBlogPostBySlugBase(slug, { locale: resolved });
}
