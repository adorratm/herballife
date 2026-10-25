import type { AppLocale } from "@/i18n/routing";

/** Windows’ta emoji bayrakları çoğu zaman görünmez — SVG kullanıyoruz. */
export function LocaleFlag({
  locale,
  className = "h-4 w-5",
}: {
  locale: AppLocale | string;
  className?: string;
}) {
  const common = {
    className: `shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/10 ${className}`,
    viewBox: "0 0 20 14",
    "aria-hidden": true as const,
  };

  switch (locale) {
    case "tr":
      return (
        <svg {...common}>
          <rect width="20" height="14" fill="#E30A17" />
          <circle cx="8.2" cy="7" r="3.2" fill="#fff" />
          <circle cx="9.1" cy="7" r="2.55" fill="#E30A17" />
          <polygon
            fill="#fff"
            points="11.6,7 13.4,7.6 12,6.1 13.4,4.6 11.6,5.4 10.5,4.1 10.5,5.9 8.8,6.6 10.5,7.2 10.5,9"
          />
        </svg>
      );
    case "en":
      return (
        <svg {...common}>
          <rect width="20" height="14" fill="#012169" />
          <path d="M0 0 L20 14 M20 0 L0 14" stroke="#fff" strokeWidth="2.4" />
          <path
            d="M0 0 L20 14 M20 0 L0 14"
            stroke="#C8102E"
            strokeWidth="1.2"
          />
          <path d="M10 0 V14 M0 7 H20" stroke="#fff" strokeWidth="4" />
          <path d="M10 0 V14 M0 7 H20" stroke="#C8102E" strokeWidth="2.2" />
        </svg>
      );
    case "de":
      return (
        <svg {...common}>
          <rect width="20" height="4.67" y="0" fill="#000" />
          <rect width="20" height="4.67" y="4.67" fill="#D00" />
          <rect width="20" height="4.66" y="9.34" fill="#FFCE00" />
        </svg>
      );
    case "fr":
      return (
        <svg {...common}>
          <rect width="6.67" height="14" x="0" fill="#002395" />
          <rect width="6.66" height="14" x="6.67" fill="#fff" />
          <rect width="6.67" height="14" x="13.33" fill="#ED2939" />
        </svg>
      );
    case "es":
      return (
        <svg {...common}>
          <rect width="20" height="14" fill="#AA151B" />
          <rect width="20" height="7" y="3.5" fill="#F1BF00" />
        </svg>
      );
    case "it":
      return (
        <svg {...common}>
          <rect width="6.67" height="14" x="0" fill="#009246" />
          <rect width="6.66" height="14" x="6.67" fill="#fff" />
          <rect width="6.67" height="14" x="13.33" fill="#CE2B37" />
        </svg>
      );
    case "nl":
      return (
        <svg {...common}>
          <rect width="20" height="4.67" y="0" fill="#AE1C28" />
          <rect width="20" height="4.67" y="4.67" fill="#fff" />
          <rect width="20" height="4.66" y="9.34" fill="#21468B" />
        </svg>
      );
    case "pt":
      return (
        <svg {...common}>
          <rect width="8" height="14" fill="#006600" />
          <rect x="8" width="12" height="14" fill="#FF0000" />
          <circle cx="8" cy="7" r="2.4" fill="#FFCC00" />
        </svg>
      );
    case "pl":
      return (
        <svg {...common}>
          <rect width="20" height="7" y="0" fill="#fff" />
          <rect width="20" height="7" y="7" fill="#DC143C" />
        </svg>
      );
    case "ru":
      return (
        <svg {...common}>
          <rect width="20" height="4.67" y="0" fill="#fff" />
          <rect width="20" height="4.67" y="4.67" fill="#0039A6" />
          <rect width="20" height="4.66" y="9.34" fill="#D52B1E" />
        </svg>
      );
    case "az":
      return (
        <svg {...common}>
          <rect width="20" height="4.67" y="0" fill="#00B5E2" />
          <rect width="20" height="4.67" y="4.67" fill="#EF3340" />
          <rect width="20" height="4.66" y="9.34" fill="#509E2F" />
          <circle cx="8" cy="7" r="1.6" fill="#fff" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect width="20" height="14" fill="#c5d9cc" />
          <text
            x="10"
            y="9.5"
            textAnchor="middle"
            fill="#0a2f1f"
            fontSize="6"
            fontFamily="system-ui,sans-serif"
            fontWeight="700"
          >
            {String(locale).slice(0, 2).toUpperCase()}
          </text>
        </svg>
      );
  }
}
