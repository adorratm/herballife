"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type Parts = { days: number; hours: number; mins: number; secs: number };

function partsUntil(end: Date, nowMs: number): Parts {
  const diff = Math.max(0, end.getTime() - nowMs);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function resolveEnd(endsAt?: string | null): Date {
  if (endsAt?.trim()) {
    const d = new Date(endsAt);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

type Props = {
  /** ISO date or empty → end of current month */
  endsAt?: string | null;
  title?: string;
  badge?: string;
  body?: string;
  couponCode?: string;
  theme?: string | null;
};

const THEME_BADGE: Record<string, string> = {
  default: "bg-flash",
  "singles-day": "bg-[#e11d48]",
  halloween: "bg-[#ea580c]",
  "black-friday": "bg-[#171717]",
  valentine: "bg-[#db2777]",
  "new-year": "bg-[#0f766e]",
  ramadan: "bg-[#047857]",
  kurban: "bg-[#b45309]",
};

export function PromoCountdown({
  endsAt,
  title,
  badge,
  body,
  couponCode = "SAGLIK2026",
  theme = "default",
}: Props) {
  const t = useTranslations("promo");
  const resolvedTitle = title ?? t("defaultTitle");
  const resolvedBadge = badge ?? t("defaultBadge");
  const resolvedBody = body ?? t("defaultBody");

  const end = useMemo(() => resolveEnd(endsAt), [endsAt]);
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    setParts(partsUntil(end, Date.now()));
    const id = window.setInterval(
      () => setParts(partsUntil(end, Date.now())),
      1000,
    );
    return () => window.clearInterval(id);
  }, [end]);

  const cells: { label: string; value: string; accent?: boolean }[] = [
    { label: t("day"), value: parts ? pad(parts.days) : "--" },
    { label: t("hour"), value: parts ? pad(parts.hours) : "--" },
    { label: t("minute"), value: parts ? pad(parts.mins) : "--" },
    {
      label: t("second"),
      value: parts ? pad(parts.secs) : "--",
      accent: true,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-flash/30 bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white ${
                THEME_BADGE[theme || "default"] || THEME_BADGE.default
              }`}
            >
              {resolvedBadge}
            </span>
            <span className="font-display text-xl font-bold text-on-surface md:text-2xl">
              {resolvedTitle}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-on-surface-variant">
            {resolvedBody}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
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

        {couponCode.trim() ? (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-flash/40 bg-flash-soft px-4 py-2.5">
            <span className="text-xs font-medium text-on-surface-variant">
              {t("coupon")}
            </span>
            <span className="font-display text-base font-bold tracking-widest text-flash">
              {couponCode}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function DealStripCountdown({ endsAt }: { endsAt?: string | null }) {
  const t = useTranslations("promo");
  const end = useMemo(() => resolveEnd(endsAt), [endsAt]);
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    setParts(partsUntil(end, Date.now()));
    const id = window.setInterval(
      () => setParts(partsUntil(end, Date.now())),
      1000,
    );
    return () => window.clearInterval(id);
  }, [end]);

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-flash px-3 py-1 text-xs font-bold text-white">
      <span>{t("dealStrip")}</span>
      <strong className="tabular-nums tracking-wide">
        {parts
          ? `${pad(parts.hours)}:${pad(parts.mins)}:${pad(parts.secs)}`
          : "--:--:--"}
      </strong>
    </span>
  );
}
