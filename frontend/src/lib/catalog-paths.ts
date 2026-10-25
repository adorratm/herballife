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
    name: "Kilo Kontrolü",
    description: "Formül 1, Formül 2 ve kilo kontrolü ürünleri",
  },
  icecekler: {
    slug: "icecekler",
    name: "İçecekler",
    description: "Aloe, bitki çayları ve aromalı içecekler",
  },
  "avantajli-setler": {
    slug: "avantajli-setler",
    name: "Avantajlı Setler",
    description: "Hediye paketleri ve avantajlı setler",
  },
  "takviye-edici": {
    slug: "takviye-edici",
    name: "Takviye Edici",
    description: "Vitamin, mineral ve destek ürünleri",
  },
  "sporcu-urunleri": {
    slug: "sporcu-urunleri",
    name: "Sporcu Ürünleri",
    description: "Protein ve performans ürünleri",
  },
  atistirmalik: {
    slug: "atistirmalik",
    name: "Atıştırmalık",
    description: "Protein bar ve pratik atıştırmalıklar",
  },
  "kisisel-bakim": {
    slug: "kisisel-bakim",
    name: "Kişisel Bakım",
    description: "SKIN ve Herbal Aloe bakım serisi",
  },
  "tanitim-urunleri": {
    slug: "tanitim-urunleri",
    name: "Tanıtım Ürünleri",
    description: "Shaker ve tanıtım ürünleri",
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
