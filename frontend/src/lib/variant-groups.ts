import type { ProductVariant } from "@/lib/types";

const DEFAULT_CATEGORY_LABELS: Record<string, Record<string, string>> = {
  tr: {
    package: "Paket / boy",
    package_size: "Paket / boy",
    size: "Paket / boy",
    shake_flavor: "Shake tadı",
    flavor: "Lezzet seçeneği",
  },
  en: {
    package: "Pack / size",
    package_size: "Pack / size",
    size: "Size",
    shake_flavor: "Shake flavor",
    flavor: "Flavor",
  },
  de: {
    package: "Packung / Größe",
    package_size: "Packung / Größe",
    size: "Größe",
    shake_flavor: "Shake-Geschmack",
    flavor: "Geschmack",
  },
  fr: {
    package: "Pack / format",
    package_size: "Pack / format",
    size: "Format",
    shake_flavor: "Parfum shake",
    flavor: "Parfum",
  },
  es: {
    package: "Pack / tamaño",
    package_size: "Pack / tamaño",
    size: "Tamaño",
    shake_flavor: "Sabor del shake",
    flavor: "Sabor",
  },
};

export type VariantGroup = {
  key: string;
  label: string;
  variants: ProductVariant[];
};

function normalizeLocale(locale?: string | null): string {
  return String(locale || "tr")
    .trim()
    .toLowerCase()
    .split(/[-_]/)[0] || "tr";
}

export function variantCategoryLabel(
  variant: ProductVariant,
  localeRaw: string = "tr",
): string {
  const locale = normalizeLocale(localeRaw);
  const fromLocale =
    variant.translations?.[locale as "tr"]?.categoryLabel?.trim();
  if (fromLocale) return fromLocale;
  const fromTr = variant.translations?.tr?.categoryLabel?.trim();
  if (fromTr && locale === "tr") return fromTr;
  const key = variant.categoryKey?.trim();
  const defaults =
    DEFAULT_CATEGORY_LABELS[locale] || DEFAULT_CATEGORY_LABELS.en;
  if (key && defaults[key]) return defaults[key];
  if (fromTr) return fromTr;
  if (key) return key.replace(/_/g, " ");
  return defaults.package || DEFAULT_CATEGORY_LABELS.tr.package;
}

export function groupProductVariants(
  variants: ProductVariant[],
  locale: string = "tr",
): VariantGroup[] {
  const active = variants.filter((v) => v.isActive !== false);
  const map = new Map<string, ProductVariant[]>();
  for (const v of active) {
    const key = v.categoryKey?.trim() || "__default__";
    const list = map.get(key) ?? [];
    list.push(v);
    map.set(key, list);
  }
  const defaults =
    DEFAULT_CATEGORY_LABELS[normalizeLocale(locale)] ||
    DEFAULT_CATEGORY_LABELS.en;
  const groups: VariantGroup[] = [];
  for (const [key, list] of map) {
    const sample = list[0];
    groups.push({
      key,
      label:
        key === "__default__"
          ? defaults.package || DEFAULT_CATEGORY_LABELS.tr.package
          : variantCategoryLabel(sample, locale),
      variants: list,
    });
  }
  return groups;
}

export function formatVariantDisplayLabel(
  variant: ProductVariant | null | undefined,
  locale: string = "tr",
): string | null {
  if (!variant?.weightLabel?.trim()) return null;
  const label = variant.weightLabel.trim();
  const key = variant.categoryKey?.trim();
  if (!key) return label;
  return `${variantCategoryLabel(variant, locale)} · ${label}`;
}
