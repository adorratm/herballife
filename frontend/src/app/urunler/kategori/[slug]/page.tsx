import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import {
  getBlogPosts,
  getCategories,
  getCategoryBySlug,
  getProductsPaged,
} from "@/lib/api";
import { getSiteSettings } from "@/lib/cms";
import { categoryCatalogPath } from "@/lib/catalog-paths";
import { looksLikeHtml } from "@/lib/catalog-seo";
import {
  buildCatalogMetadata,
  breadcrumbJsonLd,
  itemListJsonLd,
  JsonLd,
} from "@/lib/seo";
import ProductsCatalog from "../../ProductsCatalog";

type Props = {
  params: Promise<{ slug: string }>;
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
  const [{ slug }, sp, settings, categories] = await Promise.all([
    params,
    searchParams,
    getSiteSettings(),
    getCategories().catch(() => []),
  ]);
  const category =
    categories.find((c) => c.slug === slug) ||
    (await getCategoryBySlug(slug));
  if (!category) {
    return { title: "Kategori bulunamadı", robots: { index: false, follow: false } };
  }
  return buildCatalogMetadata(settings, {
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
  });
}

export default async function CategoryCatalogPage({ params }: Props) {
  const { slug } = await params;
  const [categories, relatedBlog, bySlug] = await Promise.all([
    getCategories().catch(() => []),
    getBlogPosts({ categorySlug: slug, limit: 3, sort: "publishedAt" }),
    getCategoryBySlug(slug),
  ]);
  const category = categories.find((c) => c.slug === slug) || bySlug;
  if (!category) notFound();

  const crumbs = [
    { name: "Ana sayfa", path: "/" },
    { name: "Ürünler", path: "/urunler" },
    {
      name: category.name,
      path: categoryCatalogPath(category.slug),
    },
  ];

  const catalog = await getProductsPaged({
    page: 1,
    limit: 25,
    categorySlug: category.slug,
  }).catch(() => null);

  const intro = category.description?.trim() || "";

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {catalog?.items?.length ? (
        <JsonLd
          data={itemListJsonLd(catalog.items, {
            name: category.name,
            path: categoryCatalogPath(category.slug),
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
                href={`/blog/${post.slug}`}
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
        <ProductsCatalog hideHeading />
      </Suspense>
    </>
  );
}
