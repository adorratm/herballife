"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { globalSearch } from "@/lib/api";
import type { SearchResponse } from "@/lib/types";

const SEE_ALL: Record<string, (q: string) => string> = {
  products: (q) => `/urunler?q=${encodeURIComponent(q)}`,
  blog: () => "/blog",
  legal: () => "/kvkk",
};

function shortcutLabel() {
  if (typeof navigator === "undefined") return "Ctrl+K";
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)
    ? "⌘K"
    : "Ctrl+K";
}

type Props = {
  className?: string;
  /** Desktop: geniş arama çubuğu · Mobil: ikon · both: responsive tek örnek */
  variant?: "bar" | "icon" | "both";
};

const GROUP_LABEL_KEY: Record<string, string> = {
  products: "sectionProducts",
  blog: "sectionBlog",
  legal: "sectionLegal",
};

export function SiteSearch({ className = "", variant = "both" }: Props) {
  const t = useTranslations("siteSearch");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [active, setActive] = useState(0);
  const [hint, setHint] = useState("Ctrl+K");

  useEffect(() => {
    setMounted(true);
    setHint(shortcutLabel());
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || q.trim().length < 2) {
      setResult(null);
      setLoading(false);
      return;
    }
    const t = setTimeout(() => {
      setLoading(true);
      void globalSearch(q.trim(), 8)
        .then(setResult)
        .catch(() => setResult({ q, groups: [] }))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q, open]);

  const flatHits = useMemo(() => {
    return (result?.groups ?? []).flatMap((g) => g.items);
  }, [result]);

  useEffect(() => {
    setActive(0);
  }, [result]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-search-index="${active}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function close() {
    setOpen(false);
    setQ("");
    setResult(null);
    setActive(0);
  }

  function go(href: string) {
    close();
    router.push(href);
  }

  function goCatalog() {
    const term = q.trim();
    go(term ? `/urunler?q=${encodeURIComponent(term)}` : "/urunler");
  }

  function onInputKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!flatHits.length) return;
      setActive((i) => (i + 1) % flatHits.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!flatHits.length) return;
      setActive((i) => (i - 1 + flatHits.length) % flatHits.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (flatHits[active]) {
        go(flatHits[active].href);
        return;
      }
      goCatalog();
    }
  }

  const groups = result?.groups ?? [];
  const hasHits = flatHits.length > 0;
  let hitIndex = -1;

  const showBar = variant === "bar" || variant === "both";
  const showIcon = variant === "icon" || variant === "both";

  const palette =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-200 flex items-start justify-center px-3 pt-[min(12vh,5.5rem)] sm:px-4"
            role="presentation"
          >
            <button
              type="button"
              aria-label={t("closeOverlay")}
              className="absolute inset-0 bg-[#121411]/55 backdrop-blur-[2px]"
              onClick={close}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("dialogLabel")}
              className="relative z-10 flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-outline-variant/50 bg-white shadow-[0_24px_64px_-16px_rgba(18,20,17,0.35)]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center border-b border-outline-variant/30 bg-white">
                <span className="pl-4 text-primary">
                  <SearchIcon />
                </span>
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder={t("placeholder")}
                  className="w-full bg-transparent px-3 py-4 text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={close}
                  className="mr-3 shrink-0 rounded-md border border-outline-variant/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                  aria-label={t("closeSearch")}
                >
                  {t("close")}
                </button>
              </div>

              <div
                ref={listRef}
                className="max-h-[min(55vh,22rem)] overflow-auto overscroll-contain bg-white"
              >
                {q.trim().length < 2 ? (
                  <div className="space-y-3 px-4 py-6">
                    <p className="text-xs text-on-surface-variant">
                      {t("hintMinChars")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <QuickChip
                        label={t("quickProducts")}
                        onClick={() => go("/urunler")}
                      />
                      <QuickChip
                        label={t("quickBlog")}
                        onClick={() => go("/blog")}
                      />
                      <QuickChip
                        label={t("quickOrderLookup")}
                        onClick={() => go("/siparis-sorgula")}
                      />
                    </div>
                  </div>
                ) : loading ? (
                  <p className="px-4 py-6 text-xs text-on-surface-variant">
                    {t("searching")}
                  </p>
                ) : !hasHits ? (
                  <div className="space-y-3 px-4 py-6">
                    <p className="text-xs text-on-surface-variant">
                      {t("noResults")}
                    </p>
                    <button
                      type="button"
                      onClick={goCatalog}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {t("searchInCatalog", { q: q.trim() })}
                    </button>
                  </div>
                ) : (
                  groups.map((group) => {
                    const seeAll = SEE_ALL[group.type];
                    return (
                      <div
                        key={group.type}
                        className="border-b border-outline-variant/20 last:border-0"
                      >
                        <div className="flex items-center justify-between gap-2 px-4 py-2">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                            {GROUP_LABEL_KEY[group.type]
                              ? t(
                                  GROUP_LABEL_KEY[group.type] as
                                    | "sectionProducts"
                                    | "sectionBlog"
                                    | "sectionLegal",
                                )
                              : group.label}
                          </p>
                          {seeAll ? (
                            <button
                              type="button"
                              onClick={() => go(seeAll(q.trim()))}
                              className="text-[11px] font-semibold text-on-surface-variant hover:text-primary"
                            >
                              {t("seeAll")}
                            </button>
                          ) : null}
                        </div>
                        <ul>
                          {group.items.map((hit) => {
                            hitIndex += 1;
                            const idx = hitIndex;
                            const isActive = idx === active;
                            return (
                              <li key={`${hit.type}-${hit.id}`}>
                                <Link
                                  href={hit.href}
                                  data-search-index={idx}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    go(hit.href);
                                  }}
                                  onMouseEnter={() => setActive(idx)}
                                  className={`block px-4 py-2.5 transition-colors ${
                                    isActive
                                      ? "bg-primary-fixed text-on-surface"
                                      : "hover:bg-surface-container-low"
                                  }`}
                                >
                                  <div className="text-sm font-semibold">
                                    {hit.title}
                                  </div>
                                  {hit.subtitle ? (
                                    <div className="mt-0.5 text-xs text-on-surface-variant">
                                      {hit.subtitle}
                                    </div>
                                  ) : null}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })
                )}
              </div>

              {q.trim().length >= 2 ? (
                <div className="flex flex-wrap gap-2 border-t border-outline-variant/30 bg-surface-container-low/80 px-3 py-2.5">
                  <QuickChip label={t("goToCatalog")} onClick={goCatalog} />
                  <QuickChip
                    label={t("quickBlog")}
                    onClick={() => go("/blog")}
                  />
                </div>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {showBar ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${
            variant === "both" ? "hidden h-10 w-full 2xl:flex" : "flex h-10 w-full"
          } items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container-low px-3 text-left transition-colors hover:border-primary/35 hover:bg-white ${className}`}
          aria-label={t("searchProducts")}
        >
          <span className="shrink-0 text-on-surface-variant">
            <SearchIcon />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-on-surface-variant">
            {t("searchShort")}
          </span>
          <kbd className="hidden shrink-0 rounded-md border border-outline-variant/40 px-1.5 py-0.5 text-[10px] text-on-surface-variant 2xl:inline">
            {hint}
          </kbd>
        </button>
      ) : null}

      {showIcon ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${
            variant === "both" ? "flex 2xl:hidden" : "flex"
          } h-10 w-10 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-low ${
            variant === "both" ? "" : className
          }`}
          aria-label={t("searchAria")}
        >
          <SearchIcon />
        </button>
      ) : null}

      {palette}
    </>
  );
}

function QuickChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-outline-variant/40 bg-white px-3 py-1 text-[11px] font-semibold text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
    >
      {label}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
