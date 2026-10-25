"use client";

import { useEffect, useState } from "react";
import { getApiBase } from "@/lib/api";

export type AnalyticsIds = {
  ga4Id: string;
  gtmId: string;
  googleAdsId: string;
  metaPixelId: string;
  facebookPixelId: string;
  yandexMetrikaId: string;
  tiktokPixelId: string;
};

function envFallback(): AnalyticsIds {
  return {
    ga4Id: process.env.NEXT_PUBLIC_GA4_ID?.trim() || "",
    gtmId: process.env.NEXT_PUBLIC_GTM_ID?.trim() || "",
    googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "",
    facebookPixelId:
      process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID?.trim() ||
      process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ||
      "",
    yandexMetrikaId: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID?.trim() || "",
    tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim() || "",
  };
}

function mergeAnalytics(
  raw: Record<string, unknown> | undefined,
): AnalyticsIds {
  const base = envFallback();
  if (!raw) return base;
  const pick = (key: keyof AnalyticsIds) => {
    const v = raw[key];
    return typeof v === "string" && v.trim() ? v.trim() : base[key];
  };
  return {
    ga4Id: pick("ga4Id"),
    gtmId: pick("gtmId"),
    googleAdsId: pick("googleAdsId"),
    metaPixelId: pick("metaPixelId"),
    facebookPixelId: pick("facebookPixelId"),
    yandexMetrikaId: pick("yandexMetrikaId"),
    tiktokPixelId: pick("tiktokPixelId"),
  };
}

/** CMS site ayarları + NEXT_PUBLIC_* yedek */
export function useAnalyticsIds(): AnalyticsIds {
  const [ids, setIds] = useState<AnalyticsIds>(() => envFallback());

  useEffect(() => {
    let cancelled = false;
    void fetch(`${getApiBase()}/cms/settings`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Record<string, Record<string, unknown>> | null) => {
        if (cancelled || !data) return;
        setIds(mergeAnalytics(data.analytics));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return ids;
}
