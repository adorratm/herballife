import Image from "next/image";
import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/Reveal";
import { getSiteSettings } from "@/lib/cms";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildWhatsAppUrl,
  resolveWhatsAppPhone,
} from "@/lib/whatsapp";

const DEFAULT_REVIEW_URL =
  "https://g.page/r/CdfE3W3I-W53EAI/review";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const [settings, t] = await Promise.all([
    getSiteSettings(locale),
    getTranslations("reviewsPage"),
  ]);
  return buildPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription", { brand: settings.brand.name }),
    path: "/yorum",
    settings,
    locale,
    keywords: ["Google yorum", "Herbalife", "Herbal Kapıda"],
  });
}

export default async function ReviewPage() {
  const locale = await getLocale();
  const [settings, t, tNav] = await Promise.all([
    getSiteSettings(locale),
    getTranslations("reviewsPage"),
    getTranslations("nav"),
  ]);
  const reviewUrl = settings.social.googleReviewUrl?.trim();
  const mapsUrl = settings.social.googleMaps?.trim();
  const target = reviewUrl || mapsUrl || DEFAULT_REVIEW_URL;
  const wa = settings.whatsapp.enabled
    ? buildWhatsAppUrl(
        resolveWhatsAppPhone({
          whatsappPhone: settings.whatsapp.phone,
          contactPhone: settings.contact.phone,
        }),
        t("whatsappPrefill"),
      )
    : null;

  const highlights = [
    { title: t("highlight1Title"), body: t("highlight1Body") },
    { title: t("highlight2Title"), body: t("highlight2Body") },
    { title: t("highlight3Title"), body: t("highlight3Body") },
  ];

  return (
    <div className="pb-16">
      <header className="page-shell page-hero">
        <div className="">
          <p className="page-kicker">{t("kicker")}</p>
          <h1 className="page-title">{t("title")}</h1>
          <p className="page-lead">{t("lead")}</p>
          <div className="mt-4 flex gap-0.5 text-xl text-amber-500" aria-hidden>
            {"★★★★★".split("").map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
        </div>
      </header>

      <section className="page-shell py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((h, i) => (
            <Reveal key={h.title} delay={i * 70} variant="up">
              <div className="card-motion h-full rounded-xl border border-[#ebece8] bg-surface-container-lowest p-5 shadow-sm">
                <h2 className="font-display text-lg text-primary">{h.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {h.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-shell pb-8">
        <Reveal variant="scale">
          <div className="relative mx-auto max-w-xl overflow-hidden rounded-2xl border border-[#ebece8] bg-surface-container-lowest p-8 shadow-sm md:p-10">
            <div className="shimmer-accent absolute inset-x-0 top-0 h-px" />
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-primary">
              {settings.brand.distributorName} · {t("googleBusiness")}
            </p>

            <a
              href={target}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable mt-8 flex flex-col items-center gap-4 outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={t("reviewAria")}
            >
              <span className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-outline-variant/30 transition-transform group-hover:scale-[1.02]">
                <Image
                  src="/images/google-review-qr.png"
                  alt={t("reviewQrAlt")}
                  width={220}
                  height={220}
                  className="h-55 w-55"
                  priority
                />
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                {t("scanQr")}
              </span>
            </a>

            <a
              href={target}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta pressable mt-8 flex w-full items-center justify-center py-4 text-sm"
            >
              {t("reviewOnGoogle")}
            </a>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-semibold uppercase tracking-wide">
              <Link
                href="/urunler"
                className="text-secondary underline hover:text-primary"
              >
                {tNav("products")}
              </Link>
              <Link
                href="/iletisim"
                className="text-secondary underline hover:text-primary"
              >
                {tNav("contact")}
              </Link>
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary underline hover:text-primary"
                >
                  WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
