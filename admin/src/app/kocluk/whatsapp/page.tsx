'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Modal } from '@/components/Modal';

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
    <div className="mx-auto  space-y-8">
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

      <Modal
        open={Boolean(result)}
        onClose={() => setResult(null)}
        size="lg"
        title="Gönderim raporu"
        description={result?.note || 'Mesajlar iletildi'}
        footer={
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setResult(null)}
          >
            Tamam
          </button>
        }
      >
        {result ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Alıcı', value: result.recipientCount },
                { label: 'Başarılı', value: result.sentCount },
                { label: 'Numarasız', value: result.failedCount },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border-muted bg-surface-high/50 px-2 py-3"
                >
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            <ul className="max-h-52 space-y-1.5 overflow-auto rounded-xl border border-border-muted p-3 text-sm">
              {result.recipients.map((r) => (
                <li
                  key={r.phone + r.name}
                  className="flex items-center justify-between gap-2 border-b border-border-muted/60 py-1.5 last:border-0"
                >
                  <span className="min-w-0 truncate">
                    {r.name}
                    <span className="text-muted">
                      {' '}
                      · {r.phone || 'telefon yok'}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-xs font-semibold ${
                      r.ok ? 'text-accent' : 'text-muted'
                    }`}
                  >
                    {r.ok ? 'Tamam' : 'Atlandı'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Modal>

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
