import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/cms";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const [settings, t] = await Promise.all([
    getSiteSettings(locale),
    getTranslations("tracking"),
  ]);
  return buildPageMetadata({
    title: t("title"),
    description: t("lead"),
    path: "/takip",
    settings,
    locale,
    keywords: ["shipment tracking", "order tracking"],
    noIndex: true,
  });
}

export default function TrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
