"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { SuccessModal } from "@/components/SuccessModal";
import { buildWhatsAppUrl, DEFAULT_WHATSAPP_PHONE } from "@/lib/whatsapp";

const STEPS = [
  {
    n: "1",
    title: "Havale",
    body: "Banka hesaplarından birine tutarı gönderin.",
  },
  {
    n: "2",
    title: "Bildirim formu",
    body: "Sipariş no, tutar ve gönderen bilgisini yazın.",
  },
  {
    n: "3",
    title: "Onay",
    body: "WhatsApp bildirimi sonrası siparişiniz işleme alınır.",
  },
];

export default function PaymentNotifyPage() {
  const [orderNo, setOrderNo] = useState("");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const msg = [
      "Merhaba, ödeme bildirimi:",
      `Sipariş: ${orderNo || "—"}`,
      `Tutar: ${amount || "—"} TL`,
      `Gönderen: ${name || "—"}`,
      note ? `Not: ${note}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const url = buildWhatsAppUrl(
      process.env.NEXT_PUBLIC_WHATSAPP_PHONE || DEFAULT_WHATSAPP_PHONE,
      msg,
    );
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(true);
  }

  return (
    <div className="pb-16">
      <SuccessModal
        open={open}
        title="Bildirim hazır"
        body="WhatsApp üzerinden ödeme bildiriminiz iletildi. Onay sonrası siparişiniz işleme alınır."
        onClose={() => setOpen(false)}
      />

      <section className="page-shell border-b border-outline-variant/20 pt-12 pb-10 md:pt-16">
        <div className="page-enter max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Havale · EFT
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
            Ödeme bildirimi
          </h1>
          <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
            Havale yaptıktan sonra formu doldurun. Bilgiler WhatsApp ile
            distribütöre iletilir. Hesap bilgileri için{" "}
            <Link
              href="/banka-hesaplari"
              className="font-semibold text-primary underline"
            >
              banka hesapları
            </Link>{" "}
            sayfasına bakın.
          </p>
        </div>
      </section>

      <section className="page-shell py-10">
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="card-motion flex items-start gap-3 rounded-xl border border-[#ebece8] bg-surface-container-lowest p-4 shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
                {s.n}
              </span>
              <div>
                <p className="text-sm font-semibold text-on-surface">{s.title}</p>
                <p className="mt-0.5 text-xs text-on-surface-variant">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <form
            onSubmit={onSubmit}
            className="panel-motion space-y-4 rounded-2xl border border-[#ebece8] bg-surface-container-lowest p-6 shadow-sm lg:col-span-7"
          >
            <label className="block text-sm">
              <span className="field-label">Sipariş no</span>
              <input
                className="field-input"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                placeholder="HL-…"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="field-label">Tutar (TL)</span>
              <input
                className="field-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2990"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="field-label">Gönderen ad soyad</span>
              <input
                className="field-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="field-label">Not (isteğe bağlı)</span>
              <textarea
                className="field-input"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Dekont saati, banka adı…"
              />
            </label>
            <button type="submit" className="btn-cta pressable w-full py-3.5">
              WhatsApp ile bildir
            </button>
          </form>

          <aside className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl bg-secondary-container/35 p-6">
              <h2 className="font-display text-lg text-on-surface">
                Neden bildirim?
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-on-surface-variant">
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  Ödemenizi siparişinizle eşleştiririz
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  Onay sonrası hızlıca kargoya hazırlanır
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  Takip kodunu size iletiriz
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-[#ebece8] bg-surface-container-lowest p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                İpucu
              </p>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Dekont ekran görüntüsünü WhatsApp sohbetine eklemek onayı
                hızlandırır.
              </p>
              <Link
                href="/banka-hesaplari"
                className="btn-ghost pressable mt-4 inline-flex px-4 py-2 text-xs"
              >
                IBAN’ları gör
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
