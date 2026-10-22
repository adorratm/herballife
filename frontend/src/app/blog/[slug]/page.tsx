import { AppImage as Image } from "@/components/AppImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Reveal } from "@/components/Reveal";
import {
  getBlogPostBySlug,
  getBlogPosts,
  getCategories,
  getProductBySlug,
} from "@/lib/api";
import { categoryCatalogPath } from "@/lib/catalog-paths";
import { getSiteSettings } from "@/lib/cms";
import { formatMoney, productImage } from "@/lib/format";
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
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getBlogPostBySlug(slug),
    getSiteSettings(),
  ]);
  if (!post) {
    return { title: "Yazı bulunamadı", robots: { index: false, follow: false } };
  }
  return buildBlogPostMetadata(post, settings);
}

export async function generateStaticParams() {
  const paged = await getBlogPosts({ limit: 50, sort: "publishedAt" });
  return paged.items.map((p) => ({ slug: p.slug }));
}

function formatDate(value?: string | null) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("tr-TR", {
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
      href={`/urunler/${product.slug}`}
      className="card-motion group flex h-full gap-4 rounded-2xl border border-outline-variant/30 bg-white p-3 shadow-sm"
    >
      <div
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 40%, color-mix(in srgb, var(--primary-fixed) 90%, white), var(--surface-container-low))",
        }}
      >
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
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getBlogPostBySlug(slug),
    getSiteSettings(),
  ]);

  if (!post) notFound();

  const cover = productImage(post.coverImageUrl, post.slug);
  const relatedProducts = await loadRelatedProducts(post.relatedProductSlugs);
  const categorySlugs = relatedSlugList(post.relatedCategorySlugs);
  const categories = categorySlugs.length
    ? await getCategories().catch(() => [])
    : [];
  const relatedCategories = categories.filter((c) =>
    categorySlugs.includes(c.slug),
  );
  const tags = (post.tags || []).filter(Boolean);

  const crumbs = [
    { name: "Ana sayfa", path: "/" },
    { name: "Yazılar", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <article className="pb-8">
      <JsonLd data={blogPostJsonLd(post, settings)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PageBreadcrumb items={crumbs} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-outline-variant/25">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 15% 20%, color-mix(in srgb, var(--primary-fixed) 85%, white), transparent 55%), radial-gradient(ellipse 50% 45% at 100% 80%, color-mix(in srgb, var(--flash-soft) 60%, white), transparent 50%), #fff",
          }}
        />
        <div className="page-shell relative py-10 md:py-14">
          <Reveal className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/blog"
                className="text-xs font-bold uppercase tracking-wide text-primary hover:underline"
              >
                Yazılar
              </Link>
              {tags.map((t) => (
                <Link
                  key={t}
                  href={`/blog?tag=${encodeURIComponent(t)}`}
                  className="rounded-full bg-primary-fixed px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary"
                >
                  #{t}
                </Link>
              ))}
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="mt-4 text-base leading-relaxed text-on-surface-variant md:text-lg">
                {post.excerpt}
              </p>
            ) : null}
            <p className="mt-5 text-sm text-on-surface-variant">
              <time dateTime={post.publishedAt || undefined}>
                {formatDate(post.publishedAt)}
              </time>
              {post.authorName ? (
                <>
                  <span className="mx-2 text-outline-variant">·</span>
                  {post.authorName}
                </>
              ) : null}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="page-shell py-8 md:py-12">
        <Reveal>
          <div
            className="relative mx-auto aspect-[16/9] max-w-4xl overflow-hidden rounded-3xl border border-outline-variant/25 shadow-[0_20px_50px_-24px_rgba(18,40,28,0.25)]"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% 40%, color-mix(in srgb, var(--primary-fixed) 90%, white), var(--surface-container-low))",
            }}
          >
            <Image
              src={cover}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        </Reveal>

        <Reveal delay={80} className="mx-auto mt-10 max-w-3xl md:mt-12">
          <div
            className="prose-blog space-y-5 text-base leading-8 text-on-surface-variant [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-on-surface [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-on-surface [&_li]:leading-7 [&_p]:mb-0 [&_strong]:text-on-surface [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {relatedCategories.length ? (
            <section className="mt-12 rounded-2xl bg-surface-container-low p-5 md:p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                İlgili kategoriler
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {relatedCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={categoryCatalogPath(cat.slug)}
                      className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-on-surface shadow-sm ring-1 ring-outline-variant/30 transition hover:text-primary hover:ring-primary/40"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {relatedProducts.length ? (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-bold text-on-surface md:text-3xl">
                İlgili ürünler
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Bu yazıyla birlikte sık bakılanlar
              </p>
              <div className="lift-safe mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {relatedProducts.map((p) => (
                  <RelatedProductTeaser key={p.id} product={p} />
                ))}
              </div>
            </section>
          ) : null}
        </Reveal>

        <Reveal delay={120} className="mx-auto mt-14 max-w-3xl">
          <div className="overflow-hidden rounded-3xl bg-primary px-6 py-10 text-center text-on-primary shadow-[0_20px_50px_-18px_rgba(21,122,76,0.5)] md:px-10">
            <h2 className="font-display text-2xl md:text-3xl">
              Rutinine ürünle devam et
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-on-primary/90">
              Avantajlı setleri incele veya tüm yazılara dön.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/urunler/kategori/avantajli-setler"
                className="pressable inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-primary"
              >
                Setleri incele
              </Link>
              <Link
                href="/blog"
                className="pressable inline-flex rounded-full border-2 border-white/45 px-6 py-3 text-sm font-bold text-on-primary hover:bg-white/10"
              >
                Tüm yazılar
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
