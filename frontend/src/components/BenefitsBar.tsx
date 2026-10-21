import { Reveal } from "@/components/Reveal";

const BENEFITS = [
  {
    title: "Ücretsiz Kargo",
    subtitle: "Türkiye geneli",
    tone: "sage" as const,
    icon: "🚚",
  },
  {
    title: "Kapıda Ödeme",
    subtitle: "Nakit veya kart",
    tone: "blush" as const,
    icon: "💳",
  },
  {
    title: "Güvenli Ödeme",
    subtitle: "256-bit SSL",
    tone: "sage" as const,
    icon: "🔒",
  },
  {
    title: "14 Gün İade",
    subtitle: "Koşulsuz güvence",
    tone: "blush" as const,
    icon: "↩️",
  },
  {
    title: "7/24 Koç Desteği",
    subtitle: "Birebir takip",
    tone: "mint" as const,
    icon: "💬",
  },
];

const TONE_CLASS = {
  sage: "bg-white text-primary border border-outline-variant/40",
  blush: "bg-tertiary-fixed/40 text-tertiary border border-tertiary-fixed",
  mint: "bg-white text-on-surface border border-outline-variant/40",
};

type Props = {
  className?: string;
  phone?: string;
};

export function BenefitsBar({ className = "", phone }: Props) {
  return (
    <div
      className={`grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4${className ? ` ${className}` : ""}`}
    >
      {BENEFITS.map((b, i) => (
        <Reveal key={b.title} delay={i * 55} variant="scale">
          <div className="card-motion panel-motion flex items-center gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${TONE_CLASS[b.tone]}`}
              aria-hidden
            >
              {b.icon}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-on-surface">
                {b.title}
              </span>
              <span className="block truncate text-xs text-on-surface-variant">
                {b.title.includes("Koç") && phone ? phone : b.subtitle}
              </span>
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
