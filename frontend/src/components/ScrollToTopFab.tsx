"use client";

import { useEffect, useRef, useState } from "react";
import { readCookieConsent } from "@/lib/cookie-consent";

const SHOW_AFTER = 380;

/** Tüm sayfalar: WhatsApp FAB’ın üstünde, kaydırınca görünür → yumuşak yukarı scroll */
export function ScrollToTopFab() {
  const [visible, setVisible] = useState(false);
  const [liftForCookie, setLiftForCookie] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    function syncCookieLift() {
      setLiftForCookie(!readCookieConsent());
    }
    syncCookieLift();
    window.addEventListener("herbalife:cookie-consent", syncCookieLift);
    window.addEventListener("storage", syncCookieLift);
    return () => {
      window.removeEventListener("herbalife:cookie-consent", syncCookieLift);
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

  // WA bottom (5rem/11rem + safe) + FAB 3rem + gap 0.75rem
  const bottomClass = liftForCookie
    ? "bottom-[calc(14.75rem+env(safe-area-inset-bottom))] md:bottom-[13.75rem]"
    : "bottom-[calc(8.75rem+env(safe-area-inset-bottom))] md:bottom-[5.25rem]";

  return (
    <button
      type="button"
      aria-label="Yukarı kaydır"
      onClick={scrollTop}
      className={`fixed right-3 z-40 flex h-[46px] w-[46px] items-center justify-center rounded-full border border-outline-variant/50 bg-white text-primary shadow-[0_8px_24px_rgba(18,20,17,0.14)] transition-all duration-300 ease-out hover:border-primary hover:bg-primary hover:text-on-primary md:right-6 ${bottomClass} ${
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
