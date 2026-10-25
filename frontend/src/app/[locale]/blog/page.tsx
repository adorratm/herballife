import { AppImage as Image } from "@/components/AppImage";
import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Reveal } from "@/components/Reveal";
import { getLocale, getTranslations } from "next-intl/server";
import { getBlogPosts } from "@/lib/blog.server";
import { getSiteSettings } from "@/lib/cms";
import { blogCoverImage } from "@/lib/format";
import { getSeoLabels } from "@/lib/seo-i18n";
import { buildBlogIndexMetadata } from "@/lib/seo";
import type { BlogPost } from "@/lib/types";

type Props = {
  searchParams: Promise<{ page?: string; tag?: string }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const locale = await getLocale();
  const [settings, labels] = await Promise.all([
    getSiteSettings(locale),
    getSeoLabels(),
  ]);
  const page = Math.max(1, Number(params.page || 1) || 1);
  return buildBlogIndexMetadata(settings, {
    locale,
    page,
    tag: params.tag,
    labels,
  });
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

function collectTags(posts: BlogPost[]) {
  const set = new Set<string>();
  for (const p of posts) {
    for (const t of p.tags || []) {
      if (t.trim()) set.add(t.trim());
    }
  }
  return [...set].slice(0, 8);
}

function readingMinutes(post: BlogPost) {
  const text = (post.content || "").replace(/<[^>]*>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const params = await searchParams;
  const locale = await getLocale();
  const [t, tCommon] = await Promise.all([
    getTranslations("blog"),
    getTranslations("common"),
  ]);
  const page = Math.max(1, Number(params.page || 1));
  const tag = params.tag || undefined;
  const [settings, paged] = await Promise.all([
    getSiteSettings(locale),
    getBlogPosts({
      page,
      limit: 9,
      tag,
      sort: "publishedAt",
      order: "desc",
    }),
  ]);

  const allTags = collectTags(paged.items);
  const tabs = tag && !allTags.includes(tag) ? [tag, ...allTags] : allTags;
  const brand = settings.brand.name;

  const showFeatured = page === 1 && paged.items.length > 0;
  const featured = showFeatured ? paged.items[0] : null;
  const rest = showFeatured ? paged.items.slice(1) : paged.items;

  return (
    <div>
      <PageBreadcrumb
        items={[
          { name: t("homeCrumb"), path: "/" },
          { name: t("postsCrumb"), path: "/blog" },
        ]}
      />

      {/* Başlık bandı */}
      <section className="forest">
        <div className="page-shell py-14 md:py-20">
          <div className="hero-enter">
            <p className="eyebrow text-[#8fe0b6]">{brand}</p>
            <h1 className="display-xl mt-4 text-white">{t("title")}</h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
              {t("heroBody")}
            </p>
          </div>

          {tabs.length > 0 ? (
            <nav
              aria-label={t("tagsNav")}
              className="mt-10 flex flex-wrap gap-x-7 gap-y-2 border-t border-white/20 pt-5"
            >
              <Link
                href="/blog"
                className={`border-b-2 pb-1 text-sm font-bold transition-colors ${
                  !tag
                    ? "border-[#8fe0b6] text-white"
                    : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                {tCommon("all")}
              </Link>
              {tabs.map((tab) => (
                <Link
                  key={tab}
                  href={`/blog?tag=${encodeURIComponent(tab)}`}
                  className={`border-b-2 pb-1 text-sm font-bold transition-colors ${
                    tag === tab
                      ? "border-[#8fe0b6] text-white"
                      : "border-transparent text-white/60 hover:text-white"
                  }`}
                >
                  {tab}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </section>

      <div className="page-shell py-12 md:py-20">
        {paged.items.length === 0 ? (
          <Reveal>
            <div className="mx-auto max-w-md py-10 text-center">
              <h2 className="display-md text-on-surface">{t("emptyTitle")}</h2>
              <p className="mt-3 text-base text-on-surface-variant">
                {tag ? t("emptyTag", { tag }) : t("emptyDefault")}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {tag ? (
                  <Link href="/blog" className="btn-outline-dark">
                    {t("allPosts")}
                  </Link>
                ) : null}
                <Link href="/urunler" className="btn-brand">
                  {t("exploreProducts")}
                </Link>
              </div>
            </div>
          </Reveal>
        ) : (
          <>
            {/* Öne çıkan yazı — kart yüzeyli dergi bloğu */}
            {featured ? (
              <Reveal>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group grid overflow-hidden rounded-2xl border border-outline-variant/40 bg-white shadow-sm transition-shadow hover:shadow-md lg:grid-cols-12"
                >
                  <div className="relative aspect-16/11 overflow-hidden bg-[#0f3d2e] lg:col-span-7 lg:aspect-auto lg:min-h-88">
                    <Image
                      src={blogCoverImage(featured.coverImageUrl, featured.slug)}
                      alt={featured.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(max-width: 1024px) 100vw, 58vw"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-5 lg:p-10">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                      {featured.tags?.[0] || t("featuredTag")}
                    </p>
                    <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight text-on-surface transition-colors group-hover:text-primary sm:text-3xl md:text-[2rem]">
                      {featured.title}
                    </h2>
                    {featured.excerpt ? (
                      <p className="mt-4 line-clamp-3 text-base leading-7 text-on-surface-variant">
                        {featured.excerpt}
                      </p>
                    ) : null}
                    <p className="mt-5 text-sm text-on-surface-variant">
                      <time dateTime={featured.publishedAt || undefined}>
                        {formatDate(featured.publishedAt, locale)}
                      </time>
                      {featured.authorName ? ` · ${featured.authorName}` : ""}
                      {` · ${t("readMinutes", { minutes: readingMinutes(featured) })}`}
                    </p>
                    <span className="link-arrow mt-6 text-sm">
                      {t("readPost")}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ) : null}

            {/* Diğer yazılar */}
            {rest.length > 0 ? (
              <ul
                className={`grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 ${
                  featured ? "mt-16 border-t border-outline-variant pt-14 md:mt-20 md:pt-16" : ""
                }`}
              >
                {rest.map((post, i) => (
                  <li key={post.id}>
                    <Reveal delay={Math.min(i, 5) * 60}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/35 bg-white shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="relative aspect-16/10 overflow-hidden bg-surface-container">
                          <Image
                            src={blogCoverImage(post.coverImageUrl, post.slug)}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-4 sm:p-5">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-on-surface-variant">
                            <span className="rounded-full bg-primary-fixed px-2 py-0.5 font-semibold text-primary">
                              {post.tags?.[0] || t("postTag")}
                            </span>
                            <span aria-hidden>·</span>
                            <time dateTime={post.publishedAt || undefined}>
                              {formatDate(post.publishedAt, locale)}
                            </time>
                            <span aria-hidden>·</span>
                            <span>
                              {t("readMinutes", {
                                minutes: readingMinutes(post),
                              })}
                            </span>
                          </div>
                          <h2 className="mt-3 font-display text-xl font-extrabold leading-snug tracking-tight text-on-surface transition-colors group-hover:text-primary sm:text-2xl">
                            {post.title}
                          </h2>
                          {post.excerpt ? (
                            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-on-surface-variant sm:text-base sm:leading-7">
                              {post.excerpt}
                            </p>
                          ) : (
                            <span className="flex-1" />
                          )}
                          <span className="link-arrow mt-4 text-sm">
                            {tCommon("readMore")}
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                          </span>
                        </div>
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}

        {paged.totalPages > 1 ? (
          <nav
            className="mt-16 flex items-center justify-center gap-4"
            aria-label={t("pagination")}
          >
            {page > 1 ? (
              <Link
                href={`/blog?page=${page - 1}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
                className="btn-outline-dark px-5 py-2.5 text-sm"
              >
                {t("previous")}
              </Link>
            ) : (
              <span className="px-5 py-2.5 text-sm text-outline-variant">
                {t("previous")}
              </span>
            )}
            <span className="text-sm font-semibold text-on-surface-variant">
              {page} / {paged.totalPages}
            </span>
            {page < paged.totalPages ? (
              <Link
                href={`/blog?page=${page + 1}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
                className="btn-outline-dark px-5 py-2.5 text-sm"
              >
                {t("next")}
              </Link>
            ) : (
              <span className="px-5 py-2.5 text-sm text-outline-variant">
                {t("next")}
              </span>
            )}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
