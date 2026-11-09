import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { SITE_URL, localizedPath } from "@/lib/seo";

/** Dizinlenmemesi gereken özel sayfalar (TR iç yolları; her dil için lokalize edilir). */
const PRIVATE_PATHS = [
  "/hesabim",
  "/sepet",
  "/odeme",
  "/giris",
  "/kayit",
  "/siparis-sorgula",
  "/takip",
  "/sifremi-unuttum",
  "/sifre-sifirla",
  "/odeme-bildirimi",
];

function safeLocalized(locale: string, path: string): string | null {
  try {
    return localizedPath(locale, path);
  } catch {
    return null;
  }
}

export default function robots(): MetadataRoute.Robots {
  const disallow = new Set<string>(["/auth/", "/*/auth/", "/api/"]);
  for (const path of PRIVATE_PATHS) {
    disallow.add(path);
    for (const locale of locales) {
      const p = safeLocalized(locale, path);
      if (p) disallow.add(p);
    }
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...disallow],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
