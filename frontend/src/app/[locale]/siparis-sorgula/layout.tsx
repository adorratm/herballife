import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/cms";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const [settings, t] = await Promise.all([
    getSiteSettings(locale),
    getTranslations("guestOrder"),
  ]);
  return {
    ...buildPageMetadata({
      title: t("title"),
      description: t("lead"),
      path: "/siparis-sorgula",
      settings,
      locale,
      keywords: ["order lookup", "guest order"],
    }),
    robots: { index: false, follow: false },
  };
}

export default function GuestLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
