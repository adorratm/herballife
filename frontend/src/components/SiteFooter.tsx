import Link from "next/link";
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

export function SiteFooter({ settings = DEFAULT_SETTINGS }: Props) {
  const { brand, contact, footer, navigation, social, whatsapp } = settings;
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
              `Merhaba, ${brand.name} hakkında yazıyorum.`,
            )
          : "",
      label: "WhatsApp",
    },
    { href: social.googleMaps, label: "Harita" },
    { href: social.googleReviewUrl, label: "Google Yorum" },
  ].filter((l) => l.href?.trim());

  return (
    <footer className="mt-auto border-t border-outline-variant bg-white pb-0">
      <div className="page-shell pt-10">
        <Reveal>
          <div className="surface-panel overflow-hidden p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-on-primary">
                  Onaylı
                </span>
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    Resmi Distribütör Güvencesi
                  </p>
                  <p className="mt-1 max-w-xl text-xs leading-relaxed text-on-surface-variant">
                    {brand.legalDisclaimer ||
                      "Bu site bağımsız bir Herbalife Nutrition distribütörüne aittir. Ürünler %100 orijinaldir."}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { href: "/siparis-sorgula", label: "Sipariş sorgula" },
                  { href: "/odeme-bildirimi", label: "Ödeme bildirimi" },
                  { href: "/banka-hesaplari", label: "Banka hesapları" },
                  { href: "/hesabim/favoriler", label: "Favorilerim" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-full border border-outline-variant/40 bg-white px-3.5 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="page-shell grid grid-cols-1 gap-10 py-12 md:grid-cols-12 md:gap-8 md:py-16">
        <Reveal className="md:col-span-5" variant="up">
          <p className="font-display text-2xl font-bold text-primary">
            {brand.name}
          </p>
          <p className="mt-2 text-sm font-semibold text-on-surface">
            {brand.distributorName}
            {brand.distributorTitle ? ` · ${brand.distributorTitle}` : ""}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-on-surface-variant">
            {footer.description}
          </p>
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
            Navigasyon
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
            Yasal
          </span>
          {navigation.footerLegal.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-on-surface-variant hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </Reveal>
      </div>

      <PaymentCardLogos />

    </footer>
  );
}
