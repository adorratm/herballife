import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { AuthGuard } from '@/components/AuthGuard';
import { AdminShell } from '@/components/AdminShell';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
});

const display = Plus_Jakarta_Sans({
  variable: '--font-display',
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800'],
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin', 'latin-ext'],
});

export const metadata: Metadata = {
  title: 'Herbal Ürünleri Yönetim',
  description: 'Yönetim paneli',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${display.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AuthGuard>
          <AdminShell>{children}</AdminShell>
        </AuthGuard>
      </body>
    </html>
  );
}
