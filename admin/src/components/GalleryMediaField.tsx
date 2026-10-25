'use client';

import { useState } from 'react';
import { uploadMedia } from '@/lib/api';
import { ImageDropZone } from '@/components/ImageDropZone';
import { MediaLibraryPicker } from '@/components/MediaLibraryPicker';

type Props = {
  urls: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
};

export function GalleryMediaField({
  urls,
  onChange,
  folder = 'products',
  label = 'Galeri',
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  function addUrls(next: string[]) {
    const merged = [...urls];
    for (const url of next) {
      if (url && !merged.includes(url)) merged.push(url);
    }
    onChange(merged);
  }

  function removeAt(index: number) {
    onChange(urls.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= urls.length) return;
    const next = [...urls];
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    onChange(next);
  }

  async function handleFiles(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const asset = await uploadMedia(file, { folder });
        uploaded.push(asset.url);
      }
      addUrls(uploaded);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yükleme başarısız');
    } finally {
      setUploading(false);
    }
  }

  function addManual() {
    const url = manualUrl.trim();
    if (!url) return;
    addUrls([url]);
    setManualUrl('');
  }

  function applyPicker(selected: string[]) {
    const ordered = [
      ...urls.filter((u) => selected.includes(u)),
      ...selected.filter((u) => !urls.includes(u)),
    ];
    onChange(ordered);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="mono text-[10px] uppercase text-muted">{label}</span>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="text-xs text-accent hover:underline"
        >
          Medyadan seç
        </button>
      </div>

      {urls.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {urls.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className="group relative border border-border-muted bg-background"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/70 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="flex-1 px-1 py-0.5 text-[10px] text-white disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === urls.length - 1}
                  className="flex-1 px-1 py-0.5 text-[10px] text-white disabled:opacity-30"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="flex-1 px-1 py-0.5 text-[10px] text-danger"
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <ImageDropZone
        multiple
        onFiles={handleFiles}
        busy={uploading}
        hint="Galeri görsellerini sürükleyip bırakın veya seçin"
      />

      <input
        value={manualUrl}
        onChange={(e) => setManualUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addManual();
          }
        }}
        onBlur={() => {
          if (manualUrl.trim()) addManual();
        }}
        placeholder="veya bağlantı yapıştır (Enter)"
        className="w-full border border-border-muted bg-background px-3 py-2 text-sm"
      />

      {error ? <p className="text-xs text-danger">{error}</p> : null}

      <MediaLibraryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multiple
        selectedUrls={urls}
        onApply={applyPicker}
      />
    </div>
  );
}
