"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { AuthField, AuthShell } from "@/components/AuthModal";
import { ApiError, forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const t = useTranslations("authPassword");
  const tAuth = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("requestFailed"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell mode="login" title={t("forgotTitle")} error={error}>
      {done ? (
        <div className="space-y-4">
          <p className="font-meta text-xs uppercase leading-relaxed text-secondary">
            {t("forgotDone")}
          </p>
          <Link href="/giris" className="btn-cta inline-block px-6 py-3 text-xs">
            {t("backToLogin")}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <p className="font-meta text-[11px] uppercase leading-relaxed text-secondary">
            {t("forgotLead")}
          </p>
          <AuthField
            id="email"
            label={tAuth("emailLabel")}
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-cta w-full py-4 text-xs"
          >
            {loading ? t("sending") : t("sendResetLink")}
          </button>
          <p className="font-meta text-[11px] uppercase text-secondary">
            <Link href="/giris" className="text-primary underline">
              {t("backToLogin")}
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
