'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/lib/api';

type NavItem = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
  advanced?: boolean;
};

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    title: 'Genel',
    items: [{ href: '/', label: 'Dashboard' }],
  },
  {
    title: 'Mağaza',
    items: [
      { href: '/urunler', label: 'Ürünler' },
      { href: '/kategoriler', label: 'Kategoriler' },
      { href: '/kuponlar', label: 'Kuponlar' },
      { href: '/kampanyalar', label: 'Kampanyalar' },
    ],
  },
  {
    title: 'Siparişler',
    items: [
      { href: '/siparisler', label: 'Siparişler' },
      { href: '/iadeler', label: 'İade Talepleri' },
      { href: '/kargo', label: 'Kargo' },
    ],
  },
  {
    title: 'Müşteriler',
    items: [
      { href: '/musteriler', label: 'Müşteriler' },
      { href: '/yorumlar', label: 'Yorumlar' },
      { href: '/mesajlar', label: 'Mesajlar' },
      { href: '/bulten', label: 'Bülten' },
    ],
  },
  {
    title: 'Koçluk',
    items: [
      { href: '/kocluk', label: 'Onay merkezi' },
      { href: '/kocluk/whatsapp', label: 'Toplu WhatsApp' },
    ],
  },
  {
    title: 'İçerik',
    items: [
      { href: '/blog', label: 'Blog', adminOnly: true },
      { href: '/icerik', label: 'İçerik', adminOnly: true },
      { href: '/medya', label: 'Medya', adminOnly: true },
      { href: '/galeri', label: 'Site Galerisi', adminOnly: true },
      { href: '/site-ayarlari', label: 'Site Ayarları', adminOnly: true },
    ],
  },
  {
    title: 'Gelişmiş',
    advanced: true,
    items: [
      { href: '/kasa', label: 'Kasa' },
      { href: '/cari', label: 'Cari' },
      { href: '/fisler', label: 'Fişler' },
      { href: '/faturalar', label: 'Faturalar' },
      { href: '/stok', label: 'Stok defteri' },
      { href: '/okc', label: 'ÖKC' },
      { href: '/muhasebe', label: 'Muhasebe cirosu' },
      {
        href: '/muhasebe-ayarlari',
        label: 'Muhasebe ayarları',
        adminOnly: true,
      },
      { href: '/kullanicilar', label: 'Kullanıcılar', adminOnly: true },
      {
        href: '/personel-onaylari',
        label: 'Personel onayları',
        adminOnly: true,
      },
      { href: '/pazaryeri', label: 'Pazaryeri', adminOnly: true },
      { href: '/sozlesmeler', label: 'Sözleşmeler', adminOnly: true },
      { href: '/bildirimler', label: 'Bildirimler' },
      { href: '/kuyruklar', label: 'Kuyruklar', adminOnly: true },
    ],
  },
];

/** Geriye dönük: düz liste */
export const ADMIN_NAV: Array<NavItem & { code: string }> =
  ADMIN_NAV_GROUPS.flatMap((g, gi) =>
    g.items.map((item, ii) => ({
      ...item,
      code: `${gi + 1}${String.fromCharCode(97 + ii)}`,
    })),
  );

type Props = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function NavLinks({
  onNavigate,
  isAdmin,
}: {
  onNavigate?: () => void;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const groups = useMemo(
    () =>
      ADMIN_NAV_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter((item) => !item.adminOnly || isAdmin),
      })).filter((g) => g.items.length > 0),
    [isAdmin],
  );

  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-auto p-3">
      {groups.map((group) => {
        if (group.advanced && !showAdvanced) {
          return (
            <button
              key={group.title}
              type="button"
              onClick={() => setShowAdvanced(true)}
              className="rounded-xl border border-dashed border-border-muted px-3 py-2.5 text-left text-xs font-semibold text-muted hover:border-accent hover:bg-surface-high hover:text-accent"
            >
              Gelişmiş işlemleri göster
            </button>
          );
        }
        if (group.advanced && showAdvanced) {
          return (
            <div key={group.title}>
              <button
                type="button"
                onClick={() => setShowAdvanced(false)}
                className="mb-2 px-2.5 text-[11px] font-semibold text-muted hover:text-accent"
              >
                {group.title} · gizle
              </button>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'admin-nav-active shadow-sm'
                          : 'text-foreground/75 hover:bg-surface-high hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        }
        return (
          <div key={group.title}>
            <p className="mb-1.5 px-2.5 text-[11px] font-bold uppercase tracking-wide text-muted">
              {group.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? 'admin-nav-active shadow-sm'
                        : 'text-foreground/80 hover:bg-surface-high hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function BrandBlock() {
  return (
    <div className="border-b border-border-muted px-4 py-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white">
          H
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold text-foreground">
            Herbal Ürünleri
          </p>
          <p className="text-xs font-medium text-accent">Admin · Emine Özberk</p>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({ mobileOpen = false, onMobileClose }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    void api<{ role?: string }>('/auth/me')
      .then((me) => setIsAdmin(me.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const desktop = (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border-muted bg-surface shadow-sm md:sticky md:top-0 md:flex">
      <BrandBlock />
      <NavLinks isAdmin={isAdmin} />
    </aside>
  );

  const mobile =
    mobileOpen && mounted
      ? createPortal(
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Kapat"
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
              onClick={onMobileClose}
            />
            <aside className="admin-menu-drawer absolute inset-y-0 left-0 flex w-[min(100%,18rem)] flex-col bg-surface shadow-2xl">
              <BrandBlock />
              <NavLinks isAdmin={isAdmin} onNavigate={onMobileClose} />
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {desktop}
      {mobile}
    </>
  );
}
