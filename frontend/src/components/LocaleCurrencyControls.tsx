"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { LocaleFlag } from "@/components/LocaleFlag";
import {
  CURRENCY_COOKIE,
  currencies,
  currencyByLocale,
  currencyLabels,
  currencySymbols,
  localeNames,
  locales,
  usePathname,
  useRouter,
  type AppCurrency,
  type AppLocale,
} from "@/i18n/routing";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

function DropdownShell({
  label,
  trigger,
  open,
  onToggle,
  children,
}: {
  label: string;
  trigger: React.ReactNode;
  open: boolean;
  onToggle: () => void;
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
        <ul className="locale-dd__menu" role="listbox" aria-label={label}>
          {children}
        </ul>
      ) : null}
    </div>
  );
}

export function LocaleCurrencyControls({ compact }: { compact?: boolean }) {
  const t = useTranslations("locale");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [currency, setCurrency] = useState<AppCurrency>("TRY");
  const [langOpen, setLangOpen] = useState(false);
  const [curOpen, setCurOpen] = useState(false);

  useEffect(() => {
    const stored = readCookie(CURRENCY_COOKIE);
    const upper = (stored || "").toUpperCase();
    if (upper === "TRY" || upper === "USD" || upper === "EUR" || upper === "GBP") {
      setCurrency(upper as AppCurrency);
    } else {
      setCurrency(currencyByLocale[locale]);
    }
  }, [locale]);

  const onLocale = useCallback(
    (next: AppLocale) => {
      const nextCurrency = next === "tr" ? "TRY" : currencyByLocale[next];
      writeCookie(CURRENCY_COOKIE, nextCurrency);
      setCurrency(nextCurrency);
      setLangOpen(false);
      router.replace(pathname, { locale: next });
    },
    [pathname, router],
  );

  const onCurrency = useCallback(
    (next: AppCurrency) => {
      if (locale === "tr") return;
      writeCookie(CURRENCY_COOKIE, next);
      setCurrency(next);
      setCurOpen(false);
      router.refresh();
    },
    [locale, router],
  );

  const activeCurrency = locale === "tr" ? "TRY" : currency;

  return (
    <div
      className={`locale-currency flex items-center gap-1.5 ${compact ? "scale-95" : ""}`}
      aria-label={t("language")}
    >
      <DropdownShell
        label={t("language")}
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
        {locales.map((code) => (
          <li key={code} role="option" aria-selected={code === locale}>
            <button
              type="button"
              className={`locale-dd__item ${code === locale ? "is-active" : ""}`}
              onClick={() => onLocale(code)}
            >
              <LocaleFlag locale={code} />
              <span className="locale-dd__label">
                {localeNames[locale][code]}
              </span>
              <span className="locale-dd__code-muted">{code.toUpperCase()}</span>
            </button>
          </li>
        ))}
      </DropdownShell>

      <DropdownShell
        label={t("currency")}
        open={curOpen}
        onToggle={() => {
          if (locale === "tr") return;
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
        {currencies.map((code) => (
          <li key={code} role="option" aria-selected={code === activeCurrency}>
            <button
              type="button"
              className={`locale-dd__item ${code === activeCurrency ? "is-active" : ""}`}
              disabled={locale === "tr" && code !== "TRY"}
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
