import fs from "fs";
import path from "path";

const base = path.join(import.meta.dirname, "..", "src", "app", "[locale]", "hesabim");

function ensureTakipHooks(s) {
  if (s.includes('useTranslations("wellnessPage")')) return s;
  s = s.replace(
    'import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";',
    'import { useTranslations } from "next-intl";\nimport { FormEvent, useCallback, useEffect, useMemo, useState } from "react";',
  );
  s = s.replace(
    "export default function WellnessTrackPage() {\n  const router = useRouter();",
    'export default function WellnessTrackPage() {\n  const t = useTranslations("wellnessPage");\n  const tc = useTranslations("common");\n  const router = useRouter();',
  );
  return s;
}

function patchTakip() {
  const file = path.join(base, "takip", "page.tsx");
  let s = fs.readFileSync(file, "utf8");
  s = ensureTakipHooks(s);
  s = s.replace(
    'throw new Error(err.message || "İstek başarısız");',
    'throw new Error(err.message || "__REQ_FAIL__");',
  );
  s = s.replace(
    '.catch((e) => setError(e instanceof Error ? e.message : "Yüklenemedi"))',
    '.catch((e) => setError(e instanceof Error && e.message !== "__REQ_FAIL__" ? e.message : tc("loadFailed")))',
  );
  s = s.replace(
    "throw new Error(err.message || \"Foto yüklenemedi\");",
    'throw new Error(err.message || "__PHOTO_FAIL__");',
  );
  s = s.replace(/setError\(e instanceof Error \? e\.message : "Foto yüklenemedi"\)/g, 'setError(e instanceof Error && e.message !== "__PHOTO_FAIL__" ? e.message : t("photoUploadFailed"))');
  s = s.replace(
    'showSuccess("Su eklendi", `+${amountMl} ml su kaydınız güncellendi.`);',
    'showSuccess(t("waterAddedTitle"), t("waterAddedBody", { amount: amountMl }));',
  );
  s = s.replace(
    'showSuccess(\n        "Öğün iletildi",\n        "Öğün kaydınız koç onay kuyruğuna gönderildi.",\n      );',
    'showSuccess(t("mealSubmittedTitle"), t("mealSubmittedBody"));',
  );
  s = s.replace(
    'showSuccess(\n        "Ölçüm kaydedildi",\n        "Ölçümünüz koç onayına gönderildi.",\n      );',
    'showSuccess(t("measurementSavedTitle"), t("measurementSavedBody"));',
  );
  s = s.replace(/setError\(err instanceof Error \? err\.message : "Kayıt başarısız"\)/g, 'setError(err instanceof Error ? err.message : tc("saveFailed"))');
  s = s.replace(/setError\(e instanceof Error \? e\.message : "Kayıt başarısız"\)/g, 'setError(e instanceof Error ? e.message : tc("saveFailed"))');

  const pairs = [
    ["Yükleniyor…", '{t("loading")}'],
    ["Kapat", '{tc("close")}'],
    ["Su takibi", '{t("waterTracking")}'],
    ["Su ekle", '{t("addWater")}'],
    ["Özel miktar (ml)", '{t("customAmountMl")}'],
    ["Kaydet", '{tc("save")}'],
    ["Öğün kaydı", '{t("mealLog")}'],
    ["Fotoğraf ve not ekle", '{t("addPhotoAndNote")}'],
    ["Öğün", '{t("meal")}'],
    ['<option value="kahvalti">Kahvaltı</option>', '<option value="kahvalti">{t("mealBreakfast")}</option>'],
    ['<option value="ogle">Öğle</option>', '<option value="ogle">{t("mealLunch")}</option>'],
    ['<option value="aksam">Akşam</option>', '<option value="aksam">{t("mealDinner")}</option>'],
    ['<option value="ara">Ara öğün</option>', '<option value="ara">{t("mealSnack")}</option>'],
    ['<option value="other">Diğer</option>', '<option value="other">{t("mealOther")}</option>'],
    ["Not", '{t("note")}'],
    ['placeholder="Ne yediniz?"', 'placeholder={t("whatDidYouEat")}'],
    ["Fotoğraf", '{t("photo")}'],
    ["Foto hazır", '{t("photoReady")}'],
    ["Koça gönder", '{t("sendToCoach")}'],
    ["Sağlık takibi", '{t("healthTracking")}'],
    ["Günlük su ve öğün takibi", '{t("pageTitle")}'],
    ["Su, öğün ve ölçümlerinizi kaydedin; koçunuz onaylasın.", '{t("pageLead")}'],
    ["Gelişim raporu", '{t("progressReport")}'],
    ["Ölçümler", '{t("measurements")}'],
    ['label: "Su"', 'label: t("waterKpi")'],
    ['label: "Öğün kaydı"', 'label: t("mealKpi")'],
    ['label: "Ölçüm"', 'label: t("measurementKpi")'],
    ['sub: measurements[0]?.measuredAt || "Henüz yok"', 'sub: measurements[0]?.measuredAt || t("noneYet")'],
    ['label: "Program haftası"', 'label: t("programWeek")'],
    ['sub: "Koç takip programı"', 'sub: t("coachProgram")'],
    ["Koçunuz", '{t("yourCoach")}'],
    ["Öğün ve ölçümlerinizi onaylar; WhatsApp ile motivasyon mesajı\n          gönderebilir. Gelişim raporunuzu PDF olarak indirebilirsiniz.", '{t("coachBody")}'],
    ['label="Su takibi"', 'label={t("waterTracking")}'],
    ["Günün öğün rutini", '{t("dailyMealRoutine")}'],
    ["Kutucuğa tıklayarak hızlı öğün kaydı açın", '{t("tapSlotHint")}'],
    ['{ id: "kahvalti", label: "Kahvaltı / Formül 1" }', '{ id: "kahvalti", label: t("slotBreakfastF1") }'],
    ['{ id: "ara", label: "Ara öğün" }', '{ id: "ara", label: t("mealSnack") }'],
    ['{ id: "ogle", label: "Öğle" }', '{ id: "ogle", label: t("mealLunch") }'],
    ['{ id: "ara2", label: "İkindi" }', '{ id: "ara2", label: t("slotAfternoon") }'],
    ['{ id: "aksam", label: "Akşam" }', '{ id: "aksam", label: t("mealDinner") }'],
    ['{ id: "other", label: "Akşamüstü" }', '{ id: "other", label: t("slotEveningLate") }'],
    ['? `${logged.status} · ${logged.note || "kayıtlı"}`', '? `${logged.status} · ${logged.note || t("logged")}`'],
    ['"Henüz kaydedilmedi"', 't("notLoggedYet")'],
    ["Öğün ekle", '{t("addMeal")}'],
    ["Fotoğraf (isteğe bağlı)", '{t("photoOptional")}'],
    ["Foto eklendi", '{t("photoAdded")}'],
    ["Hızlı ölçüm", '{t("quickMeasurement")}'],
    ["Kilo (kg)", '{t("weightKg")}'],
    ["Ölçümü kaydet", '{t("saveMeasurement")}'],
    ["Son öğünler", '{t("recentMeals")}'],
    ["Ölçüm trendi", '{t("measurementTrend")}'],
    ["Tümü →", '{t("viewAll")}'],
    ["Henüz kayıt yok", '{t("noRecords")}'],
    ['sub: `${meals.filter((m) => m.status === "pending").length} onay bekliyor`', 'sub: t("pendingApproval", { count: meals.filter((m) => m.status === "pending").length })'],
    ['sub: `%${progress} hedef`', 'sub: t("goalPercent", { percent: progress })'],
    ['{m.waistCm != null ? ` · bel ${m.waistCm}` : ""}', '{m.waistCm != null ? ` · ${t("waistShort", { cm: m.waistCm })}` : ""}'],
  ];
  for (const [from, to] of pairs) {
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s);
  console.log("takip patched");
}

function patchOlcumler() {
  const file = path.join(base, "olcumler", "page.tsx");
  let s = fs.readFileSync(file, "utf8");
  if (!s.includes('useTranslations("wellnessPage")')) {
    s = s.replace(
      'import { FormEvent, useEffect, useMemo, useState } from "react";',
      'import { useTranslations } from "next-intl";\nimport { FormEvent, useEffect, useMemo, useState } from "react";',
    );
    s = s.replace(
      "export default function MeasurementsPage() {\n  const router = useRouter();",
      'export default function MeasurementsPage() {\n  const t = useTranslations("wellnessPage");\n  const tc = useTranslations("common");\n  const router = useRouter();',
    );
  }
  s = s.replace('throw new Error("Ölçümler yüklenemedi");', 'throw new Error("__LOAD_FAIL__");');
  s = s.replace(
    'setError(e instanceof Error ? e.message : "Hata")',
    'setError(e instanceof Error && e.message !== "__LOAD_FAIL__" ? e.message : tc("loadFailed"))',
  );
  s = s.replace('if (!res.ok) throw new Error("Kayıt başarısız");', 'if (!res.ok) throw new Error("__SAVE_FAIL__");');
  s = s.replace(
    'setError(err instanceof Error ? err.message : "Hata")',
    'setError(err instanceof Error && err.message !== "__SAVE_FAIL__" ? err.message : tc("saveFailed"))',
  );
  s = s.replace('setOk("Ölçüm kaydedildi — koç onayı bekleniyor");', 'setOk(t("measurementSavedPending"));');
  s = s.replace('title="Ölçüm kaydedildi"', 'title={t("measurementSavedTitle")}');
  s = s.replace('body="Ölçümünüz koç onay kuyruğuna iletildi."', 'body={t("measurementSavedBody")}');
  const pairs = [
    ["Yeni ölçüm", '{t("newMeasurement")}'],
    ["Kilo (kg)", '{t("weightKg")}'],
    ["Bel (cm)", '{t("waistCm")}'],
    ["Kalça (cm)", '{t("hipCm")}'],
    ["Not", '{t("note")}'],
    ["Vazgeç", '{tc("cancel")}'],
    ["Kaydet", '{tc("save")}'],
    ["Beslenme &amp; kilo çizelgem", '{t("chartTitle")}'],
    ["Hedef, güncel ve geçmiş ölçümlerinizi tek ekranda görün.", '{t("chartLead")}'],
    ["Rapor", '{t("reportLink")}'],
    ['{ label: "Başlangıç"', '{ label: t("startLabel")'],
    ['{ label: "Güncel"', '{ label: t("currentLabel")'],
    ['{ label: "Hedef (öneri)"', '{ label: t("goalSuggested")'],
    ["Gelişim grafiği", '{t("progressChart")}'],
    ["Kilo, bel ve kalça — üzerine gelerek nokta detayını görün", '{t("progressChartHint")}'],
    ["Tarih", '{t("tableDate")}'],
    ["Kalça", '{t("tableHip")}'],
    ["Durum", '{t("tableStatus")}'],
    ["Kayıt yok", '{t("noTableRecords")}'],
    ['goalLabel="Hedef"', 'goalLabel={t("goal")}'],
  ];
  s = s.replace(
    "Kilo {delta > 0 ? \"+\" : \"\"}\n              {delta} kg",
    "{t(\"weightDelta\", { delta: `${delta > 0 ? \"+\" : \"\"}${delta}` })}",
  );
  s = s.replace('goalLabel="Hedef"', 'goalLabel={t("goal")}');
  for (const [from, to] of pairs) {
    if (from.includes("weightDelta")) continue;
    s = s.split(from).join(to);
  }
  s = s.replace('<th className="px-4 py-3">Kilo</th>', '<th className="px-4 py-3">{t("tableWeight")}</th>');
  s = s.replace('<th className="px-4 py-3">Bel</th>', '<th className="px-4 py-3">{t("tableWaist")}</th>');
  fs.writeFileSync(file, s);
  console.log("olcumler patched");
}

function patchRapor() {
  const file = path.join(base, "rapor", "page.tsx");
  let s = fs.readFileSync(file, "utf8");
  if (!s.includes('useTranslations("wellnessPage")')) {
    s = s.replace(
      'import { useEffect, useMemo, useState } from "react";',
      'import { useTranslations } from "next-intl";\nimport { useEffect, useMemo, useState } from "react";',
    );
    s = s.replace(
      "export default function ProgressReportPage() {\n  const router = useRouter();",
      'export default function ProgressReportPage() {\n  const t = useTranslations("wellnessPage");\n  const tc = useTranslations("common");\n  const locale = useLocale();\n  const router = useRouter();',
    );
    s = s.replace(
      'import { useTranslations } from "next-intl";',
      'import { useLocale, useTranslations } from "next-intl";',
    );
  }
  s = s.replace('useState("Danışan")', 'useState("")');
  s = s.replace(
    'if (!wellnessRes.ok) throw new Error("Rapor verisi yüklenemedi");',
    'if (!wellnessRes.ok) throw new Error("__REPORT_FAIL__");',
  );
  s = s.replace(
    'setError(e instanceof Error ? e.message : "Hata")',
    'setError(e instanceof Error && e.message !== "__REPORT_FAIL__" ? e.message : t("reportLoadFailed"))',
  );
  s = s.replace(
    'if (n) setName(n);',
    'if (n) setName(n);\n          else setName(t("defaultClientName"));',
  );
  s = s.replace('Rapor hazırlanıyor…', '{t("reportPreparing")}');
  s = s.replace(
    'document.title = `Gelisim-Raporu-${name.replace(/\\s+/g, "-")}-${reportNo}`;',
    'document.title = t("pdfDocTitle", { name: name.replace(/\\s+/g, "-"), reportNo });',
  );
  s = s.replace('new Date().toLocaleDateString("tr-TR")', 'new Date().toLocaleDateString(locale)');
  const pairs = [
    ["Gelişim raporu", '{t("reportTitle")}'],
    ["{name} — bütünsel gelişim özeti", '{t("reportSubtitle", { name })}'],
    ["Rapor No:", '{t("reportNo")}'],
    ["Takibe dön", '{t("backToTracking")}'],
    ["PDF olarak kaydet", '{t("saveAsPdf")}'],
    ["Herbal Kapıda · Gelişim raporu", '{t("printHeader", { brand: "Herbal Kapıda" })}'],
    ["Onaylanmış danışan belgesi", '{t("approvedDoc")}'],
    ["Koç onayı sonrası güncellenir", '{t("updatesAfterCoach")}'],
    ['label="Bugünkü su"', 'label={t("waterToday")}'],
    ["Öğün kayıtları", '{t("mealRecords")}'],
    ['Onay bekleyen:{" "}', '{t("pendingMeals", { count: meals.filter((m) => m.status === "pending").length }).split(":")[0]}: '],
    ["Yeşil: onaylı · Turuncu: bekleyen", '{t("legendApprovedPending")}'],
    ["Kilo değişimi", '{t("weightChange")}'],
    ['Son: {latest?.weightKg ?? "—"} kg', '{t("lastWeight", { weight: latest?.weightKg ?? "—" })}'],
    ["Ölçüm grafiği", '{t("measurementChart")}'],
    ["Kronolojik kilo / bel / kalça trendi", '{t("measurementChartHint")}'],
    ["Ölçüm geçmişi", '{t("measurementHistory")}'],
    ['Henüz ölçüm yok.{" "}', '{t("noMeasurementsYet")}{" "}'],
    ["Ölçüm ekle", '{t("addMeasurement")}'],
    ['Bu özet, hesabınızdaki wellness kayıtlarından üretilir. &quot;PDF\n            olarak kaydet&quot; ile yazdır diyaloğundan PDF seçin. Koç\n            onayından sonra ölçüm ve öğün verileri güncellenir.', '{t("reportFooter")}'],
    ['Herbal Kapıda · Bağımsız Distribütör · Rapor{" "}', '{t("printFooter", { brand: "Herbal Kapıda", reportNo })}{" "}'],
  ];
  for (const [from, to] of pairs) {
    s = s.split(from).join(to);
  }
  // fix pending meals line properly
  s = s.replace(
    `<p className="text-xs text-on-surface-variant">\n                {t("pendingMeals", { count: meals.filter((m) => m.status === "pending").length }).split(":")[0]}: \n                {meals.filter((m) => m.status === "pending").length}\n              </p>`,
    `<p className="text-xs text-on-surface-variant">\n                {t("pendingMeals", { count: meals.filter((m) => m.status === "pending").length })}\n              </p>`,
  );
  fs.writeFileSync(file, s);
  console.log("rapor patched");
}

patchTakip();
patchOlcumler();
patchRapor();
