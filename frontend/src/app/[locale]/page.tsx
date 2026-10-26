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
import { NewsletterForm } from "@/components/NewsletterForm";
import { ProductCarousel } from "@/components/ProductCarousel";
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
import { buildHomeMetadata, faqJsonLd, JsonLd } from "@/lib/seo";
import { buildWhatsAppUrl, resolveWhatsAppPhone } from "@/lib/whatsapp";
import type { BlogPost, Category } from "@/lib/types";

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
  const [
    settings,
    sections,
    categories,
    featured,
    gifted,
    bestsellers,
    activeCampaigns,
    blog,
  ] = await Promise.all([
    getSiteSettings(locale),
    getContentSections("home", locale),
    getCategories(locale).catch(() => [] as Category[]),
    getProductsPaged({
      page: 1,
      limit: 12,
      featured: true,
      locale,
    }).catch(() => ({
      items: [],
    })),
    getProductsPaged({
      page: 1,
      limit: 12,
      categorySlug: "avantajli-setler",
      locale,
    }).catch(() => ({ items: [] })),
    getProductsPaged({
      page: 1,
      limit: 12,
      sort: "name",
      order: "asc",
      locale,
    }).catch(() => ({ items: [] })),
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
  const giftedProducts = (
    gifted.items.length ? gifted.items : featured.items
  ).slice(0, 12);
  const bestsellerProducts = (
    bestsellers.items.length ? bestsellers.items : featured.items
  ).slice(0, 12);

  return (
    <div>
      <HomeStickyCta />
      {faqLd ? <JsonLd data={faqLd} /> : null}

      {/* 1 — Hero: marka, tek başlık, tek cümle, CTA, baskın ürün görseli */}
      <section className="hero-forest relative isolate overflow-hidden">
        <div className="page-shell grid items-center gap-8 py-12 sm:py-16 lg:min-h-[min(46rem,calc(100svh-4.5rem))] lg:grid-cols-12 lg:gap-6 lg:py-20">
          <div className="hero-enter relative z-10 lg:col-span-6">
            <h1 className="display-xl">
              <span className="block text-white">{brandWords[0]}</span>
              {brandWords.length > 1 ? (
                <span className="block text-[#8fe0b6]">
                  {brandWords.slice(1).join(" ")}
                </span>
              ) : null}
            </h1>
            <p className="mt-7 max-w-md font-display text-2xl font-bold leading-snug tracking-tight text-white md:text-3xl">
              {String(hero.headline)}
            </p>
            <p className="mt-3 line-clamp-2 max-w-md text-base leading-relaxed text-white/75">
              {String(hero.body)}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
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

          <div className="hero-media relative lg:col-span-6">
            <div className="relative mx-auto aspect-6/5 w-full max-w-176">
              <div className="absolute bottom-[-3%] left-[17%] z-10 aspect-square h-[58%] -translate-x-1/2">
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
              <div className="absolute bottom-[-3%] left-[82%] z-10 aspect-square h-[88%] -translate-x-1/2">
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
              <div className="absolute bottom-[-3%] left-1/2 z-20 aspect-square h-full -translate-x-1/2">
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

      <section className="border-b border-outline-variant/30 bg-white py-8 md:py-10">
        <div className="page-shell">
          <BenefitsBar promises={settings.promises} />
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

      {/* 3 — Hediyeli setler */}
      <section id="hediyeli-setler" className="mint-wash py-14 md:py-20">
        <div className="page-shell">
          <Reveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="eyebrow text-primary">
                  {topCampaign?.badge || tHome("giftedEyebrowFallback")}
                </p>
                <h2 className="display-md mt-3 text-on-surface">
                  {tHome("giftedTitle")}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-on-surface-variant">
                  {topCampaign?.headline || tHome("giftedBodyFallback")}
                </p>
              </div>
              <Link
                href={categoryHref("avantajli-setler")}
                className="link-arrow text-sm"
              >
                {tHome("giftedAllLink")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
          <div className="mt-8">
            <ProductCarousel products={giftedProducts} />
          </div>
          {!featured.items.length && !gifted.items.length ? (
            <p className="mt-6 text-sm text-on-surface-variant">
              {tHome("productsComingSoon")}
            </p>
          ) : null}
        </div>
      </section>

      {/* 4 — En çok satanlar */}
      <section className="bg-white py-14 md:py-20">
        <div className="page-shell">
          <Reveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-primary">{tHome("bestsellersEyebrow")}</p>
                <h2 className="display-md mt-3 text-on-surface">
                  {tHome("bestsellersTitle")}
                </h2>
              </div>
              <Link href="/urunler" className="link-arrow text-sm">
                {tHome("bestsellersLink")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
          <div className="mt-8">
            <ProductCarousel products={bestsellerProducts} />
          </div>
        </div>
      </section>

      {/* 5 — Yolculuk: 3 adım */}
      <section className="forest py-16 md:py-24">
        <div className="page-shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-[#8fe0b6]">{tHome("journey.eyebrow")}</p>
            <h2 className="display-lg mt-4 text-white">
              {tHome("journey.title")}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/75">
              {tHome("journey.body")}
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand-light mt-8"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {tHome("journey.cta")}
            </a>
            <p className="mt-8 max-w-sm text-xs leading-relaxed text-white/55">
              {tHome("journey.disclaimer", {
                distributor: settings.brand.distributorName,
              })}
            </p>
          </Reveal>
          <ol className="lg:col-span-7">
            {journey.map((j, i) => (
              <li key={j.step}>
                <Reveal delay={i * 80}>
                  <div className="grid grid-cols-[4.5rem_1fr] gap-4 border-t border-white/20 py-8 sm:grid-cols-[6rem_1fr]">
                    <span className="font-display text-5xl font-extrabold leading-none tracking-tighter text-[#8fe0b6] sm:text-6xl">
                      {j.step}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl font-bold tracking-tight text-white">
                        {j.title}
                      </h3>
                      <p className="mt-2 max-w-md text-base leading-relaxed text-white/75">
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
                "https://www.myherbalkapida.com"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta mt-6 inline-flex px-6 py-3 text-sm"
            >
              myHerbal Kapıda.com →
            </a>
          </div>
        </section>
      ) : null}

      {/* 8 — Bülten */}
      <section className="bg-linear-to-br from-primary-fixed via-white to-primary-fixed py-14 md:py-20">
        <div className="page-shell grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
          <Reveal>
            <h2 className="display-md text-on-surface">{tHome("newsletterTitle")}</h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-on-surface-variant">
              {tHome("newsletterBody")}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <NewsletterForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
