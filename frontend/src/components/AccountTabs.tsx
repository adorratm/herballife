"use client";

import { Link, toLinkHref, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export type AccountTabId =
  | "siparisler"
  | "adresler"
  | "hesap"
  | "favoriler"
  | "bildirimler"
  | "takip"
  | "rapor";

const TABS: {
  id: AccountTabId;
  labelKey:
    | "tabOrders"
    | "nutritionTracking"
    | "progressReport"
    | "tabAddresses"
    | "tabAccount"
    | "favorites"
    | "notifications";
  href: string;
}[] = [
  { id: "siparisler", labelKey: "tabOrders", href: "/hesabim?sekme=siparisler" },
  { id: "takip", labelKey: "nutritionTracking", href: "/hesabim/takip" },
  { id: "rapor", labelKey: "progressReport", href: "/hesabim/rapor" },
  { id: "adresler", labelKey: "tabAddresses", href: "/hesabim?sekme=adresler" },
  { id: "hesap", labelKey: "tabAccount", href: "/hesabim?sekme=hesap" },
  { id: "favoriler", labelKey: "favorites", href: "/hesabim/favoriler" },
  { id: "bildirimler", labelKey: "notifications", href: "/hesabim/bildirimler" },
];

export function resolveAccountTab(
  pathname: string,
  sekme: string | null,
): AccountTabId {
  if (
    pathname.startsWith("/hesabim/takip") ||
    pathname.startsWith("/hesabim/olcumler")
  )
    return "takip";
  if (pathname.startsWith("/hesabim/rapor")) return "rapor";
  if (pathname.startsWith("/hesabim/favoriler")) return "favoriler";
  if (pathname.startsWith("/hesabim/bildirimler")) return "bildirimler";
  if (sekme === "adresler" || sekme === "hesap" || sekme === "siparisler") {
    return sekme;
  }
  return "siparisler";
}

function TabNav({ current }: { current: AccountTabId }) {
  const tAccount = useTranslations("account");
  const tNav = useTranslations("nav");
  const tTabs = useTranslations("accountTabs");

  function tabLabel(key: (typeof TABS)[number]["labelKey"]): string {
    if (key === "favorites" || key === "notifications") return tNav(key);
    return tAccount(key);
  }

  return (
    <nav
      className="mt-6 flex gap-0.5 overflow-x-auto overscroll-x-contain border-b border-outline-variant/30 pb-px [-ms-overflow-style:none] scrollbar-none sm:mt-8 sm:gap-1 [&::-webkit-scrollbar]:hidden"
      aria-label={tTabs("ariaLabel")}
      role="tablist"
    >
      {TABS.map((tab) => {
        const selected = current === tab.id;
        return (
          <Link
            key={tab.id}
            href={toLinkHref(tab.href)}
            role="tab"
            aria-selected={selected}
            className={`shrink-0 border-b-2 px-3 py-2.5 font-meta text-[10px] uppercase tracking-widest transition-colors sm:px-4 sm:py-3 sm:text-[11px] ${
              selected
                ? "border-primary text-primary"
                : "border-transparent text-secondary hover:border-outline-variant/50 hover:text-on-surface"
            }`}
          >
            {tabLabel(tab.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

/** `active` verilirse URL okunmaz (alt sayfalar). */
export function AccountTabs({ active }: { active?: AccountTabId }) {
  if (active) return <TabNav current={active} />;
  return <AccountTabsFromUrl />;
}

function AccountTabsFromUrl() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = resolveAccountTab(pathname, searchParams.get("sekme"));
  return <TabNav current={current} />;
}
