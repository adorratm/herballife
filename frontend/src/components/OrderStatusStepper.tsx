"use client";

import { useTranslations } from "next-intl";
import { getOrderStepIndex, isTerminalFailure, ORDER_STEP_KEYS } from "@/lib/order-status";
import {
  orderStatusLabel,
  orderStepLabel,
} from "@/lib/order-status-i18n";

type Props = {
  status: string;
};

export function OrderStatusStepper({ status }: Props) {
  const t = useTranslations("orderStatus");

  if (isTerminalFailure(status)) {
    return (
      <div className="border border-error/40 bg-surface-container-low px-4 py-3 font-meta text-xs uppercase text-error">
        {orderStatusLabel(status, t)}
      </div>
    );
  }

  const active = getOrderStepIndex(status);
  const doneAll = status === "delivered";

  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {ORDER_STEP_KEYS.map((stepKey, i) => {
        const done = doneAll || (active >= 0 && i < active);
        const current = !doneAll && i === active;
        return (
          <li
            key={stepKey}
            className={`relative overflow-hidden rounded-xl border px-3 py-3 font-meta text-[10px] uppercase tracking-widest ${
              current
                ? "border-primary bg-primary text-on-primary"
                : done
                  ? "border-primary/40 bg-primary-fixed/30 text-primary"
                  : "border-outline-variant/30 text-secondary"
            }`}
          >
            {current ? (
              <span className="absolute right-2 top-2 h-2 w-2 animate-ping rounded-full bg-on-primary/80" />
            ) : null}
            <span className="block text-[9px] opacity-70">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="mt-1 block">{orderStepLabel(stepKey, t)}</span>
          </li>
        );
      })}
    </ol>
  );
}
