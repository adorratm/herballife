import { getTranslations } from "next-intl/server";
import type { SeoLabels } from "@/lib/seo";

function seoKeywordArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string");
}

export async function getSeoLabels(): Promise<SeoLabels> {
  const t = await getTranslations("seo");
  return {
    products: t("products"),
    productsDescription: t("productsDescription"),
    blog: t("blog"),
    blogDescription: t("blogDescription"),
    searchTitle: t("searchTitle"),
    searchDescription: t("searchDescription"),
    categoryDescription: t("categoryDescription"),
    blogTagTitle: t("blogTagTitle"),
    blogTagDescription: t("blogTagDescription"),
    pageSuffix: t("pageSuffix"),
    aboutJsonLdDescription: t("aboutJsonLdDescription"),
    keywordsCatalogDefault: seoKeywordArray(t.raw("keywordsCatalogDefault")),
    keywordsCategoryExtra: seoKeywordArray(t.raw("keywordsCategoryExtra")),
    keywordsBlog: seoKeywordArray(t.raw("keywordsBlog")),
  };
}
