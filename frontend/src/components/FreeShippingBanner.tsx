"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getApiBase } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { freeShippingThreshold } from "@/lib/shipping";

type Props = {
  subtotal: number;
  /** CMS `shipping.freeShippingOver` — yoksa API’den okunur */
  freeShippingOver?: number | null;
};

export function FreeShippingBanner({ subtotal, freeShippingOver }: Props) {
  const t = useTranslations("freeShippingBanner");
  const [cmsOver, setCmsOver] = useState<number | null | undefined>(
    freeShippingOver,
  );

  useEffect(() => {
    if (freeShippingOver != null) {
      setCmsOver(freeShippingOver);
      return;
    }
    let cancelled = false;
    void fetch(`${getApiBase()}/cms/settings`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Record<string, Record<string, unknown>> | null) => {
        if (cancelled || !data) return;
        const shipping = data.shipping as
          | { freeShippingOver?: number }
          | undefined;
        const n = Number(shipping?.freeShippingOver);
        setCmsOver(Number.isFinite(n) ? n : null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [freeShippingOver]);

  const threshold = freeShippingThreshold(cmsOver);
  if (threshold <= 0) return null;

  const reached = subtotal >= threshold;
  const remaining = Math.max(0, threshold - subtotal);

  if (reached) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary-container/60 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
            <span aria-hidden>🚚</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              {t("reachedTitle")}
            </p>
            <p className="text-xs text-on-surface-variant">{t("reachedBody")}</p>
          </div>
        </div>
        <span className="hidden shrink-0 rounded-full bg-surface-container-lowest px-3 py-1 text-[11px] font-bold text-primary shadow-sm sm:inline-flex">
          {t("badge")}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm">
      <p className="text-sm text-on-surface">
        {t("remaining", { amount: formatMoney(remaining) })}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{
            width: `${Math.min(100, Math.round((subtotal / threshold) * 100))}%`,
          }}
        />
      </div>
    </div>
  );
}
