"use client";

import { useState } from "react";
import { Link, toLinkHref } from "@/i18n/routing";
import { categoryHref, productHref } from "@/i18n/hrefs";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  ChevronsRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { AppImage as Image } from "@/components/AppImage";
import { CmsHtml } from "@/components/CmsHtml";
import { FooterNavLinks } from "@/components/FooterNavLinks";
import { NewsletterForm } from "@/components/NewsletterForm";
import { PaymentCardList } from "@/components/PaymentCardLogos";
import type { SiteSettings } from "@/lib/cms";
import { DEFAULT_SETTINGS, filterNavByFeatures } from "@/lib/cms";
import { buildWhatsAppUrl, resolveWhatsAppPhone } from "@/lib/whatsapp";

export type FooterLinkItem = { id: string; slug: string; name: string };

type Props = {
  settings?: SiteSettings;
  categories?: FooterLinkItem[];
  popularProducts?: FooterLinkItem[];
};

const QUICK_LINKS = [
  { href: "/hesabim", key: "myAccount" as const },
  { href: "/siparis-sorgula", key: "orderLookup" as const },
  { href: "/takip", key: "cargoTracking" as const },
  { href: "/odeme-bildirimi", key: "paymentNotice" as const },
  { href: "/banka-hesaplari", key: "bankAccounts" as const },
  { href: "/hesabim/favoriler", key: "myFavorites" as const },
];

/** Hızlı erişimde zaten olan adresler "Kurumsal" sütununda tekrar edilmez */
const QUICK_HREFS = new Set<string>([
  ...QUICK_LINKS.map((l) => l.href),
  "/sepet",
  "/giris",
  "/yorum",
  "/hesabim/takip",
  "/hesabim/rapor",
  "/urunler",
  "/urunler/kategori/avantajli-setler",
]);

function SocialIcon({ name }: { name: "instagram" | "facebook" | "whatsapp" | "youtube" }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 16,
    height: 16,
    fill: "currentColor",
    "aria-hidden": true,
  } as const;
  if (name === "instagram") {
    return (
      <svg {...common}>
        <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4 1.2-.1 1.6-.1 4.8-.1Zm0 4.6a5.2 5.2 0 1 0 0 10.4 5.2 5.2 0 0 0 0-10.4Zm0 8.6a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8Zm5.4-9.9a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z" />
      </svg>
    );
  }
  if (name === "facebook") {
    return (
      <svg {...common}>
        <path d="M13.5 21.9v-8.2h2.8l.4-3.2h-3.2V8.4c0-.9.3-1.6 1.6-1.6h1.7V4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.2h2.8v8.2h3.4Z" />
      </svg>
    );
  }
  if (name === "youtube") {
    return (
      <svg {...common}>
        <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.8 15V9l5.8 3-5.8 3Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.2-1.4A9.9 9.9 0 1 0 12 2Zm0 18.1c-1.5 0-3-.4-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.1Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3a2.8 2.8 0 0 0-.9 2.1c0 1.2.9 2.4 1 2.6.1.2 1.8 2.7 4.3 3.8 1.6.7 2.2.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  );
}

function FooterColumn({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-outline-variant/60 md:border-0">
      <h3 className="footer-col-title">
        <button
          type="button"
          onClick={() => onToggle(id)}
          aria-expanded={open}
          aria-controls={`footer-col-${id}`}
          className="flex w-full items-center justify-between py-3.5 text-left font-display text-base font-bold text-on-surface md:pointer-events-none md:py-0 md:text-lg"
        >
          {title}
          <ChevronDown
            className={`h-4 w-4 text-outline transition-transform md:hidden ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </h3>
      <ul
        id={`footer-col-${id}`}
        className={`flex-col gap-2.5 pb-4 md:mt-4 md:flex md:pb-0 ${open ? "flex" : "hidden"}`}
      >
        {children}
      </ul>
    </div>
  );
}

export function SiteFooter({
  settings = DEFAULT_SETTINGS,
  categories = [],
  popularProducts = [],
}: Props) {
  const tFooter = useTranslations("footer");
  const [openCol, setOpenCol] = useState<string | null>(null);
  const toggle = (id: string) => setOpenCol((c) => (c === id ? null : id));
  const { brand, contact, footer, navigation, social, whatsapp, legal, membership } =
    settings;
  const membershipUrl = membership?.ctaUrl?.trim() || "https://www.myherbalife.com";
  const membershipLabel = membership?.ctaLabel?.trim() || tFooter("membershipCta");
  const waPhone = resolveWhatsAppPhone({
    whatsappPhone: whatsapp.phone,
    contactPhone: contact.phone,
  });
  const socialLinks = (
    [
      { href: social.facebook, label: "Facebook", icon: "facebook" },
      { href: social.instagram, label: "Instagram", icon: "instagram" },
      {
        href:
          whatsapp.enabled && waPhone
            ? buildWhatsAppUrl(waPhone, tFooter("whatsappPrefill", { brand: brand.name }))
            : "",
        label: "WhatsApp",
        icon: "whatsapp",
      },
    ] as const
  ).filter((l) => l.href?.trim());

  const corporateLinks = filterNavByFeatures(navigation.footerNav, settings).filter(
    (l) => !QUICK_HREFS.has(l.href),
  );
  const cats = categories.filter((c) => c.slug).slice(0, 9);
  const popular = popularProducts.slice(0, 7);

  return (
    <footer className="mt-auto bg-white">
      {/* Bülten şeridi */}
      <div className="page-shell pt-10 md:pt-14">
        <div className="forest relative overflow-hidden rounded-2xl px-5 py-6 sm:px-8 md:py-7">
          <span
            className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/5"
            aria-hidden
          />
          <div className="relative grid items-center gap-4 md:grid-cols-[1fr_minmax(0,30rem)] md:gap-8">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#8fe0b6]">
                <Send className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-white md:text-xl">
                  {tFooter("newsletterTitle")}
                </p>
                <p className="mt-0.5 text-sm text-white/70">
                  {tFooter("newsletterBody")}
                </p>
              </div>
            </div>
            <NewsletterForm variant="footer" />
          </div>
        </div>
      </div>

      {/* Ana sütunlar */}
      <div className="page-shell grid grid-cols-1 gap-x-8 gap-y-2 py-10 md:grid-cols-2 md:gap-y-10 md:py-12 lg:grid-cols-[1.35fr_1fr_1fr_1.35fr_1fr]">
        <div className="pb-6 md:col-span-2 md:pb-0 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2.5">
            {brand.logoUrl ? (
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                width={260}
                height={80}
                className="h-14 w-auto max-w-60 object-contain object-left"
              />
            ) : (
              <span className="font-display text-2xl font-extrabold tracking-tight text-primary">
                {brand.name}
              </span>
            )}
          </Link>
          {brand.distributorName?.trim() || contact.phone ? (
            <p className="mt-3 font-display text-base font-bold text-primary">
              {brand.distributorName}
              {contact.phone ? (
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="ml-2 whitespace-nowrap hover:underline"
                >
                  {contact.phone}
                </a>
              ) : null}
            </p>
          ) : null}
          {brand.distributorTitle?.trim() ? (
            <p className="mt-1 text-sm text-on-surface-variant">{brand.distributorTitle}</p>
          ) : null}

          <ul className="mt-5 space-y-2.5 text-sm text-on-surface-variant">
            {contact.address?.trim() ? (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>
                  <strong className="font-semibold text-on-surface">{tFooter("address")}:</strong>{" "}
                  {contact.address}
                </span>
              </li>
            ) : null}
            {contact.phone?.trim() ? (
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>
                  <strong className="font-semibold text-on-surface">{tFooter("phone")}:</strong>{" "}
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                    {contact.phone}
                  </a>
                </span>
              </li>
            ) : null}
            {contact.email?.trim() ? (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 break-words">
                  <strong className="font-semibold text-on-surface">{tFooter("email")}:</strong>{" "}
                  <a href={`mailto:${contact.email}`} className="hover:text-primary">
                    {contact.email}
                  </a>
                </span>
              </li>
            ) : null}
            {contact.hours?.trim() ? (
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>
                  <strong className="font-semibold text-on-surface">{tFooter("hours")}:</strong>{" "}
                  {contact.hours}
                </span>
              </li>
            ) : null}
          </ul>
        </div>

        <FooterColumn id="corp" title={tFooter("corporate")} open={openCol === "corp"} onToggle={toggle}>
          <FooterNavLinks
            items={corporateLinks}
            className="footer-link"
            asListItems
            icon={<ChevronsRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />}
          />
        </FooterColumn>

        <FooterColumn id="cats" title={tFooter("categories")} open={openCol === "cats"} onToggle={toggle}>
          {cats.map((c) => (
            <li key={c.id}>
              <Link href={categoryHref(c.slug)} className="footer-link">
                <ChevronsRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {c.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/urunler" className="footer-link font-semibold text-primary">
              <ChevronsRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {tFooter("allProducts")}
            </Link>
          </li>
        </FooterColumn>

        <FooterColumn id="popular" title={tFooter("popularProducts")} open={openCol === "popular"} onToggle={toggle}>
          {popular.length ? (
            popular.map((p) => (
              <li key={p.id}>
                <Link href={productHref(p.slug)} className="footer-link">
                  <ChevronsRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="line-clamp-2">{p.name}</span>
                </Link>
              </li>
            ))
          ) : (
            <li>
              <Link href="/urunler" className="footer-link">
                <ChevronsRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {tFooter("allProducts")}
              </Link>
            </li>
          )}
        </FooterColumn>

        <FooterColumn id="quick" title={tFooter("quickAccess")} open={openCol === "quick"} onToggle={toggle}>
          {QUICK_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={toLinkHref(l.href)} className="footer-link">
                <ChevronsRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {tFooter(l.key)}
              </Link>
            </li>
          ))}
        </FooterColumn>
      </div>

      {/* Alt şerit: sosyal · telif · kartlar */}
      <div className="border-t border-outline-variant">
        <div className="page-shell grid gap-5 py-6 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8">
          <div className="flex flex-wrap items-center gap-3">
            {socialLinks.length ? (
              <>
                <span className="font-display text-sm font-bold text-on-surface">
                  {tFooter("followUs")}
                </span>
                <div className="flex gap-2">
                  {socialLinks.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={l.label}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-container"
                    >
                      <SocialIcon name={l.icon} />
                    </a>
                  ))}
                </div>
              </>
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-on-surface-variant md:text-center">
            © {new Date().getFullYear()} {brand.name} · {tFooter("rights")}
            {footer.copyrightSuffix ? ` · ${footer.copyrightSuffix}` : ""}
            <span className="mt-1 block text-[10px] uppercase tracking-wider text-outline">
              Developed by{" "}
              <a
                href="https://emrekilic.web.tr"
                target="_blank"
                rel="noopener noreferrer"
                className="normal-case tracking-normal underline underline-offset-2 hover:text-primary"
              >
                emrekilic.web.tr
              </a>
            </span>
          </p>
          <PaymentCardList className="md:justify-end" />
        </div>
      </div>

      {/* Yasal notlar */}
      <div className="bg-surface-container-low">
        <div className="page-shell space-y-2 py-5 text-[11px] leading-relaxed text-on-surface-variant">
          {navigation.footerLegal.length ? (
            <nav aria-label={tFooter("legal")} className="flex flex-wrap gap-x-4 gap-y-1.5 pb-2 text-xs">
              {navigation.footerLegal.map((item) => (
                <Link
                  key={item.href}
                  href={toLinkHref(item.href)}
                  className="font-medium text-on-surface-variant hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
          <CmsHtml
            as="div"
            className="[&_a]:text-primary [&_a]:underline [&_p]:m-0"
            html={brand.legalDisclaimer || tFooter("legalDisclaimerFallback")}
          />
          {footer.description?.trim() ? (
            <CmsHtml
              as="div"
              className="[&_a]:text-primary [&_a]:underline [&_p]:m-0"
              html={footer.description}
            />
          ) : null}
          {legal?.supplementDisclaimer?.trim() ? <p>{legal.supplementDisclaimer}</p> : null}
          {legal?.weightDisclaimer?.trim() ? <p>{legal.weightDisclaimer}</p> : null}
          {membershipUrl ? (
            <p>
              <a
                href={membershipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                {membershipLabel} →
              </a>
              {membership?.disclaimer?.trim() ? ` ${membership.disclaimer}` : ""}
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
