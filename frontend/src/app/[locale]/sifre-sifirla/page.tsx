"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Suspense, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AuthField, AuthShell } from "@/components/AuthModal";
import { ApiError, resetPassword } from "@/lib/api";

function ResetInner() {
  const t = useTranslations("authPassword");
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError(t("invalidLink"));
      return;
    }
    if (password !== password2) {
      setError(t("passwordMismatch"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("resetFailed"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell mode="login" title={t("resetTitle")} error={error}>
      {done ? (
        <div className="space-y-4">
          <p className="font-meta text-xs uppercase leading-relaxed text-secondary">
            {t("resetDone")}
          </p>
          <Link href="/giris" className="btn-cta inline-block px-6 py-3 text-xs">
            {t("signIn")}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          {!token ? (
            <p className="font-meta text-xs uppercase text-error">
              {t("missingToken")}
            </p>
          ) : null}
          <AuthField
            id="password"
            label={t("newPassword")}
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            required
          />
          <AuthField
            id="password2"
            label={t("newPasswordRepeat")}
            type="password"
            value={password2}
            onChange={setPassword2}
            autoComplete="new-password"
            required
          />
          <button
            type="submit"
            disabled={loading || !token}
            className="btn-cta w-full py-4 text-xs disabled:opacity-50"
          >
            {loading ? t("saving") : t("savePassword")}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("authPassword");
  return (
    <Suspense
      fallback={
        <p className="page-shell py-16 font-meta text-xs uppercase text-secondary">
          {t("loading")}
        </p>
      }
    >
      <ResetInner />
    </Suspense>
  );
}
