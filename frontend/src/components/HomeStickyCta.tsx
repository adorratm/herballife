"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { categoryHref } from "@/i18n/hrefs";
import {
  FAB_BOTTOM_MOBILE,
  useFabScrollExpand,
} from "@/hooks/useFabScrollExpand";

/** Mobil: solda — WhatsApp ile aynı boy/yükseklik; scroll ile küçülür-büyür */
export function HomeStickyCta() {
  const t = useTranslations("aria");
  const pathname = usePathname();
  const onHome = pathname === "/";
  const expanded = useFabScrollExpand(onHome);

  if (!onHome) return null;

  return (
    <div className={`fixed left-3 z-40 md:hidden ${FAB_BOTTOM_MOBILE}`}>
      <Link
        href={categoryHref("avantajli-setler")}
        aria-label={t("browsePackages")}
        className={`pointer-events-auto inline-flex h-11.5 items-center justify-center rounded-full border border-primary/40 bg-primary font-meta text-[11px] font-bold uppercase leading-none tracking-widest text-on-primary shadow-[0_8px_24px_rgba(21,122,76,0.35)] transition-all duration-300 ease-out hover:bg-primary-container ${
          expanded ? "gap-2.5 px-4" : "w-11.5 px-0"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9" />
          <path d="M3.5 7h17v3H3.5z" />
          <path d="M12 7v14" />
          <path d="M12 7c-.8-2.2-3.2-2.8-4.5-1.5S6.2 8.8 8 9.5" />
          <path d="M12 7c.8-2.2 3.2-2.8 4.5-1.5S17.8 8.8 16 9.5" />
        </svg>
        <span
          className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
            expanded ? "max-w-40 opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          {t("browsePackages")}
        </span>
      </Link>
    </div>
  );
}
