"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "herbalkapida_site_tour_v1";

export function SiteTour() {
  const t = useTranslations("tour");
  const STEPS = useMemo(
    () => [
      {
        selector: "[data-tour='search']",
        title: t("step1Title"),
        body: t("step1Body"),
      },
      {
        selector: "[data-tour='cart']",
        title: t("step2Title"),
        body: t("step2Body"),
      },
      {
        selector: "[data-tour='whatsapp']",
        title: t("step3Title"),
        body: t("step3Body"),
      },
      {
        selector: "[data-tour='account']",
        title: t("step4Title"),
        body: t("step4Body"),
      },
    ],
    [t],
  );

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
      const timer = window.setTimeout(() => setActive(true), 1200);
      return () => window.clearTimeout(timer);
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const step = STEPS[index];
    const el = document.querySelector(step.selector);
    if (!el) return;
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    el.classList.add("site-tour-highlight");
    return () => {
      el.classList.remove("site-tour-highlight");
    };
  }, [active, index, STEPS]);

  if (!active) return null;

  const step = STEPS[index];
  const isLast = index >= STEPS.length - 1;

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setActive(false);
  }

  function next() {
    if (isLast) finish();
    else setIndex((i) => i + 1);
  }

  return (
    <div className="fixed inset-0 z-70 pointer-events-none">
      <div className="pointer-events-auto absolute inset-0 bg-black/45" aria-hidden />
      <div
        role="dialog"
        aria-labelledby="site-tour-title"
        className="pointer-events-auto fixed bottom-24 left-3 right-3 mx-auto max-w-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-xl md:bottom-8 md:left-auto md:right-8"
      >
        <p className="font-meta text-[10px] uppercase tracking-widest text-primary">
          {t("eyebrow", { current: index + 1, total: STEPS.length })}
        </p>
        <h2 id="site-tour-title" className="mt-2 font-display text-xl">
          {step.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          {step.body}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={next}
            className="btn-cta px-5 py-2.5 text-xs"
          >
            {isLast ? t("finish") : t("next")}
          </button>
          <button
            type="button"
            onClick={finish}
            className="border border-outline-variant/40 px-5 py-2.5 font-meta text-[10px] uppercase tracking-widest"
          >
            {t("skip")}
          </button>
        </div>
      </div>
    </div>
  );
}
