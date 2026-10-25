"use client";

import { useTranslations } from "next-intl";
import {
  badgeToneClass,
  type ProductBadgeChip,
  type ProductBadgeLabelKey,
} from "@/lib/product-badges";

type Props = {
  badges: ProductBadgeChip[];
  compact?: boolean;
  className?: string;
  /** Rozetler ürün görseli alanına sabitlenir (kart) */
  onImage?: boolean;
};

function resolveLabel(
  chip: ProductBadgeChip,
  t: (key: ProductBadgeLabelKey) => string,
): string {
  if (chip.labelKey) return t(chip.labelKey);
  return chip.label;
}

export function ProductBadgeStack({
  badges,
  compact = false,
  className = "",
  onImage = false,
}: Props) {
  const t = useTranslations("productBadges");
  const tAria = useTranslations("aria");

  if (!badges.length) return null;

  const sale = badges.find((b) => b.tone === "sale");
  const cornerPill = badges.find(
    (b) => b.tone === "new" || b.tone === "bestseller",
  );

  if (onImage) {
    const inset = compact ? "0.375rem" : "0.625rem";
    const saleDigits = sale?.label.replace(/\D/g, "") || "";
    return (
      <>
        {cornerPill ? (
          <span
            className={`product-badge-pill pointer-events-none absolute z-10 ${badgeToneClass(cornerPill.tone)} ${compact ? "product-badge-pill--compact" : ""} ${className}`}
            style={{ left: inset, top: inset }}
          >
            {resolveLabel(cornerPill, t)}
          </span>
        ) : null}
        {sale ? (
          <span
            className={`product-badge-ribbon pointer-events-none absolute z-10 ${compact ? "product-badge-ribbon--compact" : ""}`}
            style={{ right: inset, top: inset }}
            aria-label={tAria("discountPercent", {
              percent: saleDigits || sale.label.replace(/\D/g, "") || "0",
            })}
          >
            {sale.label}
          </span>
        ) : null}
      </>
    );
  }

  return (
    <div
      className={`pointer-events-none flex max-w-full flex-wrap gap-1.5 ${className}`}
    >
      {badges.map((b) => (
        <span
          key={`${b.tone}-${b.labelKey ?? b.label}`}
          className={`${badgeToneClass(b.tone)} ${compact ? "text-[0.625rem]" : ""}`}
        >
          {resolveLabel(b, t)}
        </span>
      ))}
    </div>
  );
}
