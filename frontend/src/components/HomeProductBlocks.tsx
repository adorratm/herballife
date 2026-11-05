import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { categoryHref } from "@/i18n/hrefs";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardHorizontal } from "@/components/ProductCardHorizontal";
import { ProductCarousel } from "@/components/ProductCarousel";
import { Reveal } from "@/components/Reveal";
import {
  HOME_BLOCK_DEFS,
  type HomeBlockKey,
} from "@/lib/home-blocks";
import type { Product } from "@/lib/types";

export type ResolvedHomeBlock = {
  key: HomeBlockKey;
  title: string;
  products: Product[];
};

const VIEW_ALL: Record<HomeBlockKey, { category?: string; href?: "/urunler" }> = {
  giftedPackages: { category: "avantajli-setler" },
  bestsellerSets: { category: "avantajli-setler" },
  bestsellerProducts: { href: "/urunler" },
  sets: { category: "avantajli-setler" },
  deals: { href: "/urunler" },
  personalCare: { category: "kisisel-bakim" },
};

export async function HomeProductBlocks({
  blocks,
}: {
  blocks: ResolvedHomeBlock[];
}) {
  const t = await getTranslations("home.blocks");
  const visible = blocks.filter((b) => b.products.length > 0);
  if (!visible.length) return null;

  return (
    <div className="bg-white pt-8 pb-4 md:pt-12 md:pb-6">
      {visible.map((block, i) => {
        const layout = HOME_BLOCK_DEFS[block.key].layout;
        const va = VIEW_ALL[block.key];
        const href = va.category ? categoryHref(va.category) : "/urunler";
        return (
          <section
            key={block.key}
            id={`blok-${block.key}`}
            aria-labelledby={`blok-${block.key}-title`}
            className={i === 0 ? "pb-8 md:pb-10" : "py-8 md:py-10"}
          >
            <div className="page-shell">
              <Reveal>
                <div className="home-block-head">
                  <h2 id={`blok-${block.key}-title`} className="home-block-title">
                    {block.title}
                  </h2>
                  <Link
                    href={href}
                    className="link-arrow shrink-0 pb-1 text-xs sm:text-sm"
                  >
                    {t("viewAll")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </Reveal>

              <div className="mt-5 md:mt-6">
                {layout === "carousel" ? (
                  <ProductCarousel products={block.products} />
                ) : layout === "grid" ? (
                  <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5 lg:gap-4">
                    {block.products.map((p, idx) => (
                      <li
                        key={p.id}
                        className={`min-w-0 ${
                          /* Mobil/tablette 2 satır, masaüstünde 3 satır (5×3) */
                          idx >= 6 ? "hidden lg:block" : ""
                        }`}
                      >
                        <ProductCard product={p} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
                    {block.products.map((p) => (
                      <li key={p.id} className="min-w-0">
                        <ProductCardHorizontal product={p} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
