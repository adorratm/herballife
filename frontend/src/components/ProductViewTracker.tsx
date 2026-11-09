"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/analytics";

type Props = {
  /** Merchant feed g:id ile aynı (catalogItemId) */
  itemId: string;
  name: string;
  price?: number;
  currency?: string;
};

/** Ürün detay ViewContent — client-only bir kez */
export function ProductViewTracker({ itemId, name, price, currency }: Props) {
  useEffect(() => {
    trackViewContent({ itemId, name, price, currency });
  }, [itemId, name, price, currency]);

  return null;
}
