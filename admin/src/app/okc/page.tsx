'use client';

import Link from 'next/link';

export default function OkcRemovedPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 border border-border-muted bg-surface p-6 text-center">
      <h2 className="text-lg font-semibold">ÖKC modülü kaldırıldı</h2>
      <p className="text-sm text-muted">
        ÖKC içe aktarma ve POS satış ekranı artık kullanılmıyor. Web siparişleri
        ve kasa kayıtları için{' '}
        <Link href="/muhasebe" className="text-accent underline">
          muhasebe cirosu
        </Link>{' '}
        sayfasına bakın.
      </p>
      <Link
        href="/"
        className="inline-block bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover"
      >
        Panele dön
      </Link>
    </div>
  );
}
