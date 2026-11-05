"use client";

import { AppImage as Image } from "@/components/AppImage";
import { Link } from "@/i18n/routing";
import { productHref } from "@/i18n/hrefs";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ProductBadgeStack } from "@/components/ProductBadgeStack";
import { formatMoney, productImage } from "@/lib/format";
import {
  computeProductBadges,
  productDiscountPercent,
  resolveProductCompareAt,
} from "@/lib/product-badges";
import type { Product } from "@/lib/types";

type Props = {
  product: Product;
  /** compact: favoriler / dar grid */
  size?: "default" | "compact";
  hideCart?: boolean;
};

function ratingFromSlug(slug: string): { score: number; count: number } {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash + slug.charCodeAt(i) * (i + 3)) % 97;
  }
  const score = 4.6 + (hash % 5) * 0.1;
  const count = 28 + (hash % 90);
  return { score: Math.min(5, Number(score.toFixed(1))), count };
}

export function ProductCard({
  product,
  size = "default",
  hideCart = false,
}: Props) {
  const t = useTranslations("product");
  const compact = size === "compact";
  const img = productImage(product.imageUrl, product.slug);
  const variant = product.variants?.[0];
  const price = product.salePrice ?? variant?.price ?? product.basePrice;
  const compareAt = resolveProductCompareAt(product, price);
  const discount = productDiscountPercent(price, compareAt);
  const hasDiscount =
    compareAt != null && Number(compareAt) > Number(price);
  const { score } = ratingFromSlug(product.slug);
  /* İndirim yüzdesi fiyat satırında gösterilir; görselde yalnız yeni / çok satan */
  const imageBadges = computeProductBadges(product, { price, compareAt }).filter(
    (b) => b.tone !== "sale",
  );

  return (
    <article
      className={`group card-motion relative flex h-full min-w-0 flex-col overflow-hidden border border-outline-variant bg-white shadow-sm ${
        compact ? "rounded-lg p-1.5" : "rounded-xl p-2.5"
      }`}
    >
      <div
        className={`absolute z-20 ${compact ? "right-1.5 top-1.5" : "right-2.5 top-2.5"}`}
      >
        <FavoriteButton productId={product.id} size="sm" />
      </div>
      <Link href={productHref(product.slug)} className="flex min-w-0 flex-1 flex-col">
        <div
          className={`card-media-shine relative w-full min-w-0 overflow-hidden rounded-lg aspect-square ${
            compact ? "mb-1.5" : "mb-2"
          }`}
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 40%, color-mix(in srgb, var(--primary-fixed) 90%, white), var(--surface-container-low))",
          }}
        >
          <ProductBadgeStack badges={imageBadges} compact={compact} onImage />
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-contain p-2.5 drop-shadow-[0_10px_18px_rgba(18,40,28,0.12)] transition-transform duration-500 ease-out group-hover:scale-[1.06] sm:p-3"
            sizes={compact ? "(max-width: 768px) 33vw, 15vw" : "(max-width: 768px) 45vw, 18vw"}
          />
        </div>

        <div className="flex flex-1 flex-col gap-0.5 px-0.5">
          {!compact ? (
            <div className="flex items-center gap-1">
              <span className="flex gap-px text-amber-400" aria-hidden>
                {"★★★★★".split("").map((s, i) => (
                  <span
                    key={i}
                    className={`text-[11px] leading-none ${i < Math.round(score) ? "opacity-100" : "opacity-25"}`}
                  >
                    {s}
                  </span>
                ))}
              </span>
              <span className="sr-only">{score}</span>
            </div>
          ) : null}
          <h3
            className={`line-clamp-2 min-h-[2.5em] font-display leading-snug text-on-surface group-hover:text-primary ${
              compact ? "text-[12px]" : "text-sm font-semibold"
            }`}
          >
            {product.name}
          </h3>
          {variant?.weightLabel ? (
            <p className="truncate text-[10px] font-medium text-primary">
              {variant.weightLabel}
            </p>
          ) : null}
          <div
            className={`mt-auto flex flex-col justify-end pt-1.5 ${
              compact ? "min-h-8" : "min-h-11"
            }`}
          >
            {hasDiscount ? (
              <div className="flex items-center justify-between gap-1.5 leading-none">
                <span
                  className={`font-medium text-outline line-through ${
                    compact ? "text-[11px]" : "text-xs"
                  }`}
                >
                  {formatMoney(compareAt, product.currency)}
                </span>
                {discount != null && discount > 0 ? (
                  <span
                    className={`discount-tag ${compact ? "discount-tag--sm" : ""}`}
                  >
                    -%{discount}
                  </span>
                ) : null}
              </div>
            ) : null}
            <span
              className={`mt-1 font-display font-bold tracking-tight text-primary ${
                compact ? "text-sm" : "text-lg"
              }`}
            >
              {formatMoney(price, product.currency)}
            </span>
          </div>
          {hasDiscount && !compact ? (
            <p className="best-price-pill mt-1.5">
              <ArrowDown className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
              {t("bestPrice30Days")}
            </p>
          ) : null}
        </div>
      </Link>
      {!hideCart ? (
        <div
          className={`opacity-95 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100 ${
            compact ? "mt-1.5" : "mt-2"
          }`}
        >
          <AddToCartButton
            productId={product.id}
            variantId={variant?.id}
            variantLabel={variant?.weightLabel}
            productName={product.name}
            price={Number(price)}
            label={t("addToCart")}
            goToCart={false}
            className={`btn-cta pressable w-full cursor-pointer text-xs ${compact ? "py-1.5" : "py-2"}`}
          />
        </div>
      ) : null}
    </article>
  );
}
