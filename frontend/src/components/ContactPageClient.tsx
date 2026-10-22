"use client";

import { FormEvent, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { submitContact } from "@/lib/api";
import type { SiteSettings } from "@/lib/cms";
import {
  buildWhatsAppUrl,
  resolveWhatsAppPhone,
} from "@/lib/whatsapp";

type Props = {
  contact: SiteSettings["contact"];
  whatsapp?: SiteSettings["whatsapp"];
  brandName: string;
  title: string;
  subtitle: string;
};

export function ContactPageClient({
  contact,
  whatsapp,
  brandName,
  title,
  subtitle,
}: Props) {
  const [form, setForm] = useState({
    senderName: "",
    senderEmail: "",
    protocolType: "general",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    try {
      await submitContact(form);
      setStatus("ok");
      setForm({
        senderName: "",
        senderEmail: "",
        protocolType: "general",
        message: "",
      });
    } catch {
      setStatus("err");
    } finally {
      setLoading(false);
    }
  }

  const telHref = contact.phone
    ? `tel:${contact.phone.replace(/\s/g, "")}`
    : undefined;
  const mailHref = contact.email ? `mailto:${contact.email}` : undefined;
  const waEnabled = whatsapp?.enabled !== false;
  const waPhone = resolveWhatsAppPhone({
    whatsappPhone: whatsapp?.phone,
    contactPhone: contact.phone,
  });
  const waHref = waEnabled
    ? buildWhatsAppUrl(
        waPhone,
        `Merhaba, ${brandName} iletişim sayfasından yazıyorum.`,
      )
    : undefined;

  return (
    <div className="bg-white pb-16">
      <header className="border-b border-outline-variant bg-[#f7f8f6]">
        <div className="page-shell page-hero border-0 bg-transparent">
          <p className="page-kicker">İletişim</p>
          <h1 className="page-title">{title}</h1>
          {subtitle ? <p className="page-lead">{subtitle}</p> : null}
        </div>
      </header>

      <section className="page-shell grid grid-cols-1 gap-8 py-10 md:grid-cols-12 md:gap-10 md:py-12">
        <div className="flex flex-col gap-5 md:col-span-5">
          <Reveal variant="left">
            <div className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm md:p-8">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                {brandName}
              </p>
              {contact.locationLabel ? (
                <h2 className="mt-2 font-display text-2xl font-bold text-on-surface md:text-3xl">
                  {contact.locationLabel}
                </h2>
              ) : null}
              {contact.address ? (
                <p className="mt-4 border-t border-outline-variant pt-4 text-sm leading-relaxed text-on-surface-variant">
                  {contact.address}
                </p>
              ) : null}

              <ul className="mt-6 space-y-3 text-sm">
                {contact.phone ? (
                  <li>
                    <span className="block text-xs font-semibold text-on-surface-variant">
                      Telefon
                    </span>
                    <a
                      href={telHref}
                      className="mt-0.5 font-semibold text-primary hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </li>
                ) : null}
                {contact.email ? (
                  <li>
                    <span className="block text-xs font-semibold text-on-surface-variant">
                      E-posta
                    </span>
                    <a
                      href={mailHref}
                      className="mt-0.5 font-semibold text-primary hover:underline"
                    >
                      {contact.email}
                    </a>
                  </li>
                ) : null}
                {waHref ? (
                  <li>
                    <span className="block text-xs font-semibold text-on-surface-variant">
                      WhatsApp
                    </span>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-flex cursor-pointer font-semibold text-primary hover:underline"
                    >
                      Hemen yaz
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          </Reveal>

          {contact.hours ? (
            <Reveal variant="left" delay={80}>
              <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 md:p-8">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Çalışma saatleri
                </p>
                <p className="mt-3 text-sm leading-relaxed text-on-surface">
                  {contact.hours}
                </p>
              </div>
            </Reveal>
          ) : null}

          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#1ebe57]"
            >
              WhatsApp ile yaz
            </a>
          ) : null}
        </div>

        <Reveal className="md:col-span-7" variant="right" delay={60}>
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm md:p-8"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Mesaj gönder
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-on-surface">
              Bize ulaşın
            </h2>
            <div className="mt-6 grid gap-4">
              <div>
                <label className="field-label">Ad Soyad</label>
                <input
                  required
                  className="field-input"
                  value={form.senderName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, senderName: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="field-label">E-posta</label>
                <input
                  required
                  type="email"
                  className="field-input"
                  value={form.senderEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, senderEmail: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="field-label">Konu</label>
                <select
                  className="field-input"
                  value={form.protocolType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, protocolType: e.target.value }))
                  }
                >
                  <option value="general">Genel</option>
                  <option value="coaching">Beslenme danışmanlığı</option>
                  <option value="logistics">Sipariş / kargo</option>
                  <option value="technical">Teknik</option>
                </select>
              </div>
              <div>
                <label className="field-label">Mesaj</label>
                <textarea
                  required
                  rows={5}
                  className="field-input resize-y"
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-cta cursor-pointer py-3.5 text-sm disabled:opacity-60"
              >
                {loading ? "Gönderiliyor…" : "Gönder"}
              </button>
              {status === "ok" ? (
                <p className="text-sm font-medium text-primary">
                  Mesajınız alındı. En kısa sürede dönüş yapacağız.
                </p>
              ) : null}
              {status === "err" ? (
                <p className="text-sm font-medium text-error">
                  Gönderim başarısız. Lütfen daha sonra tekrar deneyin.
                </p>
              ) : null}
            </div>
          </form>
        </Reveal>
      </section>
    </div>
  );
}
