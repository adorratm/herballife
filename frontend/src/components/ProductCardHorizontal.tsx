"use client";

import { AppImage as Image } from "@/components/AppImage";
import { Link } from "@/i18n/routing";
import { productHref } from "@/i18n/hrefs";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { formatMoney, productImage } from "@/lib/format";
import {
  productDiscountPercent,
  resolveProductCompareAt,
} from "@/lib/product-badges";
import type { Product } from "@/lib/types";

/** Yatay ürün kartı — Fırsat Ürünleri / Kişisel Bakım blokları */
export function ProductCardHorizontal({ product }: { product: Product }) {
  const t = useTranslations("product");
  const img = productImage(product.imageUrl, product.slug);
  const variant = product.variants?.[0];
  const price = product.salePrice ?? variant?.price ?? product.basePrice;
  const compareAt = resolveProductCompareAt(product, price);
  const discount = productDiscountPercent(price, compareAt);
  const hasDiscount = compareAt != null && Number(compareAt) > Number(price);

  return (
    <Link
      href={productHref(product.slug)}
      className="group card-motion isolate flex h-full min-w-0 items-center overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm [transform:translateZ(0)]"
    >
      {/* Kare görsel kendi yuvarlak çerçevesinde: kart köşelerinden taşmaz */}
      <div className="flex w-[34%] max-w-36 shrink-0 items-center self-stretch border-r border-outline-variant/70 p-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-outline-variant/50 bg-white">
          <Image
            src={img}
            alt={product.name}
            fill
            className="rounded-lg object-contain p-1.5 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 34vw, 9rem"
          />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 self-stretch p-3">
        <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-on-surface group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-auto pt-1">
          {hasDiscount ? (
            <div className="flex items-center justify-between gap-1.5 leading-none">
              <span className="text-xs font-medium text-outline line-through">
                {formatMoney(compareAt, product.currency)}
              </span>
              {discount != null && discount > 0 ? (
                <span className="discount-tag">-%{discount}</span>
              ) : null}
            </div>
          ) : null}
          <p className="mt-1 font-display text-lg font-bold tracking-tight text-primary">
            {formatMoney(price, product.currency)}
          </p>
          {hasDiscount ? (
            <p className="best-price-pill mt-1.5">
              <ArrowDown className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
              {t("bestPrice30Days")}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
