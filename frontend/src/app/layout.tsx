import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { CartToastHost } from "@/components/CartToast";
import { CookieBannerGate } from "@/components/CookieBannerGate";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { GoogleConsentTags } from "@/components/GoogleConsentTags";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SiteFooterGate } from "@/components/SiteFooterGate";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppChatGate } from "@/components/WhatsAppChatGate";
import { getSiteSettings } from "@/lib/cms";
import {
  JsonLd,
  buildSiteMetadata,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import { resolveWhatsAppPhone } from "@/lib/whatsapp";
import "./globals.css";

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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildSiteMetadata(settings);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
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
      lang="tr"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${jakarta.variable} ${inter.variable} h-full`}
    >
      <head>
        {mediaBase ? <link rel="preconnect" href={mediaBase} /> : null}
      </head>
      <body className="flex min-h-full flex-col bg-background text-on-background antialiased">
        <GoogleConsentTags />
        <JsonLd data={organizationJsonLd(settings)} />
        <JsonLd data={websiteJsonLd(settings)} />
        <SiteHeader settings={settings} />
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
        <SiteFooterGate settings={settings} />
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
        <CartToastHost />
        <CookieBannerGate />
        <AnalyticsScripts />
      </body>
    </html>
  );
}
