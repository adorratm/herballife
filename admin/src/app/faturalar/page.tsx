'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL, api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { asPaged } from '@/lib/utils';

type Invoice = {
  id: string;
  invoiceNumber: string;
  direction: string;
  status: string;
  total: string;
  issueDate: string;
  edocumentType?: string;
  okcSaleId?: string | null;
  orderId?: string | null;
  party?: { title?: string } | null;
};

type Party = { id: string; title: string; type: string };

function istanbulToday() {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'Europe/Istanbul',
  });
}

function edocLabel(type?: string) {
  if (type === 'einvoice') return 'e-Fatura';
  return 'e-Arşiv';
}

export default function InvoicesAdminPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [direction, setDirection] = useState<'sales' | 'purchase'>('sales');
  const [partyId, setPartyId] = useState('');
  const [description, setDescription] = useState('');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('');
  const [vatRate, setVatRate] = useState('20');
  const [edocumentType, setEdocumentType] = useState<'earchive' | 'einvoice'>(
    'earchive',
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inv, p] = await Promise.all([
        api<unknown>('/accounting/invoices?limit=100&receiptOnly=false'),
        api<unknown>('/accounting/parties?limit=100'),
      ]);
      setItems(asPaged<Invoice>(inv).items);
      setParties(asPaged<Party>(p).items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Liste alınamadı');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api('/accounting/invoices', {
        method: 'POST',
        body: {
          direction,
          edocumentType,
          partyId: partyId || undefined,
          issueDate: istanbulToday(),
          lines: [
            {
              description,
              quantity: Number(qty),
              unitPrice: Number(price),
              vatRate: Number(vatRate),
            },
          ],
        },
      });
      setDescription('');
      setPrice('');
      setMessage('Taslak fatura oluşturuldu');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  }

  async function toReceipt(id: string) {
    try {
      await api(`/accounting/invoices/${id}/to-receipt`, { method: 'POST' });
      setMessage('Fişe çevrildi — Fişler listesinde görünür');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dönüşüm hatası');
    }
  }

  async function queue(id: string) {
    try {
      await api(`/accounting/invoices/${id}/queue`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kuyruk hatası');
    }
  }

  async function send(id: string) {
    try {
      await api(`/accounting/invoices/${id}/send`, { method: 'POST' });
      setMessage('GİB gönderim isteği tamamlandı');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gönderim hatası');
    }
  }

  async function printHtml(id: string) {
    const token = getToken();
    const res = await fetch(`${API_URL}/accounting/invoices/${id}/html`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const html = await res.text();
    if (!res.ok) {
      setError('Yazdırma alınamadı');
      return;
    }
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Faturalar</h2>
        <p className="text-sm text-muted">
          e-Arşiv / e-Fatura. Taslakken fişe çevrilebilir; GİB kuyruk ve gönderim.
        </p>
      </div>

      {error ? (
        <p className="border border-danger/40 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="border border-accent/40 px-3 py-2 text-sm text-accent">
          {message}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {loading ? (
            <p className="text-sm text-muted">Yükleniyor…</p>
          ) : (
            <div className="overflow-x-auto border border-border-muted">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border-muted bg-surface mono text-[10px] uppercase text-muted">
                  <tr>
                    <th className="px-3 py-2">No</th>
                    <th className="px-3 py-2">Tip</th>
                    <th className="px-3 py-2">Cari</th>
                    <th className="px-3 py-2">Durum</th>
                    <th className="px-3 py-2">Tutar</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((inv) => {
                    const canGib =
                      !inv.okcSaleId &&
                      (inv.status === 'draft' || inv.status === 'queued');
                    return (
                      <tr
                        key={inv.id}
                        className="border-b border-border-muted/60"
                      >
                        <td className="mono px-3 py-2">{inv.invoiceNumber}</td>
                        <td className="px-3 py-2">
                          {edocLabel(inv.edocumentType)}
                        </td>
                        <td className="px-3 py-2">
                          {inv.party?.title || '—'}
                        </td>
                        <td className="px-3 py-2">{inv.status}</td>
                        <td className="px-3 py-2 text-accent">
                          {inv.total} ₺
                        </td>
                        <td className="space-x-2 whitespace-nowrap px-3 py-2 text-xs">
                          {inv.status === 'draft' ||
                          inv.status === 'rejected' ? (
                            <button
                              type="button"
                              className="text-accent hover:underline"
                              onClick={() => void toReceipt(inv.id)}
                            >
                              Fişe çevir
                            </button>
                          ) : null}
                          {canGib && inv.status === 'draft' ? (
                            <button
                              type="button"
                              className="text-accent hover:underline"
                              onClick={() => void queue(inv.id)}
                            >
                              Kuyruk
                            </button>
                          ) : null}
                          {canGib ? (
                            <button
                              type="button"
                              className="text-accent hover:underline"
                              onClick={() => void send(inv.id)}
                            >
                              GİB
                            </button>
                          ) : null}
                          {inv.orderId ? (
                            <Link
                              href={`/siparisler/${inv.orderId}`}
                              className="text-muted hover:underline"
                            >
                              Sipariş
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            className="text-muted hover:underline"
                            onClick={() => void printHtml(inv.id)}
                          >
                            Yazdır
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!items.length ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-muted">
                        Fatura yok
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-3 border border-border-muted p-4 lg:col-span-2"
        >
          <p className="mono text-[10px] uppercase text-muted">Taslak fatura</p>
          <select
            value={direction}
            onChange={(e) =>
              setDirection(e.target.value as 'sales' | 'purchase')
            }
            className="w-full border border-border-muted bg-background px-3 py-2 text-sm"
          >
            <option value="sales">Satış</option>
            <option value="purchase">Alış</option>
          </select>
          <select
            value={edocumentType}
            onChange={(e) =>
              setEdocumentType(e.target.value as 'earchive' | 'einvoice')
            }
            className="w-full border border-border-muted bg-background px-3 py-2 text-sm"
          >
            <option value="earchive">e-Arşiv</option>
            <option value="einvoice">e-Fatura</option>
          </select>
          <select
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            className="w-full border border-border-muted bg-background px-3 py-2 text-sm"
          >
            <option value="">Cari (opsiyonel)</option>
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Satır açıklaması"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-border-muted bg-background px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Miktar"
              className="border border-border-muted bg-background px-3 py-2 text-sm"
            />
            <input
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Birim fiyat"
              className="border border-border-muted bg-background px-3 py-2 text-sm"
            />
            <input
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
              placeholder="KDV %"
              className="border border-border-muted bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-motion bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor…' : 'Fatura oluştur'}
          </button>
        </form>
      </div>
    </div>
  );
}
