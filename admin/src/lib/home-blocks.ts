import { api } from '@/lib/api';

/** Vitrin: frontend/src/lib/home-blocks.ts ile aynı anahtarlar */
export type HomeBlockKey =
  | 'giftedPackages'
  | 'bestsellerSets'
  | 'bestsellerProducts'
  | 'sets'
  | 'deals'
  | 'personalCare';

export type HomeBlockConfig = {
  key: HomeBlockKey;
  enabled: boolean;
  title: string;
  productIds: string[];
  limit: number;
};

export const HOME_BLOCK_META: Record<
  HomeBlockKey,
  {
    label: string;
    layout: string;
    defaultLimit: number;
    maxLimit: number;
    autoRule: string;
  }
> = {
  giftedPackages: {
    label: 'En Çok Tercih Edilen Hediyeli Paketlerimiz',
    layout: 'Kaydırmalı (slider)',
    defaultLimit: 12,
    maxLimit: 24,
    autoRule: 'Avantajlı Setler kategorisinde adında “hediye” geçen ürünler',
  },
  bestsellerSets: {
    label: 'En Çok Satan Setler',
    layout: 'Kaydırmalı (slider)',
    defaultLimit: 12,
    maxLimit: 24,
    autoRule: 'Avantajlı Setler kategorisinde hediyesiz setler',
  },
  bestsellerProducts: {
    label: 'En Çok Satan Ürünler',
    layout: 'Kaydırmalı (slider)',
    defaultLimit: 12,
    maxLimit: 24,
    autoRule: '“Öne çıkan” işaretli, set olmayan ürünler',
  },
  sets: {
    label: 'Setler',
    layout: 'Izgara — masaüstünde 5×3, mobilde 2×3',
    defaultLimit: 15,
    maxLimit: 15,
    autoRule: 'Avantajlı Setler kategorisindeki ürünler',
  },
  deals: {
    label: 'Fırsat Ürünleri',
    layout: 'Yatay kart — 4’lü sıra',
    defaultLimit: 4,
    maxLimit: 8,
    autoRule: 'İndirim oranı en yüksek ürünler',
  },
  personalCare: {
    label: 'Kişisel Bakım Ürünleri',
    layout: 'Yatay kart — 4’lü sıra',
    defaultLimit: 4,
    maxLimit: 8,
    autoRule: 'Kişisel Bakım kategorisindeki ürünler',
  },
};

export const HOME_BLOCK_ORDER = Object.keys(HOME_BLOCK_META) as HomeBlockKey[];

export const HOME_BLOCKS_SETTING_KEY = 'homeBlocks';

type SettingRow = { key: string; value: Record<string, unknown> };

export function normalizeHomeBlocks(raw: unknown): HomeBlockConfig[] {
  const list = Array.isArray((raw as { blocks?: unknown })?.blocks)
    ? ((raw as { blocks: Record<string, unknown>[] }).blocks)
    : [];
  const seen = new Set<HomeBlockKey>();
  const out: HomeBlockConfig[] = [];
  for (const item of list) {
    const key = item?.key as HomeBlockKey;
    if (!key || !(key in HOME_BLOCK_META) || seen.has(key)) continue;
    seen.add(key);
    const meta = HOME_BLOCK_META[key];
    const lim = Number(item.limit);
    out.push({
      key,
      enabled: item.enabled !== false,
      title: typeof item.title === 'string' ? item.title : '',
      productIds: Array.isArray(item.productIds)
        ? (item.productIds as unknown[]).map(String).filter(Boolean)
        : [],
      limit:
        Number.isFinite(lim) && lim > 0
          ? Math.min(Math.round(lim), meta.maxLimit)
          : meta.defaultLimit,
    });
  }
  for (const key of HOME_BLOCK_ORDER) {
    if (seen.has(key)) continue;
    out.push({
      key,
      enabled: true,
      title: '',
      productIds: [],
      limit: HOME_BLOCK_META[key].defaultLimit,
    });
  }
  return out;
}

export async function loadHomeBlocks(): Promise<HomeBlockConfig[]> {
  const rows = await api<SettingRow[]>('/cms/admin/settings');
  const row = (Array.isArray(rows) ? rows : []).find(
    (r) => r.key === HOME_BLOCKS_SETTING_KEY,
  );
  return normalizeHomeBlocks(row?.value);
}

export async function saveHomeBlocks(blocks: HomeBlockConfig[]): Promise<void> {
  await api('/cms/admin/settings', {
    method: 'PATCH',
    body: {
      settings: [
        {
          key: HOME_BLOCKS_SETTING_KEY,
          group: 'home',
          description: 'Ana sayfa ürün blokları (sıra, başlık, ürün seçimi)',
          value: {
            blocks: blocks.map((b) => ({
              key: b.key,
              enabled: b.enabled,
              title: b.title.trim(),
              limit: b.limit,
              productIds: b.productIds,
            })),
          },
        },
      ],
    },
  });
}

/** Ürün formundan: ürünün hangi bloklarda olacağını yazar */
export async function setProductHomeBlocks(
  productId: string,
  keys: HomeBlockKey[],
): Promise<void> {
  const blocks = await loadHomeBlocks();
  let changed = false;
  for (const b of blocks) {
    const has = b.productIds.includes(productId);
    const want = keys.includes(b.key);
    if (want && !has) {
      b.productIds = [...b.productIds, productId];
      changed = true;
    } else if (!want && has) {
      b.productIds = b.productIds.filter((id) => id !== productId);
      changed = true;
    }
  }
  if (changed) await saveHomeBlocks(blocks);
}
