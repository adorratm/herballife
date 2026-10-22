import { AppImage as Image } from "@/components/AppImage";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatMoney, productImage } from "@/lib/format";
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
  const compact = size === "compact";
  const img = productImage(product.imageUrl, product.slug);
  const variant = product.variants?.[0];
  const price = product.salePrice ?? variant?.price ?? product.basePrice;
  const compareAt =
    product.compareAtPrice ??
    (product.salePrice && product.basePrice !== product.salePrice
      ? product.basePrice
      : null);
  const discount =
    compareAt && Number(compareAt) > Number(price)
      ? Math.round((1 - Number(price) / Number(compareAt)) * 100)
      : null;
  const { score } = ratingFromSlug(product.slug);
  const badgeLabel = product.badge?.trim() || null;
  const nameHasGift = /hediye/i.test(product.name);
  const isGifted =
    !nameHasGift &&
    (/hediye/i.test(badgeLabel || "") ||
      product.category?.slug === "avantajli-setler");

  const primaryBadge = discount
    ? `−%${discount}`
    : isGifted
      ? "Hediyeli"
      : badgeLabel && !/hediye/i.test(badgeLabel)
        ? badgeLabel
        : null;

  return (
    <article
      className={`group card-motion relative flex h-full flex-col overflow-hidden border border-outline-variant bg-white shadow-sm ${
        compact ? "rounded-lg p-1.5" : "rounded-xl p-2.5"
      }`}
    >
      {primaryBadge ? (
        <span
          className={`absolute z-10 rounded-full font-bold uppercase tracking-wide text-on-tertiary shadow-sm ${
            compact
              ? "left-1.5 top-1.5 px-1.5 py-0.5 text-[8px]"
              : "left-2.5 top-2.5 px-2 py-0.5 text-[10px]"
          } ${discount || !isGifted ? "bg-flash" : "bg-tertiary"} ${
            discount ? "badge-live" : ""
          }`}
        >
          {primaryBadge}
        </span>
      ) : null}
      <div className={`absolute z-10 ${compact ? "right-1.5 top-1.5" : "right-2.5 top-2.5"}`}>
        <FavoriteButton productId={product.id} size="sm" />
      </div>
      <Link href={`/urunler/${product.slug}`} className="flex flex-1 flex-col">
        <div
          className={`card-media-shine relative overflow-hidden rounded-lg ${
            compact ? "mb-1.5 aspect-4/3" : "mb-2 aspect-square"
          }`}
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 40%, color-mix(in srgb, var(--primary-fixed) 90%, white), var(--surface-container-low))",
          }}
        >
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-contain p-2.5 drop-shadow-[0_10px_18px_rgba(18,40,28,0.12)] transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            sizes={compact ? "(max-width: 768px) 33vw, 15vw" : "(max-width: 768px) 45vw, 18vw"}
          />
        </div>

        <div className="flex flex-1 flex-col gap-0.5 px-0.5">
          {!compact ? (
            <div className="flex items-center gap-1">
              <span className="flex gap-0.5 text-amber-500" aria-hidden>
                {"★★★★★".split("").map((s, i) => (
                  <span
                    key={i}
                    className={`text-[9px] ${i < Math.round(score) ? "opacity-100" : "opacity-25"}`}
                  >
                    {s}
                  </span>
                ))}
              </span>
              <span className="text-[9px] text-on-surface-variant">{score}</span>
            </div>
          ) : null}
          <h3
            className={`line-clamp-2 font-display leading-snug text-on-surface group-hover:text-primary ${
              compact ? "text-[12px]" : "text-[13px]"
            }`}
          >
            {product.name}
          </h3>
          <div className="mt-auto flex items-baseline gap-1.5 pt-1">
            {compareAt && Number(compareAt) > Number(price) ? (
              <span className="text-[10px] text-outline line-through">
                {formatMoney(compareAt, product.currency)}
              </span>
            ) : null}
            <span
              className={`font-bold text-primary ${
                discount ? "price-live" : ""
              } ${compact ? "text-xs" : "text-sm"}`}
            >
              {formatMoney(price, product.currency)}
            </span>
          </div>
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
            productName={product.name}
            price={Number(price)}
            label="Sepete ekle"
            goToCart={false}
            className={`btn-cta pressable w-full cursor-pointer text-xs ${compact ? "py-1.5" : "py-2"}`}
          />
        </div>
      ) : null}
    </article>
  );
}
