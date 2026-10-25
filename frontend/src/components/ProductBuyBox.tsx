"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AddToCartButton } from "@/components/AddToCartButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatMoney } from "@/lib/format";
import {
  computeProductBadges,
  productDiscountPercent,
  resolveProductCompareAt,
} from "@/lib/product-badges";
import { sortByWeightLabel } from "@/lib/weight-sort";
import { groupProductVariants } from "@/lib/variant-groups";
import type { Product, ProductVariant } from "@/lib/types";
import {
  DEFAULT_WHATSAPP_PHONE,
  buildWhatsAppUrl,
  productWhatsAppMessage,
} from "@/lib/whatsapp";

type Props = {
  product: Product;
  whatsappEnabled?: boolean;
  whatsappPhone?: string | null;
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const SHAKER_KEYS = [
  "shakerGreen",
  "shakerPink",
  "shakerBlack",
  "shakerWhite",
] as const;

export function ProductBuyBox({
  product,
  whatsappEnabled = true,
  whatsappPhone = DEFAULT_WHATSAPP_PHONE,
}: Props) {
  const t = useTranslations("product");
  const shakers = useMemo(
    () => SHAKER_KEYS.map((key) => t(key)),
    [t],
  );
  const variants = useMemo(
    () =>
      sortByWeightLabel(
        (product.variants || []).filter((v) => v.isActive !== false),
      ),
    [product.variants],
  );

  const variantGroups = useMemo(
    () => groupProductVariants(variants),
    [variants],
  );

  const aromas = useMemo(
    () => (product.flavorNotes || []).map((n) => n.trim()).filter(Boolean),
    [product.flavorNotes],
  );

  const showShaker = /shaker|paket|set/i.test(
    `${product.name} ${product.slug} ${product.badge || ""}`,
  );

  const [variantId, setVariantId] = useState<string | null>(
    variants[0]?.id ?? null,
  );
  const [aroma, setAroma] = useState<string>(aromas[0] || "");
  const [shaker, setShaker] = useState("");

  useEffect(() => {
    if (
      variants.length > 0 &&
      !variants.some((v) => v.id === variantId)
    ) {
      setVariantId(variants[0].id);
    }
  }, [variants, variantId]);

  useEffect(() => {
    if (aromas.length && !aromas.includes(aroma)) {
      setAroma(aromas[0]);
    }
  }, [aromas, aroma]);

  useEffect(() => {
    if (shakers.length && !shakers.includes(shaker)) {
      setShaker(shakers[0]);
    }
  }, [shakers, shaker]);

  const selected: ProductVariant | undefined =
    variants.find((v) => v.id === variantId) || variants[0];

  const displayPrice =
    selected?.price ?? product.salePrice ?? product.basePrice;
  const variantCompare = (
    selected as ProductVariant & { compareAtPrice?: string }
  )?.compareAtPrice;
  const compareAt =
    variantCompare ?? resolveProductCompareAt(product, displayPrice);
  const hasDeal =
    compareAt != null && Number(compareAt) > Number(displayPrice);
  const discountPct = productDiscountPercent(displayPrice, compareAt);
  const stock = selected != null ? selected.stock : product.stock;
  const outOfStock = stock <= 0;

  const badgeChips = useMemo(
    () =>
      computeProductBadges(product, {
        price: displayPrice,
        compareAt,
      }),
    [product, displayPrice, compareAt],
  );

  return (
    <div className="space-y-6">
      {product.campaignName ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {t("campaign")} · {product.campaignName}
        </p>
      ) : null}

      {badgeChips.length > 0 ? (
        <div className="relative flex min-h-0 flex-wrap gap-2">
          {badgeChips.map((b) => (
            <span
              key={b.label}
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                b.tone === "sale"
                  ? "badge-discount badge-live text-base! px-3! py-1.5!"
                  : "bg-surface-container-high text-on-surface"
              }`}
            >
              {b.label}
            </span>
          ))}
        </div>
      ) : null}

      {hasDeal && discountPct != null ? (
        <p className="rounded-xl bg-flash-soft px-4 py-3 text-sm font-semibold text-on-surface">
          <span className="font-display text-2xl text-flash">%{discountPct}</span>
          <span className="ml-2 text-on-surface-variant">
            {t("discount")} — {t("bestPrice30Days")}
          </span>
        </p>
      ) : null}

      {variantGroups.map((group) => (
        <div key={group.key}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.variants.map((v) => {
              const active = (selected?.id || variantId) === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all hover:-translate-y-0.5 ${
                    active
                      ? "border-primary bg-primary text-on-primary shadow-md"
                      : "border-outline-variant/40 hover:border-primary hover:shadow-sm"
                  }`}
                >
                  {v.weightLabel}
                  {v.stock <= 0 ? t("variantOut") : ""}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {aromas.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            {t("flavorNotes")}
          </p>
          <div className="flex flex-wrap gap-2">
            {aromas.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAroma(a)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 ${
                  aroma === a
                    ? "bg-secondary-container text-on-secondary-container shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showShaker ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            {t("shakerColor")}
          </p>
          <div className="flex flex-wrap gap-2">
            {shakers.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setShaker(s)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 ${
                  shaker === s
                    ? "bg-primary-fixed text-primary shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-on-surface-variant">
            {t("price")}
            {product.priceTaxIncluded !== false ? (
              <span className="ml-1.5 font-normal normal-case text-on-surface-variant/80">
                {t("vatIncluded")}
              </span>
            ) : null}
          </p>
          <div className="flex flex-wrap items-baseline gap-3">
            <p
              className={`font-display text-3xl text-primary ${
                hasDeal ? "price-live" : ""
              }`}
            >
              {formatMoney(displayPrice, product.currency)}
            </p>
            {hasDeal ? (
              <p className="text-sm text-on-surface-variant line-through">
                {formatMoney(compareAt, product.currency)}
              </p>
            ) : null}
            {hasDeal && discountPct != null ? (
              <span className="badge-discount text-sm!">−%{discountPct}</span>
            ) : null}
          </div>
          {hasDeal ? (
            <p className="mt-1 text-[11px] font-medium text-on-surface-variant">
              {t("bestPrice30Days")}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-on-surface-variant">
            {t("stock")} {outOfStock ? t("stockNone") : stock}
            {aroma ? ` · ${aroma}` : ""}
            {showShaker ? ` · ${shaker}` : ""}
          </p>
          {!outOfStock && stock > 0 && stock <= 8 ? (
            <p className="mt-1.5 text-xs font-semibold text-flash">
              {t("lowStock", { count: stock })}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-stretch gap-3">
        <div className="flex-1">
          <AddToCartButton
            productId={product.id}
            variantId={selected?.id}
            disabled={outOfStock}
            productName={product.name}
            price={Number(displayPrice)}
            label={outOfStock ? t("outOfStock") : t("addToCart")}
            goToCart={false}
            className="btn-cta pressable w-full cursor-pointer py-4 text-base font-bold tracking-wide disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <FavoriteButton productId={product.id} size="lg" />
      </div>

      <ul className="grid grid-cols-1 gap-2 rounded-xl bg-surface-container-low px-3.5 py-3 text-xs text-on-surface-variant sm:grid-cols-2">
        <li className="flex items-center gap-1.5">
          <span className="font-bold text-primary" aria-hidden>
            ✓
          </span>
          {t("trustOriginal")}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="font-bold text-primary" aria-hidden>
            ✓
          </span>
          {t("trustPaytr")}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="font-bold text-primary" aria-hidden>
            ✓
          </span>
          {t("trustReturn")}
        </li>
        {hasDeal ? (
          <li className="flex items-center gap-1.5 font-semibold text-flash sm:col-span-2">
            <span aria-hidden>★</span>
            {t("bestPrice30Days")}
          </li>
        ) : null}
      </ul>

      {whatsappEnabled ? (
        <a
          href={buildWhatsAppUrl(
            whatsappPhone,
            productWhatsAppMessage(
              product.name,
              `${SITE_URL}/urunler/${product.slug}`,
            ),
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost flex w-full items-center justify-center px-4 py-3 text-xs"
        >
          {t("whatsappConsult")}
        </a>
      ) : null}
    </div>
  );
}
