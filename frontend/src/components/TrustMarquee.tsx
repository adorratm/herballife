"use client";

import { useTranslations } from "next-intl";

const ITEM_KEYS = [
  "item0",
  "item1",
  "item2",
  "item3",
  "item4",
  "item5",
  "item6",
  "item7",
] as const;

export function TrustMarquee() {
  const t = useTranslations("trustMarquee");
  const items = ITEM_KEYS.map((key) => t(key));
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden rounded-full border border-[#ebece8] bg-surface-container-lowest/90 py-2.5 shadow-sm backdrop-blur-sm">
      <div className="marquee-track gap-8 px-4" aria-hidden>
        {loop.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {label}
          </span>
        ))}
      </div>
      <span className="sr-only">{t("srOnly")}</span>
    </div>
  );
}
