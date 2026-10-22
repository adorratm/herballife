"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  title: string;
  subtitle: string;
  youtubeId: string;
  poster: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function HomeVideoSection({
  title,
  subtitle,
  youtubeId,
  poster,
  ctaLabel,
  ctaHref,
}: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="border-y border-outline-variant bg-[#0f2f22] text-white">
      <div className="page-shell grid items-center gap-8 py-12 md:grid-cols-12 md:gap-10 md:py-16">
        <div className="md:col-span-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#3dd68c]">
            Video
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 md:text-base">
            {subtitle}
          </p>
          {ctaLabel && ctaHref ? (
            <a
              href={ctaHref}
              className="mt-6 inline-flex cursor-pointer rounded-full border border-[#3dd68c] bg-[#3dd68c] px-6 py-3 text-sm font-bold text-[#0f2f22] transition-colors hover:bg-white"
            >
              {ctaLabel}
            </a>
          ) : null}
        </div>

        <div className="md:col-span-7">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/15 bg-black shadow-lg">
            {playing ? (
              <iframe
                title={title}
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="group absolute inset-0 cursor-pointer"
                aria-label="Videoyu oynat"
              >
                <Image
                  src={poster}
                  alt=""
                  fill
                  className="object-cover opacity-80 transition-opacity group-hover:opacity-90"
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
                <span className="absolute inset-0 bg-[#0f2f22]/35" aria-hidden />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/95 text-2xl text-[#0f2f22] shadow-md transition-transform group-hover:scale-105 md:h-20 md:w-20 md:text-3xl">
                    ▶
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
