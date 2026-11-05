import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

/**
 * Kök metadataBase — dil segmenti dışındaki rotalar (/_not-found, kök
 * opengraph-image, ikonlar) da mutlak URL üretsin; build uyarısını kaldırır.
 */
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://herbalkapida.com",
  ),
};

type Props = { children: ReactNode };

/**
 * Next.js kök layout — `html`/`body` dil segmentinde
 * (`[locale]/layout.tsx`) render edilir (next-intl).
 */
export default function RootLayout({ children }: Props) {
  return children;
}
