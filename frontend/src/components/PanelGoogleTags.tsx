"use client";

import Script from "next/script";
import { useAnalyticsIds } from "@/lib/analytics-ids";

/**
 * GA4 / Google Ads gtag.js — panel ID’leri + env yedek.
 * ID'ler normalizeAnalyticsIds ile doğrulanmıştır (yalnızca G-… / AW-…).
 * GTM ayrı olarak AnalyticsScripts içinde yüklenir; aynı GA4/Ads etiketini
 * GTM kapsayıcısına da eklemeyin (çift sayım).
 */
export function PanelGoogleTags() {
  const ids = useAnalyticsIds();
  if (!ids.ready) return null;

  const gtagId = ids.ga4Id || ids.googleAdsId;
  if (!gtagId) return null;

  const configs = [
    ids.ga4Id ? `gtag('config', ${JSON.stringify(ids.ga4Id)});` : "",
    ids.googleAdsId
      ? `gtag('config', ${JSON.stringify(ids.googleAdsId)}, { allow_enhanced_conversions: true });`
      : "",
  ].join("\n");

  return (
    <>
      <Script
        id="gtag-js"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagId)}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-config" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
        gtag('js', new Date());
        ${configs}
      `}</Script>
    </>
  );
}
