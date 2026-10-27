"use client";

import { Link, toLinkHref, usePathname } from "@/i18n/routing";
import { Home, Package, ShoppingBag, Heart, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useCartCount } from "@/hooks/useCartCount";
import { isAuthenticated, loginHref } from "@/lib/auth";
import {
  ensureWishlistIds,
  subscribeWishlist,
} from "@/lib/wishlist";

const ITEMS = [
  { href: "/", labelKey: "home" as const, icon: Home },
  { href: "/urunler", labelKey: "products" as const, icon: Package },
  { href: "/sepet", labelKey: "cart" as const, icon: ShoppingBag, cart: true },
  {
    href: "/hesabim/favoriler",
    labelKey: "favorites" as const,
    icon: Heart,
    fav: true,
    auth: true,
  },
  {
    href: "/hesabim",
    labelKey: "account" as const,
    icon: User,
    auth: true,
  },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tCart = useTranslations("cart");
  const count = useCartCount();
  const [favCount, setFavCount] = useState(0);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
    void ensureWishlistIds();
    return subscribeWishlist((ids) => setFavCount(ids.size));
  }, [pathname]);

  function labelFor(item: (typeof ITEMS)[number]) {
    if (item.href === "/sepet") return tCart("title");
    return tNav(item.labelKey);
  }

  // Ödeme formunda kendi sabit "Öde" çubuğu var; alt nav ile üst üste binmesin
  if (pathname === "/odeme" || pathname.startsWith("/odeme/")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/20 bg-surface-container-lowest/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label={tNav("mobileMenu")}
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const href =
            "auth" in item && item.auth && !authed
              ? loginHref(item.href)
              : toLinkHref(item.href);
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={href}
                className={`relative flex flex-col items-center gap-0.5 px-0.5 py-2.5 text-[10px] font-semibold ${
                  active ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                <span className="relative leading-none" aria-hidden>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                  {"cart" in item && item.cart && count > 0 ? (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] text-on-primary">
                      {count > 9 ? "9+" : count}
                    </span>
                  ) : null}
                  {"fav" in item && item.fav && favCount > 0 ? (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tertiary px-0.5 text-[9px] text-on-tertiary">
                      {favCount > 9 ? "9+" : favCount}
                    </span>
                  ) : null}
                </span>
                {labelFor(item)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
