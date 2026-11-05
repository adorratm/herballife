"use client";

import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
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
  /** Butonun solunda bilgi balonu */
  bubbleEnabled?: boolean;
  /** Panelden özel metin; boşsa çeviri varsayılanı */
  bubbleText?: string;
  /** Balonda gösterilecek okunur telefon */
  displayPhone?: string;
};

const BUBBLE_DISMISS_KEY = "herbalkapida:wa-bubble-dismissed";
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
  bubbleEnabled = true,
  bubbleText = "",
  displayPhone = "",
}: Props) {
  const t = useTranslations("whatsapp");
  const tForms = useTranslations("forms");
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
  /* Eski dönen kısa mesaj balonu yerini kalıcı bilgi balonuna bıraktı */
  const popupIndex = 0;
  const popupVisible = false;
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(true);
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
    window.addEventListener("herbalkapida:cookie-consent", syncCookieLift);
    window.addEventListener("storage", syncCookieLift);
    return () => {
      window.removeEventListener("herbalkapida:cookie-consent", syncCookieLift);
      window.removeEventListener("storage", syncCookieLift);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !bubbleEnabled) return;
    let dismissed = false;
    try {
      dismissed = window.sessionStorage.getItem(BUBBLE_DISMISS_KEY) === "1";
    } catch {
      /* gizli sekme */
    }
    setBubbleDismissed(dismissed);
    if (dismissed) return;
    const timer = window.setTimeout(() => setBubbleVisible(true), 3500);
    return () => window.clearTimeout(timer);
  }, [enabled, bubbleEnabled]);

  function dismissBubble() {
    setBubbleVisible(false);
    setBubbleDismissed(true);
    try {
      window.sessionStorage.setItem(BUBBLE_DISMISS_KEY, "1");
    } catch {
      /* yoksay */
    }
  }

  useEffect(() => {
    if (open && bubbleVisible) dismissBubble();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    /** Popup veya açık panel — ScrollToTop’un üstünde kalması için tam blok yüksekliği */
    const show = (popupVisible && !open) || open;
    function measureAndPublish() {
      let heightPx = 0;
      if (open && panelRef.current) {
        heightPx = panelRef.current.getBoundingClientRect().height;
      } else if (popupVisible && !open) {
        const el = popupRef.current;
        heightPx = el
          ? el.getBoundingClientRect().height
          : 96; /* animasyon öncesi yedek */
      }
      window.dispatchEvent(
        new CustomEvent("herbalkapida:wa-popup", {
          detail: { visible: show && heightPx > 0, heightPx },
        }),
      );
    }
    if (!show) {
      measureAndPublish();
      return;
    }
    // banner-enter animasyonu bittikten sonra gerçek yükseklik
    const raf = requestAnimationFrame(() => {
      measureAndPublish();
      requestAnimationFrame(measureAndPublish);
    });
    const el = open ? panelRef.current : popupRef.current;
    const ro =
      el &&
      new ResizeObserver(() => {
        measureAndPublish();
      });
    if (el && ro) ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.dispatchEvent(
        new CustomEvent("herbalkapida:wa-popup", {
          detail: { visible: false, heightPx: 0 },
        }),
      );
    };
  }, [popupVisible, open, popupIndex]);

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

      <div className="relative">
      {bubbleVisible && !open ? (
        <div
          role="status"
          className="pointer-events-auto banner-enter absolute bottom-full right-0 mb-3 w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl border border-outline-variant/50 bg-white p-3.5 pr-7 shadow-[0_10px_30px_rgba(18,40,28,0.18)] sm:bottom-0 sm:right-full sm:mb-0 sm:mr-3 sm:w-72"
        >
          <button
            type="button"
            onClick={dismissBubble}
            aria-label={t("bubbleClose")}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-outline hover:bg-surface-container hover:text-on-surface"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
          {displayPhone ? (
            <p className="text-[13px] font-semibold leading-relaxed text-on-surface">
              {t("bubbleContact")}{" "}
              <a
                href={`tel:${displayPhone.replace(/[^\d+]/g, "")}`}
                className="whitespace-nowrap text-primary hover:underline"
              >
                {displayPhone}
              </a>{" "}
              💚
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              dismissBubble();
              setOpen(true);
            }}
            className="mt-0.5 block w-full cursor-pointer whitespace-pre-line text-left text-[13px] leading-relaxed text-on-surface"
          >
            {bubbleText || t("bubbleDefault")}
          </button>
          {/* balon kuyruğu — butona doğru */}
          <span
            className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-outline-variant/50 bg-white sm:-right-1.5 sm:bottom-4 sm:border-b-0 sm:border-t"
            aria-hidden
          />
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
      {bubbleEnabled && !bubbleDismissed && !open ? (
        <span
          className="pointer-events-none absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e53935] px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white"
          aria-hidden
        >
          1
        </span>
      ) : null}
      </div>
    </div>
  );
}
