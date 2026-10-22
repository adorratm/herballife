import { AppImage as Image } from "@/components/AppImage";
import Link from "next/link";
import type { Metadata } from "next";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Reveal } from "@/components/Reveal";
import { getBlogPosts } from "@/lib/api";
import { getSiteSettings } from "@/lib/cms";
import { productImage } from "@/lib/format";
import { buildBlogIndexMetadata } from "@/lib/seo";
import type { BlogPost } from "@/lib/types";

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
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function collectTags(posts: BlogPost[]) {
  const set = new Set<string>();
  for (const p of posts) {
    for (const t of p.tags || []) {
      if (t.trim()) set.add(t.trim());
    }
  }
  return [...set].slice(0, 8);
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const tag = params.tag || undefined;
  const [settings, paged] = await Promise.all([
    getSiteSettings(),
    getBlogPosts({
      page,
      limit: 9,
      tag,
      sort: "publishedAt",
      order: "desc",
    }),
  ]);

  const allTags = collectTags(paged.items);
  const brand = settings.brand.name;

  return (
    <div className="pb-16">
      <PageBreadcrumb
        items={[
          { name: "Ana sayfa", path: "/" },
          { name: "Yazılar", path: "/blog" },
        ]}
      />

      <section className="relative overflow-hidden border-b border-outline-variant/25">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 10% 30%, color-mix(in srgb, var(--primary-fixed) 88%, white), transparent 55%), radial-gradient(ellipse 55% 50% at 95% 70%, color-mix(in srgb, var(--flash-soft) 65%, white), transparent 50%), #fff",
          }}
        />
        <div className="page-shell relative py-12 md:py-16">
          <Reveal>
            <p className="page-kicker">{brand}</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl lg:text-6xl">
              Yazılar
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-on-surface-variant md:text-lg">
              Beslenme rutinleri, paket önerileri ve sağlıklı yaşam notları.
            </p>
          </Reveal>

          {(allTags.length > 0 || tag) && (
            <Reveal delay={80} className="mt-8">
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/blog"
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    !tag
                      ? "bg-primary text-on-primary"
                      : "bg-white text-on-surface-variant ring-1 ring-outline-variant/40 hover:text-primary"
                  }`}
                >
                  Tümü
                </Link>
                {(tag && !allTags.includes(tag) ? [tag, ...allTags] : allTags).map(
                  (t) => (
                    <Link
                      key={t}
                      href={`/blog?tag=${encodeURIComponent(t)}`}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                        tag === t
                          ? "bg-primary text-on-primary"
                          : "bg-white text-on-surface-variant ring-1 ring-outline-variant/40 hover:text-primary"
                      }`}
                    >
                      #{t}
                    </Link>
                  ),
                )}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <div className="page-shell py-10 md:py-14">
        {paged.items.length === 0 ? (
          <Reveal>
            <div className="rounded-3xl bg-surface-container-low px-6 py-16 text-center">
              <h2 className="font-display text-2xl text-on-surface">
                Henüz yazı yok
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-on-surface-variant">
                {tag
                  ? `#${tag} etiketinde içerik bulunamadı.`
                  : "Yeni yazılar yakında burada."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {tag ? (
                  <Link href="/blog" className="btn-ghost px-6 py-2.5 text-sm">
                    Tüm yazılar
                  </Link>
                ) : null}
                <Link href="/urunler" className="btn-cta px-6 py-2.5 text-sm">
                  Ürünleri keşfet
                </Link>
              </div>
            </div>
          </Reveal>
        ) : (
          <ul className="space-y-5 md:space-y-6">
            {paged.items.map((post, i) => {
              const cover = productImage(post.coverImageUrl, post.slug);
              const firstTag = post.tags?.[0];
              return (
                <li key={post.id}>
                  <Reveal delay={Math.min(i, 6) * 45}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="card-motion group grid overflow-hidden rounded-2xl border border-outline-variant/25 bg-white shadow-sm md:grid-cols-[minmax(0,18rem)_1fr] lg:grid-cols-[minmax(0,22rem)_1fr]"
                    >
                      <div
                        className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[11.5rem]"
                        style={{
                          background:
                            "radial-gradient(ellipse 70% 55% at 50% 40%, color-mix(in srgb, var(--primary-fixed) 90%, white), var(--surface-container-low))",
                        }}
                      >
                        <Image
                          src={cover}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          sizes="(max-width: 768px) 100vw, 22rem"
                          priority={i === 0}
                        />
                      </div>
                      <div className="flex flex-col justify-center p-5 sm:p-6 md:px-8 md:py-7">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant">
                          <time dateTime={post.publishedAt || undefined}>
                            {formatDate(post.publishedAt)}
                          </time>
                          {post.authorName ? (
                            <span className="text-outline-variant">·</span>
                          ) : null}
                          {post.authorName ? (
                            <span>{post.authorName}</span>
                          ) : null}
                          {firstTag ? (
                            <>
                              <span className="text-outline-variant">·</span>
                              <span className="font-semibold text-primary">
                                #{firstTag}
                              </span>
                            </>
                          ) : null}
                        </div>
                        <h2 className="mt-2 font-display text-xl leading-snug text-on-surface transition-colors group-hover:text-primary sm:text-2xl">
                          {post.title}
                        </h2>
                        {post.excerpt ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
                            {post.excerpt}
                          </p>
                        ) : null}
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                          Oku
                          <span
                            aria-hidden
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          >
                            →
                          </span>
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        )}

        {paged.totalPages > 1 ? (
          <nav
            className="mt-12 flex items-center justify-center gap-3"
            aria-label="Sayfalama"
          >
            {page > 1 ? (
              <Link
                href={`/blog?page=${page - 1}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
                className="rounded-full border border-outline-variant/40 bg-white px-5 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                Önceki
              </Link>
            ) : (
              <span className="px-5 py-2.5 text-sm text-outline-variant">
                Önceki
              </span>
            )}
            <span className="text-sm font-semibold text-on-surface-variant">
              {page} / {paged.totalPages}
            </span>
            {page < paged.totalPages ? (
              <Link
                href={`/blog?page=${page + 1}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
                className="rounded-full border border-outline-variant/40 bg-white px-5 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                Sonraki
              </Link>
            ) : (
              <span className="px-5 py-2.5 text-sm text-outline-variant">
                Sonraki
              </span>
            )}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
