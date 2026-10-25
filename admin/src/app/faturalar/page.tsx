'use client';

import Link from 'next/link';

/** Faturalar modülü kaldırıldı — fatura iletimi sipariş detayından yapılır. */
export default function FaturalarRemovedPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 p-8">
      <h1 className="font-display text-2xl text-ink">Faturalar modülü kaldırıldı</h1>
      <p className="text-sm text-muted">
        Bağımsız faturalar ve ÖKC akışları sistemden çıkarıldı. Müşteriye fatura
        göndermek için ilgili sipariş detayındaki &quot;Fatura ilet&quot; işlemini
        kullanın.
      </p>
      <Link href="/siparisler" className="text-sm font-medium text-accent underline">
        Siparişlere git
      </Link>
    </div>
  );
}
