"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_EVENT,
  readCookieConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";
import { useAnalyticsIds } from "@/lib/analytics-ids";

function applyGtagConsent(consent: CookieConsent | null) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  const analytics = consent?.analytics ?? false;
  const marketing = consent?.marketing ?? false;

  window.gtag("consent", "update", {
    ad_storage: marketing ? "granted" : "denied",
    ad_user_data: marketing ? "granted" : "denied",
    ad_personalization: marketing ? "granted" : "denied",
    analytics_storage: analytics ? "granted" : "denied",
  });
}

/**
 * GTM (analitik) + Meta / FB / TikTok / Yandex (pazarlama onayı).
 */
export function AnalyticsScripts() {
  const ids = useAnalyticsIds();
  const metaOrFb = ids.metaPixelId || ids.facebookPixelId;
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    const current = readCookieConsent();
    setConsent(current);
    applyGtagConsent(current);

    function onConsent(e: Event) {
      const detail = (e as CustomEvent<CookieConsent>).detail;
      const next = detail ?? readCookieConsent();
      setConsent(next);
      applyGtagConsent(next);
    }
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
  }, []);

  useEffect(() => {
    if (!consent) return;
    const t = window.setTimeout(() => applyGtagConsent(consent), 600);
    return () => window.clearTimeout(t);
  }, [consent]);

  const loadGtm = !!consent?.analytics && !!ids.gtmId;
  const loadMeta = !!consent?.marketing && !!metaOrFb;
  const loadTiktok = !!consent?.marketing && !!ids.tiktokPixelId;
  const loadYandex = !!consent?.analytics && !!ids.yandexMetrikaId;

  if (!loadGtm && !loadMeta && !loadTiktok && !loadYandex) return null;

  return (
    <>
      {loadGtm ? (
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${ids.gtmId}');
        `}</Script>
      ) : null}

      {loadMeta ? (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${metaOrFb}');
          fbq('track', 'PageView');
        `}</Script>
      ) : null}

      {loadTiktok ? (
        <Script id="tiktok-pixel" strategy="afterInteractive">{`
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${ids.tiktokPixelId}');
            ttq.page();
          }(window, document, 'ttq');
        `}</Script>
      ) : null}

      {loadYandex ? (
        <Script id="yandex-metrika" strategy="afterInteractive">{`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
          ym(${JSON.stringify(ids.yandexMetrikaId)}, "init", {
            clickmap:true,
            trackLinks:true,
            accurateTrackBounce:true
          });
        `}</Script>
      ) : null}
    </>
  );
}
