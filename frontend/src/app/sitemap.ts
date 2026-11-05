import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { getBlogSlugs } from "@/lib/api";
import { getCategories } from "@/lib/catalog.server";
import { fetchAllCatalogProducts } from "@/lib/catalog-feed";
import { categoryCatalogPath } from "@/lib/catalog-paths";
import { productImage } from "@/lib/format";
import { getSiteSettings, isGoogleReviewsPageEnabled } from "@/lib/cms";
import { localizedPath, SITE_URL } from "@/lib/seo";

const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/urunler", changeFrequency: "daily", priority: 0.9 },
  { path: "/hakkimizda", changeFrequency: "monthly", priority: 0.8 },
  { path: "/sss", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.85 },
  { path: "/medya", changeFrequency: "weekly", priority: 0.75 },
  { path: "/iletisim", changeFrequency: "monthly", priority: 0.7 },
  { path: "/yorum", changeFrequency: "monthly", priority: 0.55 },
  { path: "/kocluk", changeFrequency: "monthly", priority: 0.7 },
  { path: "/kvkk", changeFrequency: "yearly", priority: 0.3 },
  { path: "/gizlilik", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cerez-politikasi", changeFrequency: "yearly", priority: 0.3 },
  { path: "/mesafeli-satis", changeFrequency: "yearly", priority: 0.3 },
  { path: "/on-bilgilendirme", changeFrequency: "yearly", priority: 0.3 },
  { path: "/iptal-iade", changeFrequency: "yearly", priority: 0.3 },
  { path: "/teslimat", changeFrequency: "yearly", priority: 0.3 },
  { path: "/musteri-memnuniyeti", changeFrequency: "yearly", priority: 0.3 },
  { path: "/guvenli-alisveris", changeFrequency: "yearly", priority: 0.3 },
  { path: "/aydinlatma-metni", changeFrequency: "yearly", priority: 0.3 },
];

function safeDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function absoluteHttpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const url = value.trim();
  if (!/^https?:\/\//i.test(url)) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/** Sitemap 1 saat önbellekte: hızlı yanıt (Search Console zaman aşımı yaşamasın) */
export const revalidate = 3600;

type LocaleSlugs = Record<string, string> | undefined;

/**
 * Yalnız panelde açık diller. Kapalı dillerin URL’leri sitemap’e girerse
 * Google yönlendirmeli / gereksiz sayfalarla karşılaşır.
 */
function activeLocales(
  settings: Awaited<ReturnType<typeof getSiteSettings>> | null,
): string[] {
  const loc = settings?.localization;
  const fromList = Array.isArray(loc?.enabledLocales)
    ? loc.enabledLocales
    : Array.isArray(loc?.languages)
      ? loc.languages.filter((l) => l?.enabled !== false).map((l) => l.code)
      : [];
  const valid = fromList.filter((l): l is (typeof locales)[number] =>
    (locales as readonly string[]).includes(l),
  );
  if (!valid.length) return [...locales];
  // TR (varsayılan) her zaman başta
  return Array.from(new Set(["tr", ...valid])).filter((l) =>
    (locales as readonly string[]).includes(l),
  );
}

function withLocales(
  langs: string[],
  pathFor: (locale: string) => string,
  meta: Omit<MetadataRoute.Sitemap[number], "url">,
): MetadataRoute.Sitemap {
  const urls = Object.fromEntries(
    langs.map((l) => [l, `${SITE_URL}${localizedPath(l, pathFor(l) || "/")}`]),
  );
  return langs.map((locale) => ({
    url: urls[locale],
    ...meta,
    ...(langs.length > 1 ? { alternates: { languages: urls } } : {}),
  }));
}

function slugFor(locale: string, base: string, localeSlugs: LocaleSlugs) {
  return (localeSlugs?.[locale] || base).trim();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const settings = await getSiteSettings("tr").catch(() => null);
  const langs = activeLocales(settings);
  const reviewsOn = settings
    ? isGoogleReviewsPageEnabled(settings)
    : false;
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.filter(
    (route) => reviewsOn || route.path !== "/yorum",
  ).flatMap((route) =>
    withLocales(langs, () => route.path, {
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }),
  );

  try {
    const [products, blogSlugs, categories] = await Promise.all([
      fetchAllCatalogProducts().catch(() => []),
      getBlogSlugs().catch(() => []),
      getCategories("tr").catch(() => []),
    ]);

    for (const cat of categories || []) {
      if (!cat?.slug) continue;
      entries.push(
        ...withLocales(
          langs,
          (l) => categoryCatalogPath(slugFor(l, cat.slug, cat.localeSlugs)),
          {
            lastModified: safeDate(cat.updatedAt) || now,
            changeFrequency: "weekly",
            priority: 0.75,
          },
        ),
      );
    }

    for (const p of products || []) {
      if (!p?.slug) continue;
      const img = absoluteHttpUrl(productImage(p.imageUrl, p.slug));
      entries.push(
        ...withLocales(
          langs,
          (l) => `/urunler/${slugFor(l, p.slug, p.localeSlugs)}`,
          {
            lastModified: safeDate(p.updatedAt) || now,
            changeFrequency: "weekly",
            priority: 0.8,
            ...(img ? { images: [img] } : {}),
          },
        ),
      );
    }

    for (const post of blogSlugs || []) {
      // API {slug, updatedAt, localeSlugs} döner (eski sürüm düz string)
      const base =
        typeof post === "string" ? post : (post as { slug?: string })?.slug;
      if (!base) continue;
      const ls =
        typeof post === "string" ? undefined : (post as { localeSlugs?: LocaleSlugs }).localeSlugs;
      const updated =
        typeof post === "string"
          ? undefined
          : safeDate(post.updatedAt) || safeDate(post.publishedAt);
      entries.push(
        ...withLocales(langs, (l) => `/blog/${slugFor(l, base, ls)}`, {
          lastModified: updated || now,
          changeFrequency: "weekly",
          priority: 0.7,
        }),
      );
    }
  } catch {
    /* static only */
  }

  return entries;
}
