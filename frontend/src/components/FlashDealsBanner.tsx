import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { AppImage as Image } from "@/components/AppImage";
import { ProductCarousel } from "@/components/ProductCarousel";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
  endsLabel?: string;
  badge?: string;
  title?: string;
  theme?: string | null;
  imageUrl?: string | null;
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

export async function FlashDealsBanner({
  products,
  endsLabel,
  badge,
  title,
  theme = "default",
  imageUrl,
}: Props) {
  const t = await getTranslations("flashDeals");
  const resolvedEnds = endsLabel ?? t("endsToday");
  const resolvedBadge = badge ?? t("badge");
  const resolvedTitle = title ?? t("title");

  if (!products.length) return null;
  const bar = THEME_BAR[theme || "default"] || THEME_BAR.default;
  const heroImage = imageUrl?.trim() || null;

  return (
    <section className="page-shell pb-10">
      <div className="overflow-hidden rounded-2xl border border-flash/35 bg-white shadow-sm">
        <div className={`flex flex-col ${heroImage ? "lg:flex-row" : ""}`}>
          {heroImage ? (
            <div className="relative aspect-video min-h-40 w-full shrink-0 lg:aspect-auto lg:min-h-0 lg:w-72 xl:w-80">
              <Image
                src={heroImage}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 320px"
              />
              <div className={`absolute inset-0 opacity-40 mix-blend-multiply ${bar}`} />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div
              className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-white md:px-6 ${bar}`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
                  {resolvedBadge}
                </span>
                <p className="text-sm font-bold md:text-base">{resolvedTitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-white/90">
                  {resolvedEnds}
                </span>
                <Link
                  href="/urunler?sort=price&order=asc"
                  className="cursor-pointer rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-on-surface transition-colors hover:bg-white/90"
                >
                  {t("allDeals")}
                </Link>
              </div>
            </div>
            <div className="bg-flash-soft/70 p-4 md:p-5">
              <ProductCarousel products={products} size="compact" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
