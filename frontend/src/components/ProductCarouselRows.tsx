"use client";

import { ProductCarousel } from "@/components/ProductCarousel";
import type { Product } from "@/lib/types";

const ROW_COUNT = 3;
const PER_VIEW = 5 as const;

/** Ürünleri sırayla 3 satıra böler (15 → 5+5+5). */
export function chunkProductsIntoRows(
  products: Product[],
  rowCount = ROW_COUNT,
): Product[][] {
  if (!products.length) return [];
  const perRow = Math.ceil(products.length / rowCount);
  const rows: Product[][] = [];
  for (let i = 0; i < rowCount; i++) {
    const slice = products.slice(i * perRow, (i + 1) * perRow);
    if (slice.length) rows.push(slice);
  }
  return rows;
}

type Props = {
  products: Product[];
  size?: "default" | "compact";
  className?: string;
};

/** 3 bağımsız yatay carousel satırı; masaüstünde satırda 5 kart. */
export function ProductCarouselRows({
  products,
  size = "default",
  className = "",
}: Props) {
  const rows = chunkProductsIntoRows(products);
  if (!rows.length) return null;

  return (
    <div className={`flex flex-col gap-3 sm:gap-4 ${className}`}>
      {rows.map((row, i) => (
        <ProductCarousel
          key={`carousel-row-${i}`}
          products={row}
          size={size}
          perView={PER_VIEW}
          intervalMs={5200 + i * 700}
        />
      ))}
    </div>
  );
}
