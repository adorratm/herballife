"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cartItemCount, fetchCart } from "@/lib/cart";
import { isAuthenticated, loginPath } from "@/lib/auth";
import {
  ensureWishlistIds,
  subscribeWishlist,
} from "@/lib/wishlist";

const ITEMS = [
  { href: "/", label: "Ana sayfa", icon: "⌂" },
  { href: "/urunler", label: "Ürünler", icon: "◈" },
  { href: "/sepet", label: "Sepet", icon: "bag", cart: true },
  {
    href: "/hesabim/favoriler",
    label: "Favori",
    icon: "heart",
    fav: true,
    auth: true,
  },
  { href: "/hesabim", label: "Hesabım", icon: "me", auth: true },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  // SSR ile aynı başlangıç — localStorage sadece mount sonrası
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
    fetchCart()
      .then((c) => setCount(cartItemCount(c)))
      .catch(() => undefined);
    void ensureWishlistIds();
    return subscribeWishlist((ids) => setFavCount(ids.size));
  }, [pathname]);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/20 bg-surface-container-lowest/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Mobil menü"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const href =
            item.auth && !authed ? loginPath(item.href) : item.href;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={href}
                className={`relative flex flex-col items-center gap-0.5 px-0.5 py-2.5 text-[10px] font-semibold ${
                  active ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                <span className="relative text-lg leading-none" aria-hidden>
                  {item.icon === "bag"
                    ? "👜"
                    : item.icon === "me"
                      ? "👤"
                      : item.icon === "heart"
                        ? "♡"
                        : item.icon}
                  {item.cart && count > 0 ? (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] text-on-primary">
                      {count > 9 ? "9+" : count}
                    </span>
                  ) : null}
                  {item.fav && favCount > 0 ? (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tertiary px-0.5 text-[9px] text-on-tertiary">
                      {favCount > 9 ? "9+" : favCount}
                    </span>
                  ) : null}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
