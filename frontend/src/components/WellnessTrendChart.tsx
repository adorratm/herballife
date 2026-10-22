"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type TrendPoint = {
  date: string;
  weightKg?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
};

type SeriesKey = "weightKg" | "waistCm" | "hipCm";

const SERIES: {
  key: SeriesKey;
  label: string;
  unit: string;
  color: string;
}[] = [
  { key: "weightKg", label: "Kilo", unit: "kg", color: "var(--primary)" },
  { key: "waistCm", label: "Bel", unit: "cm", color: "#0d9488" },
  { key: "hipCm", label: "Kalça", unit: "cm", color: "#c45c26" },
];

type Props = {
  points: TrendPoint[];
  goalValue?: number | null;
  goalLabel?: string;
  /** Grafik alanı yüksekliği (px) */
  height?: number;
  className?: string;
};

function formatShortDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}.${m[2]}`;
    return iso.slice(0, 10);
  }
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

function niceDomain(min: number, max: number) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1 };
  if (min === max) {
    const pad = Math.max(1, Math.abs(min) * 0.03);
    return { min: min - pad, max: max + pad };
  }
  const span = max - min;
  const pad = Math.max(span * 0.18, 0.8);
  return { min: min - pad, max: max + pad };
}

export function WellnessTrendChart({
  points,
  goalValue,
  goalLabel = "Hedef",
  height = 280,
  className = "",
}: Props) {
  const gradId = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<SeriesKey>("weightKg");
  const [hover, setHover] = useState<number | null>(null);

  const seriesMeta = SERIES.find((s) => s.key === active)!;
  const showGoal =
    active === "weightKg" && goalValue != null && Number.isFinite(goalValue);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => setWidth(Math.max(280, Math.floor(el.clientWidth)));
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const series = useMemo(() => {
    return points
      .map((p) => ({
        date: p.date,
        value: p[active] != null ? Number(p[active]) : null,
      }))
      .filter((p) => p.value != null && Number.isFinite(p.value)) as {
      date: string;
      value: number;
    }[];
  }, [points, active]);

  const available = useMemo(() => {
    return SERIES.filter((s) =>
      points.some((p) => p[s.key] != null && Number.isFinite(Number(p[s.key]))),
    );
  }, [points]);

  const stats = useMemo(() => {
    if (series.length < 1) return null;
    const values = series.map((s) => s.value);
    const first = values[0];
    const last = values[values.length - 1];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { first, last, avg, delta: last - first };
  }, [series]);

  const layout = useMemo(() => {
    const padL = 48;
    const padR = 16;
    const padT = 20;
    const padB = 36;
    const w = width;
    const h = height;
    const plotW = Math.max(1, w - padL - padR);
    const plotH = Math.max(1, h - padT - padB);

    const values = series.map((s) => s.value);
    if (showGoal && goalValue != null) values.push(goalValue);
    const rawMin = values.length ? Math.min(...values) : 0;
    const rawMax = values.length ? Math.max(...values) : 1;
    const { min, max } = niceDomain(rawMin, rawMax);
    const span = Math.max(0.01, max - min);

    const toX = (i: number) =>
      series.length <= 1
        ? padL + plotW / 2
        : padL + (i / (series.length - 1)) * plotW;
    const toY = (v: number) => padT + (1 - (v - min) / span) * plotH;

    const coords = series.map((s, i) => ({
      x: toX(i),
      y: toY(s.value),
      date: s.date,
      value: s.value,
    }));

    const lineD =
      coords.length >= 2
        ? `M ${coords.map((c) => `${c.x} ${c.y}`).join(" L ")}`
        : "";
    const areaD =
      coords.length >= 2
        ? `${lineD} L ${coords[coords.length - 1].x} ${padT + plotH} L ${coords[0].x} ${padT + plotH} Z`
        : "";

    const yTicks = 4;
    const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
      const v = min + (span * i) / yTicks;
      return { v, y: toY(v) };
    });

    const xLabelIdx: number[] = [];
    if (series.length) {
      const want = Math.min(5, series.length);
      for (let k = 0; k < want; k++) {
        const i =
          want === 1
            ? 0
            : Math.round((k * (series.length - 1)) / (want - 1));
        if (!xLabelIdx.includes(i)) xLabelIdx.push(i);
      }
    }

    return {
      w,
      h,
      padL,
      padR,
      padT,
      padB,
      plotW,
      plotH,
      coords,
      lineD,
      areaD,
      ticks,
      xLabelIdx,
      goalY: showGoal && goalValue != null ? toY(goalValue) : null,
    };
  }, [series, goalValue, showGoal, width, height]);

  if (series.length < 2) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-surface-container-low px-4 py-10 text-center text-sm text-on-surface-variant ${className}`}
      >
        Grafik için en az 2 {seriesMeta.label.toLowerCase()} kaydı gerekir
      </div>
    );
  }

  const hi = hover != null ? series[hover] : null;
  const hiCoord = hover != null ? layout.coords[hover] : null;
  const prev = hover != null && hover > 0 ? series[hover - 1] : null;
  const stepDelta =
    hi && prev ? hi.value - prev.value : hi && stats ? hi.value - stats.first : null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(available.length ? available : SERIES.slice(0, 1)).map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => {
                setActive(s.key);
                setHover(null);
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                active === s.key
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-primary-fixed hover:text-primary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {stats ? (
          <p className="text-xs text-on-surface-variant">
            Δ{" "}
            <strong className={stats.delta <= 0 ? "text-primary" : "text-flash"}>
              {stats.delta > 0 ? "+" : ""}
              {stats.delta.toFixed(1)} {seriesMeta.unit}
            </strong>
            <span className="mx-1.5 text-outline-variant">·</span>
            ort. {stats.avg.toFixed(1)}
          </p>
        ) : null}
      </div>

      {/* Sabit yükseklik + ölçülen genişlik → 1:1 SVG, yazı ezilmez */}
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-xl border border-outline-variant/30 bg-white"
        style={{ height, minHeight: height }}
        onMouseLeave={() => setHover(null)}
      >
        {/* Üstte sabit hover paneli */}
        <div
          className={`absolute inset-x-0 top-0 z-20 flex justify-center px-3 pt-2.5 transition-all duration-200 ${
            hi ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
          }`}
        >
          {hi ? (
            <div className="flex items-baseline gap-3 rounded-xl border border-primary/20 bg-white/95 px-4 py-2 shadow-md backdrop-blur-sm">
              <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                {formatShortDate(hi.date)}
              </span>
              <span className="font-display text-lg font-bold text-primary">
                {hi.value.toFixed(1)} {seriesMeta.unit}
              </span>
              {stepDelta != null ? (
                <span
                  className={`text-xs font-semibold ${
                    stepDelta <= 0 ? "text-primary" : "text-flash"
                  }`}
                >
                  {stepDelta > 0 ? "+" : ""}
                  {stepDelta.toFixed(1)} {prev ? "öncekiye" : "başa"} göre
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <svg
          width={layout.w}
          height={layout.h}
          viewBox={`0 0 ${layout.w} ${layout.h}`}
          className="block"
          role="img"
          aria-label={`${seriesMeta.label} eğrisi`}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={seriesMeta.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={seriesMeta.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {layout.ticks.map((t, i) => (
            <g key={i}>
              <line
                x1={layout.padL}
                x2={layout.w - layout.padR}
                y1={t.y}
                y2={t.y}
                stroke="color-mix(in srgb, var(--outline-variant) 55%, transparent)"
                strokeDasharray="4 6"
              />
              <text
                x={layout.padL - 10}
                y={t.y + 4}
                textAnchor="end"
                fill="var(--on-surface-variant)"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                {t.v.toFixed(1)}
              </text>
            </g>
          ))}

          {layout.goalY != null ? (
            <g>
              <line
                x1={layout.padL}
                x2={layout.w - layout.padR}
                y1={layout.goalY}
                y2={layout.goalY}
                stroke="var(--flash)"
                strokeWidth={1.5}
                strokeDasharray="6 5"
              />
              <text
                x={layout.w - layout.padR}
                y={layout.goalY - 6}
                textAnchor="end"
                fill="var(--flash)"
                style={{ fontSize: 12, fontWeight: 700 }}
              >
                {goalLabel} {goalValue}
              </text>
            </g>
          ) : null}

          {layout.areaD ? <path d={layout.areaD} fill={`url(#${gradId})`} /> : null}

          {layout.lineD ? (
            <path
              d={layout.lineD}
              fill="none"
              stroke={seriesMeta.color}
              strokeWidth={2.75}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}

          {hiCoord ? (
            <line
              x1={hiCoord.x}
              x2={hiCoord.x}
              y1={layout.padT}
              y2={layout.padT + layout.plotH}
              stroke={seriesMeta.color}
              strokeOpacity={0.35}
              strokeDasharray="4 4"
            />
          ) : null}

          {layout.coords.map((c, i) => {
            const isHi = hover === i;
            const band = Math.max(28, layout.plotW / Math.max(1, series.length));
            return (
              <g key={`${c.date}-${i}`}>
                {isHi ? (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={14}
                    fill={seriesMeta.color}
                    opacity={0.18}
                  />
                ) : null}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isHi ? 7 : 5}
                  fill={isHi ? seriesMeta.color : "#fff"}
                  stroke={seriesMeta.color}
                  strokeWidth={2.5}
                />
                <rect
                  x={c.x - band / 2}
                  y={layout.padT}
                  width={band}
                  height={layout.plotH}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onClick={() => setHover(i)}
                />
              </g>
            );
          })}

          {layout.xLabelIdx.map((i) => {
            const c = layout.coords[i];
            if (!c) return null;
            return (
              <text
                key={`x-${i}`}
                x={c.x}
                y={layout.h - 12}
                textAnchor="middle"
                fill="var(--on-surface-variant)"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                {formatShortDate(c.date)}
              </text>
            );
          })}
        </svg>

        {!hi ? (
          <p className="pointer-events-none absolute bottom-10 right-4 text-xs text-on-surface-variant/65">
            Noktaların üzerine gelin
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function WellnessRingProgress({
  value,
  goal,
  label = "Su",
  unit = "ml",
  size = 112,
}: {
  value: number;
  goal: number;
  label?: string;
  unit?: string;
  size?: number;
}) {
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} className="shrink-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-container)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
          {label}
        </p>
        <p className="font-display text-2xl font-bold text-primary">
          {Math.round(pct * 100)}
          <span className="text-sm">%</span>
        </p>
        <p className="text-xs text-on-surface-variant">
          {value} / {goal} {unit}
        </p>
      </div>
    </div>
  );
}
