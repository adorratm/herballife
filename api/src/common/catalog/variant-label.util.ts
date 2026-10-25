import type { ProductVariant } from '@entities/product-variant.entity';

const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  package: 'Paket / boy',
  package_size: 'Paket / boy',
  size: 'Paket / boy',
  shake_flavor: 'Shake tadı',
  flavor: 'Lezzet seçeneği',
};

type VariantLabelSource = Pick<
  ProductVariant,
  'categoryKey' | 'weightLabel' | 'translations'
>;

export function variantCategoryLabel(
  variant: VariantLabelSource,
  locale: 'tr' | 'en' = 'tr',
): string {
  const fromTr = variant.translations?.tr?.categoryLabel?.trim();
  if (fromTr) return fromTr;
  const fromLocale = variant.translations?.[locale]?.categoryLabel?.trim();
  if (fromLocale) return fromLocale;
  const key = variant.categoryKey?.trim();
  if (key && DEFAULT_CATEGORY_LABELS[key]) return DEFAULT_CATEGORY_LABELS[key];
  if (key) return key.replace(/_/g, ' ');
  return 'Paket / boy';
}

/** Sipariş satırı / e-posta için: "Shake tadı · Çikolata" */
export function formatOrderVariantLabel(
  variant: VariantLabelSource | null | undefined,
): string | null {
  if (!variant?.weightLabel?.trim()) return null;
  const label = variant.weightLabel.trim();
  const key = variant.categoryKey?.trim();
  if (!key) return label;
  const cat = variantCategoryLabel(variant);
  return `${cat} · ${label}`;
}
