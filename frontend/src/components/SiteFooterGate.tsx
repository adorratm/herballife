"use client";

import { SiteFooter } from "@/components/SiteFooter";
import type { SiteSettings } from "@/lib/cms";

type Props = {
  settings: SiteSettings;
};

export function SiteFooterGate({ settings }: Props) {
  return <SiteFooter settings={settings} />;
}
