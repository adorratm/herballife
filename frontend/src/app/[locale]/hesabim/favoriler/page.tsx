"use client";

import { Link, asRouterHref, useRouter } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { AccountTabs } from "@/components/AccountTabs";
import { ProductCard } from "@/components/ProductCard";
import { getWishlist, removeWishlistItem } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import {
  clearWishlistCache,
  ensureWishlistIds,
} from "@/lib/wishlist";
import type { WishlistItem } from "@/lib/types";

export default function FavoritesPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const token = getToken();
    if (!token) {
      router.replace(asRouterHref("/giris?next=/hesabim/favoriler"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getWishlist(token);
      setItems(data.filter((i) => i.product));
      clearWishlistCache();
      await ensureWishlistIds();
    } catch {
      setError("Favoriler yüklenemedi. Oturumu kontrol edin.");
      clearToken();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function remove(productId: string) {
    const token = getToken();
    if (!token) {
      router.replace(asRouterHref("/giris?next=/hesabim/favoriler"));
      return;
    }
    try {
      await removeWishlistItem(productId, token);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      clearWishlistCache();
      await ensureWishlistIds();
    } catch {
      setError("Favoriden çıkarılamadı");
    }
  }

  if (loading) {
    return (
      <div className="page-shell py-16 text-sm text-on-surface-variant">
        Favoriler yükleniyor…
      </div>
    );
  }

  return (
    <div className="page-shell py-8 md:py-10">
      <h1 className="font-display text-3xl tracking-tight text-on-surface md:text-4xl">
        Hesabım
      </h1>
      <p className="mt-1 text-sm text-on-surface-variant">Favorilerim</p>

      <AccountTabs active="favoriler" />

      {error ? (
        <p className="mt-4 text-sm text-error">{error}</p>
      ) : null}

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-outline-variant/30 bg-white p-8 text-center">
          <p className="text-sm text-on-surface-variant">
            Henüz favori ürün yok.
          </p>
          <Link
            href="/urunler"
            className="btn-cta mt-5 inline-block px-6 py-2.5 text-sm"
          >
            Ürünlere göz at
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 md:gap-3">
          {items.map((item) =>
            item.product ? (
              <div key={item.id} className="flex flex-col gap-1.5">
                <ProductCard product={item.product} size="compact" />
                <button
                  type="button"
                  onClick={() => void remove(item.productId)}
                  className="rounded-md border border-outline-variant/40 py-1.5 text-[11px] font-medium text-on-surface-variant hover:border-flash hover:text-flash"
                >
                  Favoriden çıkar
                </button>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
