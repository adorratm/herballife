"use client";

import Script from "next/script";
import { useAnalyticsIds } from "@/lib/analytics-ids";

/**
 * Google Ads / GA4 gtag — Consent Mode v2.
 * Kimlikler CMS analytics ayarlarından (client) + env yedek.
 */
export function GoogleConsentTags() {
  const { ga4Id, gtmId, googleAdsId } = useAnalyticsIds();

  if (gtmId) return null;

  const gtagId = googleAdsId || ga4Id;
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
        ${ga4Id ? `gtag('config', '${ga4Id}', { anonymize_ip: true });` : ""}
        ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ""}
      `}</Script>
    </>
  );
}
