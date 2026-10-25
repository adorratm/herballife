import type { Category } from "@/lib/types";

export function categoryCatalogPath(slug: string) {
  return `/urunler/kategori/${encodeURIComponent(slug)}`;
}

/** Seed / vitrin kategorileri — API geçici düşse bile chip linkleri 404 olmasın (English-neutral) */
const CATEGORY_FALLBACKS: Record<
  string,
  Pick<Category, "slug" | "name" | "description">
> = {
  "kilo-kontrolu": {
    slug: "kilo-kontrolu",
    name: "Weight management",
    description: "Formula 1, Formula 2, and weight management products",
  },
  icecekler: {
    slug: "icecekler",
    name: "Drinks",
    description: "Aloe, herbal teas, and flavored drink mixes",
  },
  "avantajli-setler": {
    slug: "avantajli-setler",
    name: "Bundles",
    description: "Gift packages and value bundles",
  },
  "takviye-edici": {
    slug: "takviye-edici",
    name: "Supplements",
    description: "Vitamins, minerals, and support products",
  },
  "sporcu-urunleri": {
    slug: "sporcu-urunleri",
    name: "Sports nutrition",
    description: "Protein and performance products",
  },
  atistirmalik: {
    slug: "atistirmalik",
    name: "Snacks",
    description: "Protein bars and practical snacks",
  },
  "kisisel-bakim": {
    slug: "kisisel-bakim",
    name: "Personal care",
    description: "SKIN and Herbal Aloe care series",
  },
  "tanitim-urunleri": {
    slug: "tanitim-urunleri",
    name: "Sample products",
    description: "Shakers and introductory products",
  },
};

export function categoryFallback(slug: string): Category | null {
  const row = CATEGORY_FALLBACKS[slug];
  if (!row) return null;
  return {
    id: `fallback:${row.slug}`,
    slug: row.slug,
    name: row.name,
    description: row.description,
  };
}
