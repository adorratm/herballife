"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type LocaleAlternatePathname =
  | "/urunler/[slug]"
  | "/urunler/kategori/[slug]"
  | "/blog/[slug]";

export type LocaleAlternatesState = {
  pathname: LocaleAlternatePathname;
  /** Dil kodu → o dildeki slug */
  localeSlugs: Record<string, string>;
} | null;

type Ctx = {
  alternates: LocaleAlternatesState;
  setAlternates: (next: LocaleAlternatesState) => void;
};

const LocaleAlternatesContext = createContext<Ctx>({
  alternates: null,
  setAlternates: () => {},
});

export function LocaleAlternatesProvider({ children }: { children: ReactNode }) {
  const [alternates, setAlternatesState] = useState<LocaleAlternatesState>(null);
  const setAlternates = useCallback((next: LocaleAlternatesState) => {
    setAlternatesState(next);
  }, []);
  const value = useMemo(
    () => ({ alternates, setAlternates }),
    [alternates, setAlternates],
  );
  return (
    <LocaleAlternatesContext.Provider value={value}>
      {children}
    </LocaleAlternatesContext.Provider>
  );
}

export function useLocaleAlternates() {
  return useContext(LocaleAlternatesContext);
}

/** Detay sayfası mount olunca dil seçiciye alternatif slug’ları bildirir. */
export function RegisterLocaleAlternates({
  pathname,
  localeSlugs,
  currentSlug,
}: {
  pathname: LocaleAlternatePathname;
  localeSlugs?: Record<string, string> | null;
  /** localeSlugs yoksa en azından mevcut slug ile fallback */
  currentSlug: string;
}) {
  const { setAlternates } = useLocaleAlternates();
  const slugsKey = JSON.stringify(localeSlugs || {});

  useEffect(() => {
    const parsed = (() => {
      try {
        return JSON.parse(slugsKey) as Record<string, string>;
      } catch {
        return {} as Record<string, string>;
      }
    })();
    const map =
      Object.keys(parsed).length > 0 ? parsed : { tr: currentSlug };
    setAlternates({ pathname, localeSlugs: map });
    return () => setAlternates(null);
  }, [pathname, currentSlug, slugsKey, setAlternates]);

  return null;
}
