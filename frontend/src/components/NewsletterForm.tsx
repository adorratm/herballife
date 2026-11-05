"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { subscribeNewsletter } from "@/lib/api";

export function NewsletterForm({
  variant = "default",
}: {
  /** footer: koyu yeşil şerit üzerinde tek satır */
  variant?: "default" | "footer";
}) {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    try {
      await subscribeNewsletter(email);
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("err");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "footer") {
    return (
      <form onSubmit={onSubmit} className="w-full">
        <div className="flex w-full items-stretch gap-1.5 rounded-xl bg-white p-1.5 shadow-lg shadow-black/10">
          <label className="sr-only" htmlFor="footer-newsletter-email">
            {t("emailPlaceholder")}
          </label>
          <input
            id="footer-newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="min-w-0 flex-1 bg-transparent px-3 text-sm text-on-surface outline-none placeholder:text-outline"
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 cursor-pointer rounded-lg bg-[#e8772e] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#d4661f] disabled:opacity-60 sm:px-6"
          >
            {loading ? t("submitting") : t("submit")}
          </button>
        </div>
        {status === "ok" ? (
          <p className="mt-2 text-xs font-semibold text-[#8fe0b6]" role="status">
            {t("success")}
          </p>
        ) : null}
        {status === "err" ? (
          <p className="mt-2 text-xs font-semibold text-[#ffc9b0]" role="alert">
            {t("error")}
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-xl flex-col gap-4 md:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("emailPlaceholder")}
        className="field-input grow text-primary"
      />
      <button type="submit" disabled={loading} className="btn-cta px-8 py-4 text-xs font-bold">
        {loading ? t("submitting") : t("submit")}
      </button>
      {status === "ok" ? (
        <p className="w-full font-meta text-[11px] uppercase text-primary md:absolute md:mt-20">
          {t("success")}
        </p>
      ) : null}
      {status === "err" ? (
        <p className="w-full font-meta text-[11px] uppercase text-error md:absolute md:mt-20">
          {t("error")}
        </p>
      ) : null}
    </form>
  );
}
