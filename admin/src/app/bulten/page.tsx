'use client';

import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { asArray } from '@/lib/utils';
import { DataTable } from '@/components/DataTable';
import type { NewsletterSubscriber } from '@/lib/types';

function NewsletterPageInner() {
  const searchParams = useSearchParams();
  const filterQ = (searchParams.get('q') || '').trim().toLowerCase();

  const [rows, setRows] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignHtml, setCampaignHtml] = useState('');
  const [campaignBusy, setCampaignBusy] = useState(false);
  const [campaignMsg, setCampaignMsg] = useState<string | null>(null);

  const visible = useMemo(() => {
    if (!filterQ) return rows;
    return rows.filter((r) => {
      const hay = [r.email, r.source].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(filterQ);
    });
  }, [rows, filterQ]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await api<unknown>('/newsletter/subscribers').catch(() =>
          api<unknown>('/contact/newsletter'),
        );
        if (!cancelled) setRows(asArray<NewsletterSubscriber>(data));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Aboneler yüklenemedi');
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function sendCampaign(e: FormEvent) {
    e.preventDefault();
    setCampaignBusy(true);
    setCampaignMsg(null);
    setError(null);
    try {
      const res = await api<{ queued: number; campaignId: string }>(
        '/newsletter/campaign',
        {
          method: 'POST',
          body: {
            subject: campaignSubject.trim(),
            html: campaignHtml.trim(),
          },
        },
      );
      setCampaignMsg(
        `${res.queued} aboneye e-posta kuyruğa alındı (kampanya ${res.campaignId.slice(0, 8)}…).`,
      );
      setCampaignSubject('');
      setCampaignHtml('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kampanya gönderilemedi');
    } finally {
      setCampaignBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => void sendCampaign(e)}
        className="space-y-3 border border-border-muted bg-surface p-4"
      >
        <h2 className="mono text-xs uppercase tracking-widest text-muted">
          Kampanya gönder
        </h2>
        <p className="text-sm text-muted">
          Aktif abonelere BullMQ <code className="mono text-xs">email-marketing</code>{' '}
          kuyruğu üzerinden gönderilir (gönderen: info@herbalkapida.com).
        </p>
        <label className="block text-sm">
          <span className="mono text-[10px] uppercase text-muted">Konu</span>
          <input
            required
            value={campaignSubject}
            onChange={(e) => setCampaignSubject(e.target.value)}
            className="mt-1 w-full border border-border-muted bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mono text-[10px] uppercase text-muted">HTML gövde</span>
          <textarea
            required
            rows={8}
            value={campaignHtml}
            onChange={(e) => setCampaignHtml(e.target.value)}
            className="mt-1 w-full border border-border-muted bg-background px-3 py-2 font-mono text-xs"
            placeholder="<p>Merhaba, yeni kampanyamız…</p>"
          />
        </label>
        <button
          type="submit"
          disabled={campaignBusy}
          className="border border-accent bg-accent px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {campaignBusy ? 'Kuyruğa alınıyor…' : 'Kampanyayı kuyruğa al'}
        </button>
        {campaignMsg ? (
          <p className="text-sm text-success">{campaignMsg}</p>
        ) : null}
      </form>

      {error ? (
        <p className="border border-danger/40 bg-surface px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <p className="text-sm text-muted">
        {loading
          ? 'Yükleniyor…'
          : filterQ
            ? `${visible.length} / ${rows.length} abone`
            : `${rows.length} abone`}
      </p>
      <DataTable
        rows={visible}
        rowKey={(r) => r.id}
        emptyMessage={loading ? 'Yükleniyor…' : 'Abone yok'}
        columns={[
          {
            key: 'email',
            header: 'E-posta',
            render: (r) => <span className="mono text-xs">{r.email}</span>,
          },
          {
            key: 'source',
            header: 'Kaynak',
            render: (r) => r.source || '—',
          },
          {
            key: 'active',
            header: 'Durum',
            render: (r) => (r.isActive ? 'aktif' : 'pasif'),
          },
          {
            key: 'date',
            header: 'Kayıt',
            render: (r) =>
              r.createdAt
                ? new Date(r.createdAt).toLocaleString('tr-TR')
                : '—',
          },
        ]}
      />
    </div>
  );
}

export default function NewsletterPage() {
  return (
    <Suspense
      fallback={<p className="mono text-sm text-muted">Yükleniyor…</p>}
    >
      <NewsletterPageInner />
    </Suspense>
  );
}
