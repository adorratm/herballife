import { getTranslations } from "next-intl/server";
import type { SeoLabels } from "@/lib/seo";

function seoKeywordArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string");
}

function seoTemplate(raw: unknown, fallback: string): string {
  return typeof raw === "string" && raw.trim() ? raw : fallback;
}

export async function getSeoLabels(): Promise<SeoLabels> {
  const t = await getTranslations("seo");
  // Placeholder’lı SEO şablonları t() ile formatlanmamalı — sonra fillSeoTemplate ile doldurulur
  return {
    products: t("products"),
    productsDescription: t("productsDescription"),
    blog: t("blog"),
    blogDescription: t("blogDescription"),
    searchTitle: seoTemplate(t.raw("searchTitle"), "Search: {query}"),
    searchDescription: seoTemplate(
      t.raw("searchDescription"),
      "Product results for “{query}” — {brand}.",
    ),
    categoryDescription: seoTemplate(
      t.raw("categoryDescription"),
      "Products in {categoryName} — {brand}.",
    ),
    blogTagTitle: seoTemplate(t.raw("blogTagTitle"), "Articles · {tag}"),
    blogTagDescription: seoTemplate(
      t.raw("blogTagDescription"),
      "Posts tagged “{tag}” — {brand}.",
    ),
    pageSuffix: seoTemplate(t.raw("pageSuffix"), " · Page {page}"),
    aboutJsonLdDescription: seoTemplate(
      t.raw("aboutJsonLdDescription"),
      "{brand} — independent Herbal Kapıda distributor.",
    ),
    keywordsCatalogDefault: seoKeywordArray(t.raw("keywordsCatalogDefault")),
    keywordsCategoryExtra: seoKeywordArray(t.raw("keywordsCategoryExtra")),
    keywordsBlog: seoKeywordArray(t.raw("keywordsBlog")),
  };
}
