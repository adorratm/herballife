"use client";

import { Link, toLinkHref } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type Item = { href: string; label: string };

export function FooterNavLinks({
  items,
  className,
  asListItems = false,
  icon,
}: {
  items: Item[];
  className?: string;
  /** <li> içine sar (liste içinde kullanım) */
  asListItems?: boolean;
  icon?: React.ReactNode;
}) {
  const tNav = useTranslations("nav");
  const tHeader = useTranslations("header");

  function navLabel(href: string, fallback: string): string {
    const map: Record<string, string> = {
      "/urunler": tNav("products"),
      "/hakkimizda": tNav("about"),
      "/blog": tNav("blog"),
      "/medya": tNav("media"),
      "/sss": tNav("faq"),
      "/yorum": tNav("reviews"),
      "/iletisim": tNav("contact"),
      "/sepet": tNav("cart"),
      "/hesabim": tNav("account"),
      "/hesabim/favoriler": tNav("favorites"),
      "/giris": tNav("login"),
      "/kocluk": tNav("coaching"),
      "/siparis-sorgula": tHeader("orderLookup"),
      "/odeme-bildirimi": tHeader("paymentNotice"),
      "/banka-hesaplari": tHeader("bankAccounts"),
      "/takip": tNav("cargoTracking"),
    };
    return map[href] || fallback;
  }

  return (
    <>
      {items.map((item) => {
        const link = (
          <Link
            key={asListItems ? undefined : item.href}
            href={toLinkHref(item.href)}
            className={className}
          >
            {icon}
            {navLabel(item.href, item.label)}
          </Link>
        );
        return asListItems ? <li key={item.href}>{link}</li> : link;
      })}
    </>
  );
}
