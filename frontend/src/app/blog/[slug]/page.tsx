import { AppImage as Image } from "@/components/AppImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
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
  const price = product.variants?.[0]?.price ?? product.basePrice;

  return (
    <Link
      href={`/urunler/${product.slug}`}
      className="group flex gap-4 rounded-xl border border-outline-variant/30 bg-white p-3 transition-shadow hover:shadow-md"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
        <Image
          src={img}
          alt={product.name}
          fill
          className="object-contain p-2"
          sizes="96px"
        />
      </div>
      <div className="min-w-0 flex-1 py-1">
        <h3 className="line-clamp-2 font-display text-base text-on-surface group-hover:text-primary">
          {product.name}
        </h3>
        <p className="mt-1 text-sm font-semibold text-primary">
          {formatMoney(price, product.currency)}
        </p>
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

  const crumbs = [
    { name: "Ana sayfa", path: "/" },
    { name: "Yazılar", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <article>
      <JsonLd data={blogPostJsonLd(post, settings)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PageBreadcrumb items={crumbs} />

      <div className="page-shell py-8 md:py-10">
        <header className="mx-auto max-w-3xl">
          <p className="text-sm text-on-surface-variant">
            {formatDate(post.publishedAt)}
            {post.authorName ? ` · ${post.authorName}` : ""}
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-tight text-on-surface md:text-5xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-base leading-relaxed text-on-surface-variant md:text-lg">
              {post.excerpt}
            </p>
          ) : null}
        </header>

        <div className="relative mx-auto mt-8 aspect-[21/9] max-w-4xl overflow-hidden rounded-xl bg-surface-container-low">
          <Image
            src={cover}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <div
            className="prose-blog space-y-5 text-base leading-8 text-on-surface-variant [&_a]:text-primary [&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-on-surface [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:text-on-surface [&_p]:mb-0 [&_strong]:text-on-surface [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {relatedCategories.length ? (
            <section className="mt-10 border-t border-outline-variant/20 pt-6">
              <p className="mb-3 text-sm font-medium text-on-surface">
                Kategoriler
              </p>
              <ul className="flex flex-wrap gap-2">
                {relatedCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={categoryCatalogPath(cat.slug)}
                      className="rounded-md border border-outline-variant/40 px-3 py-1.5 text-sm text-on-surface hover:border-primary hover:text-primary"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {relatedProducts.length ? (
            <section className="mt-12 border-t border-outline-variant/20 pt-8">
              <h2 className="font-display text-2xl text-on-surface">
                İlgili ürünler
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {relatedProducts.map((p) => (
                  <RelatedProductTeaser key={p.id} product={p} />
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-12 border-t border-outline-variant/20 pt-6">
            <Link
              href="/blog"
              className="text-sm font-semibold text-primary hover:underline"
            >
              ← Tüm yazılar
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
