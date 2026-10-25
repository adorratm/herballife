"use client";

import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { readCookieConsent } from "@/lib/cookie-consent";
import {
  FAB_BOTTOM_MOBILE,
  FAB_BOTTOM_MOBILE_COOKIE,
  useFabScrollExpand,
} from "@/hooks/useFabScrollExpand";
import { stripHtml } from "@/lib/format";
import {
  DEFAULT_WHATSAPP_PHONE,
  DEFAULT_WHATSAPP_SETTINGS,
  buildLocalizedWhatsAppSettings,
  buildWhatsAppUrl,
  isDefaultWhatsAppPresets,
  type WhatsAppPreset,
} from "@/lib/whatsapp";

type Props = {
  enabled?: boolean;
  phone?: string | null;
  brandName?: string;
  greeting?: string;
  presets?: WhatsAppPreset[];
};

const POPUP_KEYS = ["popup0", "popup1", "popup2", "popup3", "popup4"] as const;
const TITLE_KEYS = ["title0", "title1", "title2", "title3", "title4"] as const;

function openWhatsApp(phone: string | null | undefined, text: string) {
  const url = buildWhatsAppUrl(phone, stripHtml(text));
  window.open(url, "_blank", "noopener,noreferrer");
}

export function WhatsAppChat({
  enabled = true,
  phone = DEFAULT_WHATSAPP_PHONE,
  brandName = "Herbal Kapıda",
  greeting = DEFAULT_WHATSAPP_SETTINGS.greeting,
  presets = DEFAULT_WHATSAPP_SETTINGS.presets,
}: Props) {
  const t = useTranslations("whatsapp");
  const tForms = useTranslations("forms");
  const popupMessages = useMemo(
    () => POPUP_KEYS.map((key) => t(key)),
    [t],
  );
  const titleRotation = useMemo(
    () => TITLE_KEYS.map((key) => t(key)),
    [t],
  );
  const localizedDefaults = useMemo(
    () => buildLocalizedWhatsAppSettings(t),
    [t],
  );
  const greetingText = stripHtml(
    greeting === DEFAULT_WHATSAPP_SETTINGS.greeting
      ? localizedDefaults.greeting
      : greeting,
  );
  const activePresets = useMemo(() => {
    const source =
      !presets.length || isDefaultWhatsAppPresets(presets)
        ? localizedDefaults.presets
        : presets;
    return source.map((p) => ({
      ...p,
      label: stripHtml(p.label),
      message: stripHtml(p.message),
    }));
  }, [presets, localizedDefaults.presets]);

  const [open, setOpen] = useState(false);
  const [liftForCookie, setLiftForCookie] = useState(false);
  const [custom, setCustom] = useState("");
  const [popupIndex, setPopupIndex] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const expanded = useFabScrollExpand(enabled);
  const showLabel = expanded || open;
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) setOpen(false);
  }, [expanded]);

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
    if (open) setPopupVisible(false);
  }, [open]);

  useEffect(() => {
    const show = popupVisible && !open;
    function publish(heightPx: number) {
      window.dispatchEvent(
        new CustomEvent("herbalife:wa-popup", {
          detail: { visible: show, heightPx: show ? heightPx : 0 },
        }),
      );
    }
    if (!show) {
      publish(0);
      return;
    }
    const el = popupRef.current;
    if (!el) {
      publish(72);
      return;
    }
    publish(el.getBoundingClientRect().height);
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height ?? el.getBoundingClientRect().height;
      publish(h);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      publish(0);
    };
  }, [popupVisible, open, popupIndex]);

  useEffect(() => {
    let popupTimer: ReturnType<typeof setInterval> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const cycle = () => {
      setPopupIndex((i) => (i + 1) % popupMessages.length);
      setPopupVisible(true);
      hideTimer = setTimeout(() => setPopupVisible(false), 4500);
    };
    const start = setTimeout(cycle, 5000);
    popupTimer = setInterval(cycle, 12000);
    return () => {
      clearTimeout(start);
      if (popupTimer) clearInterval(popupTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [popupMessages.length]);

  useEffect(() => {
    const baseTitle = document.title;
    let idx = 0;
    const timer = setInterval(() => {
      document.title = titleRotation[idx % titleRotation.length];
      idx += 1;
    }, 7000);
    return () => {
      clearInterval(timer);
      document.title = baseTitle;
    };
  }, [titleRotation]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    function onPointer(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        toggleRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  if (!enabled) return null;

  function sendPreset(preset: WhatsAppPreset) {
    openWhatsApp(phone, preset.message);
    setOpen(false);
  }

  function onCustomSubmit(e: FormEvent) {
    e.preventDefault();
    const text =
      custom.trim() ||
      t("defaultCustomMessage", { brand: brandName });
    openWhatsApp(phone, text);
    setCustom("");
    setOpen(false);
  }

  const bottomClass = liftForCookie
    ? `${FAB_BOTTOM_MOBILE_COOKIE} md:bottom-40`
    : `${FAB_BOTTOM_MOBILE} md:bottom-6`;
  const list = activePresets;

  return (
    <div
      ref={stackRef}
      className={`pointer-events-none fixed right-3 z-50 flex flex-col items-end gap-3 md:right-6 ${bottomClass}`}
    >
      {!open && popupVisible ? (
        <div
          ref={popupRef}
          className="pointer-events-none banner-enter max-w-[min(100vw-2rem,20rem)] rounded-2xl border border-[#25D366]/35 bg-surface-container-lowest px-4 py-3 shadow-lg"
          role="status"
        >
          <p className="font-meta text-[10px] uppercase tracking-widest text-[#25D366]">
            {t("label")}
          </p>
          <p className="mt-1 text-sm leading-snug text-on-surface">
            {popupMessages[popupIndex]}
          </p>
        </div>
      ) : null}

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-label={t("dialogLabel")}
          className="pointer-events-auto banner-enter flex max-h-[min(52dvh,22rem)] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:max-h-[min(70vh,28rem)]"
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-outline-variant/25 bg-surface-container-low px-4 py-2.5 sm:py-3">
            <div>
              <p className="font-meta text-[10px] uppercase tracking-widest text-primary">
                {t("channelEyebrow")}
              </p>
              <p className="mt-1 font-display text-lg leading-none tracking-tight text-on-surface sm:text-xl">
                {t("liveSupport")}
              </p>
              <p className="mt-1.5 hidden font-meta text-[10px] uppercase leading-relaxed text-on-surface-variant sm:block">
                {t("presetHint", { phone: phone || "" })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="font-meta text-[10px] uppercase tracking-widest text-secondary hover:text-primary"
              aria-label={t("closeChat")}
            >
              {t("close")}
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-4 py-3 sm:space-y-3 sm:py-4">
            <div className="industrial-border bg-surface-container px-3 py-2 sm:py-3">
              <p className="font-meta text-[10px] uppercase leading-relaxed text-secondary sm:text-[11px]">
                {greetingText}
              </p>
            </div>

            <ul className="flex flex-col gap-1.5 sm:gap-2">
              {list.map((preset, index) => (
                <li key={`${preset.label}-${index}`}>
                  <button
                    type="button"
                    onClick={() => sendPreset(preset)}
                    className="w-full rounded-xl border border-outline-variant/35 bg-surface px-3 py-2 text-left font-meta text-[10px] uppercase tracking-widest text-on-surface transition-colors hover:border-primary hover:text-primary sm:py-2.5 sm:text-[11px]"
                  >
                    {preset.label}
                  </button>
                </li>
              ))}
            </ul>

            <form
              onSubmit={onCustomSubmit}
              className="space-y-2 border-t border-outline-variant/20 pt-2.5 sm:pt-3"
            >
              <label className="field-label" htmlFor={`${panelId}-msg`}>
                {t("customMessageLabel")}
              </label>
              <textarea
                id={`${panelId}-msg`}
                rows={2}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder={tForms("customMessage")}
                className="field-input resize-none text-sm normal-case tracking-normal sm:resize-y"
              />
              <button type="submit" className="btn-cta w-full py-2.5 text-xs sm:py-3">
                {t("sendOnWhatsapp")}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <button
        ref={toggleRef}
        type="button"
        data-tour="whatsapp"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? t("closeFab") : t("openFab")}
        onClick={() => setOpen((v) => !v)}
        className={`pointer-events-auto inline-flex h-11.5 items-center justify-center rounded-full border border-[#25D366]/40 bg-[#25D366] font-meta text-[11px] font-bold uppercase leading-none tracking-widest text-white shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition-all duration-300 ease-out hover:bg-[#1ebe57] ${
          showLabel ? "gap-2.5 px-4" : "w-11.5 gap-0 px-0"
        }`}
      >
        <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
        <span
          className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
            showLabel ? "max-w-28 opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          {open ? t("close") : t("label")}
        </span>
      </button>
    </div>
  );
}
