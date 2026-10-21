"use client";

import { useEffect, useMemo, useState } from "react";

type Parts = { days: number; hours: number; mins: number; secs: number };

function partsUntil(end: Date): Parts {
  const diff = Math.max(0, end.getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

type Props = {
  /** ISO date or empty → end of current month */
  endsAt?: string | null;
  title?: string;
  badge?: string;
  body?: string;
  couponCode?: string;
};

export function PromoCountdown({
  endsAt,
  title = "Özel Avantaj Kampanyası",
  badge = "FIRSAT",
  body = "Seçili setlerde hediye avantajı ve ücretsiz kargo.",
  couponCode = "SAGLIK2026",
}: Props) {
  const end = useMemo(() => {
    if (endsAt?.trim()) {
      const d = new Date(endsAt);
      if (!Number.isNaN(d.getTime())) return d;
    }
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [endsAt]);

  const [parts, setParts] = useState<Parts>(() => partsUntil(end));

  useEffect(() => {
    setParts(partsUntil(end));
    const id = window.setInterval(() => setParts(partsUntil(end)), 1000);
    return () => window.clearInterval(id);
  }, [end]);

  const cells: { label: string; value: string; accent?: boolean }[] = [
    { label: "Gün", value: pad(parts.days) },
    { label: "Saat", value: pad(parts.hours) },
    { label: "Dakika", value: pad(parts.mins) },
    { label: "Saniye", value: pad(parts.secs), accent: true },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-flash bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-flash px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              {badge}
            </span>
            <span className="font-display text-xl font-bold text-on-surface md:text-2xl">
              {title}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-on-surface-variant">{body}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {cells.map((c) => (
            <div
              key={c.label}
              className={`flex min-w-14 flex-col items-center rounded-xl px-3 py-2.5 ${
                c.accent
                  ? "bg-flash text-white"
                  : "bg-surface-container-low text-on-surface"
              }`}
            >
              <span className="font-display text-2xl font-bold leading-none tabular-nums">
                {c.value}
              </span>
              <span
                className={`mt-1 text-[10px] font-semibold uppercase ${
                  c.accent ? "text-white/85" : "text-on-surface-variant"
                }`}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-dashed border-flash/40 bg-flash-soft px-4 py-2.5">
          <span className="text-xs font-medium text-on-surface-variant">
            Kupon
          </span>
          <span className="font-display text-base font-bold tracking-widest text-flash">
            {couponCode}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Üst şerit için kompakt günün fırsatı sayacı */
export function DealStripCountdown({ endsAt }: { endsAt?: string | null }) {
  const end = useMemo(() => {
    if (endsAt?.trim()) {
      const d = new Date(endsAt);
      if (!Number.isNaN(d.getTime())) return d;
    }
    // CMS promo.endsAt yoksa ay sonu kampanya (seed ile uyumlu)
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [endsAt]);

  const [parts, setParts] = useState<Parts>(() => partsUntil(end));

  useEffect(() => {
    setParts(partsUntil(end));
    const id = window.setInterval(() => setParts(partsUntil(end)), 1000);
    return () => window.clearInterval(id);
  }, [end]);

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full bg-flash px-3 py-1 text-xs font-bold text-white"
      suppressHydrationWarning
    >
      <span>Flash</span>
      <strong className="tabular-nums tracking-wide" suppressHydrationWarning>
        {pad(parts.hours)}:{pad(parts.mins)}:{pad(parts.secs)}
      </strong>
    </span>
  );
}
