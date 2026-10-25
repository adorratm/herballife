"use client";

import { useLocale, useTranslations } from "next-intl";

type Props = {
  startsAt?: string | null;
  endsAt?: string | null;
  className?: string;
};

function formatCampaignDay(
  locale: string,
  value?: string | null,
): string {
  if (!value?.trim()) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export function CampaignDateBanner({
  startsAt,
  endsAt,
  className = "",
}: Props) {
  const locale = useLocale();
  const t = useTranslations("campaignDate");
  const start = formatCampaignDay(locale, startsAt);
  const end = formatCampaignDay(locale, endsAt);
  if (!start && !end) return null;

  const range = start && end ? `${start} – ${end}` : start || end;

  return (
    <div
      className={`border-b border-primary/20 bg-primary-fixed/80 text-center${className ? ` ${className}` : ""}`}
      role="status"
    >
      <p className="page-shell py-2.5 text-xs font-semibold tracking-wide text-primary sm:text-sm">
        {t("validity", { range })}
      </p>
    </div>
  );
}
