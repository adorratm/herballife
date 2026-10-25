"use client";

import { AppImage as Image } from "@/components/AppImage";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

type Props = {
  images: string[];
  alt: string;
  badge?: string | null;
};

export function ProductGallery({ images, alt, badge }: Props) {
  const t = useTranslations("gallery");
  const tAria = useTranslations("aria");
  const tc = useTranslations("common");
  const list = images.length ? images : [];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setActive(0);
  }, [list.join("|")]);

  const total = list.length;
  const current = list[Math.min(active, Math.max(total - 1, 0))] || "";

  const go = useCallback(
    (delta: number) => {
      if (total < 2) return;
      setActive((i) => (i + delta + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, go]);

  function onStageKey(e: ReactKeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setLightbox(true);
    }
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  }

  if (!current) {
    return (
      <div className="product-stage flex aspect-square items-center justify-center rounded-2xl bg-surface-container-low lg:aspect-auto lg:min-h-128">
        <p className="text-sm text-on-surface-variant">{t("noImage")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="product-gallery flex h-full flex-col gap-3 p-3 md:p-5 lg:p-6">
        <div
          role="button"
          tabIndex={0}
          aria-label={tAria("enlargeImage", { alt })}
          onClick={() => setLightbox(true)}
          onKeyDown={onStageKey}
          className="product-stage group relative flex min-h-80 flex-1 cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:min-h-96 lg:min-h-112 xl:min-h-128"
        >
          <div className="product-stage-glow" aria-hidden />
          <div className="product-stage-ring" aria-hidden />

          {badge ? (
            <span className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-sm">
              {badge}
            </span>
          ) : null}

          {total > 1 ? (
            <>
              <button
                type="button"
                aria-label={tAria("previousImage")}
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-outline-variant/40 bg-white/90 text-on-surface opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:border-primary hover:text-primary focus-visible:opacity-100"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label={tAria("nextImage")}
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-outline-variant/40 bg-white/90 text-on-surface opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:border-primary hover:text-primary focus-visible:opacity-100"
              >
                ›
              </button>
            </>
          ) : null}

          <div
            key={current}
            className="product-stage-figure relative z-1 h-[min(94%,36rem)] w-[min(96%,36rem)] animate-fade-up sm:h-[min(96%,40rem)]"
          >
            <Image
              src={current}
              alt={alt}
              fill
              className="object-contain p-2 drop-shadow-[0_28px_48px_rgba(18,40,28,0.16)] transition-transform duration-700 ease-out group-hover:scale-[1.03] sm:p-3"
              sizes="(max-width: 1024px) 94vw, 52vw"
              priority
            />
          </div>

          <span className="absolute bottom-4 right-4 z-10 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
            {t("enlarge")}
          </span>

          {total > 1 ? (
            <span className="absolute bottom-4 left-4 z-10 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold tabular-nums text-on-surface-variant shadow-sm backdrop-blur-sm">
              {active + 1} / {total}
            </span>
          ) : null}
        </div>

        {total > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
            {list.map((src, i) => {
              const selected = i === active;
              return (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  aria-label={tAria("imageN", { n: i + 1 })}
                  aria-current={selected}
                  onClick={() => setActive(i)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all sm:h-22 sm:w-22 ${
                    selected
                      ? "border-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_18%,transparent)]"
                      : "border-outline-variant/35 hover:border-primary/50"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-contain p-1.5"
                    sizes="72px"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {mounted && lightbox
        ? createPortal(
            <div
              className="fixed inset-0 z-100 flex flex-col bg-[#0c1410]/92 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-label={tAria("productImage")}
            >
              <button
                type="button"
                className="absolute inset-0 cursor-default"
                aria-label={tc("close")}
                onClick={() => setLightbox(false)}
              />
              <header className="relative z-10 flex items-center justify-between px-4 py-3 md:px-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  {active + 1} / {total}
                </p>
                <button
                  type="button"
                  onClick={() => setLightbox(false)}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-white/20"
                >
                  {tc("close")}
                </button>
              </header>
              <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-10 md:px-12">
                {total > 1 ? (
                  <>
                    <button
                      type="button"
                      aria-label={tAria("previous")}
                      onClick={() => go(-1)}
                      className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xl text-white hover:bg-white/20 md:left-8"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      aria-label={tAria("next")}
                      onClick={() => go(1)}
                      className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xl text-white hover:bg-white/20 md:right-8"
                    >
                      ›
                    </button>
                  </>
                ) : null}
                <div
                  key={`lb-${current}`}
                  className="relative h-[min(72vh,36rem)] w-full max-w-3xl animate-fade-up"
                >
                  <Image
                    src={current}
                    alt={alt}
                    fill
                    className="object-contain"
                    sizes="90vw"
                    priority
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
