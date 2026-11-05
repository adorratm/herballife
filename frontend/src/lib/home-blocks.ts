/**
 * Ana sayfa ürün blokları — panel: Site & içerik → Ana sayfa blokları
 * (site_settings.homeBlocks). Blokta ürün seçilmemişse otomatik kurala düşer.
 */

export type HomeBlockKey =
  | "giftedPackages"
  | "bestsellerSets"
  | "bestsellerProducts"
  | "sets"
  | "deals"
  | "personalCare";

export type HomeBlockLayout = "carousel" | "grid" | "horizontal";

export type HomeBlockConfig = {
  key: HomeBlockKey;
  enabled: boolean;
  /** Boşsa çeviri dosyasındaki başlık kullanılır (yalnız TR’de geçerli) */
  title?: string;
  /** Elle seçilen ürünler (sıra korunur). Boşsa otomatik seçim. */
  productIds: string[];
  /** Gösterilecek en fazla ürün */
  limit?: number;
};

export const HOME_BLOCK_DEFS: Record<
  HomeBlockKey,
  { layout: HomeBlockLayout; defaultLimit: number; maxLimit: number }
> = {
  giftedPackages: { layout: "carousel", defaultLimit: 12, maxLimit: 24 },
  bestsellerSets: { layout: "carousel", defaultLimit: 12, maxLimit: 24 },
  bestsellerProducts: { layout: "carousel", defaultLimit: 12, maxLimit: 24 },
  sets: { layout: "grid", defaultLimit: 15, maxLimit: 15 },
  deals: { layout: "horizontal", defaultLimit: 4, maxLimit: 8 },
  personalCare: { layout: "horizontal", defaultLimit: 4, maxLimit: 8 },
};

export const HOME_BLOCK_ORDER: HomeBlockKey[] = [
  "giftedPackages",
  "bestsellerSets",
  "bestsellerProducts",
  "sets",
  "deals",
  "personalCare",
];

function isKey(v: unknown): v is HomeBlockKey {
  return typeof v === "string" && v in HOME_BLOCK_DEFS;
}

/** Panelden gelen ham değeri doğrular; eksik blokları varsayılanla tamamlar. */
export function normalizeHomeBlocks(raw: unknown): HomeBlockConfig[] {
  const list = Array.isArray((raw as { blocks?: unknown })?.blocks)
    ? ((raw as { blocks: unknown[] }).blocks as Record<string, unknown>[])
    : [];
  const seen = new Set<HomeBlockKey>();
  const out: HomeBlockConfig[] = [];
  for (const item of list) {
    if (!item || !isKey(item.key) || seen.has(item.key)) continue;
    seen.add(item.key);
    const def = HOME_BLOCK_DEFS[item.key];
    const limitNum = Number(item.limit);
    out.push({
      key: item.key,
      enabled: item.enabled !== false,
      title: typeof item.title === "string" ? item.title.trim() : "",
      productIds: Array.isArray(item.productIds)
        ? (item.productIds as unknown[])
            .map((id) => String(id).trim())
            .filter(Boolean)
            .slice(0, 100)
        : [],
      limit:
        Number.isFinite(limitNum) && limitNum > 0
          ? Math.min(Math.round(limitNum), def.maxLimit)
          : def.defaultLimit,
    });
  }
  for (const key of HOME_BLOCK_ORDER) {
    if (seen.has(key)) continue;
    out.push({
      key,
      enabled: true,
      title: "",
      productIds: [],
      limit: HOME_BLOCK_DEFS[key].defaultLimit,
    });
  }
  return out;
}
