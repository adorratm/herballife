import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/cms";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const [settings, t] = await Promise.all([
    getSiteSettings(locale),
    getTranslations("contactPage"),
  ]);
  const location =
    settings.contact.locationLabel || settings.brand.location || "";
  return buildPageMetadata({
    title: t("metaTitle"),
    description: location
      ? t("metaDescriptionLocation", {
          brand: settings.brand.name,
          location,
        })
      : t("metaDescription", { brand: settings.brand.name }),
    path: "/iletisim",
    settings,
    locale,
    keywords: ["contact", location, "Herbalife", "coaching"].filter(Boolean),
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
