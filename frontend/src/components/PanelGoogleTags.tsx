"use client";

import Script from "next/script";
import { useAnalyticsIds } from "@/lib/analytics-ids";

/**
 * GA4 / Google Ads gtag — panel ID’leri + env yedek.
 * GTM panel/env’de tanımlıysa burada atlanır (AnalyticsScripts yükler).
 */
export function PanelGoogleTags() {
  const ids = useAnalyticsIds();
  const gtmId = ids.gtmId;
  if (gtmId) return null;

  const gtagId = ids.googleAdsId || ids.ga4Id;
  if (!gtagId) return null;

  return (
    <>
      <Script id="gtag-consent-default" strategy="beforeInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied',
          wait_for_update: 500
        });
      `}</Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-config" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        ${ids.ga4Id ? `gtag('config', '${ids.ga4Id}', { anonymize_ip: true });` : ""}
        ${ids.googleAdsId ? `gtag('config', '${ids.googleAdsId}');` : ""}
      `}</Script>
    </>
  );
}
