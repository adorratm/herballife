import type { Metadata } from "next";
import { Link, redirect } from "@/i18n/routing";
import { blogPostHref } from "@/i18n/hrefs";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RegisterLocaleAlternates } from "@/components/LocaleAlternates";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { getBlogPosts } from "@/lib/blog.server";
import {
  getCategories,
  getCategoryBySlug,
  getProductsPaged,
} from "@/lib/catalog.server";
import { getSiteSettings } from "@/lib/cms";
import {
  categoryCatalogPath,
  categoryFallback,
} from "@/lib/catalog-paths";
import { looksLikeHtml } from "@/lib/catalog-seo";
import { getSeoLabels } from "@/lib/seo-i18n";
import {
  buildCatalogMetadata,
  breadcrumbJsonLd,
  itemListJsonLd,
  JsonLd,
} from "@/lib/seo";
import ProductsCatalog from "../../ProductsCatalog";

/** API kısa süre düşse bile chip URL’leri 404 cache’lenmesin */
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{
    q?: string;
    origin?: string;
    sort?: string;
    order?: string;
    page?: string;
  }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const [{ slug, locale }, sp] = await Promise.all([params, searchParams]);
  const [settings, labels, tSeo, categories] = await Promise.all([
    getSiteSettings(locale),
    getSeoLabels(),
    getTranslations("seo"),
    getCategories(locale).catch(() => []),
  ]);
  const category =
    (await getCategoryBySlug(slug, locale)) ||
    categories.find(
      (c) =>
        c.slug === slug ||
        Object.values(c.localeSlugs || {}).includes(slug),
    ) ||
    categoryFallback(slug);
  if (!category) {
    return {
      title: tSeo("categoryNotFound"),
      robots: { index: false, follow: false },
    };
  }
  return buildCatalogMetadata(settings, {
    locale,
    categorySlug: category.slug,
    categoryName: category.name,
    categoryDescription: category.description,
    categorySeoTitle: category.seoTitle,
    categorySeoDescription: category.seoDescription,
    q: sp.q,
    page: sp.page,
    origin: sp.origin,
    sort: sp.sort,
    order: sp.order,
    labels,
  });
}

export default async function CategoryCatalogPage({ params }: Props) {
  const { slug, locale } = await params;
  const [tCommon, tCatalog] = await Promise.all([
    getTranslations("common"),
    getTranslations("catalog"),
  ]);
  const [categories, relatedBlog, bySlug] = await Promise.all([
    getCategories(locale).catch(() => []),
    getBlogPosts({
      categorySlug: slug,
      limit: 3,
      sort: "publishedAt",
      locale,
    }),
    getCategoryBySlug(slug, locale),
  ]);
  // Önce API slug eşlemesi (TR/EN/…); liste lokalize slug ile de yedekler
  const category =
    bySlug ||
    categories.find(
      (c) =>
        c.slug === slug ||
        Object.values(c.localeSlugs || {}).includes(slug),
    ) ||
    categoryFallback(slug);
  if (!category) notFound();

  const requestSlug = decodeURIComponent(slug).toLowerCase();
  const canonicalSlug = (category.slug || "").toLowerCase();
  const knownSlugs = new Set(
    [
      canonicalSlug,
      ...Object.values(category.localeSlugs || {}).map((s) =>
        String(s).toLowerCase(),
      ),
    ].filter(Boolean),
  );
  // Yalnızca bu dilin kanonik slug’ına yönlendir (çerez/dil uyumsuzluğunda döngü olmasın)
  if (
    canonicalSlug &&
    knownSlugs.has(requestSlug) &&
    requestSlug !== canonicalSlug
  ) {
    redirect({
      href: {
        pathname: "/urunler/kategori/[slug]",
        params: { slug: category.slug },
      },
      locale,
    });
  }

  const crumbs = [
    { name: tCommon("home"), path: "/" },
    { name: tCatalog("title"), path: "/urunler" },
    {
      name: category.name,
      path: categoryCatalogPath(category.slug),
    },
  ];

  const catalog = await getProductsPaged({
    page: 1,
    limit: 25,
    categorySlug: category.slug,
    locale,
  }).catch(() => null);

  const intro = category.description?.trim() || "";

  return (
    <>
      <RegisterLocaleAlternates
        pathname="/urunler/kategori/[slug]"
        localeSlugs={category.localeSlugs}
        currentSlug={category.slug}
      />
      <JsonLd data={breadcrumbJsonLd(crumbs, locale)} />
      {catalog?.items?.length ? (
        <JsonLd
          data={itemListJsonLd(catalog.items, {
            name: category.name,
            path: categoryCatalogPath(category.slug),
            locale,
          })}
        />
      ) : null}
      <PageBreadcrumb items={crumbs} />
      <section className="page-shell border-b border-outline-variant/20 py-6 md:py-8">
        <h1 className="font-display text-3xl tracking-tight text-on-surface md:text-4xl">
          {category.name}
        </h1>
        {intro ? (
          looksLikeHtml(intro) ? (
            <div
              className="prose-blog mt-3 max-w-3xl space-y-3 text-sm leading-relaxed text-on-surface-variant [&_a]:text-primary [&_a]:underline [&_p]:mb-0"
              dangerouslySetInnerHTML={{ __html: intro }}
            />
          ) : (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
              {intro}
            </p>
          )
        ) : null}
        {relatedBlog.items.length ? (
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-outline-variant/15 pt-4">
            {relatedBlog.items.map((post) => (
              <Link
                key={post.id}
                href={blogPostHref(post.slug)}
                className="text-sm text-on-surface-variant hover:text-primary"
              >
                {post.title}
              </Link>
            ))}
          </div>
        ) : null}
      </section>
      <Suspense
        fallback={
          <div className="page-shell py-16 text-sm text-on-surface-variant">
            Katalog yükleniyor…
          </div>
        }
      >
        <ProductsCatalog hideHeading categorySlug={category.slug} />
      </Suspense>
    </>
  );
}
