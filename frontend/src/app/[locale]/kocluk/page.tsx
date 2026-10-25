import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/Reveal";
import {
  cmsImageUrl,
  getContentSections,
  getSiteSettings,
  sectionContent,
} from "@/lib/cms";
import { buildPageMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import {
  buildWhatsAppUrl,
  mergeWhatsAppSettings,
  resolveWhatsAppPhone,
} from "@/lib/whatsapp";

type CoachingHero = {
  eyebrow: string;
  headline: string;
  body: string;
  imageUrl: string;
  whatsappPresetLabel: string;
};

type CoachingBody = {
  titleLine1: string;
  titleLine2: string;
  paragraphs: string[];
};

type CoachingStep = { title: string; body: string };
type CoachingSteps = { title: string; items: CoachingStep[] };

function fallbackHero(
  t: Awaited<ReturnType<typeof getTranslations>>,
): CoachingHero {
  return {
    eyebrow: t("fallbackHeroEyebrow"),
    headline: t("fallbackHeroHeadline"),
    body: t("fallbackHeroBody"),
    imageUrl: "/images/products/formul-1-shake.png",
    whatsappPresetLabel: t("fallbackWhatsappPreset"),
  };
}

function fallbackBody(
  t: Awaited<ReturnType<typeof getTranslations>>,
): CoachingBody {
  return {
    titleLine1: t("fallbackBodyLine1"),
    titleLine2: t("fallbackBodyLine2"),
    paragraphs: [
      t("fallbackBodyP1"),
      t("fallbackBodyP2"),
      t("fallbackBodyP3"),
    ],
  };
}

function fallbackSteps(
  t: Awaited<ReturnType<typeof getTranslations>>,
): CoachingSteps {
  return {
    title: t("fallbackStepsTitle"),
    items: [
      { title: t("step1Title"), body: t("step1Body") },
      { title: t("step2Title"), body: t("step2Body") },
      { title: t("step3Title"), body: t("step3Body") },
      { title: t("step4Title"), body: t("step4Body") },
    ],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const [settings, t] = await Promise.all([
    getSiteSettings(locale),
    getTranslations("coachingPage"),
  ]);
  return buildPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription", { brand: settings.brand.name }),
    path: "/kocluk",
    settings,
    locale,
    keywords: t("metaKeywords").split(", "),
  });
}

export default async function CoachingPage() {
  const locale = await getLocale();
  const [settings, sections, t, tNav] = await Promise.all([
    getSiteSettings(locale),
    getContentSections("coaching", locale),
    getTranslations("coachingPage"),
    getTranslations("nav"),
  ]);

  const hero = sectionContent(sections, "hero", fallbackHero(t));
  const body = sectionContent(sections, "body", fallbackBody(t));
  const steps = sectionContent(sections, "steps", fallbackSteps(t));

  const whatsapp = mergeWhatsAppSettings(settings.whatsapp);
  const phone = resolveWhatsAppPhone({
    whatsappPhone: whatsapp.phone,
    contactPhone: settings.contact.phone,
  });
  const preset =
    whatsapp.presets.find((p) => p.label === hero.whatsappPresetLabel) ||
    whatsapp.presets[2];
  const waUrl = buildWhatsAppUrl(phone, preset?.message || hero.body);

  const heroImage = cmsImageUrl(
    hero.imageUrl,
    "/images/products/formul-1-shake.png",
  );

  return (
    <div className="pb-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("breadcrumbHome"), path: "/" },
          { name: tNav("coaching"), path: "/kocluk" },
        ])}
      />

      <section className="relative overflow-hidden bg-surface-container-low">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center md:py-20">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {hero.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-on-surface md:text-4xl">
              {hero.headline}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
              {hero.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-105"
              >
                {t("ctaWhatsapp")}
              </a>
              <Link
                href="/hesabim/takip"
                className="inline-flex items-center rounded-full border border-outline px-6 py-3 text-sm font-semibold text-on-surface"
              >
                {t("ctaTracking")}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={80}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt=""
              className="mx-auto max-h-80 w-full max-w-md rounded-2xl object-contain shadow-lg"
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <Reveal>
          <h2 className="font-display text-2xl font-bold text-on-surface md:text-3xl">
            {body.titleLine1}{" "}
            <span className="text-primary">{body.titleLine2}</span>
          </h2>
          <div className="mt-6 space-y-4 text-on-surface-variant">
            {body.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-surface-container-lowest py-14">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="text-center font-display text-2xl font-bold text-on-surface">
              {steps.title}
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.items.map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
                <li className="h-full rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-fixed text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-semibold text-on-surface">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {item.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
