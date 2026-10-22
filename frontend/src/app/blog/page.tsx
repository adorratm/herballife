import { AppImage as Image } from "@/components/AppImage";
import Link from "next/link";
import type { Metadata } from "next";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { getBlogPosts } from "@/lib/api";
import { getSiteSettings } from "@/lib/cms";
import { productImage } from "@/lib/format";
import { buildBlogIndexMetadata } from "@/lib/seo";

type Props = {
  searchParams: Promise<{ page?: string; tag?: string }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const settings = await getSiteSettings();
  const page = Math.max(1, Number(params.page || 1) || 1);
  return buildBlogIndexMetadata(settings, {
    page,
    tag: params.tag,
  });
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

export default async function BlogIndexPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const tag = params.tag || undefined;
  const paged = await getBlogPosts({
    page,
    limit: 9,
    tag,
    sort: "publishedAt",
    order: "desc",
  });

  return (
    <div className="pb-16">
      <PageBreadcrumb
        items={[
          { name: "Ana sayfa", path: "/" },
          { name: "Yazılar", path: "/blog" },
        ]}
      />

      <div className="page-shell py-8 md:py-10">
        <header className="mb-8 max-w-2xl">
          <p className="page-kicker">İçerik</p>
          <h1 className="page-title">Yazılar</h1>
          <p className="page-lead">
            Beslenme, paketler ve sağlıklı yaşam notları
            {tag ? ` · #${tag}` : ""}
          </p>
        </header>

        {paged.items.length === 0 ? (
          <div className="surface-panel p-10 text-center">
            <h2 className="section-title">Henüz yazı yok</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Yeni yazılar yakında burada yayınlanacak.
            </p>
          </div>
        ) : (
          <div className="lift-safe grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {paged.items.map((post) => {
              const cover = productImage(post.coverImageUrl, post.slug);
              return (
                <article
                  key={post.id}
                  className="card-motion group flex h-full flex-col rounded-2xl border border-outline-variant/30 bg-white shadow-sm"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative block aspect-16/10 overflow-hidden bg-surface-container-low"
                  >
                    <Image
                      src={cover}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs text-on-surface-variant">
                      {formatDate(post.publishedAt)}
                      {post.authorName ? ` · ${post.authorName}` : ""}
                    </p>
                    <h2 className="mt-2 line-clamp-2 min-h-[2.6em] font-display text-xl leading-snug text-on-surface">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:text-primary"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-on-surface-variant">
                        {post.excerpt}
                      </p>
                    ) : null}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-4 text-sm font-semibold text-primary hover:underline"
                    >
                      Devamını oku
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {paged.totalPages > 1 ? (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {page > 1 ? (
              <Link
                href={`/blog?page=${page - 1}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
                className="rounded-md border border-outline-variant/40 px-4 py-2 text-sm font-medium"
              >
                Önceki
              </Link>
            ) : null}
            <span className="px-3 text-sm text-on-surface-variant">
              {page} / {paged.totalPages}
            </span>
            {page < paged.totalPages ? (
              <Link
                href={`/blog?page=${page + 1}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
                className="rounded-md border border-outline-variant/40 px-4 py-2 text-sm font-medium"
              >
                Sonraki
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
