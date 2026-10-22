'use client';

import { usePathname, useRouter } from 'next/navigation';
import { AdminSearch } from '@/components/AdminSearch';
import { NotificationBell } from '@/components/NotificationBell';
import { clearToken } from '@/lib/auth';

const TITLES: Record<string, string> = {
  '/': 'Özet panel',
  '/urunler': 'Ürünler',
  '/kategoriler': 'Kategoriler',
  '/blog': 'Yazılar',
  '/icerik': 'İçerik',
  '/site-ayarlari': 'Site Ayarları',
  '/medya': 'Medya',
  '/galeri': 'Site Galerisi',
  '/siparisler': 'Siparişler',
  '/musteriler': 'Müşteriler',
  '/personel-onaylari': 'Personel onayları',
  '/iadeler': 'İade Talepleri',
  '/kuponlar': 'Kuponlar',
  '/kampanyalar': 'Kampanyalar',
  '/yorumlar': 'Ürün Yorumları',
  '/kargo': 'Kargo Ayarları',
  '/pazaryeri': 'Pazaryeri',
  '/sozlesmeler': 'Sözleşmeler',
  '/mesajlar': 'Mesajlar',
  '/bulten': 'Bülten Aboneleri',
  '/kuyruklar': 'Kuyruklar',
  '/bildirimler': 'Bildirimler',
  '/kocluk': 'Koçluk',
  '/kasa': 'Kasa',
  '/cari': 'Cari',
  '/stok': 'Stok',
  '/muhasebe': 'Muhasebe',
  '/muhasebe-ayarlari': 'Muhasebe ayarları',
  '/kullanicilar': 'Kullanıcılar',
  '/fisler': 'Fişler',
  '/faturalar': 'Faturalar',
  '/okc': 'ÖKC',
};

function resolveTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  const base = Object.keys(TITLES)
    .filter((k) => k !== '/' && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  if (base === '/siparisler') return 'Sipariş Detayı';
  if (base === '/urunler') return 'Ürün Düzenle';
  if (base === '/musteriler') return 'Müşteri Detayı';
  if (base === '/kocluk') return 'Koçluk';
  return TITLES[base] || 'Yönetim';
}

type Props = {
  onMenuOpen?: () => void;
};

export function AdminHeader({ onMenuOpen }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const title = resolveTitle(pathname);

  function logout() {
    clearToken();
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border-muted bg-surface/90 px-3 backdrop-blur-md sm:gap-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-muted bg-surface text-muted hover:border-accent hover:text-accent md:hidden"
          aria-label="Menüyü aç"
        >
          <MenuIcon />
        </button>
        <div key={pathname} className="page-enter min-w-0 shrink">
          <h1 className="truncate font-display text-lg font-bold text-foreground">
            {title}
          </h1>
          <p className="hidden text-xs text-muted sm:block">{pathname}</p>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
        <AdminSearch />
        <NotificationBell />
        <button
          type="button"
          onClick={logout}
          className="admin-btn admin-btn-ghost shrink-0"
        >
          Çıkış
        </button>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
