"use client";

import { useEffect, useMemo, useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatMoney } from "@/lib/format";
import { sortByWeightLabel } from "@/lib/weight-sort";
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

const DEFAULT_SHAKERS = ["Parlak yeşil", "Pembe", "Siyah", "Beyaz"];

export function ProductBuyBox({
  product,
  whatsappEnabled = true,
  whatsappPhone = DEFAULT_WHATSAPP_PHONE,
}: Props) {
  const variants = useMemo(
    () =>
      sortByWeightLabel(
        (product.variants || []).filter((v) => v.isActive !== false),
      ),
    [product.variants],
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
  const [shaker, setShaker] = useState(DEFAULT_SHAKERS[0]);

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

  const selected: ProductVariant | undefined =
    variants.find((v) => v.id === variantId) || variants[0];

  const displayPrice =
    selected?.price ?? product.salePrice ?? product.basePrice;
  const compareAt =
    (selected as ProductVariant & { compareAtPrice?: string })
      ?.compareAtPrice ?? product.compareAtPrice;
  const hasDeal =
    compareAt != null && Number(compareAt) > Number(displayPrice);
  const stock = selected != null ? selected.stock : product.stock;
  const outOfStock = stock <= 0;

  return (
    <div className="space-y-6">
      {product.campaignName ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Kampanya · {product.campaignName}
        </p>
      ) : null}

      {product.badge ? (
        <span className="badge-discount inline-flex">{product.badge}</span>
      ) : null}

      {variants.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Paket / boy
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
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
                  {v.stock <= 0 ? " · Yok" : ""}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {aromas.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Aroma
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
            Karıştırıcı rengi
          </p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SHAKERS.map((s) => (
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
            Fiyat
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
          </div>
          {hasDeal ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-flash">
              <span className="badge-discount px-2! py-0.5! text-[10px]!">
                Fırsat
              </span>
              İndirimli fiyat
            </p>
          ) : null}
          <p className="mt-1 text-xs text-on-surface-variant">
            Stok {outOfStock ? "yok" : stock}
            {aroma ? ` · ${aroma}` : ""}
            {showShaker ? ` · ${shaker}` : ""}
          </p>
          {!outOfStock && stock > 0 && stock <= 8 ? (
            <p className="mt-1.5 text-xs font-semibold text-flash">
              Son {stock} adet — stok sınırlı
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
            label={outOfStock ? "Stokta yok" : "Sepete Ekle"}
            goToCart={false}
            className="btn-cta pressable w-full cursor-pointer py-4 text-base font-bold tracking-wide disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <FavoriteButton productId={product.id} size="lg" />
      </div>

      <ul className="grid grid-cols-1 gap-2 rounded-xl bg-surface-container-low px-3.5 py-3 text-xs text-on-surface-variant sm:grid-cols-3">
        <li className="flex items-center gap-1.5">
          <span className="font-bold text-primary" aria-hidden>
            ✓
          </span>
          14 gün cayma hakkı
        </li>
        <li className="flex items-center gap-1.5">
          <span className="font-bold text-primary" aria-hidden>
            ✓
          </span>
          PayTR güvenli ödeme
        </li>
        <li className="flex items-center gap-1.5">
          <span className="font-bold text-primary" aria-hidden>
            ✓
          </span>
          Orijinal ürün
        </li>
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
          WhatsApp ile danış — ortalama yanıt 1 saatten kısa
        </a>
      ) : null}
    </div>
  );
}
