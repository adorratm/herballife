"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SiteSearch } from "@/components/SiteSearch";
import { NotificationBell } from "@/components/NotificationBell";
import { DealStripCountdown } from "@/components/PromoCountdown";
import { isAuthenticated, loginPath } from "@/lib/auth";
import { cartItemCount, fetchCart } from "@/lib/cart";
import type { SiteSettings } from "@/lib/cms";
import { DEFAULT_SETTINGS } from "@/lib/cms";
import {
  ACCOUNT_LINKS,
  CATEGORY_CHIPS,
  DEFAULT_HEADER_NAV,
  SUPPORT_LINKS,
  UTILITY_LINKS,
  dedupeHeaderNav,
} from "@/lib/site-nav";
import {
  ensureWishlistIds,
  subscribeWishlist,
} from "@/lib/wishlist";

type Props = {
  settings?: SiteSettings;
};

function linkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ settings = DEFAULT_SETTINGS }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [authed, setAuthed] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const catCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nav = dedupeHeaderNav(
    settings.navigation.header?.length
      ? settings.navigation.header
      : DEFAULT_HEADER_NAV,
  );
  const brand = settings.brand;
  const phone = settings.contact.phone;
  const catActive = pathname.startsWith("/urunler");
  const pageLinks = nav.filter((item) => item.href !== "/urunler");

  function openCats() {
    if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
    setCatOpen(true);
  }
  function scheduleCloseCats() {
    if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
    catCloseTimer.current = setTimeout(() => setCatOpen(false), 280);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setAuthed(isAuthenticated());
    fetchCart()
      .then((cart) => setCount(cartItemCount(cart)))
      .catch(() => undefined);
    void ensureWishlistIds();
    return subscribeWishlist((ids) => setFavCount(ids.size));
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
    setCatOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!catOpen) return;
    function onDoc(e: MouseEvent) {
      if (!catRef.current?.contains(e.target as Node)) setCatOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setCatOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [catOpen]);

  const favoritesHref = authed
    ? "/hesabim/favoriler"
    : loginPath("/hesabim/favoriler");
  const accountHref = authed ? "/hesabim" : loginPath(pathname);

  const menu =
    open && mounted
      ? createPortal(
          <div
            className="mobile-menu fixed inset-0 z-90 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobil menü"
          >
            <button
              type="button"
              aria-label="Kapat"
              className="mobile-menu-backdrop absolute inset-0 bg-on-surface/50"
              onClick={() => setOpen(false)}
            />
            <div className="mobile-menu-panel absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-3xl bg-white shadow-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[min(100%,22rem)] sm:rounded-none sm:rounded-l-2xl">
              <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-outline-variant sm:hidden" />
              <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-5 py-4">
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold text-on-surface">
                    {brand.name}
                  </p>
                  <p className="truncate text-xs text-on-surface-variant">
                    {brand.distributorName}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Menüyü kapat"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-on-surface"
                  onClick={() => setOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="flex-1 overflow-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <section className="mb-5">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">
                      Kategoriler
                    </p>
                    <Link
                      href="/urunler"
                      onClick={() => setOpen(false)}
                      className="text-xs font-bold text-primary"
                    >
                      Tümü
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {CATEGORY_CHIPS.map((chip) => {
                      const active = linkActive(pathname, chip.href);
                      return (
                        <Link
                          key={`m-cat-${chip.href}`}
                          href={chip.href}
                          onClick={() => setOpen(false)}
                          className={`group overflow-hidden border ${
                            active
                              ? "border-primary ring-1 ring-primary"
                              : chip.accent
                                ? "border-flash/40"
                                : "border-outline-variant"
                          }`}
                        >
                          <div className="relative aspect-[5/3] bg-surface-container-low">
                            <Image
                              src={chip.image}
                              alt=""
                              fill
                              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                              sizes="40vw"
                            />
                            {chip.accent ? (
                              <span className="absolute left-0 top-0 bg-flash px-2 py-0.5 text-[10px] font-bold text-white">
                                Fırsat
                              </span>
                            ) : null}
                          </div>
                          <div
                            className={`border-t border-outline-variant px-2.5 py-2 ${
                              active ? "bg-primary text-on-primary" : "bg-white"
                            }`}
                          >
                            <p className="text-sm font-bold leading-tight">
                              {chip.label}
                            </p>
                            <p
                              className={`mt-0.5 text-[11px] ${
                                active
                                  ? "text-on-primary/80"
                                  : "text-on-surface-variant"
                              }`}
                            >
                              {chip.blurb}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>

                <section className="mb-5">
                  <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                    Sayfalar
                  </p>
                  <nav className="flex flex-col overflow-hidden rounded-xl border border-outline-variant">
                    {nav.map((item, i) => (
                      <Link
                        key={`m-nav-${item.href}`}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`px-4 py-3.5 text-sm font-semibold ${
                          i > 0 ? "border-t border-outline-variant" : ""
                        } ${
                          linkActive(pathname, item.href)
                            ? "bg-primary-fixed text-primary"
                            : "text-on-surface"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </section>

                <section className="mb-5">
                  <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                    Sipariş
                  </p>
                  <nav className="flex flex-col overflow-hidden rounded-xl border border-outline-variant">
                    {SUPPORT_LINKS.slice(0, 4).map((item, i) => (
                      <Link
                        key={`m-sup-${item.href}`}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`px-4 py-3.5 text-sm font-semibold text-on-surface ${
                          i > 0 ? "border-t border-outline-variant" : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </section>

                <section className="mb-2">
                  <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                    Hesap
                  </p>
                  <nav className="flex flex-col overflow-hidden rounded-xl border border-outline-variant">
                    {ACCOUNT_LINKS.map((item, i) => (
                      <Link
                        key={`m-acc-${item.href}`}
                        href={authed ? item.href : loginPath(item.href)}
                        onClick={() => setOpen(false)}
                        className={`px-4 py-3.5 text-sm font-semibold text-on-surface ${
                          i > 0 ? "border-t border-outline-variant" : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </section>

                {phone ? (
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="mt-4 flex items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-on-primary"
                  >
                    Ara · {phone}
                  </a>
                ) : null}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-outline-variant bg-white shadow-sm">
        <div className="hidden bg-primary text-on-primary lg:block">
          <div className="page-shell flex items-center justify-between gap-4 py-2 text-[13px]">
            <p className="font-semibold text-on-primary">
              Ücretsiz kargo · Güvenli ödeme
            </p>
            <div className="flex items-center gap-4">
              <DealStripCountdown />
              {phone ? (
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="font-semibold text-on-primary hover:text-primary-fixed"
                >
                  {phone}
                </a>
              ) : null}
              {UTILITY_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={
                    item.href.includes("favoriler") && !authed
                      ? loginPath(item.href)
                      : item.href
                  }
                  className="font-medium text-on-primary/85 hover:text-on-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="page-shell grid grid-cols-[1fr_auto] items-center gap-2 py-2.5 sm:py-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-2 xl:gap-3 xl:py-3.5">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 justify-self-start lg:max-w-[11rem] xl:max-w-[15rem] 2xl:max-w-none"
          >
            {brand.logoUrl ? (
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                width={44}
                height={44}
                className="h-10 w-10 shrink-0 rounded-xl object-cover ring-2 ring-primary/15 sm:h-11 sm:w-11"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-on-primary sm:h-11 sm:w-11 sm:text-lg">
                {brand.name.slice(0, 1)}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-bold tracking-tight text-on-surface sm:text-lg xl:text-xl">
                {brand.name}
              </span>
              <span className="mt-0.5 block truncate text-[11px] font-medium text-on-surface-variant sm:text-xs">
                {brand.distributorName}
              </span>
            </span>
          </Link>

          <nav className="hidden min-w-0 items-center justify-center gap-0 lg:flex xl:gap-0.5">
            <div
              ref={catRef}
              className="relative shrink-0"
              onMouseEnter={openCats}
              onMouseLeave={scheduleCloseCats}
            >
              <button
                type="button"
                aria-expanded={catOpen}
                aria-haspopup="true"
                onClick={() => setCatOpen((v) => !v)}
                className={`inline-flex cursor-pointer items-center gap-0.5 px-1 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors xl:gap-1.5 xl:px-2.5 xl:py-2 xl:text-sm ${
                  catActive || catOpen
                    ? "text-primary"
                    : "text-on-surface hover:text-primary"
                }`}
              >
                Ürünler
                <ChevronIcon open={catOpen} />
              </button>
              {(catActive || catOpen) && (
                <span
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary"
                  aria-hidden
                />
              )}

              {catOpen ? (
                <div className="absolute left-0 top-full z-50 max-w-[calc(100vw-1.25rem)] w-[min(34rem,calc(100vw-1.5rem))] pt-2 xl:w-[min(46rem,calc(100vw-2rem))] 2xl:w-[min(56rem,calc(100vw-3rem))]">
                  <div className="border border-outline-variant bg-white shadow-xl">
                    <div className="flex items-center justify-between gap-2 border-b border-outline-variant bg-[#f7f8f6] px-3 py-2.5 xl:gap-3 xl:px-5 xl:py-3.5">
                      <div className="min-w-0">
                        <p className="hidden text-[10px] font-bold uppercase tracking-wide text-primary xl:block">
                          Katalog
                        </p>
                        <p className="truncate text-sm font-bold text-on-surface xl:text-base">
                          Kategoriler
                        </p>
                      </div>
                      <Link
                        href="/urunler"
                        className="shrink-0 cursor-pointer border border-primary bg-primary px-2.5 py-1.5 text-[11px] font-bold text-on-primary hover:bg-primary-container xl:px-3.5 xl:py-2 xl:text-sm"
                      >
                        Tüm ürünler →
                      </Link>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 p-2 xl:gap-3 xl:p-4 2xl:gap-3.5 2xl:p-5">
                      {CATEGORY_CHIPS.map((chip) => {
                        const active = linkActive(pathname, chip.href);
                        return (
                          <Link
                            key={`mega-${chip.href}`}
                            href={chip.href}
                            className={`group flex cursor-pointer flex-col overflow-hidden border bg-white transition-colors hover:border-primary ${
                              active
                                ? "border-primary"
                                : chip.accent
                                  ? "border-flash/45"
                                  : "border-outline-variant"
                            }`}
                          >
                            <div className="relative aspect-[5/4] bg-[linear-gradient(145deg,#eef3f0,#fff)] xl:aspect-[4/3]">
                              <Image
                                src={chip.image}
                                alt={chip.label}
                                fill
                                className="object-contain p-2 transition-transform duration-300 group-hover:scale-105 xl:p-3.5 2xl:p-4"
                                sizes="(max-width: 1280px) 120px, 200px"
                              />
                              {chip.accent ? (
                                <span className="absolute left-0 top-0 bg-flash px-1.5 py-0.5 text-[8px] font-bold uppercase text-white xl:px-2 xl:text-[10px]">
                                  Hediyeli
                                </span>
                              ) : null}
                            </div>
                            <div
                              className={`border-t px-1.5 py-1.5 xl:px-3 xl:py-2.5 ${
                                active
                                  ? "border-primary bg-primary text-on-primary"
                                  : "border-outline-variant"
                              }`}
                            >
                              <p className="truncate text-[11px] font-bold leading-tight xl:text-sm 2xl:text-base">
                                {chip.label}
                              </p>
                              <p
                                className={`mt-0.5 hidden truncate text-xs xl:block ${
                                  active
                                    ? "text-on-primary/85"
                                    : "text-on-surface-variant"
                                }`}
                              >
                                {chip.blurb}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {pageLinks.map((item) => {
              const active = linkActive(pathname, item.href);
              return (
                <Link
                  key={`d-nav-${item.href}`}
                  href={item.href}
                  className={`relative shrink-0 px-1 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors xl:px-2.5 xl:py-2 xl:text-sm ${
                    active
                      ? "text-primary"
                      : "text-on-surface hover:text-primary"
                  }`}
                >
                  {item.label}
                  {active ? (
                    <span
                      className="absolute inset-x-1 -bottom-0.5 h-0.5 rounded-full bg-primary xl:inset-x-2.5"
                      aria-hidden
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center justify-self-end gap-0.5 sm:gap-1">
            <div className="hidden w-40 2xl:block 2xl:w-52">
              <SiteSearch variant="bar" />
            </div>
            <div className="2xl:hidden">
              <SiteSearch variant="icon" />
            </div>

            {authed ? (
              <div className="hidden md:block">
                <NotificationBell />
              </div>
            ) : null}

            <Link
              href={favoritesHref}
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low md:flex"
              aria-label="Favorilerim"
              title="Favorilerim"
            >
              <HeartIcon />
              {favCount > 0 ? (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary">
                  {favCount > 9 ? "9+" : favCount}
                </span>
              ) : null}
            </Link>

            <Link
              href="/sepet"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low 2xl:w-auto 2xl:gap-2 2xl:px-3"
              aria-label="Sepet"
            >
              <CartIcon />
              <span className="hidden text-sm font-medium 2xl:inline">Sepet</span>
              {count > 0 ? (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary 2xl:static 2xl:h-5 2xl:min-w-5 2xl:px-1.5 2xl:text-[11px]">
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </Link>

            <Link
              href={accountHref}
              className="hidden h-9 items-center border border-outline-variant px-2 text-xs font-medium text-on-surface hover:border-primary hover:text-primary lg:inline-flex xl:h-10 xl:px-3.5 xl:text-sm"
            >
              {authed ? "Hesabım" : "Giriş"}
            </Link>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary lg:hidden"
              aria-label="Menüyü aç"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>

      </header>
      {menu}
    </>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.35-7-9.2A3.8 3.8 0 0 1 12 7.5a3.8 3.8 0 0 1 7 3.3C19 15.65 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h2l1.2 10.2a1.5 1.5 0 0 0 1.5 1.3h8.6a1.5 1.5 0 0 0 1.5-1.3L20 8H7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.2" fill="currentColor" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}
