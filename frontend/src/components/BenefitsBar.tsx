import { Reveal } from "@/components/Reveal";
import { freeShippingThreshold } from "@/lib/shipping";
import { formatMoney } from "@/lib/format";

function buildBenefits() {
  const threshold = freeShippingThreshold();
  const shipping =
    threshold > 0
      ? {
          title: `${formatMoney(threshold)} üzeri ücretsiz kargo`,
          subtitle: "Türkiye geneli",
          tone: "sage" as const,
          icon: "🚚",
        }
      : {
          title: "Hızlı kargo",
          subtitle: "1–3 iş günü sevk",
          tone: "sage" as const,
          icon: "🚚",
        };

  return [
    shipping,
    {
      title: "PayTR güvenli ödeme",
      subtitle: "256 bit SSL",
      tone: "blush" as const,
      icon: "🔒",
    },
    {
      title: "14 gün iade",
      subtitle: "Cayma hakkı",
      tone: "sage" as const,
      icon: "↩️",
    },
    {
      title: "Orijinal ürün",
      subtitle: "Bağımsız distribütör",
      tone: "blush" as const,
      icon: "✓",
    },
    {
      title: "WhatsApp koç desteği",
      subtitle: "Birebir takip",
      tone: "mint" as const,
      icon: "💬",
    },
  ];
}

const TONE_CLASS = {
  sage: "bg-primary-fixed text-primary border border-primary/15",
  blush: "bg-tertiary-fixed text-tertiary border border-tertiary/20",
  mint: "bg-flash-soft text-flash border border-flash/20",
};

type Props = {
  className?: string;
  phone?: string;
};

export function BenefitsBar({ className = "", phone: _phone }: Props) {
  const benefits = buildBenefits();
  return (
    <div
      className={`lift-safe grid grid-cols-2 items-stretch gap-2.5 sm:gap-3 md:grid-cols-5 md:gap-4${className ? ` ${className}` : ""}`}
    >
      {benefits.map((b, i) => (
        <Reveal key={b.title} delay={i * 55} variant="scale">
          <div className="card-motion panel-motion flex h-full min-h-[4.75rem] items-center gap-3 rounded-xl bg-surface-container-lowest p-3 shadow-sm sm:p-4">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${TONE_CLASS[b.tone]}`}
              aria-hidden
            >
              {b.icon}
            </span>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <p className="line-clamp-2 min-h-[2.5em] text-sm font-bold leading-snug text-on-surface">
                {b.title}
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-on-surface-variant">
                {b.subtitle}
              </p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
