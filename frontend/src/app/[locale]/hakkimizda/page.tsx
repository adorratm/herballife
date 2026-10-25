import { AppImage as Image } from "@/components/AppImage";
import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartHandshake,
  LineChart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import {
  cmsImageUrl,
  getContentSections,
  getSiteSettings,
  sectionContent,
} from "@/lib/cms";
import {
  aboutPageJsonLd,
  breadcrumbJsonLd,
  buildPageMetadata,
  JsonLd,
} from "@/lib/seo";
import { buildWhatsAppUrl, resolveWhatsAppPhone } from "@/lib/whatsapp";

type AboutHero = {
  imageUrl: string;
  title: string;
  seoDescription: string;
};

type AboutBody = {
  titleLine1: string;
  titleLine2: string;
  paragraphs: string[];
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  showContactAside: boolean;
};

type AboutEthos = {
  imageUrl: string;
  eyebrow: string;
  quote: string;
  linkLabel: string;
  linkHref: string;
};

function fallbackHero(t: Awaited<ReturnType<typeof getTranslations>>): AboutHero {
  return {
    imageUrl: "/images/products/2026-paket-1-shaker-hediyeli.png",
    title: t("fallbackHeroTitle"),
    seoDescription: t("fallbackHeroSeo"),
  };
}

function fallbackBody(t: Awaited<ReturnType<typeof getTranslations>>): AboutBody {
  return {
    titleLine1: t("fallbackBodyLine1"),
    titleLine2: t("fallbackBodyLine2"),
    paragraphs: [t("fallbackBodyP1"), t("fallbackBodyP2"), t("fallbackBodyP3")],
    ctaPrimary: { label: t("ctaProducts"), href: "/urunler" },
    ctaSecondary: { label: t("ctaContact"), href: "/iletisim" },
    showContactAside: true,
  };
}

function fallbackEthos(t: Awaited<ReturnType<typeof getTranslations>>): AboutEthos {
  return {
    imageUrl: "/images/products/formul-1-shake.png",
    eyebrow: t("fallbackEthosEyebrow"),
    quote: t("fallbackEthosQuote"),
    linkLabel: t("fallbackEthosLink"),
    linkHref: "/blog",
  };
}

function pillars(t: Awaited<ReturnType<typeof getTranslations>>): {
  title: string;
  body: string;
  Icon: LucideIcon;
}[] {
  return [
    {
      title: t("pillarOriginalTitle"),
      body: t("pillarOriginalBody"),
      Icon: CheckCircle2,
    },
    {
      title: t("pillarProgramTitle"),
      body: t("pillarProgramBody"),
      Icon: HeartHandshake,
    },
    {
      title: t("pillarTrackingTitle"),
      body: t("pillarTrackingBody"),
      Icon: LineChart,
    },
  ];
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const [settings, sections, t] = await Promise.all([
    getSiteSettings(locale),
    getContentSections("about", locale),
    getTranslations("aboutPage"),
  ]);
  const hero = sectionContent(sections, "hero", fallbackHero(t));
  return buildPageMetadata({
    title: hero.title || t("fallbackHeroTitle"),
    description:
      hero.seoDescription ||
      `${settings.brand.name} — bağımsız Herbalife distribütörü.`,
    path: "/hakkimizda",
    settings,
    locale,
    keywords: [
      "hakkımızda",
      "Herbalife",
      "bağımsız distribütör",
      "Herbal Kapıda",
      "beslenme",
    ],
    image: "/images/products/2026-paket-1-shaker-hediyeli.png",
  });
}

export default async function AboutPage() {
  const locale = await getLocale();
  const [settings, sections, t, tCommon, tSeo] = await Promise.all([
    getSiteSettings(locale),
    getContentSections("about", locale),
    getTranslations("aboutPage"),
    getTranslations("common"),
    getTranslations("seo"),
  ]);
  const heroFallback = fallbackHero(t);
  const bodyFallback = fallbackBody(t);
  const ethosFallback = fallbackEthos(t);
  const pagePillars = pillars(t);
  const { brand, contact, whatsapp } = settings;
  const hero = sectionContent(sections, "hero", heroFallback);
  const body = sectionContent(sections, "body", bodyFallback);
  const ethos = sectionContent(sections, "ethos", ethosFallback);
  const hasCustomEthosImage =
    Boolean(ethos.imageUrl) && ethos.imageUrl !== ethosFallback.imageUrl;
  const ethosImage = cmsImageUrl(ethos.imageUrl, ethosFallback.imageUrl);
  const paragraphs = Array.isArray(body.paragraphs)
    ? body.paragraphs.filter((p) => typeof p === "string" && p.trim())
    : bodyFallback.paragraphs;
  const [lead, ...restParagraphs] = paragraphs;

  const waPhone = resolveWhatsAppPhone({
    whatsappPhone: whatsapp.phone,
    contactPhone: contact.phone,
  });
  const aboutTitle = hero.title || t("fallbackHeroTitle");
  const waUrl = buildWhatsAppUrl(
    waPhone,
    t("waPrefillAbout", { brand: brand.name }),
  );

  const crumbs = [
    { name: tCommon("home"), path: "/" },
    { name: aboutTitle, path: "/hakkimizda" },
  ];

  const brandWords = brand.name.trim().split(/\s+/);
  const kicker =
    [aboutTitle, brand.established, brand.location]
      .filter(Boolean)
      .join(" · ") || aboutTitle;

  const contactRows: { label: string; value: string; href?: string; Icon: LucideIcon }[] =
    [
      contact.address
        ? { label: t("address"), value: contact.address, Icon: MapPin }
        : null,
      contact.hours
        ? { label: t("hours"), value: contact.hours, Icon: Clock }
        : null,
      contact.phone
        ? {
            label: t("phone"),
            value: contact.phone,
            href: `tel:${contact.phone.replace(/\s/g, "")}`,
            Icon: Phone,
          }
        : null,
      contact.email
        ? {
            label: t("email"),
            value: contact.email,
            href: `mailto:${contact.email}`,
            Icon: Mail,
          }
        : null,
    ].filter(Boolean) as {
      label: string;
      value: string;
      href?: string;
      Icon: LucideIcon;
    }[];

  return (
    <>
      <JsonLd
        data={aboutPageJsonLd(
          settings,
          tSeo("aboutTitle"),
          tSeo("aboutJsonLdDescription"),
        )}
      />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      {/* 1 — Sinematik hero: marka, tek cümle, CTA, baskın görsel */}
      <section className="hero-forest relative isolate overflow-hidden">
        <div className="page-shell grid items-center gap-8 py-14 sm:py-16 lg:min-h-[min(46rem,calc(100svh-4.5rem))] lg:grid-cols-12 lg:gap-6 lg:py-20">
          <div className="hero-enter relative z-10 lg:col-span-6">
            <p className="eyebrow text-[#8fe0b6]">{kicker}</p>
            <h1 className="display-xl mt-5">
              <span className="block text-white">{brandWords[0]}</span>
              {brandWords.length > 1 ? (
                <span className="block text-[#8fe0b6]">
                  {brandWords.slice(1).join(" ")}
                </span>
              ) : null}
            </h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-white/80 md:text-xl">
              {brand.tagline || brand.slogan || hero.seoDescription}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {whatsapp.enabled ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-brand-light"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  {t("waWrite")}
                </a>
              ) : (
                <Link
                  href={body.ctaSecondary?.href || "/iletisim"}
                  className="btn-brand-light"
                >
                  {body.ctaSecondary?.label || t("ctaContact")}
                </Link>
              )}
              <Link
                href={body.ctaPrimary?.href || "/urunler"}
                className="btn-outline-light"
              >
                {body.ctaPrimary?.label || t("ctaProducts")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="hero-media relative lg:col-span-6">
            <div className="relative mx-auto aspect-6/5 w-full max-w-176">
              <div className="absolute bottom-[-3%] left-[18%] z-10 aspect-square h-[70%] -translate-x-1/2">
                <Image
                  src="/images/cutouts/formul-2-vitamin.png"
                  alt=""
                  fill
                  className="object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.22)]"
                  sizes="(max-width: 1024px) 50vw, 30rem"
                />
              </div>
              <div className="absolute bottom-[-3%] left-[84%] z-10 aspect-square h-[66%] -translate-x-1/2">
                <Image
                  src="/images/cutouts/multi-fiber.png"
                  alt=""
                  fill
                  className="object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.22)]"
                  sizes="(max-width: 1024px) 50vw, 28rem"
                />
              </div>
              <div className="absolute bottom-[-3%] left-1/2 z-20 aspect-square h-full -translate-x-1/2">
                <Image
                  src="/images/cutouts/thermo-complete.png"
                  alt={brand.name}
                  fill
                  priority
                  className="object-contain drop-shadow-[0_24px_28px_rgba(0,0,0,0.28)]"
                  sizes="(max-width: 1024px) 90vw, 44rem"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Hikaye */}
      <section className="bg-white py-16 md:py-28">
        <div className="page-shell grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-primary">Hikayemiz</p>
            <h2 className="display-lg mt-4 text-on-surface">
              {body.titleLine1}
              {body.titleLine2 ? (
                <span className="block text-primary">{body.titleLine2}</span>
              ) : null}
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={90}>
            {lead ? (
              <p className="font-display text-2xl font-semibold leading-snug tracking-tight text-on-surface md:text-3xl">
                {lead}
              </p>
            ) : null}
            <div className="mt-8 space-y-5 text-lg leading-8 text-on-surface-variant">
              {restParagraphs.map((p, i) => (
                <p key={`p-${i}`}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3 — Üç dayanak */}
      <section className="mint-wash py-16 md:py-24">
        <div className="page-shell">
          <Reveal>
            <p className="eyebrow text-primary">Neden bizimle</p>
            <h2 className="display-md mt-3 max-w-xl text-on-surface">
              Ürün, rehberlik ve takip — üçü bir arada
            </h2>
          </Reveal>
          <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {pagePillars.map((pillar, i) => (
              <li key={pillar.title}>
                <Reveal delay={i * 80}>
                  <div className="border-t-2 border-primary pt-6">
                    <pillar.Icon
                      className="h-8 w-8 text-primary"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <h3 className="mt-6 font-display text-2xl font-bold tracking-tight text-on-surface">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-on-surface-variant">
                      {pillar.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 — Yaklaşım alıntısı */}
      <section className="forest relative isolate overflow-hidden">
        {hasCustomEthosImage ? (
          <>
            <Image
              src={ethosImage}
              alt=""
              fill
              className="-z-10 object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#0a2f1f]/90 via-[#0a2f1f]/65 to-[#0a2f1f]/25" />
          </>
        ) : null}
        <div className="page-shell grid items-center gap-10 py-20 md:py-28 lg:grid-cols-12">
          <Reveal className="lg:col-span-9">
            <p className="eyebrow text-[#8fe0b6]">{ethos.eyebrow}</p>
            <p className="display-lg mt-6 text-white">“{ethos.quote}”</p>
            {ethos.linkLabel ? (
              <Link
                href={ethos.linkHref || "/blog"}
                className="btn-outline-light mt-10"
              >
                {String(ethos.linkLabel).replace(/\s*→\s*$/, "")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
          </Reveal>
          {!hasCustomEthosImage ? (
            <Reveal className="hidden lg:col-span-3 lg:block" variant="fade">
              <div className="relative mx-auto aspect-3/4 w-full max-w-64">
                <Image
                  src="/images/cutouts/herbal-aloe.png"
                  alt=""
                  fill
                  className="object-contain drop-shadow-[0_24px_28px_rgba(0,0,0,0.28)]"
                  sizes="16rem"
                />
              </div>
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* 5 — İletişim bilgileri */}
      {body.showContactAside !== false && contactRows.length ? (
        <section className="bg-white py-16 md:py-24">
          <div className="page-shell">
            <Reveal>
              <p className="eyebrow text-primary">Bize ulaşın</p>
              <h2 className="display-md mt-3 text-on-surface">
                {brand.distributorName || brand.name}
              </h2>
            </Reveal>
            <dl className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {contactRows.map((row, i) => (
                <Reveal key={row.label} delay={i * 60}>
                  <div className="border-t border-outline-variant pt-5">
                    <dt className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant">
                      <row.Icon
                        className="h-4 w-4 text-primary"
                        aria-hidden
                      />
                      {row.label}
                    </dt>
                    <dd className="mt-2 text-base leading-relaxed text-on-surface">
                      {row.href ? (
                        <a
                          href={row.href}
                          className="font-semibold text-primary hover:underline"
                        >
                          {row.value}
                        </a>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {/* 6 — Kapanış CTA */}
      <section className="forest relative isolate overflow-hidden">
        <div className="page-shell py-20 text-center md:py-28">
          <Reveal>
            <h2 className="display-lg mx-auto max-w-3xl text-white">
              Birlikte başlayalım
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-white/80">
              Ücretsiz ürün danışmanlığı için yazın veya hediyeli setleri
              keşfedin.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {whatsapp.enabled ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-brand-light"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  WhatsApp ile yaz
                </a>
              ) : (
                <Link href="/iletisim" className="btn-brand-light">
                  İletişime geç
                </Link>
              )}
              <Link
                href="/urunler/kategori/avantajli-setler"
                className="btn-outline-light"
              >
                Setleri incele
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
