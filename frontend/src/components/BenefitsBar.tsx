import {
  BadgeCheck,
  Clock,
  Lock,
  MessageCircle,
  RotateCcw,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/Reveal";
import type { SiteSettings } from "@/lib/cms";
import { formatMoney } from "@/lib/format";
import { freeShippingThreshold } from "@/lib/shipping";

type SitePromises = NonNullable<SiteSettings["promises"]>;

const TONE_CLASS = {
  sage: "bg-primary-fixed text-primary border border-primary/15",
  blush: "bg-tertiary-fixed text-tertiary border border-tertiary/20",
  mint: "bg-flash-soft text-flash border border-flash/20",
};

type Props = {
  className?: string;
  phone?: string;
  promises?: SitePromises;
  freeShippingOver?: number | null;
};

export async function BenefitsBar({
  className = "",
  phone: _phone,
  promises,
  freeShippingOver,
}: Props) {
  const t = await getTranslations("benefits");
  const threshold = freeShippingThreshold(freeShippingOver);
  const returnDays = promises?.returnDays ?? 14;
  const sameDay =
    promises?.sameDayShipping !== false &&
    (promises?.sameDayCutoff?.trim() || "13:00");

  const shipping = sameDay
    ? {
        title: t("sameDayTitle", { cutoff: sameDay }),
        subtitle: t("sameDaySubtitle"),
        tone: "sage" as const,
        Icon: Clock,
      }
    : threshold > 0
      ? {
          title: t("freeShippingTitle", {
            amount: formatMoney(threshold),
          }),
          subtitle: t("freeShippingSubtitle"),
          tone: "sage" as const,
          Icon: Truck,
        }
      : {
          title: t("fastShippingTitle"),
          subtitle: t("fastShippingSubtitle"),
          tone: "sage" as const,
          Icon: Truck,
        };

  const benefits: Array<{
    title: string;
    subtitle: string;
    tone: "sage" | "blush" | "mint";
    Icon: LucideIcon;
  }> = [
    shipping,
    {
      title: t("securePayTitle"),
      subtitle: t("securePaySubtitle"),
      tone: "blush",
      Icon: Lock,
    },
    {
      title: t("returnTitle", { days: returnDays }),
      subtitle: t("returnSubtitle"),
      tone: "sage",
      Icon: RotateCcw,
    },
    {
      title: t("originalTitle"),
      subtitle: t("originalSubtitle"),
      tone: "blush",
      Icon: BadgeCheck,
    },
  ];

  if (promises?.freeCoaching !== false) {
    benefits.push({
      title: t("coachingTitle"),
      subtitle: t("coachingSubtitle"),
      tone: "mint",
      Icon: MessageCircle,
    });
  }

  return (
    <div
      className={`lift-safe grid grid-cols-2 items-stretch gap-2.5 sm:gap-3 md:grid-cols-5 md:gap-4${className ? ` ${className}` : ""}`}
    >
      {benefits.map((b, i) => (
        <Reveal key={b.title} delay={i * 55} variant="scale">
          <div className="card-motion panel-motion flex h-full min-h-19 items-center gap-3 rounded-xl bg-surface-container-lowest p-3 shadow-sm sm:p-4">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TONE_CLASS[b.tone]}`}
              aria-hidden
            >
              <b.Icon className="h-5 w-5" strokeWidth={2} />
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
