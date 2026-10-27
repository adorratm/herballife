"use client";

import { usePathname } from "@/i18n/routing";
import { SiteFooter } from "@/components/SiteFooter";
import type { SiteSettings } from "@/lib/cms";

type Props = {
  settings: SiteSettings;
};

/** Sepet / ödeme akışında footer menüsü forma binmesin */
const HIDE_FOOTER_PREFIXES = ["/sepet", "/odeme"] as const;

export function SiteFooterGate({ settings }: Props) {
  const pathname = usePathname();
  const hide = HIDE_FOOTER_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (hide) return null;
  return <SiteFooter settings={settings} />;
}
