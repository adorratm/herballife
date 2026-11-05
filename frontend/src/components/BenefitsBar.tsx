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
      className={`lift-safe grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 xl:grid-cols-5 ${className}`}
    >
      {benefits.map((b, i) => (
        <Reveal
          key={b.title}
          delay={i * 55}
          variant="scale"
          className={
            /* Tek kalan kart mobil 2'li ızgarada tam genişlik */
            i === benefits.length - 1 && benefits.length % 2 === 1
              ? "sm:col-span-2 md:col-span-1"
              : ""
          }
        >
          <div className="card-motion group flex h-full items-center gap-4 rounded-2xl border border-outline-variant/50 bg-surface-container-low p-4 sm:p-5">
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center" aria-hidden>
              <span
                className={`absolute bottom-0.5 right-0.5 h-7 w-7 rounded-full ${
                  b.tone === "blush" ? "bg-amber-300/80" : "bg-amber-300/70"
                } transition-transform duration-300 group-hover:scale-110`}
              />
              <span className="absolute inset-1 rounded-2xl bg-white shadow-sm" />
              <b.Icon
                className="relative h-7 w-7 text-primary"
                strokeWidth={1.75}
              />
            </span>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <p className="font-display text-[15px] font-bold leading-snug text-on-surface">
                {b.title}
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-on-surface-variant">
                {b.subtitle}
              </p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
