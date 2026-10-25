import { AppImage as Image } from "@/components/AppImage";
import { Link, redirect, toLinkHref } from "@/i18n/routing";
import { categoryHref, productHref } from "@/i18n/hrefs";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { RegisterLocaleAlternates } from "@/components/LocaleAlternates";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Reveal } from "@/components/Reveal";
import { getBlogPostBySlug } from "@/lib/blog.server";
import { getBlogPosts as getBlogPostsApi } from "@/lib/api";
import { getCategories, getProductBySlug } from "@/lib/catalog.server";
import { getSiteSettings } from "@/lib/cms";
import { blogCoverImage, formatMoney, productImage } from "@/lib/format";
import {
  JsonLd,
  blogPostJsonLd,
  breadcrumbJsonLd,
  buildBlogPostMetadata,
} from "@/lib/seo";
import type { Product } from "@/lib/types";

/** İlgili ürün fetch’i SSG’yi kilitlemesin / prod’da asılı kalmasın */
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params;
  const [post, settings] = await Promise.all([
    getBlogPostBySlug(slug, locale),
    getSiteSettings(locale),
  ]);
  if (!post) {
    const t = await getTranslations("blog");
    return { title: t("notFound"), robots: { index: false, follow: false } };
  }
  return buildBlogPostMetadata(post, settings, locale);
}

export async function generateStaticParams() {
  // Cookie kullanma — build-time; locale segment üst layout generateStaticParams’tan gelir
  const paged = await getBlogPostsApi({ limit: 50, sort: "publishedAt", locale: "tr" });
  return paged.items.map((p) => ({ slug: p.slug }));
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function relatedSlugList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s || "").trim()).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

async function loadRelatedProducts(raw: unknown): Promise<Product[]> {
  const slugs = relatedSlugList(raw).slice(0, 6);
  if (!slugs.length) return [];

  const results = await Promise.all(
    slugs.map(async (s) => {
      try {
        return await Promise.race([
          getProductBySlug(s),
          new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), 8000);
          }),
        ]);
      } catch {
        return null;
      }
    }),
  );

  return results.filter(
    (p): p is Product => Boolean(p && p.isActive !== false),
  );
}

function RelatedProductTeaser({ product }: { product: Product }) {
  const img = productImage(product.imageUrl, product.slug);
  const price = product.salePrice ?? product.variants?.[0]?.price ?? product.basePrice;
  const compareAt = product.compareAtPrice;

  return (
    <Link
      href={productHref(product.slug)}
      className="card-motion group flex h-full gap-4 rounded-xl border border-outline-variant/40 bg-white p-3"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
        <Image
          src={img}
          alt={product.name}
          fill
          className="object-contain p-2 transition-transform duration-400 group-hover:scale-105"
          sizes="96px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
        <h3 className="line-clamp-2 font-display text-base leading-snug text-on-surface group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          {compareAt && Number(compareAt) > Number(price) ? (
            <span className="text-xs text-outline line-through">
              {formatMoney(compareAt, product.currency)}
            </span>
          ) : null}
          <p className="text-sm font-bold text-primary">
            {formatMoney(price, product.currency)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale } = await params;
  const t = await getTranslations("blog");
  const [post, settings] = await Promise.all([
    getBlogPostBySlug(slug, locale),
    getSiteSettings(locale),
  ]);

  if (!post) notFound();

  const requestSlug = decodeURIComponent(slug).toLowerCase();
  if (post.slug && post.slug.toLowerCase() !== requestSlug) {
    redirect({
      href: {
        pathname: "/blog/[slug]",
        params: { slug: post.slug },
      },
      locale,
    });
  }

  const cover = blogCoverImage(post.coverImageUrl, post.slug);
  const relatedProducts = await loadRelatedProducts(post.relatedProductSlugs);
  const categorySlugs = relatedSlugList(post.relatedCategorySlugs);
  const categories = categorySlugs.length
    ? await getCategories().catch(() => [])
    : [];
  const relatedCategories = categories.filter((c) =>
    categorySlugs.includes(c.slug),
  );
  const tags = (post.tags || []).filter(Boolean);
  const minutes = Math.max(
    1,
    Math.round(
      (post.content || "")
        .replace(/<[^>]*>/g, " ")
        .split(/\s+/)
        .filter(Boolean).length / 200,
    ),
  );

  const crumbs = [
    { name: t("homeCrumb"), path: "/" },
    { name: t("postsCrumb"), path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <article>
      <RegisterLocaleAlternates
        pathname="/blog/[slug]"
        localeSlugs={post.localeSlugs}
        currentSlug={post.slug}
      />
      <JsonLd data={blogPostJsonLd(post, settings, locale)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, locale)} />
      <PageBreadcrumb items={crumbs} />

      {/* Başlık */}
      <header className="mint-wash">
        <div className="page-shell py-12 md:py-20">
          <div className="hero-enter mx-auto max-w-4xl">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {tags.length ? (
                tags.map((t) => (
                  <Link
                    key={t}
                    href={toLinkHref(`/blog?tag=${encodeURIComponent(t)}`)}
                    className="eyebrow text-primary hover:underline"
                  >
                    {t}
                  </Link>
                ))
              ) : (
                <Link href="/blog" className="eyebrow text-primary hover:underline">
                  {t("postsCrumb")}
                </Link>
              )}
            </div>
            <h1 className="display-lg mt-5 text-on-surface">{post.title}</h1>
            {post.excerpt ? (
              <p className="mt-6 max-w-3xl text-xl leading-relaxed text-on-surface-variant md:text-2xl md:leading-relaxed">
                {post.excerpt}
              </p>
            ) : null}
            <p className="mt-8 text-sm text-on-surface-variant">
              <time dateTime={post.publishedAt || undefined}>
                {formatDate(post.publishedAt, locale)}
              </time>
              {post.authorName ? ` · ${post.authorName}` : ""}
              {` · ${t("readMinutesLong", { minutes })}`}
            </p>
          </div>
        </div>
      </header>

      {/* Kapak */}
      <div className="page-shell">
        <Reveal>
          <div className="relative mx-auto -mt-2 aspect-2/1 min-h-56 max-w-5xl overflow-hidden rounded-xl bg-surface-container md:min-h-96">
            <Image
              src={cover}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        </Reveal>
      </div>

      {/* Metin */}
      <div className="page-shell py-12 md:py-20">
        <Reveal className="mx-auto max-w-2xl">
          <div
            className="prose-editorial"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {relatedCategories.length ? (
            <section className="mt-16 border-t border-outline-variant pt-8">
              <p className="eyebrow text-on-surface-variant">
                {t("relatedCategories")}
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                {relatedCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={categoryHref(cat.slug)}
                      className="link-arrow text-base"
                    >
                      {cat.name}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </Reveal>

        {relatedProducts.length ? (
          <Reveal className="mx-auto mt-16 max-w-4xl" delay={60}>
            <h2 className="display-md text-on-surface">{t("relatedProducts")}</h2>
            <p className="mt-2 text-base text-on-surface-variant">
              {t("relatedProductsBody")}
            </p>
            <div className="lift-safe mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {relatedProducts.map((p) => (
                <RelatedProductTeaser key={p.id} product={p} />
              ))}
            </div>
          </Reveal>
        ) : null}
      </div>

      {/* Kapanış */}
      <section className="forest">
        <div className="page-shell py-16 text-center md:py-24">
          <Reveal>
            <h2 className="display-md mx-auto max-w-xl text-white">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/75">
              {t("ctaBody")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={categoryHref("avantajli-setler")}
                className="btn-brand-light"
              >
                {t("ctaSets")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/blog" className="btn-outline-light">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {t("ctaAllPosts")}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </article>
  );
}
