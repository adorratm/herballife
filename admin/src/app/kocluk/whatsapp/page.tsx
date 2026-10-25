'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Modal } from '@/components/Modal';

type BlastResult = {
  id: string;
  message: string;
  templateName: string;
  languageCode: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  queued?: boolean;
  recipients: Array<{
    name: string;
    phone: string;
    ok: boolean;
    error?: string;
    messageId?: string;
  }>;
};

type BlastRow = {
  id: string;
  message: string;
  templateName?: string | null;
  languageCode?: string | null;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  createdAt?: string;
};

const PRESETS = [
  {
    id: 'motivasyon',
    label: 'Motivasyon',
    templateName: 'coach_motivation',
    bodyParams: ['{{1}}'],
  },
  {
    id: 'su',
    label: 'Su hatırlatma',
    templateName: 'coach_water_reminder',
    bodyParams: ['{{1}}'],
  },
  {
    id: 'olcum',
    label: 'Ölçüm günü',
    templateName: 'coach_measurement_reminder',
    bodyParams: ['{{1}}'],
  },
];

export default function CoachWhatsappPage() {
  const [templateName, setTemplateName] = useState(PRESETS[0].templateName);
  const [languageCode, setLanguageCode] = useState('tr');
  const [bodyParamsText, setBodyParamsText] = useState('{{1}}');
  const [result, setResult] = useState<BlastResult | null>(null);
  const [history, setHistory] = useState<BlastRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [pollingId, setPollingId] = useState<string | null>(null);

  useEffect(() => {
    void api<BlastRow[]>('/wellness/coach/whatsapp-blasts')
      .then(setHistory)
      .catch(() => undefined);
  }, [result?.id]);

  useEffect(() => {
    if (!pollingId) return;
    const timer = setInterval(() => {
      void api<BlastResult>(`/wellness/coach/whatsapp-blasts/${pollingId}`)
        .then((blast) => {
          const done =
            blast.sentCount + blast.failedCount >= blast.recipientCount;
          setResult({
            id: blast.id,
            message: blast.message,
            templateName: blast.templateName,
            languageCode: blast.languageCode,
            recipientCount: blast.recipientCount,
            sentCount: blast.sentCount,
            failedCount: blast.failedCount,
            recipients: blast.recipients || [],
          });
          if (done) {
            setPollingId(null);
          }
        })
        .catch(() => setPollingId(null));
    }, 1500);
    return () => clearInterval(timer);
  }, [pollingId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const bodyParams = bodyParamsText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const res = await api<BlastResult>('/wellness/coach/whatsapp-blast', {
        method: 'POST',
        body: {
          templateName: templateName.trim(),
          languageCode: languageCode.trim() || 'tr',
          bodyParams: bodyParams.length ? bodyParams : ['{{1}}'],
        },
      });
      setResult(res);
      setPollingId(res.id);
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
          Meta Business onaylı şablonlar ile danışanlara gönderim.{' '}
          <code className="text-xs">WHATSAPP_PROVIDER=meta</code> ve şablon
          adını panelden girin. {'{{1}}'} danışan adı ile doldurulur.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-danger/40 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border border-border-muted bg-surface p-5"
      >
        <div>
          <p className="text-xs uppercase text-muted">Şablon ön ayarları</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTemplateName(t.templateName);
                  setBodyParamsText(t.bodyParams.join('\n'));
                }}
                className="rounded-full border border-border-muted bg-background px-3 py-1.5 text-xs font-semibold hover:border-accent"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <label className="block text-sm">
          <span className="text-xs uppercase text-muted">Meta şablon adı</span>
          <input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border-muted bg-background px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs uppercase text-muted">Dil kodu</span>
          <input
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            placeholder="tr"
            className="mt-1 w-full rounded-lg border border-border-muted bg-background px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs uppercase text-muted">
            Body parametreleri (satır başına bir değer)
          </span>
          <textarea
            rows={3}
            value={bodyParamsText}
            onChange={(e) => setBodyParamsText(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border-muted bg-background px-3 py-2 font-mono text-sm"
          />
          <span className="mt-1 block text-xs text-muted">
            İlk parametre için {'{{1}}'} kullanın — gönderimde danışan adı
            yazılır.
          </span>
        </label>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {sending ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Kuyruğa alınıyor…
            </>
          ) : (
            'WhatsApp kuyruğuna ekle'
          )}
        </button>
      </form>

      <Modal
        open={Boolean(result)}
        onClose={() => {
          setResult(null);
          setPollingId(null);
        }}
        size="lg"
        title="Gönderim raporu"
        description={
          pollingId
            ? 'Mesajlar sırayla iletiliyor…'
            : 'Gönderim tamamlandı'
        }
        footer={
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => {
              setResult(null);
              setPollingId(null);
            }}
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
                { label: 'Başarısız', value: result.failedCount },
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
                    {r.error ? (
                      <span className="block text-xs text-danger">{r.error}</span>
                    ) : null}
                  </span>
                  <span
                    className={`shrink-0 text-xs font-semibold ${
                      r.ok ? 'text-accent' : 'text-muted'
                    }`}
                  >
                    {r.ok ? 'Gönderildi' : r.phone ? 'Bekliyor / hata' : 'Atlandı'}
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
            <p className="font-mono text-xs text-muted">
              {h.templateName || '—'} · {h.languageCode || 'tr'}
            </p>
            <p className="line-clamp-2">{h.message}</p>
            <p className="mt-1 text-xs text-muted">
              {h.sentCount}/{h.recipientCount} başarılı · {h.failedCount}{' '}
              başarısız · {h.createdAt || ''}
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
