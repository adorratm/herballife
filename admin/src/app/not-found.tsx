import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sayfa bulunamadı · Yönetim',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 20% 10%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, color-mix(in srgb, var(--success) 12%, transparent), transparent 50%)',
        }}
        aria-hidden
      />

      <div className="page-enter relative w-full max-w-lg rounded-2xl border border-border-muted bg-surface/95 p-8 text-center shadow-md backdrop-blur-sm md:p-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          404
        </span>

        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Sayfa bulunamadı
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
          Bu yol yönetim panelinde yok veya taşınmış olabilir. Panele dönüp
          devam edebilirsiniz.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="admin-btn admin-btn-primary px-6 py-2.5 text-sm">
            Panele dön
          </Link>
          <Link href="/urunler" className="admin-btn admin-btn-ghost px-6 py-2.5 text-sm">
            Ürünler
          </Link>
        </div>
      </div>
    </div>
  );
}
