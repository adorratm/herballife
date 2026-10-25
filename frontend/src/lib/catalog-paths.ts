import type { Category } from "@/lib/types";

export function categoryCatalogPath(slug: string) {
  return `/urunler/kategori/${encodeURIComponent(slug)}`;
}

/** Seed / vitrin kategorileri — API düşse bile chip linkleri 404 olmasın (EN nötr; UI home.categoryHub ile çevirir) */
const CATEGORY_FALLBACKS: Record<
  string,
  Pick<Category, "slug" | "name" | "description">
> = {
  "kilo-kontrolu": {
    slug: "kilo-kontrolu",
    name: "Weight Management",
    description: "Formula 1, Formula 2 and weight management products",
  },
  icecekler: {
    slug: "icecekler",
    name: "Beverages",
    description: "Aloe, herbal teas and flavored drinks",
  },
  "avantajli-setler": {
    slug: "avantajli-setler",
    name: "Bundles",
    description: "Gift packs and value sets",
  },
  "takviye-edici": {
    slug: "takviye-edici",
    name: "Supplements",
    description: "Vitamins, minerals and support products",
  },
  "sporcu-urunleri": {
    slug: "sporcu-urunleri",
    name: "Sports Nutrition",
    description: "Protein and performance products",
  },
  atistirmalik: {
    slug: "atistirmalik",
    name: "Snacks",
    description: "Protein bars and practical snacks",
  },
  "kisisel-bakim": {
    slug: "kisisel-bakim",
    name: "Personal Care",
    description: "SKIN and Herbal Aloe care range",
  },
  "tanitim-urunleri": {
    slug: "tanitim-urunleri",
    name: "Promo Items",
    description: "Shakers and promotional items",
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
