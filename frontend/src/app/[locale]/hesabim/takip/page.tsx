"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountTabs } from "@/components/AccountTabs";
import { SuccessModal } from "@/components/SuccessModal";
import {
  WellnessRingProgress,
  WellnessTrendChart,
} from "@/components/WellnessTrendChart";
import { getApiBase } from "@/lib/api";
import { getToken, isAuthenticated } from "@/lib/auth";

type WaterState = {
  logDate: string;
  totalMl: number;
  goalMl: number;
};

type Meal = {
  id: string;
  mealType: string;
  note: string | null;
  photoUrl: string | null;
  logDate: string;
  status: string;
};

type Measurement = {
  id: string;
  measuredAt: string;
  weightKg: number | null;
  waistCm: number | null;
  hipCm: number | null;
  status: string;
};

async function authFetch(path: string, init?: RequestInit) {
  const token = getToken();
  const res = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "__REQ_FAIL__");
  }
  return res.json();
}

export default function WellnessTrackPage() {
  const t = useTranslations("wellnessPage");
  const tc = useTranslations("common");
  const router = useRouter();
  const [water, setWater] = useState<WaterState | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [mealNote, setMealNote] = useState("");
  const [mealType, setMealType] = useState("ogle");
  const [mealPhotoUrl, setMealPhotoUrl] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const [waterCustom, setWaterCustom] = useState("250");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  function showSuccess(title: string, body: string) {
    setOk(title);
    setModalTitle(title);
    setModalBody(body);
    setModalOpen(true);
  }

  const load = useCallback(async () => {
    const data = await authFetch("/wellness/me");
    setWater(data.water);
    setMeals(data.meals || []);
    setMeasurements(data.measurements || []);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/giris?next=/hesabim/takip");
      return;
    }
    void load()
      .catch((e) => setError(e instanceof Error && e.message !== "__REQ_FAIL__" ? e.message : tc("loadFailed")))
      .finally(() => setLoading(false));
  }, [load, router]);

  async function addWater(amountMl = 250) {
    setError(null);
    try {
      const data = await authFetch("/wellness/water", {
        method: "POST",
        body: JSON.stringify({ amountMl }),
      });
      setWater(data);
      setWaterModalOpen(false);
      showSuccess(t("waterAddedTitle"), t("waterAddedBody", { amount: amountMl }));
    } catch (e) {
      setError(e instanceof Error ? e.message : tc("saveFailed"));
    }
  }

  async function uploadMealPhoto(file: File) {
    setPhotoBusy(true);
    setError(null);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${getApiBase()}/wellness/meals/photo`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "__PHOTO_FAIL__");
      }
      const data = await res.json();
      setMealPhotoUrl(data.url);
    } catch (e) {
      setError(e instanceof Error && e.message !== "__PHOTO_FAIL__" ? e.message : t("photoUploadFailed"));
    } finally {
      setPhotoBusy(false);
    }
  }

  async function submitMeal(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await authFetch("/wellness/meals", {
        method: "POST",
        body: JSON.stringify({
          mealType,
          note: mealNote,
          photoUrl: mealPhotoUrl || undefined,
        }),
      });
      setMealNote("");
      setMealPhotoUrl(null);
      setMealModalOpen(false);
      showSuccess(t("mealSubmittedTitle"), t("mealSubmittedBody"));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : tc("saveFailed"));
    }
  }

  function openMealSlot(slotId: string) {
    setMealType(slotId === "ara2" ? "ara" : slotId);
    setMealModalOpen(true);
  }

  async function submitMeasurement(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await authFetch("/wellness/measurements", {
        method: "POST",
        body: JSON.stringify({
          weightKg: weight ? Number(weight) : undefined,
        }),
      });
      setWeight("");
      showSuccess(t("measurementSavedTitle"), t("measurementSavedBody"));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : tc("saveFailed"));
    }
  }

  const progress = water
    ? Math.min(100, Math.round((water.totalMl / water.goalMl) * 100))
    : 0;

  const chartPoints = useMemo(
    () =>
      [...measurements]
        .slice()
        .reverse()
        .map((m) => ({
          date: m.measuredAt,
          weightKg: m.weightKg,
          waistCm: m.waistCm,
          hipCm: m.hipCm,
        })),
    [measurements],
  );

  if (loading) {
    return (
      <div className="page-shell py-12 text-sm text-on-surface-variant">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="page-shell space-y-8 py-10">
      <AccountTabs active="takip" />
      <SuccessModal
        open={modalOpen}
        title={modalTitle}
        body={modalBody}
        onClose={() => setModalOpen(false)}
      />

      {waterModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {t("waterTracking")}
                </p>
                <h2 className="font-display text-xl">{t("addWater")}</h2>
              </div>
              <button
                type="button"
                className="text-sm text-on-surface-variant"
                onClick={() => setWaterModalOpen(false)}
              >
                {tc("close")}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[200, 250, 330, 500].map((ml) => (
                <button
                  key={ml}
                  type="button"
                  onClick={() => void addWater(ml)}
                  className="rounded-full bg-primary-fixed px-4 py-2 text-sm font-semibold text-primary"
                >
                  +{ml} ml
                </button>
              ))}
            </div>
            <label className="mt-4 block text-sm">
              <span className="field-label">{t("customAmountMl")}</span>
              <input
                className="field-input"
                type="number"
                min={50}
                value={waterCustom}
                onChange={(e) => setWaterCustom(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn-cta mt-4 w-full py-3"
              onClick={() => void addWater(Number(waterCustom) || 250)}
            >
              {tc("save")}
            </button>
          </div>
        </div>
      ) : null}

      {mealModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {t("mealLog")}
                </p>
                <h2 className="font-display text-xl">{t("addPhotoAndNote")}</h2>
              </div>
              <button
                type="button"
                className="text-sm text-on-surface-variant"
                onClick={() => setMealModalOpen(false)}
              >
                {tc("close")}
              </button>
            </div>
            <form onSubmit={submitMeal} className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="field-label">{t("meal")}</span>
                <select
                  className="field-input"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                >
                  <option value="kahvalti">{t("mealBreakfast")}</option>
                  <option value="ogle">{t("mealLunch")}</option>
                  <option value="aksam">{t("mealDinner")}</option>
                  <option value="ara">{t("mealSnack")}</option>
                  <option value="other">{t("mealOther")}</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="field-label">{t("note")}</span>
                <textarea
                  className="field-input"
                  rows={3}
                  value={mealNote}
                  onChange={(e) => setMealNote(e.target.value)}
                  placeholder={t("whatDidYouEat")}
                />
              </label>
              <label className="block text-sm">
                <span className="field-label">{t("photo")}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="field-input"
                  disabled={photoBusy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadMealPhoto(file);
                  }}
                />
                {mealPhotoUrl ? (
                  <span className="mt-1 block text-xs text-primary">
                    {t("photoReady")}
                  </span>
                ) : null}
              </label>
              <button type="submit" className="btn-cta w-full py-3">
                {t("sendToCoach")}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {t("healthTracking")}
          </p>
          <h1 className="font-display text-3xl text-on-surface">
            {t("pageTitle")}
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {t("pageLead")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/hesabim/rapor"
            className="rounded-full bg-surface-container px-4 py-2 text-sm font-semibold"
          >
            {t("progressReport")}
          </Link>
          <Link
            href="/hesabim/olcumler"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
          >
            {t("measurements")}
          </Link>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}
      {ok && !modalOpen ? (
        <p className="rounded-xl border border-primary/30 bg-primary-fixed/40 px-4 py-3 text-sm text-primary">
          {ok}
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t("waterKpi"),
            value: `${water?.totalMl ?? 0} ml`,
            sub: t("goalPercent", { percent: progress }),
          },
          {
            label: t("mealLog"),
            value: String(meals.length),
            sub: t("pendingApproval", { count: meals.filter((m) => m.status === "pending").length }),
          },
          {
            label: t("measurementKpi"),
            value:
              measurements[0]?.weightKg != null
                ? `${measurements[0].weightKg} kg`
                : "—",
            sub: measurements[0]?.measuredAt || t("noneYet"),
          },
          {
            label: t("programWeek"),
            value: `H${Math.max(1, Math.ceil(new Date().getDate() / 7))}`,
            sub: t("coachProgram"),
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl bg-surface-container-lowest p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              {kpi.label}
            </p>
            <p className="mt-2 font-display text-2xl text-primary">{kpi.value}</p>
            <p className="mt-1 text-xs text-on-surface-variant">{kpi.sub}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-secondary-container/40 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {t("yourCoach")}
        </p>
        <h2 className="mt-1 font-display text-xl">Herbal Kapıda</h2>
        <p className="mt-2 text-sm text-on-surface-variant">{t("coachBody")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/hesabim/rapor"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
          >
            {t("progressReport")}
          </Link>
          <Link
            href="/hesabim/olcumler"
            className="rounded-full bg-surface-container-lowest px-4 py-2 text-sm font-semibold"
          >
            {t("measurements")}
          </Link>
        </div>
      </section>

      <section className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <WellnessRingProgress
            value={water?.totalMl ?? 0}
            goal={water?.goalMl ?? 2500}
            label={t("waterTracking")}
            size={108}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setWaterModalOpen(true)}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
            >
              {t("addWater")}
            </button>
            {[250, 500].map((ml) => (
              <button
                key={ml}
                type="button"
                onClick={() => void addWater(ml)}
                className="rounded-full bg-primary-fixed px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-on-primary"
              >
                +{ml} ml
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-surface-container">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => {
            const filled =
              water != null &&
              (i + 1) * 250 <= Math.min(water.totalMl, water.goalMl);
            return (
              <span
                key={i}
                className={`flex h-10 w-8 items-end justify-center rounded-md border text-[10px] ${
                  filled
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-outline-variant/40 text-outline"
                }`}
              >
                {filled ? "💧" : ""}
              </span>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
        <h2 className="font-display text-xl">{t("dailyMealRoutine")}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          {t("tapSlotHint")}
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { id: "kahvalti", label: t("slotBreakfastF1") },
            { id: "ara", label: t("mealSnack") },
            { id: "ogle", label: t("mealLunch") },
            { id: "ara2", label: t("slotAfternoon") },
            { id: "aksam", label: t("mealDinner") },
            { id: "other", label: t("slotEveningLate") },
          ].map((slot) => {
            const logged = meals.find(
              (m) =>
                m.mealType === slot.id ||
                (slot.id === "ara2" && m.mealType === "ara"),
            );
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => openMealSlot(slot.id)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  logged
                    ? "border-primary/40 bg-primary-fixed/40"
                    : "border-[#ebece8] hover:border-primary/40"
                }`}
              >
                <span className="font-semibold text-on-surface">{slot.label}</span>
                <span className="mt-1 block text-xs text-on-surface-variant">
                  {logged
                    ? `${logged.status} · ${logged.note || t("logged")}`
                    : t("notLoggedYet")}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <form
          onSubmit={submitMeal}
          className="rounded-xl bg-surface-container-lowest p-6 shadow-sm"
        >
          <h2 className="font-display text-xl">{t("meal")} ekle</h2>
          <label className="mt-4 block text-sm">
            <span className="field-label">{t("meal")}</span>
            <select
              className="field-input"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option value="kahvalti">{t("mealBreakfast")}</option>
              <option value="ogle">{t("mealLunch")}</option>
              <option value="aksam">{t("mealDinner")}</option>
              <option value="ara">{t("mealSnack")}</option>
              <option value="other">{t("mealOther")}</option>
            </select>
          </label>
          <label className="mt-3 block text-sm">
            <span className="field-label">{t("note")}</span>
            <textarea
              className="field-input"
              rows={3}
              value={mealNote}
              onChange={(e) => setMealNote(e.target.value)}
              placeholder={t("whatDidYouEat")}
            />
          </label>
          <label className="mt-3 block text-sm">
            <span className="field-label">{t("photoOptional")}</span>
            <input
              type="file"
              accept="image/*"
              className="field-input"
              disabled={photoBusy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadMealPhoto(file);
              }}
            />
            {photoBusy ? (
              <span className="mt-1 block text-xs text-on-surface-variant">
                {t("loading")}
              </span>
            ) : null}
            {mealPhotoUrl ? (
              <span className="mt-1 block text-xs text-primary">
                {t("photoAdded")}
              </span>
            ) : null}
          </label>
          <button type="submit" className="btn-cta mt-4 px-5 py-2.5">
            {t("sendToCoach")}
          </button>
        </form>

        <form
          onSubmit={submitMeasurement}
          className="rounded-xl bg-surface-container-lowest p-6 shadow-sm"
        >
          <h2 className="font-display text-xl">{t("quickMeasurement")}</h2>
          <label className="mt-4 block text-sm">
            <span className="field-label">{t("weightKg")}</span>
            <input
              className="field-input"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="72.5"
            />
          </label>
          <button type="submit" className="btn-cta mt-4 px-5 py-2.5">
            {t("saveMeasurement")}
          </button>
        </form>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="font-display text-lg">{t("recentMeals")}</h2>
          <ul className="mt-4 space-y-3">
            {meals.map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-[#ebece8] px-3 py-2 text-sm"
              >
                <div className="flex justify-between gap-2">
                  <span className="font-semibold">{m.mealType}</span>
                  <span className="text-xs text-on-surface-variant">
                    {m.status}
                  </span>
                </div>
                <p className="text-on-surface-variant">{m.note || "—"}</p>
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photoUrl}
                    alt=""
                    className="mt-2 h-16 w-16 rounded-lg object-cover"
                  />
                ) : null}
              </li>
            ))}
            {!meals.length ? (
              <li className="text-sm text-on-surface-variant">{t("noRecords")}</li>
            ) : null}
          </ul>
        </div>
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg">{t("measurementTrend")}</h2>
            <Link
              href="/hesabim/olcumler"
              className="text-xs font-semibold text-primary hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          <div className="mt-3">
            <WellnessTrendChart
              points={chartPoints}
              height={240}
            />
          </div>
          <ul className="mt-4 space-y-3">
            {measurements.slice(0, 4).map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-[#ebece8] px-3 py-2 text-sm"
              >
                <div className="flex justify-between gap-2">
                  <span className="font-semibold">{m.measuredAt}</span>
                  <span className="text-xs text-on-surface-variant">
                    {m.status}
                  </span>
                </div>
                <p className="text-on-surface-variant">
                  {m.weightKg != null ? `${m.weightKg} kg` : "—"}
                  {m.waistCm != null ? ` · ${t("waistShort", { cm: m.waistCm })}` : ""}
                </p>
              </li>
            ))}
            {!measurements.length ? (
              <li className="text-sm text-on-surface-variant">{t("noRecords")}</li>
            ) : null}
          </ul>
        </div>
      </section>
    </div>
  );
}
