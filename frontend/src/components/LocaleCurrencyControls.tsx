"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LocaleFlag } from "@/components/LocaleFlag";
import { useLocaleAlternates } from "@/components/LocaleAlternates";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import {
  currencies as allCurrencies,
  currencyByLocale as defaultCurrencyByLocale,
  currencyLabels,
  currencySymbols,
  localeNativeNames,
  locales as allLocales,
  usePathname,
  useRouter,
  type AppCurrency,
  type AppLocale,
} from "@/i18n/routing";

export type LocalizationConfig = {
  enabledLocales?: string[];
  currencies?: string[];
  currencyByLocale?: Record<string, string>;
  defaultCurrency?: string;
  languages?: Array<{
    code: string;
    name?: string;
    nativeName?: string;
    enabled?: boolean;
    currency?: string;
    sortOrder?: number;
  }>;
};

function isAppLocale(v: string): v is AppLocale {
  return (allLocales as readonly string[]).includes(v);
}

function isAppCurrency(v: string): v is AppCurrency {
  return (allCurrencies as readonly string[]).includes(v);
}

function DropdownShell({
  label,
  trigger,
  open,
  onToggle,
  menuAlign = "right",
  children,
}: {
  label: string;
  trigger: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  /** Mobil menüde left — ekran dışına kaymayı önler */
  menuAlign?: "left" | "right";
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onToggle();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onToggle();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onToggle]);

  return (
    <div className="locale-dd relative" ref={ref}>
      <button
        type="button"
        className="locale-dd__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={onToggle}
      >
        {trigger}
        <svg
          className={`h-3 w-3 opacity-60 transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          aria-hidden
        >
          <path
            d="M2.5 4.5L6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {open ? (
        <ul
          className={`locale-dd__menu locale-dd__menu--${menuAlign}`}
          role="listbox"
          aria-label={label}
        >
          {children}
        </ul>
      ) : null}
    </div>
  );
}

export function LocaleCurrencyControls({
  compact,
  localization,
  menuAlign = "right",
}: {
  compact?: boolean;
  localization?: LocalizationConfig | null;
  menuAlign?: "left" | "right";
}) {
  const t = useTranslations("locale");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const { currency, setCurrency } = useActiveCurrency();
  const { alternates } = useLocaleAlternates();
  const [langOpen, setLangOpen] = useState(false);
  const [curOpen, setCurOpen] = useState(false);

  const languageMeta = useMemo(() => {
    const map = new Map<
      string,
      { nativeName: string; currency?: string; sortOrder: number }
    >();
    for (const row of localization?.languages || []) {
      const code = String(row.code || "").toLowerCase();
      if (!code) continue;
      if (row.enabled === false) continue;
      map.set(code, {
        nativeName:
          row.nativeName?.trim() ||
          row.name?.trim() ||
          localeNativeNames[code as AppLocale] ||
          code.toUpperCase(),
        currency: row.currency,
        sortOrder: Number(row.sortOrder) || 0,
      });
    }
    return map;
  }, [localization?.languages]);

  const enabledLocales = useMemo(() => {
    if (languageMeta.size > 0) {
      return [...languageMeta.keys()]
        .filter(isAppLocale)
        .sort(
          (a, b) =>
            (languageMeta.get(a)?.sortOrder || 0) -
            (languageMeta.get(b)?.sortOrder || 0),
        );
    }
    const fromCms = (localization?.enabledLocales || [])
      .map((x) => x.toLowerCase())
      .filter(isAppLocale);
    return fromCms.length > 0 ? fromCms : [...allLocales];
  }, [languageMeta, localization?.enabledLocales]);

  const enabledCurrencies = useMemo(() => {
    const fromCms = (localization?.currencies || [])
      .map((x) => x.toUpperCase())
      .filter(isAppCurrency);
    return fromCms.length > 0 ? fromCms : [...allCurrencies];
  }, [localization?.currencies]);

  const currencyMap = useMemo(() => {
    const map: Record<AppLocale, AppCurrency> = {
      ...defaultCurrencyByLocale,
    };
    for (const [loc, meta] of languageMeta) {
      if (isAppLocale(loc) && meta.currency && isAppCurrency(meta.currency)) {
        map[loc] = meta.currency;
      }
    }
    const fromCms = localization?.currencyByLocale || {};
    for (const [loc, cur] of Object.entries(fromCms)) {
      if (isAppLocale(loc) && isAppCurrency(cur)) {
        map[loc] = cur;
      }
    }
    return map;
  }, [languageMeta, localization?.currencyByLocale]);

  const onLocale = useCallback(
    (next: AppLocale) => {
      if (!enabledLocales.includes(next)) return;
      const nextCurrency =
        next === "tr" ? "TRY" : currencyMap[next] || enabledCurrencies[0] || "TRY";
      const safeCurrency = enabledCurrencies.includes(nextCurrency)
        ? nextCurrency
        : enabledCurrencies[0] || "TRY";
      setCurrency(safeCurrency);
      setLangOpen(false);

      // Detay sayfalarında hedef dilin slug’ına git (404 / yanlış içerik önlemi)
      if (alternates?.localeSlugs) {
        const targetSlug =
          alternates.localeSlugs[next] ||
          alternates.localeSlugs.en ||
          alternates.localeSlugs.tr ||
          Object.values(alternates.localeSlugs)[0];
        if (targetSlug) {
          router.replace(
            {
              pathname: alternates.pathname,
              params: { slug: targetSlug },
            },
            { locale: next },
          );
          return;
        }
      }

      router.replace(
        pathname as Parameters<typeof router.replace>[0],
        { locale: next },
      );
    },
    [
      pathname,
      router,
      enabledLocales,
      currencyMap,
      enabledCurrencies,
      setCurrency,
      alternates,
    ],
  );

  const onCurrency = useCallback(
    (next: AppCurrency) => {
      if (!enabledCurrencies.includes(next)) return;
      setCurrency(next);
      setCurOpen(false);
      router.refresh();
    },
    [router, enabledCurrencies, setCurrency],
  );

  const activeCurrency = enabledCurrencies.includes(currency)
    ? currency
    : enabledCurrencies[0] || "TRY";

  return (
    <div
      className={`locale-currency flex items-center gap-1.5 ${compact ? "scale-95" : ""}`}
      aria-label={t("language")}
    >
      <DropdownShell
        label={t("language")}
        menuAlign={menuAlign}
        open={langOpen}
        onToggle={() => {
          setLangOpen((v) => !v);
          setCurOpen(false);
        }}
        trigger={
          <>
            <LocaleFlag locale={locale} />
            <span className="locale-dd__code">{locale.toUpperCase()}</span>
          </>
        }
      >
        {enabledLocales.map((code) => (
          <li key={code} role="option" aria-selected={code === locale}>
            <button
              type="button"
              className={`locale-dd__item ${code === locale ? "is-active" : ""}`}
              onClick={() => onLocale(code)}
            >
              <LocaleFlag locale={code} />
              <span className="locale-dd__label">
                {languageMeta.get(code)?.nativeName ||
                  localeNativeNames[code]}
              </span>
              <span className="locale-dd__code-muted">{code.toUpperCase()}</span>
            </button>
          </li>
        ))}
      </DropdownShell>

      <DropdownShell
        label={t("currency")}
        menuAlign={menuAlign}
        open={curOpen}
        onToggle={() => {
          setCurOpen((v) => !v);
          setLangOpen(false);
        }}
        trigger={
          <>
            <span className="locale-dd__symbol" aria-hidden>
              {currencySymbols[activeCurrency]}
            </span>
            <span className="locale-dd__code">{activeCurrency}</span>
          </>
        }
      >
        {enabledCurrencies.map((code) => (
          <li key={code} role="option" aria-selected={code === activeCurrency}>
            <button
              type="button"
              className={`locale-dd__item ${code === activeCurrency ? "is-active" : ""}`}
              onClick={() => onCurrency(code)}
            >
              <span className="locale-dd__symbol">{currencySymbols[code]}</span>
              <span className="locale-dd__label">
                {currencyLabels[locale][code]}
              </span>
              <span className="locale-dd__code-muted">{code}</span>
            </button>
          </li>
        ))}
      </DropdownShell>
    </div>
  );
}
