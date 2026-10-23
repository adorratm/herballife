import type { Category } from "@/lib/types";

export function categoryCatalogPath(slug: string) {
  return `/urunler/kategori/${encodeURIComponent(slug)}`;
}

/** Seed / vitrin kategorileri — API geçici düşse bile chip linkleri 404 olmasın */
const CATEGORY_FALLBACKS: Record<
  string,
  Pick<Category, "slug" | "name" | "description">
> = {
  "kilo-kontrolu": {
    slug: "kilo-kontrolu",
    name: "Aşağı - Yukarı Kilo Kontrolü",
    description: "Formül 1, Formül 2 ve kilo yönetimi ürünleri",
  },
  icecekler: {
    slug: "icecekler",
    name: "İçecekler",
    description: "Aloe, bitkisel çaylar ve aromalı içecek tozları",
  },
  "avantajli-setler": {
    slug: "avantajli-setler",
    name: "Setler",
    description: "Hediyeli paketler ve avantajlı setler",
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
    description: "Pratik protein bar ve atıştırmalıklar",
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
