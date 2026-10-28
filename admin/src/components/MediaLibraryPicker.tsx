'use client';

import { useEffect, useRef, useState } from 'react';
import { api, resolveMediaUrl } from '@/lib/api';
import { Modal } from '@/components/Modal';

export type MediaAsset = {
  id: string;
  filename: string;
  url: string;
  mimeType?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Çoklu seçim */
  multiple?: boolean;
  selectedUrls?: string[];
  onApply: (urls: string[]) => void;
};

export function MediaLibraryPicker({
  open,
  onClose,
  multiple = false,
  selectedUrls,
  onApply,
}: Props) {
  const [library, setLibrary] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectedUrlsRef = useRef(selectedUrls);
  selectedUrlsRef.current = selectedUrls;

  // Yalnızca modal açılınca listeyi çek; selectedUrls her render’da yeni [] olmasın diye bağımlılık yok
  useEffect(() => {
    if (!open) return;
    setSelected(new Set(selectedUrlsRef.current ?? []));
    setLoading(true);
    setError(null);
    let cancelled = false;
    void api<MediaAsset[]>('/cms/admin/media')
      .then((data) => {
        if (!cancelled) setLibrary(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Medya listesi alınamadı',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  function toggle(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (multiple) {
        if (next.has(url)) next.delete(url);
        else next.add(url);
      } else {
        next.clear();
        next.add(url);
      }
      return next;
    });
  }

  function apply() {
    onApply([...selected]);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Medya kütüphanesi"
      description={
        multiple
          ? `${selected.size} seçili · çoklu seçim`
          : 'Tek görsel seçin'
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="admin-btn admin-btn-ghost"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={!selected.size}
            className="admin-btn admin-btn-primary disabled:opacity-50"
          >
            Seç ({selected.size})
          </button>
        </>
      }
    >
      {loading ? (
        <p className="text-sm text-muted">Yükleniyor…</p>
      ) : error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : library.length === 0 ? (
        <p className="text-sm text-muted">
          Kütüphanede görsel yok. Medya sayfasından yükleyin.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
          {library.map((asset) => {
            const active = selected.has(asset.url);
            return (
              <li key={asset.id}>
                <button
                  type="button"
                  onClick={() => toggle(asset.url)}
                  className={`relative w-full overflow-hidden rounded-xl border transition ${
                    active
                      ? 'border-accent ring-2 ring-accent/30'
                      : 'border-border-muted hover:border-accent/50'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveMediaUrl(asset.url)}
                    loading="lazy"
                    alt={asset.filename}
                    className="aspect-square w-full object-cover"
                  />
                  {active ? (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                      ✓
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
