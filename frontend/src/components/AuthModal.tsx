"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { oauthUrl } from "@/lib/api";
import {
  loginHref,
  registerHref,
  rememberAuthNext,
  safeNextPath,
} from "@/lib/auth";

type AuthMode = "login" | "register";

type Props = {
  mode: AuthMode;
  children: ReactNode;
  error?: string | null;
  title?: string;
  nextPath?: string;
};

export function AuthShell({
  mode,
  children,
  error,
  title,
  nextPath,
}: Props) {
  const t = useTranslations("auth");
  const isLogin = mode === "login";
  const next = safeNextPath(nextPath, "/hesabim");
  const registerLink =
    registerHref(next === "/hesabim" ? null : next);
  const loginLink = loginHref(next === "/hesabim" ? null : next);

  return (
    <div className="page-shell mx-auto max-w-xl py-16 md:py-24">
      <div className="page-enter">
        <div className="mb-2 font-meta text-xs uppercase tracking-widest text-primary">
          {isLogin ? t("loginEyebrow") : t("registerEyebrow")}
        </div>
        <h1 className="font-display text-4xl leading-none md:text-5xl">
          {title || (isLogin ? t("loginTitle") : t("registerTitle"))}
        </h1>
        <p className="mt-4 font-meta text-xs uppercase tracking-widest text-secondary">
          {t("subtitle")}
        </p>
      </div>

      <div
        className="mt-10 industrial-border bg-surface-container-low p-6 md:p-8 animate-fade-up"
        style={{ animationDelay: "160ms" }}
      >
        {error ? (
          <div className="mb-6 border border-error/40 bg-error/10 px-4 py-3 font-meta text-xs uppercase text-error">
            {/invalid_client/i.test(error)
              ? "Google OAuth Client ID geçersiz (401). Sunucu GOOGLE_CLIENT_ID / SECRET ve Console redirect URI’lerini kontrol edin."
              : error}
          </div>
        ) : null}
        {children}
        <OAuthLinks nextPath={next} />
        <p className="mt-8 font-meta text-[11px] uppercase text-secondary">
          {isLogin ? (
            <>
              {t("noAccount")}{" "}
              <Link href={registerLink} className="text-primary underline">
                {t("registerLink")}
              </Link>
            </>
          ) : (
            <>
              {t("hasAccount")}{" "}
              <Link href={loginLink} className="text-primary underline">
                {t("loginLink")}
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export function OAuthLinks({ nextPath }: { nextPath?: string }) {
  const t = useTranslations("auth");
  const next = safeNextPath(nextPath, "/hesabim");

  return (
    <div className="mt-8 border-t border-outline-variant/20 pt-8">
      <p className="mb-4 font-meta text-[10px] uppercase tracking-widest text-on-surface-variant">
        {t("socialLogin")}
      </p>
      <GoogleSignInButton
        href={oauthUrl("google")}
        label={t("googleContinue")}
        onClick={() => rememberAuthNext(next)}
      />
    </div>
  );
}

export function AuthField({
  label,
  id,
  type = "text",
  value,
  onChange,
  autoComplete,
  required,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="field-input"
      />
    </div>
  );
}
