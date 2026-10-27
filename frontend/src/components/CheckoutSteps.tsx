"use client";

import { Link, toLinkHref } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type Step = 1 | 2 | 3;

export function CheckoutSteps({ active }: { active: Step }) {
  const t = useTranslations("checkout");

  const STEPS: { n: Step; label: string; href?: string }[] = [
    { n: 1, label: t("stepCart"), href: "/sepet" },
    { n: 2, label: t("stepDelivery"), href: "/odeme" },
    { n: 3, label: t("stepPayment") },
  ];

  return (
    <div className="flex w-full max-w-full min-w-0 items-center justify-between gap-1.5 overflow-hidden rounded-full bg-surface-container-lowest px-3 py-2 text-xs font-semibold shadow-sm sm:w-auto sm:justify-start sm:gap-3 sm:px-4 sm:py-2.5">
      {STEPS.map((step, i) => {
        const done = step.n < active;
        const current = step.n === active;
        const circle = (
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
              current || done
                ? "bg-primary-fixed text-primary"
                : "bg-surface-container text-on-surface-variant"
            }`}
          >
            {step.n}
          </span>
        );
        // Mobilde yalnız aktif adımın etiketi görünür; diğerleri sadece numara
        const label = (
          <span
            className={`min-w-0 truncate ${
              current ? "" : "hidden sm:inline"
            } ${
              current
                ? "text-primary"
                : done
                  ? "text-on-surface"
                  : "text-on-surface-variant/60"
            }`}
          >
            {step.label}
          </span>
        );
        return (
          <div
            key={step.n}
            className={`flex min-w-0 items-center gap-1.5 sm:gap-2 ${
              i > 0 ? "sm:flex-none" : ""
            } ${current ? "shrink" : "shrink-0"}`}
          >
            {i > 0 ? (
              <span
                className={`mx-0.5 h-0.5 w-4 shrink-0 sm:w-6 ${
                  done || current ? "bg-primary-fixed" : "bg-surface-container"
                }`}
              />
            ) : null}
            {step.href && !current ? (
              <Link
                href={toLinkHref(step.href)}
                className="flex min-w-0 items-center gap-1.5 hover:opacity-80 sm:gap-2"
              >
                {circle}
                {label}
              </Link>
            ) : (
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                {circle}
                {label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
