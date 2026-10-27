"use client";

import { useTranslations } from "next-intl";

import { useEffect, useRef, useState } from "react";
import { useWhatsAppFabState } from "@/hooks/useWhatsAppFabState";
import { readCookieConsent } from "@/lib/cookie-consent";

const SHOW_AFTER = 380;
/** WA butonu ile ok arası (popup kapalıyken) */
const GAP_PX = 16;
/** Bildirim / panel ile ok arası — popup’a yakın dursun */
const POPUP_CLEARANCE_PX = 12;
/** WhatsApp FAB yüksekliği (h-11.5 ≈ 46) + stack gap-3 (12) */
const WA_BUTTON_PX = 58;
/** Ölçüm gelmeden önce yedek (kısa tanıtım balonu) */
const POPUP_FALLBACK_PX = 72;

function waBottomPx(isMobile: boolean, cookieLift: boolean): number {
  if (isMobile) {
    return (cookieLift ? 11 : 5) * 16;
  }
  return cookieLift ? 10 * 16 : 24;
}

/**
 * Yukarı kaydır: WA butonu + bildirim/panel bloğunun üzerinde.
 */
export function ScrollToTopFab() {
  const t = useTranslations("aria");
  const [visible, setVisible] = useState(false);
  const [liftForCookie, setLiftForCookie] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const { popupVisible, popupHeightPx } = useWhatsAppFabState();
  const ticking = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    function syncCookieLift() {
      setLiftForCookie(!readCookieConsent());
    }
    syncCookieLift();
    window.addEventListener("herbalkapida:cookie-consent", syncCookieLift);
    window.addEventListener("storage", syncCookieLift);
    return () => {
      window.removeEventListener("herbalkapida:cookie-consent", syncCookieLift);
      window.removeEventListener("storage", syncCookieLift);
    };
  }, []);

  useEffect(() => {
    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        setVisible(window.scrollY > SHOW_AFTER);
        ticking.current = false;
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  const base = waBottomPx(isMobile, liftForCookie);
  // Popup açıkken: WA butonu + gap-3 + balon yüksekliği + kısa boşluk
  // Kapalıyken: WA butonu + GAP_PX (eski konum)
  const aboveWa = popupVisible
    ? WA_BUTTON_PX +
      (popupHeightPx > 0 ? popupHeightPx : POPUP_FALLBACK_PX) +
      POPUP_CLEARANCE_PX
    : WA_BUTTON_PX + GAP_PX;
  const bottomPx = base + aboveWa;

  return (
    <button
      type="button"
      aria-label={t("scrollToTop")}
      onClick={scrollTop}
      style={{
        bottom: `calc(${bottomPx}px + env(safe-area-inset-bottom, 0px))`,
      }}
      className={`fixed right-3 z-40 flex h-11.5 w-11.5 items-center justify-center rounded-full border border-outline-variant/50 bg-white text-primary shadow-[0_8px_24px_rgba(18,20,17,0.14)] transition-[opacity,transform,bottom] duration-300 ease-out hover:border-primary hover:bg-primary hover:text-on-primary md:right-6 ${
        visible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-3 scale-90 opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
