"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthField, AuthShell } from "@/components/AuthModal";
import { register } from "@/lib/api";
import {
  isAuthenticated,
  rememberAuthNext,
  safeNextPath,
  setToken,
} from "@/lib/auth";
import { fetchCart } from "@/lib/cart";

function RegisterInner() {
  const tAuth = useTranslations("auth");
  const tForms = useTranslations("forms");
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"), "/hesabim");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    rememberAuthNext(next);
    if (isAuthenticated()) {
      router.replace(next);
    }
  }, [next, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await register({ email, password, firstName, lastName });
      setToken(res.accessToken);
      await fetchCart().catch(() => null);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : tAuth("registerFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell mode="register" error={error} nextPath={next}>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthField
            id="firstName"
            label={tForms("firstName")}
            value={firstName}
            onChange={setFirstName}
            autoComplete="given-name"
          />
          <AuthField
            id="lastName"
            label={tForms("lastName")}
            value={lastName}
            onChange={setLastName}
            autoComplete="family-name"
          />
        </div>
        <AuthField
          id="email"
          label={tForms("email")}
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <AuthField
          id="password"
          label={tForms("password")}
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-cta w-full py-4 text-xs"
        >
          {loading ? tAuth("creating") : tAuth("createAccount")}
        </button>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <p className="page-shell py-16 font-meta text-xs uppercase text-secondary">
          Yükleniyor…
        </p>
      }
    >
      <RegisterInner />
    </Suspense>
  );
}
