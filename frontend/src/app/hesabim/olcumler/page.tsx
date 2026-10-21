"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountTabs } from "@/components/AccountTabs";
import { SuccessModal } from "@/components/SuccessModal";
import { getApiBase } from "@/lib/api";
import { getToken, isAuthenticated } from "@/lib/auth";

type Measurement = {
  id: string;
  measuredAt: string;
  weightKg: number | null;
  waistCm: number | null;
  hipCm: number | null;
  note: string | null;
  status: string;
};

function WeightSparkline({ points }: { points: number[] }) {
  if (points.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl bg-surface-container-low text-sm text-on-surface-variant">
        Grafik için en az 2 ölçüm gerekir
      </div>
    );
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(0.1, max - min);
  const w = 320;
  const h = 120;
  const pad = 8;
  const coords = points.map((v, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return `${x},${y}`;
  });
  const polyline = coords.join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-40 w-full rounded-xl bg-surface-container-low"
      role="img"
      aria-label="Kilo eğrisi"
    >
      <polyline
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={polyline}
      />
      {coords.map((c, i) => {
        const [x, y] = c.split(",").map(Number);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3.5"
            fill="var(--primary-fixed)"
            stroke="var(--primary)"
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}

export default function MeasurementsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Measurement[]>([]);
  const [weightKg, setWeightKg] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [hipCm, setHipCm] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    const token = getToken();
    const res = await fetch(`${getApiBase()}/wellness/measurements`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Ölçümler yüklenemedi");
    setItems(await res.json());
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/giris?next=/hesabim/olcumler");
      return;
    }
    void load().catch((e) =>
      setError(e instanceof Error ? e.message : "Hata"),
    );
  }, [router]);

  const chronological = useMemo(
    () =>
      [...items]
        .filter((i) => i.weightKg != null)
        .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)),
    [items],
  );
  const weights = chronological.map((i) => Number(i.weightKg));
  const start = weights[0] ?? null;
  const current = weights[weights.length - 1] ?? null;
  const goal = start != null ? Math.round((start - 4) * 10) / 10 : null;
  const delta =
    start != null && current != null
      ? Math.round((current - start) * 10) / 10
      : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    try {
      const token = getToken();
      const res = await fetch(`${getApiBase()}/wellness/measurements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weightKg: weightKg ? Number(weightKg) : undefined,
          waistCm: waistCm ? Number(waistCm) : undefined,
          hipCm: hipCm ? Number(hipCm) : undefined,
          note: note || undefined,
        }),
      });
      if (!res.ok) throw new Error("Kayıt başarısız");
      setWeightKg("");
      setWaistCm("");
      setHipCm("");
      setNote("");
      setOk("Ölçüm kaydedildi — koç onayı bekleniyor");
      setFormOpen(false);
      setModalOpen(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    }
  }

  return (
    <div className="page-shell space-y-8 py-10">
      <AccountTabs active="takip" />
      <SuccessModal
        open={modalOpen}
        title="Ölçüm kaydedildi"
        body="Ölçümünüz koç onay kuyruğuna iletildi."
        onClose={() => setModalOpen(false)}
      />

      {formOpen ? (
        <div
          className="fixed inset-0 z-80 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setFormOpen(false)}
        >
          <form
            onSubmit={onSubmit}
            className="animate-fade-up grid w-full max-w-lg gap-4 rounded-2xl bg-surface-container-lowest p-6 shadow-xl md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl md:col-span-2">Yeni ölçüm</h2>
            <label className="text-sm">
              <span className="field-label">Kilo (kg)</span>
              <input
                className="field-input"
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                autoFocus
              />
            </label>
            <label className="text-sm">
              <span className="field-label">Bel (cm)</span>
              <input
                className="field-input"
                type="number"
                step="0.1"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="field-label">Kalça (cm)</span>
              <input
                className="field-input"
                type="number"
                step="0.1"
                value={hipCm}
                onChange={(e) => setHipCm(e.target.value)}
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="field-label">Not</span>
              <input
                className="field-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <div className="flex gap-2 md:col-span-2">
              <button
                type="button"
                className="rounded-full bg-surface-container px-5 py-2.5 text-sm font-semibold"
                onClick={() => setFormOpen(false)}
              >
                Vazgeç
              </button>
              <button type="submit" className="btn-cta flex-1 px-5 py-2.5">
                Kaydet
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Beslenme &amp; kilo çizelgem</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Hedef, güncel ve geçmiş ölçümlerinizi tek ekranda görün.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/hesabim/rapor"
            className="rounded-full bg-surface-container px-4 py-2 text-sm font-semibold"
          >
            Rapor
          </Link>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
          >
            Yeni ölçüm
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-error/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}
      {ok && !modalOpen ? (
        <p className="rounded-xl border border-primary/30 bg-primary-fixed/30 px-4 py-3 text-sm text-primary">
          {ok}
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Başlangıç", value: start != null ? `${start} kg` : "—" },
          { label: "Güncel", value: current != null ? `${current} kg` : "—" },
          {
            label: "Hedef (öneri)",
            value: goal != null ? `${goal} kg` : "—",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl bg-surface-container-lowest p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase text-on-surface-variant">
              {kpi.label}
            </p>
            <p className="mt-2 font-display text-2xl text-primary">{kpi.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-surface-container-lowest p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-xl">Kilo eğrisi</h2>
          {delta != null ? (
            <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary">
              {delta > 0 ? "+" : ""}
              {delta} kg
            </span>
          ) : null}
        </div>
        <WeightSparkline points={weights} />
      </section>

      <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
        <table className="w-full min-w-120 text-left text-sm">
          <thead className="border-b border-[#ebece8] text-xs uppercase text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Kilo</th>
              <th className="px-4 py-3">Bel</th>
              <th className="px-4 py-3">Kalça</th>
              <th className="px-4 py-3">Durum</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b border-[#ebece8]/40">
                <td className="px-4 py-3">{row.measuredAt}</td>
                <td className="px-4 py-3">{row.weightKg ?? "—"}</td>
                <td className="px-4 py-3">{row.waistCm ?? "—"}</td>
                <td className="px-4 py-3">{row.hipCm ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] uppercase">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length ? (
          <p className="p-6 text-sm text-on-surface-variant">Kayıt yok</p>
        ) : null}
      </div>
    </div>
  );
}
