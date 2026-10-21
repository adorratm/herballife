import Link from "next/link";
import { ProductCarousel } from "@/components/ProductCarousel";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
  endsLabel?: string;
};

/** Ana sayfa — flash indirim şeridi + kaydırılabilir ürünler */
export function FlashDealsBanner({
  products,
  endsLabel = "Bugün bitiyor",
}: Props) {
  if (!products.length) return null;

  return (
    <section className="page-shell pb-10">
      <div className="overflow-hidden border border-flash bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-flash px-5 py-3.5 text-white md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-white/25 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
              Flash İndirim
            </span>
            <p className="text-sm font-bold md:text-base">
              Seçili ürünlerde anlık fırsatlar
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white">{endsLabel}</span>
            <Link
              href="/urunler?sort=price&order=asc"
              className="cursor-pointer bg-white px-3.5 py-1.5 text-xs font-bold text-flash hover:bg-flash-soft"
            >
              Tüm fırsatlar →
            </Link>
          </div>
        </div>
        <div className="bg-flash-soft/60 p-4 md:p-5">
          <ProductCarousel products={products} size="compact" />
        </div>
      </div>
    </section>
  );
}
