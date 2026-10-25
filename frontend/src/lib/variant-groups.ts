import type { ProductVariant } from "@/lib/types";

const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  package: "Paket / boy",
  package_size: "Paket / boy",
  size: "Paket / boy",
  shake_flavor: "Shake tadı",
  flavor: "Lezzet seçeneği",
};

export type VariantGroup = {
  key: string;
  label: string;
  variants: ProductVariant[];
};

export function variantCategoryLabel(
  variant: ProductVariant,
  locale: "tr" | "en" = "tr",
): string {
  const tr = variant.translations?.tr?.categoryLabel?.trim();
  if (tr) return tr;
  const fromLocale = variant.translations?.[locale]?.categoryLabel?.trim();
  if (fromLocale) return fromLocale;
  const key = variant.categoryKey?.trim();
  if (key && DEFAULT_CATEGORY_LABELS[key]) return DEFAULT_CATEGORY_LABELS[key];
  if (key) return key.replace(/_/g, " ");
  return "Paket / boy";
}

export function groupProductVariants(
  variants: ProductVariant[],
): VariantGroup[] {
  const active = variants.filter((v) => v.isActive !== false);
  const map = new Map<string, ProductVariant[]>();
  for (const v of active) {
    const key = v.categoryKey?.trim() || "__default__";
    const list = map.get(key) ?? [];
    list.push(v);
    map.set(key, list);
  }
  const groups: VariantGroup[] = [];
  for (const [key, list] of map) {
    const sample = list[0];
    groups.push({
      key,
      label:
        key === "__default__"
          ? "Paket / boy"
          : variantCategoryLabel(sample),
      variants: list,
    });
  }
  return groups;
}

export function formatVariantDisplayLabel(
  variant: ProductVariant | null | undefined,
): string | null {
  if (!variant?.weightLabel?.trim()) return null;
  const label = variant.weightLabel.trim();
  const key = variant.categoryKey?.trim();
  if (!key) return label;
  return `${variantCategoryLabel(variant)} · ${label}`;
}
