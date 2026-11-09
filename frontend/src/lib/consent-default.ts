import { COOKIE_CONSENT_KEY } from "@/lib/cookie-consent";

/**
 * Consent Mode v2 varsayılanı — <head> içinde, tüm Google etiketlerinden önce
 * çalışır (gtag.js ve GTM yollarının ikisi için de). Daha önce onay vermiş
 * ziyaretçinin tercihini hemen uygular.
 */
export function consentDefaultInlineScript(): string {
  const key = JSON.stringify(COOKIE_CONSENT_KEY);
  return `
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
gtag('set', 'url_passthrough', true);
try {
  var c = JSON.parse(localStorage.getItem(${key}) || 'null');
  if (c) {
    gtag('consent', 'update', {
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied',
      analytics_storage: c.analytics ? 'granted' : 'denied'
    });
  }
} catch (e) {}
`;
}
