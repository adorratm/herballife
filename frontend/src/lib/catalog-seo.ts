import type { Product } from "@/lib/types";

export type BrewGuide = {
  method?: string;
  ratio?: string;
  notes?: string;
};

export const PRODUCT_KIND_LABELS: Record<string, string> = {
  supplement: "Takviye / Formül",
  beverage: "İçecek",
  herbal_tea: "Bitki çayı",
  tea: "Çay",
  other: "Diğer",
};

const GOOGLE_CATEGORY_SUPPLEMENT =
  "Health & Beauty > Health Care > Fitness & Nutrition > Vitamins & Supplements";
const GOOGLE_CATEGORY_BEVERAGE =
  "Food, Beverages & Tobacco > Beverages";

export function productKindLabel(kind?: string | null): string | null {
  if (!kind) return null;
  return PRODUCT_KIND_LABELS[kind] || null;
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

export function merchantProductType(product: Product): string {
  const category = product.category?.name?.trim();
  const kind = productKindLabel(product.kind);
  if (category && kind && category !== kind) {
    return `${category} > ${kind}`;
  }
  if (category) return category;
  if (kind) return `Ürünler > ${kind}`;
  return "Ürünler > Takviye";
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
