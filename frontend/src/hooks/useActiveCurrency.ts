"use client";

import { useLocale } from "next-intl";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  CURRENCY_COOKIE,
  currencyByLocale,
  type AppCurrency,
  type AppLocale,
} from "@/i18n/routing";
import {
  pickCurrency,
  readBrowserCookie,
} from "@/lib/locale-currency.shared";

export const CURRENCY_CHANGE_EVENT = "herbal:currency-change";

function writeCurrencyCookie(value: AppCurrency) {
  document.cookie = `${CURRENCY_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

function readActiveCurrency(locale: AppLocale): AppCurrency {
  return pickCurrency(readBrowserCookie(CURRENCY_COOKIE), locale);
}

let listeners = new Set<() => void>();
let snapshot = "TRY" as AppCurrency;

function emitCurrency(next: AppCurrency) {
  snapshot = next;
  listeners.forEach((l) => l());
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(CURRENCY_CHANGE_EVENT, { detail: { currency: next } }),
    );
  }
}

function subscribe(listener: () => void) {
  if (listeners.size === 0 && typeof document !== "undefined") {
    // İlk abone: cookie’den senkronize et (hydration sonrası doğru para birimi)
    const fromCookie = pickCurrency(
      readBrowserCookie(CURRENCY_COOKIE),
      "tr",
    );
    if (fromCookie !== snapshot) {
      snapshot = fromCookie;
    }
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return "TRY" as AppCurrency;
}

/** Çerez + event ile aktif para birimini canlı tutar. */
export function useActiveCurrency(): {
  currency: AppCurrency;
  setCurrency: (next: AppCurrency) => void;
} {
  const locale = useLocale() as AppLocale;

  // Hydration: client’ta cookie’yi oku
  useEffect(() => {
    emitCurrency(readActiveCurrency(locale));
  }, [locale]);

  useEffect(() => {
    function onEvent(e: Event) {
      const detail = (e as CustomEvent<{ currency?: string }>).detail;
      const upper = String(detail?.currency || "").toUpperCase();
      if (
        upper === "TRY" ||
        upper === "USD" ||
        upper === "EUR" ||
        upper === "GBP"
      ) {
        snapshot = upper;
        listeners.forEach((l) => l());
      }
    }
    window.addEventListener(CURRENCY_CHANGE_EVENT, onEvent);
    return () => window.removeEventListener(CURRENCY_CHANGE_EVENT, onEvent);
  }, []);

  const currency = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setCurrency = useCallback((next: AppCurrency) => {
    writeCurrencyCookie(next);
    emitCurrency(next);
  }, []);

  const resolved = currency || currencyByLocale[locale] || "TRY";

  return { currency: resolved, setCurrency };
}

/** İlk yüklemede store’u cookie ile senkron tut (layout mount). */
export function syncCurrencyStoreFromCookie(locale: AppLocale) {
  if (typeof window === "undefined") return;
  emitCurrency(readActiveCurrency(locale));
}
