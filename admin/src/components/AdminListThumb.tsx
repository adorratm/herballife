'use client';

const PLACEHOLDER = '/images/product-placeholder.svg';

type Props = {
  src?: string | null;
  alt?: string;
  /** sm/md veya piksel (48–64 önerilir) */
  size?: 'sm' | 'md' | 48 | 56 | 64;
};

const SIZE_CLASS: Record<'sm' | 'md', string> = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
};

export function AdminListThumb({ src, alt = '', size = 'md' }: Props) {
  const url = src?.trim() ? src.trim() : PLACEHOLDER;
  if (typeof size === 'number') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        width={size}
        height={size}
        className="shrink-0 rounded-lg border border-border-muted bg-surface-high object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className={`${SIZE_CLASS[size]} shrink-0 rounded-lg border border-border-muted object-contain bg-surface-high`}
    />
  );
}
