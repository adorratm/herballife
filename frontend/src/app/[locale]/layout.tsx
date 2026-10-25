import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CartToastHost } from "@/components/CartToast";
import { CookieBannerGate } from "@/components/CookieBannerGate";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { LocaleAlternatesProvider } from "@/components/LocaleAlternates";
import { PanelGoogleTags } from "@/components/PanelGoogleTags";
import { SiteTour } from "@/components/SiteTour";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SiteFooterGate } from "@/components/SiteFooterGate";
import { SiteHeader } from "@/components/SiteHeader";
import { ScrollToTopFab } from "@/components/ScrollToTopFab";
import { WhatsAppChatGate } from "@/components/WhatsAppChatGate";
import { routing } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/cms";
import {
  JsonLd,
  buildSiteMetadata,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import { resolveWhatsAppPhone } from "@/lib/whatsapp";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getSiteSettings(locale);
  const base = buildSiteMetadata(settings, locale);
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}`]),
  );
  return {
    ...base,
    alternates: {
      ...base.alternates,
      languages,
      canonical: `/${locale}`,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [settings, messages] = await Promise.all([
    getSiteSettings(locale),
    getMessages(),
  ]);

  const mediaBase =
    (process.env.NEXT_PUBLIC_CDN_URL || process.env.AWS_CDN_URL || "").replace(
      /\/$/,
      "",
    ) ||
    (process.env.NEXT_PUBLIC_S3_BUCKET
      ? `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_S3_REGION || process.env.AWS_REGION || "eu-central-1"}.amazonaws.com`
      : "");

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${jakarta.variable} ${inter.variable} h-full`}
    >
      <head>
        {mediaBase ? <link rel="preconnect" href={mediaBase} /> : null}
      </head>
      <body className="flex min-h-full flex-col bg-background text-on-background antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleAlternatesProvider>
            <PanelGoogleTags />
            <JsonLd data={organizationJsonLd(settings)} />
            <JsonLd data={websiteJsonLd(settings, locale)} />
            <SiteHeader settings={settings} />
            <main className="flex-1">{children}</main>
            <SiteFooterGate settings={settings} />
            <div
              className="h-[calc(4.75rem+env(safe-area-inset-bottom))] shrink-0 md:hidden"
              aria-hidden
            />
            <MobileBottomNav />
            <WhatsAppChatGate
              enabled={settings.whatsapp.enabled}
              phone={resolveWhatsAppPhone({
                whatsappPhone: settings.whatsapp.phone,
                contactPhone: settings.contact.phone,
              })}
              brandName={settings.brand.name}
              greeting={settings.whatsapp.greeting}
              presets={settings.whatsapp.presets}
            />
            <ScrollToTopFab />
            <CartToastHost />
            <CookieBannerGate />
            <AnalyticsScripts />
            <SiteTour />
          </LocaleAlternatesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
