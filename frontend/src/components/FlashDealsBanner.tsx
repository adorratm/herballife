import Link from "next/link";
import { ProductCarousel } from "@/components/ProductCarousel";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
  endsLabel?: string;
  badge?: string;
  title?: string;
  theme?: string | null;
};

const THEME_BAR: Record<string, string> = {
  default: "bg-flash",
  "singles-day": "bg-[#e11d48]",
  halloween: "bg-[#ea580c]",
  "black-friday": "bg-[#171717]",
  valentine: "bg-[#db2777]",
  "new-year": "bg-[#0f766e]",
  ramadan: "bg-[#047857]",
  kurban: "bg-[#b45309]",
};

/** Ana sayfa — flash / özel gün indirim şeridi + kaydırılabilir ürünler */
export function FlashDealsBanner({
  products,
  endsLabel = "Bugün bitiyor",
  badge = "Anlık indirim",
  title = "Seçili ürünlerde anlık fırsatlar",
  theme = "default",
}: Props) {
  if (!products.length) return null;
  const bar = THEME_BAR[theme || "default"] || THEME_BAR.default;

  return (
    <section className="page-shell pb-10">
      <div className="overflow-hidden rounded-2xl border border-flash/35 bg-white shadow-sm">
        <div
          className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-white md:px-6 ${bar}`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
              {badge}
            </span>
            <p className="text-sm font-bold md:text-base">{title}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white/90">{endsLabel}</span>
            <Link
              href="/urunler?sort=price&order=asc"
              className="cursor-pointer rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-on-surface transition-colors hover:bg-white/90"
            >
              Tüm fırsatlar →
            </Link>
          </div>
        </div>
        <div className="bg-flash-soft/70 p-4 md:p-5">
          <ProductCarousel products={products} size="compact" />
        </div>
      </div>
    </section>
  );
}
