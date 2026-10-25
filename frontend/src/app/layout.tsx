import type { ReactNode } from "react";
import "./globals.css";

type Props = { children: ReactNode };

/**
 * Next.js kök layout — `html`/`body` dil segmentinde
 * (`[locale]/layout.tsx`) render edilir (next-intl).
 */
export default function RootLayout({ children }: Props) {
  return children;
}
