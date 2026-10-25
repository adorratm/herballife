import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { redirect } from "@/i18n/routing";
import { getProductsPaged } from "@/lib/catalog.server";
import { getSiteSettings } from "@/lib/cms";
import { getSeoLabels } from "@/lib/seo-i18n";
import {
  buildCatalogMetadata,
  breadcrumbJsonLd,
  itemListJsonLd,
  JsonLd,
} from "@/lib/seo";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import ProductsCatalog from "./ProductsCatalog";

type Props = {
  searchParams: Promise<{
    category?: string;
    q?: string;
    origin?: string;
    sort?: string;
    order?: string;
    page?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const sp = await searchParams;
  if (sp.category) {
    // Eski query URL'ler kategori sayfasına yönlenir; meta orada üretilir.
    return {};
  }
  const locale = await getLocale();
  const [settings, labels] = await Promise.all([
    getSiteSettings(locale),
    getSeoLabels(),
  ]);
  return buildCatalogMetadata(settings, {
    locale,
    q: sp.q,
    page: sp.page,
    origin: sp.origin,
    sort: sp.sort,
    order: sp.order,
    labels,
  });
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = await getLocale();

  if (sp.category?.trim()) {
    const qs = new URLSearchParams();
    if (sp.q) qs.set("q", sp.q);
    if (sp.origin) qs.set("origin", sp.origin);
    if (sp.sort) qs.set("sort", sp.sort);
    if (sp.order) qs.set("order", sp.order);
    if (sp.page) qs.set("page", sp.page);
    const query = Object.fromEntries(qs.entries());
    redirect({
      href: {
        pathname: "/urunler/kategori/[slug]",
        params: { slug: sp.category.trim() },
        ...(Object.keys(query).length ? { query } : {}),
      },
      locale,
    });
  }

  const [tCommon, tCatalog, tSeo] = await Promise.all([
    getTranslations("common"),
    getTranslations("catalog"),
    getTranslations("seo"),
  ]);

  const crumbs = [
    { name: tCommon("home"), path: "/" },
    { name: tCatalog("title"), path: "/urunler" },
  ];

  const catalog = await getProductsPaged({ page: 1, limit: 25 }).catch(() => null);
  const listItems = catalog?.items ?? [];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs, locale)} />
      {listItems.length ? (
        <JsonLd
          data={itemListJsonLd(listItems, {
            name: tCatalog("title"),
            path: "/urunler",
            locale,
          })}
        />
      ) : null}
      <PageBreadcrumb items={crumbs} />
      <Suspense
        fallback={
          <div className="page-shell py-16 text-sm text-on-surface-variant">
            {tSeo("catalogLoading")}
          </div>
        }
      >
        <ProductsCatalog />
      </Suspense>
    </>
  );
}
