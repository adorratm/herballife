import type { Product } from "@/lib/types";

export type BrewGuide = {
  method?: string;
  ratio?: string;
  notes?: string;
};

export const PRODUCT_KIND_KEYS = [
  "supplement",
  "beverage",
  "herbal_tea",
  "tea",
  "other",
] as const;

export type ProductKindLabels = Record<string, string>;

const ENGLISH_KIND_LABELS: ProductKindLabels = {
  supplement: "Supplement / Formula",
  beverage: "Beverage",
  herbal_tea: "Herbal tea",
  tea: "Tea",
  other: "Other",
};

const GOOGLE_CATEGORY_SUPPLEMENT =
  "Health & Beauty > Health Care > Fitness & Nutrition > Vitamins & Supplements";
const GOOGLE_CATEGORY_BEVERAGE =
  "Food, Beverages & Tobacco > Beverages";

export function productKindLabel(
  kind?: string | null,
  labels: ProductKindLabels = ENGLISH_KIND_LABELS,
): string | null {
  if (!kind) return null;
  return labels[kind] || labels.other || ENGLISH_KIND_LABELS.other;
}

export function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function googleProductCategory(kind?: string | null): string {
  switch (kind) {
    case "herbal_tea":
    case "tea":
    case "beverage":
      return GOOGLE_CATEGORY_BEVERAGE;
    case "supplement":
    default:
      return GOOGLE_CATEGORY_SUPPLEMENT;
  }
}

export function merchantProductType(
  product: Product,
  labels?: { productsPrefix?: string; defaultType?: string; kinds?: ProductKindLabels },
): string {
  const productsPrefix = labels?.productsPrefix ?? "Products";
  const defaultType = labels?.defaultType ?? `${productsPrefix} > Supplements`;
  const kindLabels = labels?.kinds ?? ENGLISH_KIND_LABELS;
  const category = product.category?.name?.trim();
  const kind = productKindLabel(product.kind, kindLabels);
  if (category && kind && category !== kind) {
    return `${category} > ${kind}`;
  }
  if (category) return category;
  if (kind) return `${productsPrefix} > ${kind}`;
  return defaultType;
}

export function productGtin(product: Product): string | null {
  const own = product.barcode?.trim();
  if (own) return own;
  const fromVariant = (product.variants || [])
    .map((v) => v.barcode?.trim())
    .find(Boolean);
  return fromVariant || null;
}

export function asBrewGuide(raw: unknown): BrewGuide | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as BrewGuide;
  const guide: BrewGuide = {
    method: row.method?.trim() || undefined,
    ratio: row.ratio?.trim() || undefined,
    notes: row.notes?.trim() || undefined,
  };
  if (!guide.method && !guide.ratio && !guide.notes) {
    return null;
  }
  return guide;
}
