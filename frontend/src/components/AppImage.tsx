"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { stockImage } from "@/lib/stock-images";

function hostnameOf(src: ImageProps["src"]): string | null {
  if (typeof src !== "string" || !/^https?:\/\//i.test(src)) return null;
  try {
    return new URL(src).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isS3Host(host: string) {
  return host === "amazonaws.com" || host.endsWith(".amazonaws.com");
}

/** Instagram/Meta CDN — kendi CORS’umuz yok; native img. */
function isInstagramCdn(host: string) {
  return (
    host === "cdninstagram.com" ||
    host.endsWith(".cdninstagram.com") ||
    host === "fbcdn.net" ||
    host.endsWith(".fbcdn.net") ||
    host === "instagram.com" ||
    host.endsWith(".instagram.com")
  );
}

function isHerbalUrunleriHost(host: string) {
  return (
    host === "herbalurunleri.com" || host.endsWith(".herbalurunleri.com")
  );
}

function isSvgSrc(src: ImageProps["src"]): boolean {
  return typeof src === "string" && /\.svg(\?|#|$)/i.test(src);
}

function shouldUseNativeImg(host: string | null, src: ImageProps["src"]) {
  if (isSvgSrc(src)) return true;
  if (!host) return false;
  // S3 / harici katalog CDN: next/image crossOrigin sorunları olabiliyor.
  return isS3Host(host) || isInstagramCdn(host) || isHerbalUrunleriHost(host);
}

type Props = ImageProps & {
  /** Yükleme / 404 durumunda kullanılacak yerel fallback */
  fallbackSrc?: string;
};

/**
 * S3, Instagram CDN ve SVG: native <img>.
 * Diğer remote URL’ler: next/image.
 * Hata olursa yerel fallback gösterilir.
 */
export function AppImage({
  unoptimized,
  fallbackSrc = stockImage("og"),
  onError,
  ...props
}: Props) {
  const [failed, setFailed] = useState(false);
  const host = hostnameOf(props.src);
  const src =
    failed || !props.src
      ? fallbackSrc
      : (props.src as string | import("next/image").StaticImageData);

  const useNative = shouldUseNativeImg(
    typeof src === "string" ? hostnameOf(src) : host,
    src,
  );

  if (useNative && typeof src === "string") {
    const { alt, className, fill, width, height, style, priority, loading } =
      props;
    const imgClass = fill
      ? ["absolute inset-0 h-full w-full", className].filter(Boolean).join(" ")
      : className;
    return (
      // eslint-disable-next-line @next/next/no-img-element -- S3/IG/SVG: CORS’suz native img
      <img
        src={src}
        alt={alt || ""}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={imgClass}
        style={style}
        loading={loading ?? (priority ? "eager" : "lazy")}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={(e) => {
          if (!failed && src !== fallbackSrc) {
            setFailed(true);
          }
          onError?.(e as unknown as React.SyntheticEvent<HTMLImageElement>);
        }}
      />
    );
  }

  return (
    <Image
      {...props}
      key={typeof src === "string" ? src : "img"}
      src={src}
      unoptimized={unoptimized || isSvgSrc(src)}
      onError={(e) => {
        if (!failed) setFailed(true);
        onError?.(e);
      }}
    />
  );
}
