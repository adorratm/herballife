'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Modal } from '@/components/Modal';

type Meal = {
  id: string;
  mealType: string;
  note: string | null;
  photoUrl?: string | null;
  logDate: string;
  status: string;
  user?: { email?: string; firstName?: string; lastName?: string; phone?: string };
};

type Measurement = {
  id: string;
  measuredAt: string;
  weightKg: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  note?: string | null;
  status: string;
  user?: { email?: string; firstName?: string; lastName?: string; phone?: string };
};

type Kpis = {
  pendingMeals: number;
  pendingMeasurements: number;
  pendingTotal: number;
  activeClients: number;
};

function userLabel(u?: {
  email?: string;
  firstName?: string;
  lastName?: string;
}) {
  if (!u) return '—';
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
  return name || u.email || '—';
}

export default function CoachPage() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [detail, setDetail] = useState<
    | { kind: 'meal'; row: Meal }
    | { kind: 'measurement'; row: Measurement }
    | null
  >(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successText, setSuccessText] = useState('');

  const load = useCallback(async () => {
    const [k, pending] = await Promise.all([
      api<Kpis>('/wellness/coach/kpis'),
      api<{ meals: Meal[]; measurements: Measurement[] }>(
        '/wellness/coach/pending',
      ),
    ]);
    setKpis(k);
    setMeals(pending.meals || []);
    setMeasurements(pending.measurements || []);
  }, []);

  useEffect(() => {
    void load()
      .catch((e) => setError(e instanceof Error ? e.message : 'Yüklenemedi'))
      .finally(() => setLoading(false));
  }, [load]);

  async function decide(
    kind: 'meals' | 'measurements',
    id: string,
    status: 'approved' | 'rejected',
  ) {
    setError(null);
    try {
      await api(`/wellness/coach/${kind}/${id}`, {
        method: 'PATCH',
        body: { status },
      });
      setDetail(null);
      setSuccessText(
        status === 'approved'
          ? 'Kayıt başarıyla onaylandı. Danışan bilgilendirilebilir.'
          : 'Kayıt reddedildi.',
      );
      setSuccessOpen(true);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'İşlem başarısız');
    }
  }

  const needle = q.trim().toLowerCase();
  const mealRows = meals.filter((m) =>
    !needle
      ? true
      : userLabel(m.user).toLowerCase().includes(needle) ||
        (m.note || '').toLowerCase().includes(needle),
  );
  const measRows = measurements.filter((m) =>
    !needle
      ? true
      : userLabel(m.user).toLowerCase().includes(needle),
  );

  if (loading) return <p className="text-sm text-muted">Yükleniyor…</p>;

  return (
    <div className="space-y-8">
      {(kpis?.pendingTotal ?? 0) > 0 ? (
        <div className="relative overflow-hidden rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          <span className="absolute right-3 top-3 h-2 w-2 animate-ping rounded-full bg-accent" />
          <strong>{kpis?.pendingTotal}</strong> kayıt onay bekliyor — öncelikli
          kuyruğu aşağıdan yönetin.
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Koçluk — Danışan takip & onay</h2>
          <p className="text-sm text-muted">
            Öğün / ölçüm onayları ve toplu motivasyon mesajları.
          </p>
        </div>
        <Link
          href="/kocluk/whatsapp"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white!"
        >
          Toplu WhatsApp
        </Link>
      </div>

      {error ? (
        <p className="rounded-xl border border-danger/40 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Bekleyen toplam', kpis?.pendingTotal ?? 0],
          ['Bekleyen öğün', kpis?.pendingMeals ?? 0],
          ['Bekleyen ölçüm', kpis?.pendingMeasurements ?? 0],
          ['Aktif danışan', kpis?.activeClients ?? 0],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-border-muted bg-surface p-4"
          >
            <p className="text-xs uppercase text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Danışan ara…"
          className="w-full max-w-sm rounded-full border border-border-muted bg-background px-4 py-2 text-sm"
        />
      </div>

      <Modal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        size="sm"
        showClose={false}
        footer={
          <button
            type="button"
            className="admin-btn admin-btn-primary w-full sm:w-auto"
            onClick={() => setSuccessOpen(false)}
          >
            Tamam
          </button>
        }
      >
        <div className="py-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/12 text-2xl font-bold text-accent ring-1 ring-inset ring-accent/20">
            ✓
          </div>
          <h3 className="admin-modal-title mt-4">İşlem tamamlandı</h3>
          <p className="admin-modal-desc">{successText}</p>
        </div>
      </Modal>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        size="md"
        title={detail?.kind === 'meal' ? 'Öğün onayı' : 'Ölçüm onayı'}
        description={detail ? userLabel(detail.row.user) : undefined}
        footer={
          detail ? (
            <>
              <button
                type="button"
                className="admin-btn admin-btn-ghost border-danger/40 text-danger hover:border-danger hover:bg-danger/5 hover:text-danger"
                onClick={() =>
                  void decide(
                    detail.kind === 'meal' ? 'meals' : 'measurements',
                    detail.row.id,
                    'rejected',
                  )
                }
              >
                Reddet
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={() =>
                  void decide(
                    detail.kind === 'meal' ? 'meals' : 'measurements',
                    detail.row.id,
                    'approved',
                  )
                }
              >
                Onayla
              </button>
            </>
          ) : null
        }
      >
        {detail?.kind === 'meal' ? (
          <div className="rounded-xl border border-border-muted bg-surface-high/60 p-3.5 text-sm">
            <p>
              <strong>{detail.row.mealType}</strong> · {detail.row.logDate}
            </p>
            <p className="mt-2 text-foreground/80">
              {detail.row.note || 'Not yok'}
            </p>
          </div>
        ) : detail ? (
          <div className="rounded-xl border border-border-muted bg-surface-high/60 p-3.5 text-sm">
            <p className="text-muted">{detail.row.measuredAt}</p>
            <p className="mt-2 text-base font-semibold">
              {detail.row.weightKg ?? '—'} kg
              {detail.row.waistCm != null ? ` · bel ${detail.row.waistCm}` : ''}
            </p>
            {detail.row.note ? (
              <p className="mt-1 text-foreground/80">{detail.row.note}</p>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <section id="pending-queue" className="space-y-3">
        <h3 className="font-semibold">Onay kuyruğu — öğünler</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {mealRows.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setDetail({ kind: 'meal', row: m })}
              className="rounded-xl border border-border-muted bg-surface p-4 text-left transition hover:border-accent/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{userLabel(m.user)}</p>
                  <p className="text-xs text-muted">
                    {m.mealType} · {m.logDate}
                  </p>
                </div>
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase text-accent">
                  bekliyor
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted">
                {m.note || 'Not yok'}
              </p>
            </button>
          ))}
          {!mealRows.length ? (
            <p className="text-sm text-muted">Bekleyen öğün yok</p>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Onay kuyruğu — ölçümler</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {measRows.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setDetail({ kind: 'measurement', row: m })}
              className="rounded-xl border border-border-muted bg-surface p-4 text-left transition hover:border-accent/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{userLabel(m.user)}</p>
                  <p className="text-xs text-muted">{m.measuredAt}</p>
                </div>
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase text-accent">
                  bekliyor
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold">
                {m.weightKg ?? '—'} kg
              </p>
            </button>
          ))}
          {!measRows.length ? (
            <p className="text-sm text-muted">Bekleyen ölçüm yok</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
