"use client";

import { useEffect, useState } from "react";
import { getApiBase } from "@/lib/api";

export type AnalyticsIds = {
  ga4Id: string;
  gtmId: string;
  /** AW-123456789 */
  googleAdsId: string;
  /** Google Ads "Satın alma" dönüşüm etiketi (AW-…/ETIKET kısmı) */
  googleAdsPurchaseLabel: string;
  /** Google Ads "WhatsApp" dönüşüm etiketi (opsiyonel) */
  googleAdsWhatsappLabel: string;
  metaPixelId: string;
  facebookPixelId: string;
  yandexMetrikaId: string;
  tiktokPixelId: string;
};

const EMPTY: AnalyticsIds = {
  ga4Id: "",
  gtmId: "",
  googleAdsId: "",
  googleAdsPurchaseLabel: "",
  googleAdsWhatsappLabel: "",
  metaPixelId: "",
  facebookPixelId: "",
  yandexMetrikaId: "",
  tiktokPixelId: "",
};

const RE_GTM = /\bGTM-[A-Z0-9]{4,12}\b/;
const RE_GA4 = /\bG-[A-Z0-9]{6,16}\b/;
const RE_AW = /\bAW-(\d{6,14})(?:\/([A-Za-z0-9_-]{4,64}))?/;
const RE_LABEL = /^[A-Za-z0-9_-]{4,64}$/;
const RE_DIGITS = /^\d{5,20}$/;
const RE_TIKTOK = /^[A-Z0-9]{10,32}$/;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function firstMatch(re: RegExp, preferred: string, all: string[]): string {
  const own = preferred.match(re);
  if (own) return own[0];
  for (const s of all) {
    const m = s.match(re);
    if (m) return m[0];
  }
  return "";
}

/**
 * Panelde yanlış alana yazılmış / snippet olarak yapıştırılmış kimlikleri ayıklar.
 * Sadece geçerli formattaki ID'ler döner; kalan her şey atılır (JS içine
 * ham metin enjekte edilmesini engeller).
 */
export function normalizeAnalyticsIds(
  raw: Record<string, unknown> | undefined | null,
  fallback: Partial<AnalyticsIds> = {},
): AnalyticsIds {
  const r = raw || {};
  const get = (k: keyof AnalyticsIds) => str(r[k]) || str(fallback[k]);
  const googleFields = [get("ga4Id"), get("gtmId"), get("googleAdsId")];

  const gtmId = firstMatch(RE_GTM, get("gtmId"), googleFields);
  const ga4Id = firstMatch(RE_GA4, get("ga4Id"), googleFields);

  let googleAdsId = "";
  let labelFromId = "";
  const awSource =
    get("googleAdsId").match(RE_AW) ||
    googleFields.map((s) => s.match(RE_AW)).find(Boolean) ||
    null;
  if (awSource) {
    googleAdsId = `AW-${awSource[1]}`;
    labelFromId = awSource[2] || "";
  }

  const label = (k: keyof AnalyticsIds) => {
    const v = get(k).replace(/^AW-\d+\//, "");
    return RE_LABEL.test(v) ? v : "";
  };

  const digits = (k: keyof AnalyticsIds) => {
    const v = get(k);
    return RE_DIGITS.test(v) ? v : "";
  };

  const metaPixelId = digits("metaPixelId");
  const tiktok = get("tiktokPixelId").toUpperCase();

  return {
    ga4Id,
    gtmId,
    googleAdsId,
    googleAdsPurchaseLabel: label("googleAdsPurchaseLabel") || labelFromId,
    googleAdsWhatsappLabel: label("googleAdsWhatsappLabel"),
    metaPixelId,
    facebookPixelId: digits("facebookPixelId") || metaPixelId,
    yandexMetrikaId: digits("yandexMetrikaId"),
    tiktokPixelId: RE_TIKTOK.test(tiktok) ? tiktok : "",
  };
}

function envFallback(): Partial<AnalyticsIds> {
  return {
    ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "",
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
    googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "",
    googleAdsPurchaseLabel:
      process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL || "",
    googleAdsWhatsappLabel:
      process.env.NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_LABEL || "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
    facebookPixelId:
      process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ||
      process.env.NEXT_PUBLIC_META_PIXEL_ID ||
      "",
    yandexMetrikaId: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || "",
    tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
  };
}

let cached: AnalyticsIds | null = null;
let inflight: Promise<AnalyticsIds> | null = null;

/** Sayfa başına tek istek; tüm bileşenler aynı sonucu paylaşır. */
export function loadAnalyticsIds(): Promise<AnalyticsIds> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch(`${getApiBase()}/cms/settings`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Record<string, Record<string, unknown>> | null) => {
        cached = normalizeAnalyticsIds(data?.analytics, envFallback());
        return cached;
      })
      .catch(() => {
        cached = normalizeAnalyticsIds(null, envFallback());
        return cached;
      });
  }
  return inflight;
}

/** Senkron erişim (yüklendiyse); analytics.ts olayları için. */
export function getLoadedAnalyticsIds(): AnalyticsIds | null {
  return cached;
}

/**
 * CMS site ayarları + NEXT_PUBLIC_* yedek.
 * `ready` false iken etiket yüklenmez (env yedeğiyle yanlış/çift yükleme olmasın).
 */
export function useAnalyticsIds(): AnalyticsIds & { ready: boolean } {
  const [ids, setIds] = useState<AnalyticsIds | null>(cached);

  useEffect(() => {
    let cancelled = false;
    void loadAnalyticsIds().then((v) => {
      if (!cancelled) setIds(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...(ids || EMPTY), ready: !!ids };
}
