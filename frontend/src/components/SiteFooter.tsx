"use client";

import { Link, toLinkHref } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { CmsHtml } from "@/components/CmsHtml";
import { Reveal } from "@/components/Reveal";
import { FooterNavLinks } from "@/components/FooterNavLinks";
import { PaymentCardLogos } from "@/components/PaymentCardLogos";
import type { SiteSettings } from "@/lib/cms";
import { DEFAULT_SETTINGS } from "@/lib/cms";
import {
  buildWhatsAppUrl,
  resolveWhatsAppPhone,
} from "@/lib/whatsapp";

type Props = {
  settings?: SiteSettings;
};

const UTILITY_CHIPS = [
  { href: "/siparis-sorgula", key: "orderLookup" as const },
  { href: "/odeme-bildirimi", key: "paymentNotice" as const },
  { href: "/banka-hesaplari", key: "bankAccounts" as const },
  { href: "/hesabim/favoriler", key: "myFavorites" as const },
];

export function SiteFooter({ settings = DEFAULT_SETTINGS }: Props) {
  const tFooter = useTranslations("footer");
  const { brand, contact, footer, navigation, social, whatsapp, legal, membership } =
    settings;
  const distributorCode = brand.distributorCode?.trim();
  const membershipUrl = membership?.ctaUrl?.trim() || "https://www.myherbalife.com";
  const membershipLabel =
    membership?.ctaLabel?.trim() || tFooter("membershipCta");
  const waPhone = resolveWhatsAppPhone({
    whatsappPhone: whatsapp.phone,
    contactPhone: contact.phone,
  });
  const socialLinks = [
    { href: social.instagram, label: "Instagram" },
    { href: social.facebook, label: "Facebook" },
    {
      href:
        whatsapp.enabled && waPhone
          ? buildWhatsAppUrl(
              waPhone,
              tFooter("whatsappPrefill", { brand: brand.name }),
            )
          : "",
      label: "WhatsApp",
    },
    { href: social.googleMaps, label: tFooter("map") },
    { href: social.googleReviewUrl, label: tFooter("googleReview") },
  ].filter((l) => l.href?.trim());

  return (
    <footer className="mt-auto border-t border-outline-variant bg-white pb-0">
      <div className="page-shell pt-10">
        <Reveal>
          <div className="surface-panel overflow-hidden p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-on-primary">
                  {tFooter("approvedBadge")}
                </span>
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    {tFooter("distributorTrustTitle")}
                  </p>
                  <CmsHtml
                    as="div"
                    className="mt-1 max-w-xl text-xs leading-relaxed text-on-surface-variant [&_a]:text-primary [&_a]:underline [&_p]:m-0"
                    html={
                      brand.legalDisclaimer || tFooter("legalDisclaimerFallback")
                    }
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {UTILITY_CHIPS.map((l) => (
                  <Link
                    key={l.href}
                    href={toLinkHref(l.href)}
                    className="rounded-full border border-outline-variant/40 bg-white px-3.5 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                  >
                    {tFooter(l.key)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="page-shell grid grid-cols-1 gap-10 py-12 md:grid-cols-12 md:gap-8 md:py-16">
        <Reveal className="md:col-span-5" variant="up">
          <p className="flex flex-wrap items-center gap-2 font-display text-2xl font-bold text-primary">
            {brand.name}
            {distributorCode ? (
              <span className="rounded-full border border-primary/25 bg-primary-fixed px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-primary">
                ID {distributorCode}
              </span>
            ) : null}
          </p>
          <p className="mt-2 text-sm font-semibold text-on-surface">
            {brand.distributorName}
            {brand.distributorTitle ? ` · ${brand.distributorTitle}` : ""}
          </p>
          <CmsHtml
            as="div"
            className="mt-4 max-w-sm text-sm leading-relaxed text-on-surface-variant [&_a]:text-primary [&_a]:underline [&_p]:mb-2 [&_p:last-child]:mb-0"
            html={footer.description}
          />
          <p className="mt-4 text-sm text-on-surface-variant">{contact.address}</p>
          {contact.email ? (
            <p className="mt-2 text-sm">
              <a
                href={`mailto:${contact.email}`}
                className="font-medium text-primary hover:underline"
              >
                {contact.email}
              </a>
            </p>
          ) : null}
          {contact.phone ? (
            <p className="mt-1 text-sm">
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="font-semibold text-on-surface hover:text-primary"
              >
                {contact.phone}
              </a>
            </p>
          ) : null}
          {socialLinks.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary-fixed px-3.5 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </Reveal>

        <Reveal
          className="flex flex-col gap-2.5 text-sm md:col-span-3"
          delay={80}
          variant="up"
        >
          <span className="mb-1 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            {tFooter("navigation")}
          </span>
          <FooterNavLinks
            items={navigation.footerNav}
            className="text-on-surface-variant hover:text-primary"
          />
        </Reveal>

        <Reveal
          className="flex flex-col gap-2.5 text-sm md:col-span-4"
          delay={120}
          variant="up"
        >
          <span className="mb-1 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            {tFooter("legal")}
          </span>
          {navigation.footerLegal.map((item) => (
            <Link
              key={item.href}
              href={toLinkHref(item.href)}
              className="text-on-surface-variant hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </Reveal>
      </div>

      <PaymentCardLogos />

      <div className="border-t border-outline-variant bg-surface-container-low">
        <div className="page-shell space-y-4 py-8">
          {membershipUrl ? (
            <div className="rounded-xl border border-outline-variant/50 bg-white p-4 md:p-5">
              <a
                href={membershipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-primary hover:underline"
              >
                {membershipLabel} →
              </a>
              {membership?.disclaimer?.trim() ? (
                <p className="mt-2 text-[11px] leading-relaxed text-on-surface-variant">
                  {membership.disclaimer}
                </p>
              ) : null}
            </div>
          ) : null}
          {legal?.supplementDisclaimer?.trim() ||
          legal?.weightDisclaimer?.trim() ? (
            <div className="space-y-2 text-[10px] leading-relaxed text-on-surface-variant/90">
              {legal?.supplementDisclaimer?.trim() ? (
                <p>{legal.supplementDisclaimer}</p>
              ) : null}
              {legal?.weightDisclaimer?.trim() ? (
                <p>{legal.weightDisclaimer}</p>
              ) : null}
            </div>
          ) : null}
          <p className="text-xs text-on-surface-variant">
            © {new Date().getFullYear()} {brand.name}
            {footer.copyrightSuffix ? ` · ${footer.copyrightSuffix}` : ""}
          </p>
        </div>
      </div>
    </footer>
  );
}
