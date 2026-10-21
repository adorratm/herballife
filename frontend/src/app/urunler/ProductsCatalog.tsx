"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { getCategories, getProductsPaged } from "@/lib/api";
import { categoryCatalogPath } from "@/lib/catalog-paths";
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
  const pathname = usePathname();
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

  const hasActiveFilters = Boolean(q || categorySlug || originCountry);

  useEffect(() => {
    void getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    void getProductsPaged({ limit: 50, sort: "name", order: "asc" }).then(
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSuggestions([]);
    void getProductsPaged({
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
          featured: true,
          sort: "createdAt",
          order: "desc",
          limit: 6,
        });
        let suggested = featured.items;
        if (!suggested.length) {
          const fallback = await getProductsPaged({
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
  }, [q, categorySlug, originCountry, sort, order, page, hasActiveFilters]);

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
      ? categoryCatalogPath(nextCategory)
      : "/urunler";
    const qs = sp.toString();
    startTransition(() => {
      router.push(qs ? `${base}?${qs}` : base);
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
    if (loading || pending) return "Yükleniyor…";
    return `${paged.total} ürün · Sayfa ${paged.page}/${paged.totalPages}`;
  }, [loading, pending, paged]);

  const activeCategoryName =
    categories.find((c) => c.slug === categorySlug)?.name || null;

  return (
    <div className="page-shell py-8 md:py-10">
      {hideHeading ? null : (
        <div className="mb-8">
          <h1 className="font-display text-3xl tracking-tight text-on-surface md:text-4xl">
            {activeCategoryName || "Ürünler"}
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {activeCategoryName
              ? `${activeCategoryName} kategorisindeki ürünler`
              : "Arama, filtre ve sıralama ile katalog"}
          </p>
        </div>
      )}

      <div className="mb-8 rounded-xl border border-outline-variant/30 bg-white p-4 shadow-sm md:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-on-surface-variant">
              Ara
            </span>
            <input
              className="catalog-filter-input"
              defaultValue={q}
              key={`q-${q}`}
              placeholder="Ürün adı, set…"
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
              Kategori
            </span>
            <select
              className="catalog-filter-input"
              value={categorySlug}
              onChange={(e) =>
                patchParams({ category: e.target.value || null })
              }
            >
              <option value="">Tümü</option>
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
                Menşei
              </span>
              <select
                className="catalog-filter-input"
                value={originCountry}
                onChange={(e) =>
                  patchParams({ origin: e.target.value || null })
                }
              >
                <option value="">Tümü</option>
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
              Sırala
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
              <option value="name:asc">İsim A→Z</option>
              <option value="name:desc">İsim Z→A</option>
              <option value="price:asc">Fiyat artan</option>
              <option value="price:desc">Fiyat azalan</option>
              <option value="createdAt:desc">En yeni</option>
              <option value="stock:desc">Stok</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 pt-3">
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
              Filtreleri temizle
            </button>
          ) : null}
        </div>
      </div>

      {!paged.items.length && !loading ? (
        <div className="space-y-10">
          <div className="rounded-xl border border-outline-variant/30 bg-white p-8 text-center md:p-10">
            <h2 className="font-display text-2xl text-on-surface">
              {hasActiveFilters
                ? "Aradığınız ürünü bulamadık"
                : "Katalogda ürün yok"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">
              {hasActiveFilters
                ? q
                  ? `"${q}" için sonuç yok. Filtreleri temizleyip tekrar deneyin.`
                  : "Seçili filtrelere uygun ürün yok."
                : "Şu an listelenecek ürün bulunmuyor."}
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
                Filtreleri temizle
              </button>
            ) : null}
          </div>

          {suggestions.length ? (
            <section>
              <h3 className="mb-4 font-display text-xl text-on-surface">
                Bunları da inceleyebilirsiniz
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
            Önceki
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
            Sonraki
          </button>
        </div>
      ) : null}
    </div>
  );
}
