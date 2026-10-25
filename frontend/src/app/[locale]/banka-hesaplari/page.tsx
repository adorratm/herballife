import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { CopyIbanButton } from "@/components/CopyIbanButton";
import { Reveal } from "@/components/Reveal";
import { getSiteSettings } from "@/lib/cms";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildWhatsAppUrl,
  resolveWhatsAppPhone,
} from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const [settings, t] = await Promise.all([
    getSiteSettings(locale),
    getTranslations("bankAccountsPage"),
  ]);
  return buildPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/banka-hesaplari",
    settings,
    locale,
    keywords: t("metaKeywords").split(", "),
  });
}

const ACCOUNTS = [
  {
    bank: "Ziraat Bankası",
    holder: "Herbal Kapıda",
    iban: "TR00 0000 0000 0000 0000 0000 00",
    branch: "Merkez",
    note: "TL vadesiz",
  },
  {
    bank: "Garanti BBVA",
    holder: "Herbal Kapıda",
    iban: "TR11 1111 1111 1111 1111 1111 11",
    branch: "İnternet şubesi",
    note: "TL vadesiz",
  },
];

export default async function BankAccountsPage() {
  const locale = await getLocale();
  const [settings, t] = await Promise.all([
    getSiteSettings(locale),
    getTranslations("bankAccountsPage"),
  ]);
  const phone = settings.contact.phone || settings.whatsapp.phone;
  const wa = buildWhatsAppUrl(
    resolveWhatsAppPhone({
      whatsappPhone: settings.whatsapp.phone,
      contactPhone: settings.contact.phone,
    }),
    t("waPrefill"),
  );

  const steps = [
    { n: "1", title: t("step1Title"), body: t("step1Body") },
    { n: "2", title: t("step2Title"), body: t("step2Body") },
    { n: "3", title: t("step3Title"), body: t("step3Body") },
  ];

  return (
    <div className="pb-16">
      <section className="page-shell border-b border-outline-variant/20 pt-12 pb-10 md:pt-16">
        <div className="page-enter max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-on-surface md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4  text-base leading-relaxed text-on-surface-variant">
            {t("leadBefore")}{" "}
            <Link
              href="/odeme-bildirimi"
              className="font-semibold text-primary underline"
            >
              {t("paymentNoticeLink")}
            </Link>{" "}
            {t("leadAfter")}
          </p>
        </div>
      </section>

      <section className="page-shell py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 70} variant="up">
              <div className="card-motion rounded-xl border border-[#ebece8] bg-surface-container-lowest p-5 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                  {s.n}
                </span>
                <h2 className="mt-3 font-display text-lg text-on-surface">
                  {s.title}
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-shell pb-10">
        <div className="grid gap-4 md:grid-cols-2">
          {ACCOUNTS.map((a, i) => (
            <Reveal key={a.iban} delay={i * 80} variant="scale">
              <div className="card-motion relative rounded-2xl border border-[#ebece8] bg-surface-container-lowest p-6 shadow-sm">
                <div className="shimmer-accent absolute inset-x-0 top-0 h-px" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {a.bank}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {a.note} · {a.branch}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary-container/50 px-2.5 py-1 text-[10px] font-bold uppercase text-primary">
                    TL
                  </span>
                </div>
                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="text-xs text-on-surface-variant">
                      {t("accountHolder")}
                    </dt>
                    <dd className="mt-1 font-semibold text-on-surface">
                      {a.holder}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-on-surface-variant">IBAN</dt>
                    <dd className="mt-1 break-all font-mono text-base font-semibold tracking-wide text-on-surface">
                      {a.iban}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5">
                  <CopyIbanButton iban={a.iban} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 rounded-xl bg-tertiary-fixed/30 p-5 text-sm text-on-surface-variant">
          <p>
            {t("disclaimerBefore")}{" "}
            {phone ? (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="font-semibold text-primary underline"
              >
                {phone}
              </a>
            ) : (
              t("supportLine")
            )}{" "}
            {t("disclaimerMiddle")}{" "}
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline"
            >
              WhatsApp
            </a>{" "}
            {t("disclaimerAfter")}
          </p>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/odeme-bildirimi" className="btn-cta pressable px-6 py-3 text-sm">
            {t("ctaPaymentNotice")}
          </Link>
          <Link
            href="/siparis-sorgula"
            className="btn-ghost pressable px-6 py-3 text-sm"
          >
            {t("ctaOrderLookup")}
          </Link>
        </div>
      </section>
    </div>
  );
}
