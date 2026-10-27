'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminGoogleLoginUrl } from '@/lib/api';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

const ERROR_HINTS: Record<string, string> = {
  allowlist:
    'Bu e-posta yönetici izin listesinde değil. Yetkili bir hesap kullanın.',
  denied: 'Google ile giriş iptal edildi veya reddedildi.',
  invalid_client:
    'Google OAuth Client ID bulunamadı (401 invalid_client). Sunucu deploy/.env içindeki GOOGLE_CLIENT_ID / SECRET değerlerini Google Cloud Console ile eşleştirin; redirect URI: https://api.herbalkapida.com/auth/google/admin/callback',
};

function LoginInner() {
  const params = useSearchParams();
  const raw = params.get('error') || '';
  const error = raw
    ? /allowlist/i.test(raw)
      ? ERROR_HINTS.allowlist
      : /invalid_client/i.test(raw)
        ? ERROR_HINTS.invalid_client
        : decodeURIComponent(raw)
    : null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 20% 10%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, color-mix(in srgb, var(--warning) 12%, transparent), transparent 50%)',
        }}
        aria-hidden
      />
      <div className="page-enter relative w-full max-w-md rounded-2xl border border-border-muted bg-surface/95 p-8 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-base font-bold text-white">
            H
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
              Yönetim paneli
            </p>
            <h1 className="font-display text-xl font-bold text-foreground">
              Herbal Kapıda
            </h1>
          </div>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-muted">
          Panele yalnızca Google ile giriş yapılabilir. İzin listesi dışındaki
          hesaplar reddedilir.
        </p>
        {error ? (
          <p className="mt-4 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="mt-8">
          <GoogleSignInButton
            href={adminGoogleLoginUrl()}
            label="Google ile Giriş"
          />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted">
          Yükleniyor…
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
