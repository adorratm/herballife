import type { ProductVariant } from '@entities/product-variant.entity';

const DEFAULT_CATEGORY_LABELS: Record<string, Record<string, string>> = {
  tr: {
    package: 'Paket / boy',
    package_size: 'Paket / boy',
    size: 'Paket / boy',
    shake_flavor: 'Shake tadı',
    flavor: 'Lezzet seçeneği',
  },
  en: {
    package: 'Pack / size',
    package_size: 'Pack / size',
    size: 'Size',
    shake_flavor: 'Shake flavor',
    flavor: 'Flavor',
  },
  de: {
    package: 'Packung / Größe',
    package_size: 'Packung / Größe',
    size: 'Größe',
    shake_flavor: 'Shake-Geschmack',
    flavor: 'Geschmack',
  },
  fr: {
    package: 'Pack / format',
    package_size: 'Pack / format',
    size: 'Format',
    shake_flavor: 'Parfum shake',
    flavor: 'Parfum',
  },
  es: {
    package: 'Pack / tamaño',
    package_size: 'Pack / tamaño',
    size: 'Tamaño',
    shake_flavor: 'Sabor del shake',
    flavor: 'Sabor',
  },
};

type VariantLabelSource = Pick<
  ProductVariant,
  'categoryKey' | 'weightLabel' | 'translations'
>;

function normalizeLocale(locale?: string | null): string {
  return String(locale || 'tr')
    .trim()
    .toLowerCase()
    .split(/[-_]/)[0] || 'tr';
}

export function variantCategoryLabel(
  variant: VariantLabelSource,
  localeRaw: string = 'tr',
): string {
  const locale = normalizeLocale(localeRaw);
  const fromLocale = variant.translations?.[locale as 'tr']?.categoryLabel?.trim();
  if (fromLocale) return fromLocale;
  const fromTr = variant.translations?.tr?.categoryLabel?.trim();
  if (fromTr && locale === 'tr') return fromTr;
  // Diğer dillerde TR kategori etiketi yerine varsayılan çeviri tercih et
  const key = variant.categoryKey?.trim();
  const defaults =
    DEFAULT_CATEGORY_LABELS[locale] || DEFAULT_CATEGORY_LABELS.en;
  if (key && defaults[key]) return defaults[key];
  if (fromTr) return fromTr;
  if (key) return key.replace(/_/g, ' ');
  return defaults.package || DEFAULT_CATEGORY_LABELS.tr.package;
}

/** Sipariş satırı / e-posta için: "Shake tadı · Çikolata" */
export function formatOrderVariantLabel(
  variant: VariantLabelSource | null | undefined,
  locale: string = 'tr',
): string | null {
  if (!variant?.weightLabel?.trim()) return null;
  const loc = normalizeLocale(locale);
  const localizedName =
    loc !== 'tr'
      ? variant.translations?.[loc as 'en']?.name?.trim()
      : undefined;
  const label = localizedName || variant.weightLabel.trim();
  const key = variant.categoryKey?.trim();
  if (!key) return label;
  const cat = variantCategoryLabel(variant, loc);
  return `${cat} · ${label}`;
}
