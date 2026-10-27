"use client";

import { usePathname } from "@/i18n/routing";
import { useEffect, useState } from "react";
import {
  cartItemCount,
  fetchCart,
  getCartVersion,
  subscribeCart,
} from "@/lib/cart";

/**
 * Sepet rozet adedi.
 * - Sayfa/route değişiminde sunucudan yeniler.
 * - Sepete ekle/güncelle/sil olunca (AddToCartButton, sepet sayfası) event ile
 *   ANINDA günceller (router.refresh() pathname değiştirmediği için eskiden
 *   rozet ilk eklemede görünmüyordu).
 * - Sekme tekrar odaklanınca yeniler (başka sekmede yapılan değişiklikler).
 */
export function useCartCount() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => subscribeCart(setCount), []);

  useEffect(() => {
    let cancelled = false;

    function refresh() {
      const startVersion = getCartVersion();
      fetchCart()
        .then((cart) => {
          // Fetch sürerken bir ekleme olduysa (daha yeni veri) eski sonucu yoksay
          if (cancelled || getCartVersion() !== startVersion) return;
          setCount(cartItemCount(cart));
        })
        .catch(() => undefined);
    }

    refresh();
    function onVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);

  return count;
}
