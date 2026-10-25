import type { Product } from "@/lib/types";

export type BadgeTone = "sale" | "new" | "bestseller" | "gift" | "custom";

export type ProductBadgeLabelKey = "new" | "bestseller" | "gift";

export type ProductBadgeChip = {
  label: string;
  tone: BadgeTone;
  /** Built-in badge copy — resolved in UI via productBadges.* */
  labelKey?: ProductBadgeLabelKey;
};

const NEW_DAYS = 45;
const MAX_BADGES = 2;

export function productDiscountPercent(
  price: string | number,
  compareAt: string | number | null | undefined,
): number | null {
  if (compareAt == null) return null;
  const p = Number(price);
  const c = Number(compareAt);
  if (!Number.isFinite(p) || !Number.isFinite(c) || c <= p) return null;
  return Math.round((1 - p / c) * 100);
}

export function isProductNew(product: Product): boolean {
  if (!product.createdAt) return false;
  const created = new Date(product.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const ageMs = Date.now() - created;
  return ageMs >= 0 && ageMs < NEW_DAYS * 24 * 60 * 60 * 1000;
}

export function resolveProductCompareAt(
  product: Product,
  price: string | number,
): string | number | null {
  if (product.compareAtPrice != null && product.compareAtPrice !== "") {
    return product.compareAtPrice;
  }
  const base = product.basePrice;
  const sale = product.salePrice;
  if (
    sale != null &&
    base != null &&
    Number(base) > Number(sale)
  ) {
    return base;
  }
  if (base != null && Number(base) > Number(price)) {
    return base;
  }
  return null;
}

export function computeProductBadges(
  product: Product,
  opts?: { price?: string | number; compareAt?: string | number | null },
): ProductBadgeChip[] {
  const variant = product.variants?.[0];
  const price =
    opts?.price ??
    product.salePrice ??
    variant?.price ??
    product.basePrice;
  const compareAt =
    opts?.compareAt !== undefined
      ? opts.compareAt
      : resolveProductCompareAt(product, price);

  const discount = productDiscountPercent(price, compareAt);
  const prioritized: ProductBadgeChip[] = [];

  if (discount != null && discount > 0) {
    prioritized.push({ label: `−%${discount}`, tone: "sale" });
  }

  if (isProductNew(product)) {
    prioritized.push({ label: "", tone: "new", labelKey: "new" });
  }

  if (product.isFeatured) {
    prioritized.push({ label: "", tone: "bestseller", labelKey: "bestseller" });
  }

  const badgeLabel = product.badge?.trim();
  const nameHasGift = /hediye/i.test(product.name);
  const isGifted =
    !nameHasGift &&
    (/hediye/i.test(badgeLabel || "") ||
      product.category?.slug === "avantajli-setler");

  if (isGifted) {
    prioritized.push({ label: "", tone: "gift", labelKey: "gift" });
  } else if (badgeLabel) {
    const lower = badgeLabel.toLocaleLowerCase("tr");
    if (
      !/indirim|fırsat|sale/i.test(badgeLabel) &&
      !(discount && /%/.test(badgeLabel)) &&
      !prioritized.some((c) => c.label === badgeLabel)
    ) {
      prioritized.push({
        label: badgeLabel,
        tone: lower.includes("yeni") ? "new" : "custom",
      });
    }
  }

  const seen = new Set<string>();
  const unique = prioritized.filter((c) => {
    if (seen.has(c.label)) return false;
    seen.add(c.label);
    return true;
  });

  return unique.slice(0, MAX_BADGES);
}

export function badgeHasSale(badges: ProductBadgeChip[]): boolean {
  return badges.some((b) => b.tone === "sale");
}

export function badgeToneClass(tone: BadgeTone): string {
  switch (tone) {
    case "sale":
      return "product-badge-chip product-badge-chip--sale badge-live";
    case "new":
      return "product-badge-chip product-badge-chip--new";
    case "bestseller":
      return "product-badge-chip product-badge-chip--bestseller";
    case "gift":
      return "product-badge-chip product-badge-chip--gift";
    default:
      return "product-badge-chip product-badge-chip--custom";
  }
}
