"use client";

import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountTabs } from "@/components/AccountTabs";
import { Reveal } from "@/components/Reveal";
import {
  WellnessRingProgress,
  WellnessTrendChart,
} from "@/components/WellnessTrendChart";
import { getApiBase } from "@/lib/api";
import { getToken, isAuthenticated } from "@/lib/auth";

type Measurement = {
  measuredAt: string;
  weightKg: number | null;
  waistCm: number | null;
  hipCm: number | null;
  status: string;
};

type WaterState = { totalMl: number; goalMl: number };
type Meal = { mealType: string; note: string | null; status: string };

export default function ProgressReportPage() {
  const t = useTranslations("wellnessPage");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [water, setWater] = useState<WaterState | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/giris?next=/hesabim/rapor");
      return;
    }
    const token = getToken();
    void (async () => {
      try {
        const [meRes, wellnessRes] = await Promise.all([
          fetch(`${getApiBase()}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${getApiBase()}/wellness/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (meRes.ok) {
          const me = await meRes.json();
          const n = [me.firstName, me.lastName].filter(Boolean).join(" ");
          if (n) setName(n);
          else setName(t("defaultClientName"));
        }
        if (!wellnessRes.ok) throw new Error("__REPORT_FAIL__");
        const data = await wellnessRes.json();
        setWater(data.water);
        setMeals(data.meals || []);
        setMeasurements(data.measurements || []);
      } catch (e) {
        setError(e instanceof Error && e.message !== "__REPORT_FAIL__" ? e.message : t("reportLoadFailed"));
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const reportNo = useMemo(() => {
    const d = new Date();
    return `#REP-${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
  }, []);

  const latest = measurements[0];
  const first = measurements[measurements.length - 1];
  const delta =
    latest?.weightKg != null && first?.weightKg != null
      ? Number(latest.weightKg) - Number(first.weightKg)
      : null;

  if (loading) {
    return (
      <div className="page-shell py-12 text-sm text-on-surface-variant">
        {t("reportPreparing")}
      </div>
    );
  }

  function downloadPdf() {
    const prev = document.title;
    document.title = t("pdfDocTitle", { name: name.replace(/\s+/g, "-"), reportNo });
    window.print();
    setTimeout(() => {
      document.title = prev;
    }, 500);
  }

  return (
    <div className="page-shell py-10 print:max-w-none print:px-0">
      <div className="print:hidden">
        <AccountTabs active="rapor" />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * { visibility: hidden !important; }
          .progress-report-print, .progress-report-print * { visibility: visible !important; }
          .progress-report-print {
            position: absolute; left: 0; top: 0; width: 100%;
            padding: 24px; background: white;
          }
        }
      `,
        }}
      />

      <Reveal className="mt-8 print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t("reportTitle")}
            </p>
            <h1 className="font-display text-3xl text-on-surface">
              {t("reportSubtitle", { name })}
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              {t("reportNo")} <strong className="text-primary">{reportNo}</strong> ·{" "}
              {new Date().toLocaleDateString(locale)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/hesabim/takip"
              className="rounded-full bg-surface-container px-4 py-2 text-sm font-semibold"
            >
              {t("backToTracking")}
            </Link>
            <button
              type="button"
              onClick={downloadPdf}
              className="btn-cta px-5 py-2.5 text-sm"
            >
              {t("saveAsPdf")}
            </button>
          </div>
        </div>
      </Reveal>

      {error ? (
        <p className="mt-6 rounded-xl border border-error/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <Reveal delay={80}>
        <article className="progress-report-print mt-8 space-y-6 rounded-xl bg-surface-container-lowest p-6 shadow-sm md:p-8 print:mt-0 print:rounded-none print:shadow-none">
          <header className="hidden print:block">
            <p className="text-xs uppercase tracking-wide text-primary">
              Herbal Kapıda · {t("reportTitle")}
            </p>
            <h1 className="mt-1 font-display text-3xl">
              {t("reportSubtitle", { name })}
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              {t("reportNo")} {reportNo} · {new Date().toLocaleDateString("tr-TR")}
            </p>
          </header>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary">
              {t("approvedDoc")}
            </span>
            <span className="rounded-full bg-tertiary-fixed/50 px-3 py-1 text-xs font-semibold text-tertiary">
              {t("updatesAfterCoach")}
            </span>
          </div>

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-surface-container-low p-4 sm:col-span-1">
              <WellnessRingProgress
                value={water?.totalMl ?? 0}
                goal={water?.goalMl ?? 2500}
                label={t("waterToday")}
                size={100}
              />
            </div>
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-xs text-on-surface-variant">{t("mealRecords")}</p>
              <p className="mt-1 font-display text-2xl text-primary">
                {meals.length}
              </p>
              <p className="text-xs text-on-surface-variant">
                {t("pendingMeals", { count: meals.filter((m) => m.status === "pending").length })}
              </p>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-surface-container">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${
                      meals.length
                        ? (meals.filter((m) => m.status === "approved").length /
                            meals.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
                <div
                  className="h-full bg-flash/70"
                  style={{
                    width: `${
                      meals.length
                        ? (meals.filter((m) => m.status === "pending").length /
                            meals.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="mt-1 text-[10px] text-on-surface-variant">
                {t("legendApprovedPending")}
              </p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-xs text-on-surface-variant">{t("weightChange")}</p>
              <p className="mt-1 font-display text-2xl text-primary">
                {delta == null
                  ? "—"
                  : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg`}
              </p>
              <p className="text-xs text-on-surface-variant">
                {t("lastWeight", { weight: latest?.weightKg ?? "—" })}
              </p>
            </div>
          </section>

          <section className="print:break-inside-avoid">
            <h2 className="font-display text-xl">{t("measurementChart")}</h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              {t("measurementChartHint")}
            </p>
            <div className="mt-4">
              <WellnessTrendChart
                points={[...measurements]
                  .slice()
                  .reverse()
                  .map((m) => ({
                    date: m.measuredAt,
                    weightKg: m.weightKg,
                    waistCm: m.waistCm,
                    hipCm: m.hipCm,
                  }))}
                height={260}
              />
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl">{t("measurementHistory")}</h2>
            <ul className="mt-3 divide-y divide-outline-variant/30">
              {measurements.length === 0 ? (
                <li className="py-3 text-sm text-on-surface-variant">
                  {t("noMeasurementsYet")}{" "}
                  <Link href="/hesabim/olcumler" className="text-primary underline">
                    {t("addMeasurement")}
                  </Link>
                </li>
              ) : (
                measurements.slice(0, 8).map((m, i) => (
                  <li
                    key={`${m.measuredAt}-${i}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                  >
                    <span>{m.measuredAt}</span>
                    <span className="font-semibold text-on-surface">
                      {m.weightKg ?? "—"} kg
                      {m.waistCm != null
                        ? ` · ${t("waistShort", { cm: m.waistCm })} cm`
                        : ""}
                    </span>
                    <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] uppercase">
                      {m.status}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <p className="text-xs text-on-surface-variant print:mt-8">
            {t("reportFooter")}
          </p>
          <div className="hidden print:block print:mt-10 print:border-t print:pt-4 print:text-xs">
            {t("printFooter", { brand: "Herbal Kapıda", reportNo })}
          </div>
        </article>
      </Reveal>
    </div>
  );
}
