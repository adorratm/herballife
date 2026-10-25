"use client";

import Image from "next/image";
import { Link, toLinkHref } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

export type HeroSlide = {
  image: string;
  title: string;
  subtitle: string;
  href: string;
};

type Props = {
  slides: HeroSlide[];
  intervalMs?: number;
};

export function HomeHeroSlider({ slides, intervalMs = 5200 }: Props) {
  const t = useTranslations("aria");
  const tCta = useTranslations("homeHeroSlider");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  const go = useCallback(
    (next: number) => {
      if (!total) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (paused || total < 2) return;
    const id = window.setInterval(() => go(index + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [go, index, intervalMs, paused, total]);

  if (!total) return null;
  const slide = slides[index];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low shadow-md"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-16/10 w-full bg-[linear-gradient(145deg,#eef3f0,#fff)] md:aspect-16/11">
        {slides.map((s, i) => (
          <div
            key={`${s.image}-${i}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              priority={i === 0}
              className="object-contain p-3 md:p-4"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        ))}

        {total > 1 ? (
          <>
            <button
              type="button"
              aria-label={t("previous")}
              onClick={() => go(index - 1)}
              className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-outline-variant bg-white text-lg font-bold text-on-surface shadow-sm transition-colors hover:bg-primary hover:text-on-primary"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={t("next")}
              onClick={() => go(index + 1)}
              className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-outline-variant bg-white text-lg font-bold text-on-surface shadow-sm transition-colors hover:bg-primary hover:text-on-primary"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-outline-variant bg-white px-3 py-2.5 md:px-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
            {slide.subtitle}
          </p>
          <p className="mt-0.5 truncate font-display text-sm font-bold text-on-surface md:text-base">
            {slide.title}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {total > 1 ? (
            <div className="hidden gap-1.5 sm:flex">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={t("imageN", { n: i + 1 })}
                  aria-current={i === index}
                  onClick={() => go(i)}
                  className={`h-1.5 cursor-pointer transition-all ${
                    i === index
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-outline-variant hover:bg-primary/60"
                  }`}
                />
              ))}
            </div>
          ) : null}
          <Link
            href={toLinkHref(slide.href)}
            className="inline-flex cursor-pointer bg-primary px-3.5 py-2 text-xs font-bold text-on-primary hover:bg-primary-container rounded-full"
          >
            {tCta("inspect")}
          </Link>
        </div>
      </div>
    </div>
  );
}
