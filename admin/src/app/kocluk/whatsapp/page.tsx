'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type BlastResult = {
  id: string;
  message: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  note?: string;
  recipients: Array<{ name: string; phone: string; ok: boolean }>;
};

type BlastRow = {
  id: string;
  message: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  createdAt?: string;
};

const TEMPLATES = [
  {
    id: 'su',
    label: 'Su hatırlatma',
    text: 'Merhaba {Danışan Adı}! Bugün su hedefinizi tamamlamayı unutmayın — Emine Özberk',
  },
  {
    id: 'motivasyon',
    label: 'Motivasyon',
    text: 'Merhaba {Danışan Adı}! Bugün hedefinize bir adım daha yaklaştınız. Öğün düzeninizi sürdürün — Emine Özberk',
  },
  {
    id: 'olcum',
    label: 'Ölçüm günü',
    text: 'Merhaba {Danışan Adı}! Bu haftanın ölçümünü uygulamadan kaydetmeyi unutmayın — Emine Özberk',
  },
];

export default function CoachWhatsappPage() {
  const [message, setMessage] = useState(TEMPLATES[1].text);
  const [result, setResult] = useState<BlastResult | null>(null);
  const [history, setHistory] = useState<BlastRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    void api<BlastRow[]>('/wellness/coach/whatsapp-blasts')
      .then(setHistory)
      .catch(() => undefined);
  }, [result]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await api<BlastResult>('/wellness/coach/whatsapp-blast', {
        method: 'POST',
        body: { message },
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gönderim başarısız');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/kocluk" className="text-sm text-accent underline">
          ← Onay merkezi
        </Link>
        <h2 className="mt-2 text-xl font-semibold">Toplu WhatsApp mesajı</h2>
        <p className="text-sm text-muted">
          Sağlık takibi kaydı olan danışanlara motivasyon mesajı. Demo ortamında
          gerçek API çağrısı yapılmaz; numarası olanlar “gönderildi” sayılır.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-danger/40 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border-muted bg-surface p-5">
        <div>
          <p className="text-xs uppercase text-muted">Şablonlar</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMessage(t.text)}
                className="rounded-full border border-border-muted bg-background px-3 py-1.5 text-xs font-semibold hover:border-accent"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <label className="block text-sm">
          <span className="text-xs uppercase text-muted">Mesaj</span>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border-muted bg-background px-3 py-2"
            required
          />
          <span className="mt-1 block text-xs text-muted">
            {'{Danışan Adı}'} alanı gönderimde otomatik doldurulabilir (demo).
          </span>
        </label>
        <div className="rounded-xl bg-background p-3 text-sm">
          <p className="text-xs uppercase text-muted">Önizleme</p>
          <p className="mt-1 whitespace-pre-wrap">{message}</p>
        </div>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {sending ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Gönderiliyor…
            </>
          ) : (
            'WhatsApp ile gönder'
          )}
        </button>
      </form>

      {result ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl border border-accent/30 bg-surface p-6 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-lg">Mesajlar iletildi — gönderim raporu</h3>
            <button
              type="button"
              className="rounded-full px-3 py-1 text-sm text-muted hover:bg-background"
              onClick={() => setResult(null)}
            >
              Kapat
            </button>
          </div>
          <p className="text-sm text-muted">{result.note}</p>
          <p className="text-sm">
            Alıcı: {result.recipientCount} · Başarılı: {result.sentCount} ·
            Numarasız: {result.failedCount}
          </p>
          <ul className="max-h-48 space-y-1 overflow-auto text-sm">
            {result.recipients.map((r) => (
              <li key={r.phone + r.name}>
                {r.name} · {r.phone || 'telefon yok'} ·{' '}
                {r.ok ? 'Tamam' : 'atlandı'}
              </li>
            ))}
          </ul>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <h3 className="font-semibold">Geçmiş</h3>
        {history.map((h) => (
          <div
            key={h.id}
            className="rounded-xl border border-border-muted bg-surface px-4 py-3 text-sm"
          >
            <p className="line-clamp-2">{h.message}</p>
            <p className="mt-1 text-xs text-muted">
              {h.sentCount}/{h.recipientCount} · {h.createdAt || ''}
            </p>
          </div>
        ))}
        {!history.length ? (
          <p className="text-sm text-muted">Henüz gönderim yok</p>
        ) : null}
      </div>
    </div>
  );
}
