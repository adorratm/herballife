"use client";

import { Link } from "@/i18n/routing";
import { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { SuccessModal } from "@/components/SuccessModal";
import { buildWhatsAppUrl, DEFAULT_WHATSAPP_PHONE } from "@/lib/whatsapp";

export default function PaymentNotifyPage() {
  const t = useTranslations("paymentNotify");
  const tForms = useTranslations("forms");
  const STEPS = useMemo(
    () => [
      { n: "1", title: t("step1Title"), body: t("step1Body") },
      { n: "2", title: t("step2Title"), body: t("step2Body") },
      { n: "3", title: t("step3Title"), body: t("step3Body") },
    ],
    [t],
  );

  const [orderNo, setOrderNo] = useState("");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const msg = [
      t("waMessageIntro"),
      `${t("waOrder")}: ${orderNo || "—"}`,
      `${t("waAmount")}: ${amount || "—"} TL`,
      `${t("waSender")}: ${name || "—"}`,
      note ? `${t("waNote")}: ${note}` : "",
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
        title={t("modalTitle")}
        body={t("modalBody")}
        onClose={() => setOpen(false)}
      />

      <section className="page-shell border-b border-outline-variant/20 pt-12 pb-10 md:pt-16">
        <div className="page-enter ">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
            {t("leadBefore")}{" "}
            <Link
              href="/banka-hesaplari"
              className="font-semibold text-primary underline"
            >
              {t("bankAccounts")}
            </Link>{" "}
            {t("leadAfter")}
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
              <span className="field-label">{tForms("orderNumber")}</span>
              <input
                className="field-input"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                placeholder="HL-…"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="field-label">{tForms("amountTry")}</span>
              <input
                className="field-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2990"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="field-label">{tForms("senderName")}</span>
              <input
                className="field-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="field-label">{tForms("noteOptional")}</span>
              <textarea
                className="field-input"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("notePlaceholder")}
              />
            </label>
            <button type="submit" className="btn-cta pressable w-full py-3.5">
              {t("submit")}
            </button>
          </form>

          <aside className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl bg-secondary-container/35 p-6">
              <h2 className="font-display text-lg text-on-surface">
                {t("whyTitle")}
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-on-surface-variant">
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  {t("why1")}
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  {t("why2")}
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  {t("why3")}
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-[#ebece8] bg-surface-container-lowest p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {t("tip")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                {t("tipBody")}
              </p>
              <Link
                href="/banka-hesaplari"
                className="btn-ghost pressable mt-4 inline-flex px-4 py-2 text-xs"
              >
                {t("viewIbans")}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
