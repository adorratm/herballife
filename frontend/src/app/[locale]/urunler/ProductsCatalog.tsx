"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { asRouterHref, usePathname, useRouter, toLinkHref } from "@/i18n/routing";
import { categoryHref } from "@/i18n/hrefs";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { getCategories, getProductsPaged } from "@/lib/api";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import type { Category, Paginated, Product } from "@/lib/types";

type SortKey = "name" | "price" | "createdAt" | "stock";

const PAGE_LIMIT = 25;

function categorySlugFromPath(pathname: string) {
  const match = pathname.match(/^\/urunler\/kategori\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : "";
}

export default function ProductsCatalog({
  hideHeading = false,
}: {
  hideHeading?: boolean;
}) {
  const router = useRouter();
  const intlLocale = useLocale();
  const t = useTranslations("catalog");
  const tCommon = useTranslations("common");
  const tForms = useTranslations("forms");
  const pathname = usePathname();
  const { currency: activeCurrency } = useActiveCurrency();
  const catalogLocale = useMemo(
    () => ({
      locale: intlLocale,
      currency: activeCurrency,
    }),
    [intlLocale, activeCurrency],
  );
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = searchParams.get("q") || "";
  const categorySlug =
    categorySlugFromPath(pathname) || searchParams.get("category") || "";
  const originCountry = searchParams.get("origin") || "";
  const sort = (searchParams.get("sort") as SortKey) || "name";
  const order = (searchParams.get("order") as "asc" | "desc") || "asc";
  const page = Math.max(1, Number(searchParams.get("page") || 1));

  const [categories, setCategories] = useState<Category[]>([]);
  const [paged, setPaged] = useState<Paginated<Product>>({
    items: [],
    total: 0,
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
  });
  const [origins, setOrigins] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters = Boolean(q || categorySlug || originCountry);

  useEffect(() => {
    void getCategories(catalogLocale).then(setCategories);
  }, [catalogLocale]);

  useEffect(() => {
    void getProductsPaged({
      ...catalogLocale,
      limit: 50,
      sort: "name",
      order: "asc",
    }).then(
      (data) => {
        setOrigins(
          Array.from(
            new Set(
              data.items
                .map((p) => p.originCountry)
                .filter(Boolean) as string[],
            ),
          ).sort(),
        );
      },
    );
  }, [catalogLocale]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSuggestions([]);
    void getProductsPaged({
      ...catalogLocale,
      q: q || undefined,
      categorySlug: categorySlug || undefined,
      originCountry: originCountry || undefined,
      sort,
      order,
      page,
      limit: PAGE_LIMIT,
    }).then(async (data) => {
      if (cancelled) return;
      setPaged(data);

      if (!data.items.length && hasActiveFilters) {
        const featured = await getProductsPaged({
          ...catalogLocale,
          featured: true,
          sort: "createdAt",
          order: "desc",
          limit: 6,
        });
        let suggested = featured.items;
        if (!suggested.length) {
          const fallback = await getProductsPaged({
            ...catalogLocale,
            sort: "createdAt",
            order: "desc",
            limit: 6,
          });
          suggested = fallback.items;
        }
        if (!cancelled) setSuggestions(suggested.slice(0, 6));
      }

      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [
    q,
    categorySlug,
    originCountry,
    sort,
    order,
    page,
    hasActiveFilters,
    catalogLocale,
  ]);

  function navigateCatalog(
    nextCategory: string | null,
    next: Record<string, string | null>,
  ) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("category");
    for (const [key, value] of Object.entries(next)) {
      if (!value) sp.delete(key);
      else sp.set(key, value);
    }
    if (!("page" in next)) sp.delete("page");
    const base = nextCategory
      ? categoryHref(nextCategory)
      : ("/urunler" as const);
    const qs = sp.toString();
    const href = qs
      ? asRouterHref(
          nextCategory
            ? `/urunler/kategori/${encodeURIComponent(nextCategory)}?${qs}`
            : `/urunler?${qs}`,
        )
      : base;
    startTransition(() => {
      router.push(href as Parameters<typeof router.push>[0]);
    });
  }

  function patchParams(next: Record<string, string | null>) {
    if ("category" in next) {
      navigateCatalog(next.category, {
        ...next,
        category: null,
      });
      return;
    }
    navigateCatalog(categorySlug || null, next);
  }

  const summary = useMemo(() => {
    if (loading || pending) return t("summaryLoading");
    return t("summary", {
      total: paged.total,
      page: paged.page,
      totalPages: paged.totalPages,
    });
  }, [loading, pending, paged, t]);

  const activeCategoryName =
    categories.find((c) => c.slug === categorySlug)?.name || null;

  return (
    <div className="page-shell py-8 md:py-10">
      {hideHeading ? null : (
        <div className="mb-8">
          <h1 className="font-display text-3xl tracking-tight text-on-surface md:text-4xl">
            {activeCategoryName || t("title")}
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {activeCategoryName
              ? t("categorySubtitle", { name: activeCategoryName })
              : t("defaultSubtitle")}
          </p>
        </div>
      )}

      <div className="mb-8 rounded-xl border border-outline-variant/30 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-3 flex items-center justify-between gap-3 md:hidden">
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm font-semibold text-on-surface"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            {t("filterToggle")}
            <span className="text-xs text-on-surface-variant" aria-hidden>
              {filtersOpen ? "▲" : "▼"}
            </span>
          </button>
          {hasActiveFilters ? (
            <button
              type="button"
              className="shrink-0 text-sm font-medium text-primary hover:underline"
              onClick={() =>
                patchParams({
                  q: null,
                  category: null,
                  origin: null,
                  page: null,
                })
              }
            >
              {t("clear")}
            </button>
          ) : null}
        </div>

        <div
          className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${filtersOpen ? "grid" : "hidden md:grid"}`}
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-on-surface-variant">
              {t("searchLabel")}
            </span>
            <input
              className="catalog-filter-input"
              defaultValue={q}
              key={`q-${q}`}
              placeholder={tForms("searchProducts")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  patchParams({
                    q: (e.target as HTMLInputElement).value.trim() || null,
                  });
                }
              }}
              onBlur={(e) =>
                patchParams({ q: e.target.value.trim() || null })
              }
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-on-surface-variant">
              {t("categoryLabel")}
            </span>
            <select
              className="catalog-filter-input"
              value={categorySlug}
              onChange={(e) =>
                patchParams({ category: e.target.value || null })
              }
            >
              <option value="">{tCommon("all")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {origins.length > 0 ? (
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                {t("originLabel")}
              </span>
              <select
                className="catalog-filter-input"
                value={originCountry}
                onChange={(e) =>
                  patchParams({ origin: e.target.value || null })
                }
              >
                <option value="">{tCommon("all")}</option>
                {origins.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-on-surface-variant">
              {t("sortLabel")}
            </span>
            <select
              className="catalog-filter-input"
              value={`${sort}:${order}`}
              onChange={(e) => {
                const [s, o] = e.target.value.split(":") as [
                  SortKey,
                  "asc" | "desc",
                ];
                patchParams({ sort: s, order: o });
              }}
            >
              <option value="name:asc">{t("sortNameAsc")}</option>
              <option value="name:desc">{t("sortNameDesc")}</option>
              <option value="price:asc">{t("sortPriceAsc")}</option>
              <option value="price:desc">{t("sortPriceDesc")}</option>
              <option value="createdAt:desc">{t("sortNewest")}</option>
              <option value="stock:desc">{t("sortStock")}</option>
            </select>
          </label>
        </div>

        <div
          className={`mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 pt-3 ${filtersOpen ? "flex" : "hidden md:flex"}`}
        >
          <p className="text-sm text-on-surface-variant">{summary}</p>
          {hasActiveFilters ? (
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
              onClick={() =>
                patchParams({
                  q: null,
                  category: null,
                  origin: null,
                  page: null,
                })
              }
            >
              {t("clearFilters")}
            </button>
          ) : null}
        </div>
      </div>

      {!paged.items.length && !loading ? (
        <div className="space-y-10">
          <div className="rounded-xl border border-outline-variant/30 bg-white p-8 text-center md:p-10">
            <h2 className="font-display text-2xl text-on-surface">
              {hasActiveFilters
                ? t("emptyFilteredTitle")
                : t("emptyCatalogTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">
              {hasActiveFilters
                ? q
                  ? t("emptyQuery", { q })
                  : t("emptyFilters")
                : t("emptyDefault")}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary"
                onClick={() =>
                  patchParams({
                    q: null,
                    category: null,
                    origin: null,
                    page: null,
                  })
                }
              >
                {t("clearFilters")}
              </button>
            ) : null}
          </div>

          {suggestions.length ? (
            <section>
              <h3 className="mb-4 font-display text-xl text-on-surface">
                {t("suggestionsTitle")}
              </h3>
              <div className="lift-safe grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
                {suggestions.map((product, i) => (
                  <Reveal key={product.id} delay={Math.min(i, 5) * 40}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <div className="lift-safe grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
          {paged.items.map((product, i) => (
            <Reveal key={product.id} delay={Math.min(i, 5) * 40}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}

      {paged.totalPages > 1 ? (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            className="rounded-md border border-outline-variant/40 px-4 py-2 text-sm font-medium disabled:opacity-30"
            onClick={() => patchParams({ page: String(page - 1) })}
          >
            {t("previous")}
          </button>
          <span className="px-3 text-sm text-on-surface-variant">
            {page} / {paged.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= paged.totalPages}
            className="rounded-md border border-outline-variant/40 px-4 py-2 text-sm font-medium disabled:opacity-30"
            onClick={() => patchParams({ page: String(page + 1) })}
          >
            {t("next")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
