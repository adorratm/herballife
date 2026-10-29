import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/cms";
import { buildPageMetadata } from "@/lib/seo";

const LEGAL_SLUGS = [
  "gizlilik",
  "kvkk",
  "cerez-politikasi",
  "mesafeli-satis",
  "on-bilgilendirme",
  "iptal-iade",
  "teslimat",
  "musteri-memnuniyeti",
  "guvenli-alisveris",
  "aydinlatma-metni",
] as const;

export async function legalMetadata(slug: string): Promise<Metadata> {
  const locale = await getLocale();
  const [settings, t] = await Promise.all([
    getSiteSettings(locale),
    getTranslations("legalSeo"),
  ]);
  const known = (LEGAL_SLUGS as readonly string[]).includes(slug);
  const title = known
    ? t(`${slug}.title` as "gizlilik.title")
    : slug;
  const description = known
    ? t(`${slug}.description` as "gizlilik.description")
    : settings.seo.description;
  return buildPageMetadata({
    title,
    description,
    path: `/${slug}`,
    settings,
    locale,
    keywords: [t("keywords"), title],
  });
}
