'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { asPaged, formatMoney } from '@/lib/utils';
import { AdminListThumb } from '@/components/AdminListThumb';
import { Checkbox } from '@/components/Checkbox';
import {
  HOME_BLOCK_META,
  loadHomeBlocks,
  saveHomeBlocks,
  type HomeBlockConfig,
} from '@/lib/home-blocks';
import type { Product as BaseProduct } from '@/lib/types';

type Product = BaseProduct & { category?: { name?: string } | null };

const FRONTEND_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || ''
).replace(/\/$/, '');

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

async function loadAllProducts(): Promise<Product[]> {
  const out: Product[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const data = await api<unknown>(
      `/products/admin/all?limit=100&page=${page}&includeInactive=true&sort=name&order=asc`,
    );
    const paged = asPaged<Product>(data, 100);
    out.push(...paged.items);
    if (page >= paged.totalPages || !paged.items.length) break;
  }
  return out;
}

function BlockEditor({
  block,
  index,
  total,
  products,
  productById,
  onChange,
  onMove,
}: {
  block: HomeBlockConfig;
  index: number;
  total: number;
  products: Product[];
  productById: Map<string, Product>;
  onChange: (next: HomeBlockConfig) => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const meta = HOME_BLOCK_META[block.key];
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const candidates = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    return products
      .filter((p) => !block.productIds.includes(p.id))
      .filter((p) => {
        if (!q) return true;
        return `${p.name} ${p.slug} ${p.category?.name || ''}`
          .toLocaleLowerCase('tr')
          .includes(q);
      })
      .slice(0, 40);
  }, [products, block.productIds, query]);

  const selected = block.productIds
    .map((id) => productById.get(id))
    .filter((p): p is Product => Boolean(p));
  const missing = block.productIds.length - selected.length;
  const overLimit = selected.length > block.limit;

  return (
    <section
      className={`border border-border-muted bg-surface p-4 shadow-sm md:p-5 ${
        block.enabled ? '' : 'opacity-70'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mono text-[10px] uppercase tracking-widest text-muted">
            {index + 1}. blok · {meta.layout}
          </p>
          <h2 className="mt-1 font-display text-lg font-bold">
            {block.title.trim() || meta.label}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="border border-border-muted bg-background px-2.5 py-1.5 text-xs disabled:opacity-40"
            aria-label="Yukarı taşı"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="border border-border-muted bg-background px-2.5 py-1.5 text-xs disabled:opacity-40"
            aria-label="Aşağı taşı"
          >
            ↓
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[auto_1fr_8rem] md:items-end">
        <Checkbox
          id={`blk-enabled-${block.key}`}
          checked={block.enabled}
          onChange={(enabled) => onChange({ ...block, enabled })}
          label="Ana sayfada göster"
        />
        <label className="block text-sm">
          <span className="mono text-[10px] uppercase text-muted">
            Başlık (boşsa varsayılan)
          </span>
          <input
            value={block.title}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
            placeholder={meta.label}
            className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mono text-[10px] uppercase text-muted">
            En fazla ürün
          </span>
          <input
            type="number"
            min={1}
            max={meta.maxLimit}
            value={block.limit}
            onChange={(e) =>
              onChange({
                ...block,
                limit: Math.max(
                  1,
                  Math.min(meta.maxLimit, Number(e.target.value) || 1),
                ),
              })
            }
            className="mt-1 w-full border border-border-muted bg-background px-3 py-2"
          />
        </label>
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">
            Seçili ürünler{' '}
            <span className="font-normal text-muted">({selected.length})</span>
          </p>
          {block.productIds.length ? (
            <button
              type="button"
              onClick={() => onChange({ ...block, productIds: [] })}
              className="text-xs text-danger underline"
            >
              Tümünü kaldır (otomatiğe dön)
            </button>
          ) : null}
        </div>
        {!selected.length ? (
          <p className="mt-2 border border-dashed border-border-muted bg-surface-high px-3 py-2.5 text-sm text-muted">
            Ürün seçilmedi — otomatik gösterilir: <em>{meta.autoRule}</em>.
          </p>
        ) : (
          <ol className="mt-2 divide-y divide-border-muted border border-border-muted">
            {selected.map((p, i) => (
              <li
                key={p.id}
                className={`flex items-center gap-3 px-3 py-2 ${
                  i >= block.limit ? 'bg-surface-high text-muted' : ''
                }`}
              >
                <span className="mono w-5 text-xs text-muted">{i + 1}</span>
                <AdminListThumb src={p.imageUrl} alt={p.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {p.name}
                  </span>
                  <span className="block text-xs text-muted">
                    {formatMoney(p.basePrice)}
                    {!p.isActive ? ' · pasif (vitrinde görünmez)' : ''}
                    {i >= block.limit ? ' · limit dışında' : ''}
                  </span>
                </span>
                <span className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...block,
                        productIds: move(block.productIds, block.productIds.indexOf(p.id), block.productIds.indexOf(p.id) - 1),
                      })
                    }
                    className="border border-border-muted px-2 py-1 text-xs"
                    aria-label="Yukarı"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...block,
                        productIds: move(block.productIds, block.productIds.indexOf(p.id), block.productIds.indexOf(p.id) + 1),
                      })
                    }
                    className="border border-border-muted px-2 py-1 text-xs"
                    aria-label="Aşağı"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...block,
                        productIds: block.productIds.filter((id) => id !== p.id),
                      })
                    }
                    className="border border-danger/40 px-2 py-1 text-xs text-danger"
                    aria-label="Kaldır"
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ol>
        )}
        {missing > 0 ? (
          <p className="mt-1 text-xs text-warning">
            {missing} ürün silinmiş görünüyor; kaydettiğinizde listeden çıkarılır.
          </p>
        ) : null}
        {overLimit ? (
          <p className="mt-1 text-xs text-muted">
            İlk {block.limit} ürün gösterilir.
          </p>
        ) : null}

        <div className="relative mt-3">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            placeholder="+ Ürün ekle — ad veya kategori ile ara"
            className="w-full border border-border-muted bg-background px-3 py-2 text-sm"
          />
          {open && candidates.length ? (
            <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto border border-border-muted bg-surface shadow-lg">
              {candidates.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange({
                        ...block,
                        productIds: [...block.productIds, p.id],
                      });
                      setQuery('');
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-high"
                  >
                    <AdminListThumb src={p.imageUrl} alt={p.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{p.name}</span>
                      <span className="block text-xs text-muted">
                        {p.category?.name || 'Kategorisiz'} ·{' '}
                        {formatMoney(p.basePrice)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default function HomeBlocksPage() {
  const [blocks, setBlocks] = useState<HomeBlockConfig[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, p] = await Promise.all([loadHomeBlocks(), loadAllProducts()]);
        if (cancelled) return;
        setBlocks(b);
        setProducts(p);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Yüklenemedi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const productById = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  function update(i: number, next: HomeBlockConfig) {
    setBlocks((list) => list.map((b, idx) => (idx === i ? next : b)));
    setDirty(true);
    setMsg(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMsg(null);
    try {
      const cleaned = blocks.map((b) => ({
        ...b,
        productIds: b.productIds.filter((id) => productById.has(id)),
      }));
      await saveHomeBlocks(cleaned);
      setBlocks(cleaned);
      setDirty(false);
      setMsg('Kaydedildi. Ana sayfa birkaç saniye içinde güncellenir.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="mono text-sm text-muted">Yükleniyor…</p>;
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="border border-border-muted bg-surface p-4 md:p-5">
        <h1 className="font-display text-xl font-bold">Ana sayfa blokları</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Ana sayfadaki ürün bölümlerinin sırasını, başlığını ve hangi ürünlerin
          görüneceğini buradan yönetin. Bir bloğa ürün seçmezseniz otomatik
          kurala göre doldurulur. Ürünü bloğa ürün düzenleme ekranından da
          ekleyebilirsiniz. Özel başlık Türkçe vitrinde kullanılır; diğer
          dillerde çeviri dosyasındaki başlık görünür.
        </p>
        {FRONTEND_URL ? (
          <a
            href={FRONTEND_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-accent underline"
          >
            Ana sayfayı aç ↗
          </a>
        ) : null}
      </div>

      {error ? (
        <p className="border border-danger/40 bg-surface px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {blocks.map((b, i) => (
        <BlockEditor
          key={b.key}
          block={b}
          index={i}
          total={blocks.length}
          products={products}
          productById={productById}
          onChange={(next) => update(i, next)}
          onMove={(dir) => {
            setBlocks((list) => move(list, i, i + dir));
            setDirty(true);
          }}
        />
      ))}

      <div className="sticky bottom-0 z-30 -mx-1 flex flex-wrap items-center gap-3 border border-border-muted bg-surface/95 px-4 py-3 shadow-md backdrop-blur">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || !dirty}
          className="border border-accent bg-accent px-5 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor…' : 'Değişiklikleri kaydet'}
        </button>
        {dirty ? (
          <span className="text-xs text-muted">Kaydedilmemiş değişiklik var</span>
        ) : null}
        {msg ? <span className="text-sm text-success">{msg}</span> : null}
      </div>
    </div>
  );
}
