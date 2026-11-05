import { AppImage as Image } from "@/components/AppImage";
import { Link, toLinkHref } from "@/i18n/routing";
import { blogPostHref, categoryHref } from "@/i18n/hrefs";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRight,
  ArrowUpRight,
  CupSoda,
  Cookie,
  Dumbbell,
  Gift,
  MessageCircle,
  Pill,
  Scale,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BenefitsBar } from "@/components/BenefitsBar";
import { CampaignDateBanner } from "@/components/CampaignDateBanner";
import { FaqAccordion } from "@/components/FaqAccordion";
import { HomeStickyCta } from "@/components/HomeStickyCta";
import {
  HomeProductBlocks,
  type ResolvedHomeBlock,
} from "@/components/HomeProductBlocks";
import { Reveal } from "@/components/Reveal";
import { getBlogPosts } from "@/lib/blog.server";
import { getActiveCampaigns } from "@/lib/campaigns.server";
import { getCategories, getProductsPaged } from "@/lib/catalog.server";
import {
  getContentSections,
  getSiteSettings,
  sectionContent,
} from "@/lib/cms";
import { blogCoverImage } from "@/lib/format";
import {
  HOME_BLOCK_DEFS,
  normalizeHomeBlocks,
  type HomeBlockConfig,
  type HomeBlockKey,
} from "@/lib/home-blocks";
import {
  productDiscountPercent,
  resolveProductCompareAt,
} from "@/lib/product-badges";
import { buildHomeMetadata, faqJsonLd, JsonLd } from "@/lib/seo";
import { buildWhatsAppUrl, resolveWhatsAppPhone } from "@/lib/whatsapp";
import type { BlogPost, Category, Product } from "@/lib/types";

const SETS_CATEGORY = "avantajli-setler";
const PERSONAL_CARE_CATEGORY = "kisisel-bakim";
const GIFT_RE = /hediye/i;

function productDiscount(p: Product): number {
  const price = p.salePrice ?? p.variants?.[0]?.price ?? p.basePrice;
  return productDiscountPercent(price, resolveProductCompareAt(p, price)) ?? 0;
}

/**
 * Panelden ürün seçilmiş bloklar seçimi gösterir; seçilmemişse
 * kategori / öne çıkan / indirim oranına göre otomatik doldurulur.
 */
async function resolveHomeBlocks(
  configs: HomeBlockConfig[],
  locale: string,
  titleFor: (key: HomeBlockKey, custom?: string) => string,
): Promise<ResolvedHomeBlock[]> {
  const memo = new Map<string, Promise<Product[]>>();
  const load = (key: string, fn: () => Promise<{ items: Product[] }>) => {
    if (!memo.has(key)) {
      memo.set(
        key,
        fn()
          .then((r) => r.items ?? [])
          .catch(() => [] as Product[]),
      );
    }
    return memo.get(key)!;
  };
  const sets = () =>
    load("sets", () =>
      getProductsPaged({ page: 1, limit: 48, categorySlug: SETS_CATEGORY, locale }),
    );
  const featured = () =>
    load("featured", () =>
      getProductsPaged({ page: 1, limit: 36, featured: true, locale }),
    );
  const all = () =>
    load("all", () => getProductsPaged({ page: 1, limit: 100, locale }));
  const personal = () =>
    load("personal", () =>
      getProductsPaged({
        page: 1,
        limit: 16,
        categorySlug: PERSONAL_CARE_CATEGORY,
        locale,
      }),
    );
  const isSet = (p: Product) =>
    p.category?.slug === SETS_CATEGORY ||
    Object.values(p.category?.localeSlugs || {}).includes(SETS_CATEGORY);

  async function auto(key: HomeBlockKey): Promise<Product[]> {
    switch (key) {
      case "giftedPackages": {
        const list = await sets();
        const gifted = list.filter((p) => GIFT_RE.test(p.name));
        return gifted.length ? gifted : list;
      }
      case "bestsellerSets": {
        const list = await sets();
        const plain = list.filter((p) => !GIFT_RE.test(p.name));
        return plain.length ? plain : list;
      }
      case "bestsellerProducts": {
        const f = (await featured()).filter((p) => !isSet(p));
        if (f.length) return f;
        return (await all()).filter((p) => !isSet(p));
      }
      case "sets":
        return sets();
      case "deals":
        return [...(await all())]
          .filter((p) => productDiscount(p) > 0)
          .sort((a, b) => productDiscount(b) - productDiscount(a));
      case "personalCare":
        return personal();
    }
  }

  const enabled = configs.filter((c) => c.enabled);
  return Promise.all(
    enabled.map(async (c) => {
      const limit = c.limit || HOME_BLOCK_DEFS[c.key].defaultLimit;
      let products: Product[] = [];
      if (c.productIds.length) {
        products = await load(`ids:${c.key}`, () =>
          getProductsPaged({
            page: 1,
            limit: Math.min(c.productIds.length, 100),
            ids: c.productIds,
            locale,
          }),
        );
      }
      if (!products.length) products = await auto(c.key);
      return {
        key: c.key,
        title: titleFor(c.key, c.title),
        products: products.slice(0, limit),
      };
    }),
  );
}

const HOME_CATEGORY_HUB: { slug: string; Icon: LucideIcon }[] = [
  { slug: "kilo-kontrolu", Icon: Scale },
  { slug: "icecekler", Icon: CupSoda },
  { slug: "avantajli-setler", Icon: Gift },
  { slug: "takviye-edici", Icon: Pill },
  { slug: "sporcu-urunleri", Icon: Dumbbell },
  { slug: "atistirmalik", Icon: Cookie },
];

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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const settings = await getSiteSettings(locale);
  return buildHomeMetadata(settings, locale);
}

export default async function HomePage() {
  const locale = await getLocale();
  const tHome = await getTranslations("home");
  const journey = [
    {
      step: "01",
      title: tHome("journey.step1Title"),
      body: tHome("journey.step1Body"),
    },
    {
      step: "02",
      title: tHome("journey.step2Title"),
      body: tHome("journey.step2Body"),
    },
    {
      step: "03",
      title: tHome("journey.step3Title"),
      body: tHome("journey.step3Body"),
    },
  ];
  const settings = await getSiteSettings(locale);
  const blockConfigs = normalizeHomeBlocks(settings.homeBlocks);
  const [sections, categories, productBlocks, activeCampaigns, blog] =
    await Promise.all([
    getContentSections("home", locale),
    getCategories(locale).catch(() => [] as Category[]),
    resolveHomeBlocks(blockConfigs, locale, (key, custom) =>
      locale === "tr" && custom?.trim()
        ? custom.trim()
        : tHome(`blocks.${key}` as Parameters<typeof tHome>[0]),
    ),
    getActiveCampaigns(),
    getBlogPosts({
      page: 1,
      limit: 3,
      sort: "publishedAt",
      order: "desc",
      locale,
    }).catch(() => ({ items: [] as BlogPost[] })),
  ]);

  const topCampaign = activeCampaigns[0] ?? null;
  const posts = (blog.items ?? []) as BlogPost[];

  const hero = sectionContent(sections, "hero", {
    headline: tHome("fallbackHeroHeadline"),
    body: settings.brand.tagline,
    ctaLabel: tHome("fallbackHeroCta"),
    ctaHref: "/urunler/kategori/avantajli-setler",
    secondaryCtaLabel: tHome("fallbackHeroSecondaryCta"),
  });

  const fallbackFaqItems = tHome.raw("fallbackFaqItems") as {
    question: string;
    answer: string;
  }[];
  const faqCms = sectionContent(sections, "faq", {
    title: tHome("fallbackFaqTitle"),
    items: fallbackFaqItems,
  });
  const faqItems = (
    Array.isArray(faqCms.items) && faqCms.items.length
      ? faqCms.items
      : fallbackFaqItems
  ).filter(
    (item: { question?: string; answer?: string }) =>
      item?.question?.trim() && item?.answer?.trim(),
  ) as { question: string; answer: string }[];

  const waPhone = resolveWhatsAppPhone({
    whatsappPhone: settings.whatsapp.phone,
    contactPhone: settings.contact.phone,
  });
  const waUrl = buildWhatsAppUrl(
    waPhone,
    tHome("waPrefillConsult", { name: settings.brand.distributorName }),
  );

  const catBySlug = new Map<string, Category>();
  for (const c of categories) {
    catBySlug.set(c.slug, c);
    for (const s of Object.values(c.localeSlugs || {})) {
      if (s) catBySlug.set(s, c);
    }
  }
  const faqLd = faqJsonLd(faqItems);

  const brandWords = settings.brand.name.trim().split(/\s+/);

  return (
    <div>
      <HomeStickyCta />
      {faqLd ? <JsonLd data={faqLd} /> : null}

      {/* 1 — Hero: marka, tek başlık, tek cümle, CTA, baskın ürün görseli */}
      <section className="hero-forest relative isolate overflow-hidden">
        <div className="page-shell grid items-center gap-5 py-8 sm:gap-6 sm:py-10 lg:min-h-[min(28rem,calc(100svh-5.5rem))] lg:grid-cols-12 lg:gap-5 lg:py-12">
          <div className="hero-enter relative z-10 lg:col-span-6">
            <h1 className="display-xl text-[clamp(2.75rem,7.5vw,5.5rem)]">
              <span className="block text-white">{brandWords[0]}</span>
              {brandWords.length > 1 ? (
                <span className="block text-[#8fe0b6]">
                  {brandWords.slice(1).join(" ")}
                </span>
              ) : null}
            </h1>
            <p className="mt-4 max-w-md font-display text-xl font-bold leading-snug tracking-tight text-white md:text-2xl">
              {String(hero.headline)}
            </p>
            <p className="mt-2 line-clamp-2 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              {String(hero.body)}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={toLinkHref(String(hero.ctaHref))} className="btn-brand-light">
                {String(hero.ctaLabel)}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-light"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                {String(hero.secondaryCtaLabel)}
              </a>
            </div>
          </div>

          <div className="hero-media relative w-full min-w-0 lg:col-span-6">
            <div className="relative mx-auto aspect-5/4 w-full max-w-full overflow-hidden sm:max-w-140 lg:max-h-88">
              <div className="absolute bottom-0 left-[18%] z-10 aspect-square h-[52%] max-h-full -translate-x-1/2 sm:bottom-[-3%] sm:h-[58%]">
                {/* eslint-disable-next-line @next/next/no-img-element -- hero LCP: kesin eager */}
                <img
                  src="/images/cutouts/bitkisel-cay.png"
                  alt=""
                  width={480}
                  height={480}
                  decoding="async"
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.22)]"
                />
              </div>
              <div className="absolute bottom-0 left-[80%] z-10 aspect-square h-[72%] max-h-full -translate-x-1/2 sm:bottom-[-3%] sm:left-[82%] sm:h-[88%]">
                {/* eslint-disable-next-line @next/next/no-img-element -- hero LCP: kesin eager */}
                <img
                  src="/images/cutouts/herbal-aloe.png"
                  alt=""
                  width={720}
                  height={720}
                  decoding="async"
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.22)]"
                />
              </div>
              <div className="absolute bottom-0 left-1/2 z-20 aspect-square h-[92%] max-h-full -translate-x-1/2 sm:bottom-[-3%] sm:h-full">
                {/* eslint-disable-next-line @next/next/no-img-element -- hero LCP: kesin eager */}
                <img
                  src="/images/cutouts/formul-1-shake.png"
                  alt={tHome("heroShakeAlt", { brand: settings.brand.name })}
                  width={880}
                  height={880}
                  decoding="async"
                  loading="eager"
                  fetchPriority="high"
                  className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_24px_28px_rgba(0,0,0,0.28)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {topCampaign?.startsAt || topCampaign?.endsAt ? (
        <CampaignDateBanner
          startsAt={topCampaign.startsAt}
          endsAt={topCampaign.endsAt}
        />
      ) : null}

      {/* 3 — Ürün blokları (panel: Ana sayfa blokları) */}
      <HomeProductBlocks blocks={productBlocks} />
      {!productBlocks.some((b) => b.products.length) ? (
        <p className="page-shell py-10 text-sm text-on-surface-variant">
          {tHome("productsComingSoon")}
        </p>
      ) : null}

      <section className="bg-white pb-10 pt-4 md:pb-14 md:pt-6">
        <div className="page-shell">
          <BenefitsBar
            promises={settings.promises}
            freeShippingOver={settings.shipping?.freeShippingOver}
          />
        </div>
      </section>

      {/* 2 — Kategori şeridi: tek iş, hedefe göre yönlendir */}
      <section className="bg-white py-14 md:py-20">
        <div className="page-shell">
          <Reveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-primary">
                  {tHome("categories.eyebrow")}
                </p>
                <h2 className="display-md mt-3 text-on-surface">
                  {tHome("categories.title")}
                </h2>
              </div>
              <Link href="/urunler" className="link-arrow text-sm">
                {tHome("categories.allProducts")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
            {HOME_CATEGORY_HUB.map((hub, i) => {
              const cat = catBySlug.get(hub.slug);
              return (
                <li key={hub.slug}>
                  <Reveal delay={i * 50} className="h-full">
                    <Link
                      href={categoryHref(cat?.slug || hub.slug)}
                      className="group flex h-full flex-col border-t-2 border-outline-variant pt-5 transition-colors hover:border-primary"
                    >
                      <hub.Icon
                        className="h-7 w-7 text-primary"
                        strokeWidth={1.6}
                        aria-hidden
                      />
                      <span className="mt-5 flex items-start justify-between gap-2 font-display text-lg font-bold leading-snug text-on-surface">
                        {cat?.name ||
                          tHome(
                            `categoryHub.${hub.slug}.name` as Parameters<
                              typeof tHome
                            >[0],
                          )}
                        <ArrowUpRight
                          className="mt-1 h-4 w-4 shrink-0 text-outline transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                          aria-hidden
                        />
                      </span>
                      <span className="mt-1.5 text-sm leading-snug text-on-surface-variant">
                        {tHome(
                          `categoryHub.${hub.slug}.blurb` as Parameters<
                            typeof tHome
                          >[0],
                        )}
                        {cat?.productCount != null && cat.productCount > 0 ? (
                          <span className="mt-1 block text-xs font-semibold text-primary">
                            {tHome("productCount", { count: cat.productCount })}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      

      {/* 5 — Yolculuk: 3 adım */}
      <section className="forest py-10 md:py-12">
        <div className="page-shell grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-[#8fe0b6]">{tHome("journey.eyebrow")}</p>
            <h2 className="display-md mt-3 text-white">
              {tHome("journey.title")}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 md:text-base">
              {tHome("journey.body")}
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand-light mt-5 px-5! py-2.5! text-sm!"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {tHome("journey.cta")}
            </a>
            <p className="mt-5 max-w-sm text-[11px] leading-relaxed text-white/55">
              {tHome("journey.disclaimer", {
                distributor: settings.brand.distributorName,
              })}
            </p>
          </Reveal>
          <ol className="lg:col-span-7">
            {journey.map((j, i) => (
              <li key={j.step}>
                <Reveal delay={i * 80}>
                  <div
                    className={`grid grid-cols-[3.25rem_1fr] items-start gap-3 py-4 sm:grid-cols-[4.25rem_1fr] ${
                      i === 0 ? "" : "border-t border-white/20"
                    }`}
                  >
                    <span className="font-display text-3xl font-extrabold leading-none tracking-tighter text-[#8fe0b6] sm:text-4xl">
                      {j.step}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold tracking-tight text-white">
                        {j.title}
                      </h3>
                      <p className="mt-1 max-w-lg text-sm leading-relaxed text-white/75">
                        {j.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 6 — Blog tease */}
      {posts.length ? (
        <section className="mint-wash py-14 md:py-20">
          <div className="page-shell">
            <Reveal>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow text-primary">
                    {tHome("blog.eyebrow")}
                  </p>
                  <h2 className="display-md mt-3 text-on-surface">
                    {tHome("blog.title")}
                  </h2>
                </div>
                <Link href="/blog" className="link-arrow text-sm">
                  {tHome("blog.allPosts")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 3).map((p, i) => (
                <Reveal key={p.id} delay={i * 70}>
                  <Link
                    href={blogPostHref(p.slug)}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/40 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-16/10 overflow-hidden bg-[#0f3d2e]">
                      <Image
                        src={blogCoverImage(p.coverImageUrl, p.slug)}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                        <time dateTime={p.publishedAt || undefined}>
                          {formatDate(p.publishedAt)}
                        </time>
                        {p.tags?.[0] ? ` · ${p.tags[0]}` : ""}
                      </p>
                      <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold leading-snug text-on-surface transition-colors group-hover:text-primary sm:text-xl">
                        {p.title}
                      </h3>
                      {p.excerpt ? (
                        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-on-surface-variant">
                          {p.excerpt}
                        </p>
                      ) : (
                        <span className="flex-1" />
                      )}
                      <span className="link-arrow mt-4 text-sm">
                        {tHome("blog.read")}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 7 — SSS */}
      <section className="mint-wash py-14 md:py-20">
        <div className="page-shell grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-primary">{tHome("faqEyebrow")}</p>
            <h2 className="display-md mt-3 text-on-surface">
              {String(faqCms.title || tHome("fallbackFaqTitle"))}
            </h2>
            <Link href="/sss" className="link-arrow mt-6 text-sm">
              {tHome("faqAllLink")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
          <Reveal className="lg:col-span-8" delay={80}>
            <FaqAccordion items={faqItems.slice(0, 4)} />
          </Reveal>
        </div>
      </section>

      {settings.membership?.ctaUrl?.trim() ? (
        <section className="border-y border-outline-variant bg-surface-container-low py-10 md:py-12">
          <div className="page-shell max-w-2xl text-center">
            <p className="eyebrow text-primary">{tHome("membershipEyebrow")}</p>
            <h2 className="display-md mt-3 text-on-surface">
              {settings.membership?.ctaLabel?.trim() ||
                tHome("membershipFallbackTitle")}
            </h2>
            {settings.membership?.disclaimer?.trim() ? (
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                {settings.membership.disclaimer}
              </p>
            ) : null}
            <a
              href={
                settings.membership?.ctaUrl?.trim() ||
                "https://www.myherbalife.com"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta mt-6 inline-flex px-6 py-3 text-sm"
            >
              myHerbalife.com →
            </a>
          </div>
        </section>
      ) : null}

    </div>
  );
}
