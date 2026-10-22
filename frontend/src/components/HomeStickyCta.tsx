"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  whatsappUrl: string;
};

/** Mobil: ana sayfada sticky sipariş / danış çubuğu (bottom nav üstü) */
export function HomeStickyCta({ whatsappUrl }: Props) {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 px-3 pb-2 md:hidden">
      <div className="mx-auto flex max-w-lg gap-2 rounded-2xl border border-outline-variant/40 bg-white/95 p-2 shadow-lg backdrop-blur">
        <Link
          href="/urunler/kategori/avantajli-setler"
          className="btn-cta flex-1 py-2.5 text-center text-xs font-bold"
        >
          Paketleri incele
        </Link>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost flex-1 py-2.5 text-center text-xs font-bold"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
