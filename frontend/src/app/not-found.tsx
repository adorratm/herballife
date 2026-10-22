import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 15% 10%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 55%), radial-gradient(ellipse 55% 45% at 90% 85%, color-mix(in srgb, var(--tertiary) 12%, transparent), transparent 50%), linear-gradient(180deg, var(--primary-fixed) 0%, transparent 42%)",
        }}
        aria-hidden
      />

      <div className="page-shell relative flex min-h-[70vh] flex-col items-center justify-center py-20 text-center md:py-28">
        <p className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          404
        </p>

        <h1 className="mt-6 max-w-2xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-on-surface md:text-6xl">
          Sayfa bulunamadı
        </h1>

        <p className="mt-5 max-w-lg text-base leading-relaxed text-on-surface-variant md:text-lg">
          Aradığınız sayfa taşınmış veya yayından kalkmış olabilir. Kataloğa
          dönüp doğru ürünü bulabilirsiniz.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/urunler"
            className="btn-cta pressable inline-flex items-center px-7 py-3.5 text-sm shadow-md"
          >
            Ürünlere git
          </Link>
          <Link
            href="/"
            className="btn-ghost pressable inline-flex items-center bg-white/80 px-7 py-3.5 text-sm backdrop-blur-sm"
          >
            Ana sayfa
          </Link>
        </div>

        <div className="mt-14 grid w-full max-w-xl grid-cols-3 gap-3 md:gap-4">
          {[
            { href: "/urunler/kategori/avantajli-setler", label: "Hediyeli setler" },
            { href: "/iletisim", label: "İletişim" },
            { href: "/sss", label: "SSS" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-outline-variant/50 bg-white/70 px-3 py-3 text-xs font-semibold text-on-surface-variant shadow-sm backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-primary md:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
