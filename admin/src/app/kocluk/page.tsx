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
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
};

type Measurement = {
  id: string;
  measuredAt: string;
  weightKg: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  note?: string | null;
  status: string;
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
};

type Kpis = {
  pendingMeals: number;
  pendingMeasurements: number;
  pendingTotal: number;
  activeClients: number;
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Kahvaltı',
  lunch: 'Öğle',
  dinner: 'Akşam',
  snack: 'Ara öğün',
  other: 'Diğer',
};

function mealTypeLabel(code: string) {
  return MEAL_LABELS[code] || code;
}

function userLabel(u?: {
  email?: string;
  firstName?: string;
  lastName?: string;
}) {
  if (!u) return '—';
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
  return name || u.email || '—';
}

function formatDate(value: string) {
  if (!value) return '—';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [y, m, d] = value.slice(0, 10).split('-');
    return `${d}.${m}.${y}`;
  }
  return value;
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
  const [coachNote, setCoachNote] = useState('');
  const [deciding, setDeciding] = useState(false);
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

  function openDetail(
    item: { kind: 'meal'; row: Meal } | { kind: 'measurement'; row: Measurement },
  ) {
    setCoachNote('');
    setDetail(item);
  }

  async function decide(
    kind: 'meals' | 'measurements',
    id: string,
    status: 'approved' | 'rejected',
  ) {
    setError(null);
    setDeciding(true);
    try {
      await api(`/wellness/coach/${kind}/${id}`, {
        method: 'PATCH',
        body: { status, coachNote: coachNote.trim() || undefined },
      });
      setDetail(null);
      setCoachNote('');
      setSuccessText(
        status === 'approved'
          ? 'Kayıt onaylandı. Danışan inbox (ve e-posta varsa) ile bilgilendirildi.'
          : 'Kayıt reddedildi. Danışana geri bildirim gönderildi.',
      );
      setSuccessOpen(true);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'İşlem başarısız');
    } finally {
      setDeciding(false);
    }
  }

  const needle = q.trim().toLowerCase();
  const mealRows = meals.filter((m) =>
    !needle
      ? true
      : userLabel(m.user).toLowerCase().includes(needle) ||
        (m.note || '').toLowerCase().includes(needle) ||
        mealTypeLabel(m.mealType).toLowerCase().includes(needle),
  );
  const measRows = measurements.filter((m) =>
    !needle
      ? true
      : userLabel(m.user).toLowerCase().includes(needle) ||
        (m.note || '').toLowerCase().includes(needle),
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
            Öğün fotoğrafı, ölçüm ve koç notu ile onay / red.
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

      <div className="admin-toolbar items-end">
        <label className="block min-w-48 flex-1 text-sm">
          <span className="mono text-[10px] uppercase text-muted">Danışan ara</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ad, not, öğün türü…"
            className="mt-1 w-full rounded-lg border border-border-muted bg-background px-3 py-2"
          />
        </label>
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
        onClose={() => {
          if (!deciding) setDetail(null);
        }}
        size="lg"
        title={detail?.kind === 'meal' ? 'Öğün onayı' : 'Ölçüm onayı'}
        description={
          detail
            ? `${userLabel(detail.row.user)}${detail.row.user?.email ? ` · ${detail.row.user.email}` : ''}`
            : undefined
        }
        footer={
          detail ? (
            <>
              <button
                type="button"
                disabled={deciding}
                className="admin-btn admin-btn-ghost border-danger/40 text-danger hover:border-danger hover:bg-danger/5 hover:text-danger disabled:opacity-50"
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
                disabled={deciding}
                className="admin-btn admin-btn-primary disabled:opacity-50"
                onClick={() =>
                  void decide(
                    detail.kind === 'meal' ? 'meals' : 'measurements',
                    detail.row.id,
                    'approved',
                  )
                }
              >
                {deciding ? 'İşleniyor…' : 'Onayla'}
              </button>
            </>
          ) : null
        }
      >
        {detail?.kind === 'meal' ? (
          <div className="space-y-4">
            <dl className="grid gap-2 rounded-xl border border-border-muted bg-surface-high/60 p-3.5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase text-muted">Öğün türü</dt>
                <dd className="font-semibold">
                  {mealTypeLabel(detail.row.mealType)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted">Tarih</dt>
                <dd className="font-semibold">
                  {formatDate(detail.row.logDate)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase text-muted">Danışan notu</dt>
                <dd className="mt-1 text-foreground/85">
                  {detail.row.note?.trim() || '—'}
                </dd>
              </div>
            </dl>
            {detail.row.photoUrl ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted">
                  Öğün fotoğrafı
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detail.row.photoUrl}
                  alt="Öğün"
                  className="max-h-80 w-full rounded-xl border border-border-muted object-contain bg-black/5"
                />
              </div>
            ) : (
              <p className="text-sm text-muted">Fotoğraf eklenmemiş.</p>
            )}
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                Koç notu (onay / red mesajında gider)
              </span>
              <textarea
                rows={3}
                value={coachNote}
                onChange={(e) => setCoachNote(e.target.value)}
                placeholder="Opsiyonel geri bildirim…"
                className="mt-1 w-full rounded-lg border border-border-muted bg-background px-3 py-2"
              />
            </label>
          </div>
        ) : detail ? (
          <div className="space-y-4">
            <dl className="grid gap-3 rounded-xl border border-border-muted bg-surface-high/60 p-3.5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase text-muted">Ölçüm tarihi</dt>
                <dd className="font-semibold">
                  {formatDate(detail.row.measuredAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted">Kilo</dt>
                <dd className="text-base font-semibold">
                  {detail.row.weightKg != null ? `${detail.row.weightKg} kg` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted">Bel</dt>
                <dd className="font-semibold">
                  {detail.row.waistCm != null ? `${detail.row.waistCm} cm` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted">Kalça</dt>
                <dd className="font-semibold">
                  {detail.row.hipCm != null ? `${detail.row.hipCm} cm` : '—'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase text-muted">Not</dt>
                <dd className="mt-1 text-foreground/85">
                  {detail.row.note?.trim() || '—'}
                </dd>
              </div>
            </dl>
            <label className="block text-sm">
              <span className="mono text-[10px] uppercase text-muted">
                Koç notu (onay / red mesajında gider)
              </span>
              <textarea
                rows={3}
                value={coachNote}
                onChange={(e) => setCoachNote(e.target.value)}
                placeholder="Opsiyonel geri bildirim…"
                className="mt-1 w-full rounded-lg border border-border-muted bg-background px-3 py-2"
              />
            </label>
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
              onClick={() => openDetail({ kind: 'meal', row: m })}
              className="rounded-xl border border-border-muted bg-surface p-4 text-left transition hover:border-accent/50"
            >
              <div className="flex items-start gap-3">
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photoUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg border border-border-muted object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-border-muted bg-surface-high text-[10px] text-muted">
                    Foto yok
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{userLabel(m.user)}</p>
                      <p className="text-xs text-muted">
                        {mealTypeLabel(m.mealType)} · {formatDate(m.logDate)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase text-accent">
                      bekliyor
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {m.note || 'Not yok'}
                  </p>
                </div>
              </div>
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
              onClick={() => openDetail({ kind: 'measurement', row: m })}
              className="rounded-xl border border-border-muted bg-surface p-4 text-left transition hover:border-accent/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{userLabel(m.user)}</p>
                  <p className="text-xs text-muted">
                    {formatDate(m.measuredAt)}
                  </p>
                </div>
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase text-accent">
                  bekliyor
                </span>
              </div>
              <p className="mt-2 text-sm">
                <span className="font-semibold">
                  {m.weightKg != null ? `${m.weightKg} kg` : '—'}
                </span>
                {m.waistCm != null ? (
                  <span className="text-muted"> · bel {m.waistCm} cm</span>
                ) : null}
                {m.hipCm != null ? (
                  <span className="text-muted"> · kalça {m.hipCm} cm</span>
                ) : null}
              </p>
              {m.note ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted">{m.note}</p>
              ) : null}
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
