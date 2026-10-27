"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "@/i18n/routing";
import type { WelcomePopupSettings } from "@/lib/cms";

type Props = {
  settings: WelcomePopupSettings;
};

function stripLocale(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  const maybeLocale = parts[0];
  if (["tr", "en", "de", "fr", "es"].includes(maybeLocale)) {
    const rest = parts.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function pathMatches(path: string, patterns: string[]): boolean {
  if (!patterns.length) return false;
  return patterns.some((p) => {
    const norm = p.startsWith("/") ? p : `/${p}`;
    if (norm === "/") return path === "/";
    return path === norm || path.startsWith(`${norm}/`);
  });
}

function readDismissed(key: string, frequency: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    if (frequency === "always") return false;
    if (frequency === "session") {
      return sessionStorage.getItem(key) === "1";
    }
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeDismissed(key: string, frequency: string) {
  try {
    if (frequency === "session") {
      sessionStorage.setItem(key, "1");
    } else if (frequency !== "always") {
      localStorage.setItem(key, "1");
    }
  } catch {
    /* ignore */
  }
}

export function WelcomePopup({ settings }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const path = useMemo(() => stripLocale(pathname || "/"), [pathname]);

  useEffect(() => {
    if (!settings?.enabled) return;
    const exclude = settings.excludePaths || [];
    const showOn = settings.showOnPaths || [];
    if (exclude.length && pathMatches(path, exclude)) return;
    // showOn boş = tüm sayfalar; doluysa yalnızca eşleşenler
    if (showOn.length && !pathMatches(path, showOn)) return;
    if (readDismissed(settings.storageKey, settings.frequency)) return;

    const delay = Math.max(0, Number(settings.delayMs) || 0);
    const t = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(t);
  }, [settings, path]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    writeDismissed(settings.storageKey, settings.frequency);
    setOpen(false);
  }

  if (!open) return null;

  const name = settings.distributorName || "Büşra Özberk";
  const headline =
    settings.headline ||
    `Bu internet sitesi Herbalife Nutrition Bağımsız Distribütörü tarafından yönetilmektedir: ${name}`;

  return (
    <div
      className="fixed inset-0 z-80 flex items-end justify-center bg-black/45 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-popup-title"
      onClick={dismiss}
    >
      <div
        className="relative max-h-[min(92dvh,40rem)] w-full max-w-3xl overflow-y-auto rounded-sm bg-white text-[#1a2744] shadow-[0_20px_60px_rgba(0,0,0,0.28)] animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center text-3xl leading-none text-[#1a2744]/80 hover:text-[#1a2744]"
          aria-label={settings.closeLabel || "Kapat"}
        >
          ×
        </button>

        <div className="border-b border-[#d9dee8] px-5 py-5 pr-14 sm:px-7 sm:py-6">
          <h2
            id="welcome-popup-title"
            className="text-base font-bold leading-snug sm:text-lg"
          >
            {headline}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2">
          <div className="border-b border-[#d9dee8] px-5 py-5 sm:border-b-0 sm:border-r sm:px-7 sm:py-6">
            <h3 className="text-[13px] font-bold uppercase tracking-wide text-[#1a2744]">
              {settings.leftTitle}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[#2c3a55]">
              {settings.leftBody}{" "}
              {settings.leftLinkUrl ? (
                <a
                  href={settings.leftLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#2f9e44] underline underline-offset-2 hover:text-[#248a38]"
                >
                  {settings.leftLinkLabel}
                </a>
              ) : null}
            </p>
          </div>
          <div className="px-5 py-5 sm:px-7 sm:py-6">
            <h3 className="text-[13px] font-bold uppercase tracking-wide text-[#1a2744]">
              {settings.rightTitle}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[#2c3a55]">
              {settings.rightBody}{" "}
              {settings.rightLinkUrl ? (
                <a
                  href={settings.rightLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#2f9e44] underline underline-offset-2 hover:text-[#248a38]"
                >
                  {settings.rightLinkLabel}
                </a>
              ) : null}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
