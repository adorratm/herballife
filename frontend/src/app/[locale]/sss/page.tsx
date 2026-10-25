import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { FaqAccordion } from "@/components/FaqAccordion";
import { getContentSections, getSiteSettings, sectionContent } from "@/lib/cms";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  faqJsonLd,
  JsonLd,
} from "@/lib/seo";
import {
  buildWhatsAppUrl,
  resolveWhatsAppPhone,
} from "@/lib/whatsapp";

type FaqItem = { question: string; answer: string };
type FaqContent = { title: string; items: FaqItem[] };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const [settings, sections, t] = await Promise.all([
    getSiteSettings(locale),
    getContentSections("home", locale),
    getTranslations("faqPage"),
  ]);
  const fallbackItems = t.raw("fallbackItems") as FaqItem[];
  const faq = sectionContent(sections, "faq", {
    title: t("fallbackTitle"),
    items: fallbackItems,
  });
  return buildPageMetadata({
    title: faq.title || t("fallbackTitle"),
    description: t("metaDescription", { brand: settings.brand.name }),
    path: "/sss",
    settings,
    locale,
    keywords: t("metaKeywords")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
  });
}

export default async function FaqPage() {
  const locale = await getLocale();
  const [settings, sections, t, tCommon, tNav] = await Promise.all([
    getSiteSettings(locale),
    getContentSections("home", locale),
    getTranslations("faqPage"),
    getTranslations("common"),
    getTranslations("nav"),
  ]);
  const fallbackItems = t.raw("fallbackItems") as FaqItem[];
  const faq = sectionContent(sections, "faq", {
    title: t("fallbackTitle"),
    items: fallbackItems,
  });
  const faqItems = (faq.items?.length ? faq.items : fallbackItems).filter(
    (item) => item?.question?.trim() && item?.answer?.trim(),
  );
  const faqSchema = faqJsonLd(faqItems);
  const crumbs = [
    { name: tCommon("home"), path: "/" },
    { name: tNav("faq"), path: "/sss" },
  ];
  const wa = buildWhatsAppUrl(
    resolveWhatsAppPhone({
      whatsappPhone: settings.whatsapp.phone,
      contactPhone: settings.contact.phone,
    }),
    t("whatsappPrefill"),
  );

  return (
    <>
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
      <JsonLd data={breadcrumbJsonLd(crumbs, locale)} />

      <section className="page-shell page-hero">
        <p className="page-kicker">{t("kicker")}</p>
        <h1 className="page-title">{faq.title || t("fallbackTitle")}</h1>
        <p className="page-lead">{t("lead")}</p>
      </section>

      <section className="page-shell py-8 md:py-10">
        {faqItems.length ? (
          <FaqAccordion items={faqItems} className="mx-auto max-w-3xl" />
        ) : (
          <p className="text-sm text-on-surface-variant">{t("empty")}</p>
        )}

        <div className="surface-panel mx-auto mt-10 max-w-3xl p-6 md:p-8">
          <h2 className="font-display text-xl font-bold tracking-tight text-on-surface">
            {t("stillQuestions")}
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            {t("distributorHelp", { name: settings.brand.distributorName })}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary"
            >
              {t("askWhatsapp")}
            </a>
            <Link
              href="/iletisim"
              className="rounded-full border border-outline-variant/40 px-5 py-2.5 text-sm font-medium"
            >
              {t("contactForm")}
            </Link>
            <Link
              href="/urunler"
              className="rounded-full border border-outline-variant/40 px-5 py-2.5 text-sm font-medium"
            >
              {t("browseProducts")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
