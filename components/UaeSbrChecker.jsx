"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  SBR_REVENUE_THRESHOLD,
  SBR_END_DATE,
  MNE_GLOBAL_REVENUE_THRESHOLD,
  PERSON_TYPE,
  TRI,
  SBR_RESULT,
  FTA_SBR_URL,
  FTA_CT_URL,
  evaluateSBR,
  formatAED,
  formatAEDInt,
  sanitizeNumber,
} from "@/lib/uaeSbrConfig";

// ─── Small helpers ─────────────────────────────────────────────────────────────
function AedInput({ id, label, hint, value, onChange, optional = false }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-ink-secondary mb-1">
        {label}{optional && <span className="mr-1 text-ink-muted font-normal">(اختياري)</span>}
      </label>
      <div className="relative">
        <input id={id} type="number" inputMode="decimal" min="0" value={value}
          onChange={(e) => onChange(e.target.value)} placeholder="0"
          className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none" />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">د.إ</span>
      </div>
      {hint && <p className="mt-1 text-[11px] text-ink-muted leading-relaxed">{hint}</p>}
    </div>
  );
}

function TriToggle({ label, value, onChange, options }) {
  const opts = options || [{ l: "نعم", v: TRI.YES }, { l: "لا", v: TRI.NO }, { l: "غير متأكد", v: TRI.UNSURE }];
  return (
    <div>
      <p className="text-xs font-bold text-ink-secondary mb-2">{label}</p>
      <div className={`grid gap-2 max-w-sm`} style={{ gridTemplateColumns: `repeat(${opts.length}, 1fr)` }}>
        {opts.map(({ l, v }) => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${value === v ? "border-brand bg-brand-light text-brand-dark shadow-sm" : "border-brand-border bg-white text-ink-secondary hover:border-brand"}`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChecklistRow({ label, status, note }) {
  const icon = status === "pass" ? "✅" : status === "fail" ? "❌" : "⚠️";
  const color = status === "pass" ? "text-emerald-700" : status === "fail" ? "text-rose-700" : "text-amber-700";
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-brand-border/40 last:border-b-0">
      <span className="text-base shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className={`text-xs font-bold ${color}`}>{label}</p>
        {note && <p className="text-[10px] text-ink-muted">{note}</p>}
      </div>
    </div>
  );
}

const PERSON_OPTIONS = [
  { val: PERSON_TYPE.COMPANY,        label: "🏢 شركة / شخص اعتباري" },
  { val: PERSON_TYPE.NATURAL_PERSON, label: "👤 شخص طبيعي يمارس نشاطاً تجارياً" },
  { val: PERSON_TYPE.FREE_ZONE,      label: "🏙️ منشأة في منطقة حرة" },
  { val: PERSON_TYPE.UNSURE,         label: "❓ غير متأكد" },
];

export default function UaeSbrChecker() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [personType,    setPersonType]    = useState(PERSON_TYPE.COMPANY);
  const [residency,     setResidency]     = useState(TRI.YES);
  const [periodStart,   setPeriodStart]   = useState("");
  const [periodEnd,     setPeriodEnd]     = useState("");
  const [currentRev,    setCurrentRev]    = useState("0");
  const [hasPrior,      setHasPrior]      = useState(TRI.NO);
  const [priorPeriods,  setPriorPeriods]  = useState([{ label: "", revenue: "0" }]);
  const [isQFZP,        setIsQFZP]        = useState(TRI.NO);
  const [isMNE,         setIsMNE]         = useState(TRI.NO);
  const [mneRevenue,    setMneRevenue]    = useState("0");
  const [relatedEntities, setRelatedEntities] = useState(TRI.NO);
  const [showPrint,     setShowPrint]     = useState(false);
  const [showTradeoff,  setShowTradeoff]  = useState(false);

  // ── Derived ────────────────────────────────────────────────────────────────
  const highestPriorRevenue = useMemo(() => {
    if (hasPrior !== TRI.YES) return 0;
    return Math.max(0, ...priorPeriods.map(p => sanitizeNumber(p.revenue)));
  }, [hasPrior, priorPeriods]);

  const dateError = useMemo(() => {
    if (!periodStart || !periodEnd) return null;
    if (periodEnd <= periodStart) return "تاريخ النهاية يجب أن يكون بعد تاريخ البداية.";
    return null;
  }, [periodStart, periodEnd]);

  const evaluation = useMemo(() => evaluateSBR({
    personType, residency, taxPeriodStart: periodStart, taxPeriodEnd: periodEnd,
    currentRevenue: currentRev, hasPriorPeriods: hasPrior === TRI.YES,
    highestPriorRevenue, isQFZP, isMNE, mneGlobalRevenue: mneRevenue, hasRelatedEntities: relatedEntities,
  }), [personType, residency, periodStart, periodEnd, currentRev, hasPrior, highestPriorRevenue, isQFZP, isMNE, mneRevenue, relatedEntities]);

  const today = new Date().toLocaleDateString("ar-AE", { year: "numeric", month: "long", day: "numeric" });

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setPersonType(PERSON_TYPE.COMPANY); setResidency(TRI.YES);
    setPeriodStart(""); setPeriodEnd(""); setCurrentRev("0");
    setHasPrior(TRI.NO); setPriorPeriods([{ label: "", revenue: "0" }]);
    setIsQFZP(TRI.NO); setIsMNE(TRI.NO); setMneRevenue("0");
    setRelatedEntities(TRI.NO); setShowPrint(false); setShowTradeoff(false);
  }, []);

  // ── Preset loader ──────────────────────────────────────────────────────────
  const loadPreset = (id) => {
    handleReset();
    setTimeout(() => {
      if (id === "ex1") { setCurrentRev("2200000"); setHasPrior(TRI.YES); setPriorPeriods([{ label: "الفترة السابقة", revenue: "2600000" }]); setPeriodStart("2024-01-01"); setPeriodEnd("2024-12-31"); }
      else if (id === "ex2") { setCurrentRev("3400000"); setPeriodStart("2024-01-01"); setPeriodEnd("2024-12-31"); }
      else if (id === "ex3") { setCurrentRev("2500000"); setHasPrior(TRI.YES); setPriorPeriods([{ label: "الفترة السابقة", revenue: "3200000" }]); setPeriodStart("2024-01-01"); setPeriodEnd("2024-12-31"); }
      else if (id === "ex4") { setPersonType(PERSON_TYPE.FREE_ZONE); setIsQFZP(TRI.YES); setPeriodStart("2024-01-01"); setPeriodEnd("2024-12-31"); }
      else if (id === "ex5") { setPeriodStart("2026-04-01"); setPeriodEnd("2027-03-31"); setCurrentRev("1500000"); }
    }, 0);
  };

  // ── Result appearance ──────────────────────────────────────────────────────
  const resultConfig = {
    [SBR_RESULT.POTENTIALLY_ELIGIBLE]: { gradient: "bg-gradient-to-r from-emerald-700 to-teal-600",  emoji: "✅", title: "قد تكون مؤهلاً لتسهيلات الأعمال الصغيرة",          badge: "أهلية محتملة" },
    [SBR_RESULT.NOT_ELIGIBLE]:         { gradient: "bg-gradient-to-r from-rose-700 to-rose-600",      emoji: "❌", title: "غير مؤهل بناءً على البيانات المدخلة",               badge: "غير مؤهل" },
    [SBR_RESULT.REVIEW_REQUIRED]:      { gradient: "bg-gradient-to-r from-amber-600 to-amber-500",    emoji: "⚠️", title: "حالتك تحتاج إلى مراجعة إضافية",                    badge: "مراجعة مطلوبة" },
    [SBR_RESULT.OUTSIDE_TIME_WINDOW]:  { gradient: "bg-gradient-to-r from-slate-600 to-gray-600",    emoji: "📅", title: "الفترة الضريبية خارج النطاق الزمني الحالي للتسهيل", badge: "خارج النطاق الزمني" },
  };
  const rc = resultConfig[evaluation.result];

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-result">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏷️</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black leading-tight">حاسبة أهلية تسهيلات الأعمال الصغيرة في الإمارات</h1>
              <p className="mt-1 text-sm text-white/85">تقدير الأهلية لاختيار تسهيلات الأعمال الصغيرة في ضريبة الشركات الإماراتية — حد 3,000,000 درهم</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-bold whitespace-nowrap">محدث سبتمبر 2026 — FTA</span>
        </div>
      </div>

      {/* Date warning banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3">
        <span className="text-xl shrink-0">📅</span>
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>تنبيه:</strong> وفق التوجيهات الحالية لـ FTA، تسهيلات الأعمال الصغيرة تسري على الفترات الضريبية التي <strong>تنتهي في أو قبل 31 ديسمبر 2026</strong>. يُنصح بمراجعة أحدث إرشادات الهيئة الاتحادية للضرائب.
        </p>
      </div>

      {/* Presets */}
      <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3"><span>💡</span><span className="text-xs font-extrabold text-ink">نماذج سريعة:</span></div>
        <div className="flex flex-wrap gap-2">
          {[
            { id:"ex1", label:"إيرادات 2.2M (مؤهل)",              cls:"bg-emerald-50 border-emerald-200 text-emerald-800" },
            { id:"ex2", label:"إيرادات 3.4M (غير مؤهل)",          cls:"bg-rose-50 border-rose-200 text-rose-800"         },
            { id:"ex3", label:"فترة سابقة 3.2M (غير مؤهل)",       cls:"bg-rose-50 border-rose-200 text-rose-800"         },
            { id:"ex4", label:"QFZP (غير مؤهل)",                   cls:"bg-purple-50 border-purple-200 text-purple-800"   },
            { id:"ex5", label:"فترة تنتهي مارس 2027",              cls:"bg-slate-50 border-slate-200 text-slate-700"      },
          ].map(p => (
            <button key={p.id} type="button" onClick={() => loadPreset(p.id)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all ${p.cls}`}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Step 1: Person type */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">١</span>
          <h2 className="text-sm sm:text-base font-extrabold text-ink">ما نوع الشخص؟</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PERSON_OPTIONS.map(({ val, label }) => (
            <button key={val} type="button" onClick={() => { setPersonType(val); if (val === PERSON_TYPE.FREE_ZONE && isQFZP === TRI.NO) setIsQFZP(TRI.UNSURE); }}
              className={`rounded-xl border p-3 text-center text-xs font-bold transition-all ${personType === val ? "border-brand bg-brand-light text-brand-dark shadow-sm" : "border-brand-border bg-white text-ink-secondary hover:border-brand"}`}>
              {label}
            </button>
          ))}
        </div>
        {personType === PERSON_TYPE.FREE_ZONE && (
          <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3 text-xs text-purple-900 leading-relaxed">
            منشآت المناطق الحرة المصنفة كـ QFZP غير مؤهلة لتسهيلات الأعمال الصغيرة. ستُسأل لاحقاً عن وضع QFZP.
          </div>
        )}
      </div>

      {/* Step 2: Residency */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">٢</span>
          <h2 className="text-sm sm:text-base font-extrabold text-ink">الإقامة لأغراض ضريبة الشركات</h2>
        </div>
        <TriToggle label="هل أنت شخص مقيم لأغراض ضريبة الشركات في الإمارات؟" value={residency} onChange={setResidency} />
        {residency === TRI.NO && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-900 leading-relaxed">
            تسهيلات الأعمال الصغيرة مخصصة للأشخاص المقيمين وفق الشروط النظامية — حالتك تحتاج مراجعة إضافية.
          </div>
        )}
      </div>

      {/* Step 3: Tax period */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">٣</span>
          <h2 className="text-sm sm:text-base font-extrabold text-ink">الفترة الضريبية</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">تاريخ بداية الفترة الضريبية</label>
            <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} max={periodEnd || undefined}
              className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">تاريخ نهاية الفترة الضريبية</label>
            <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} min={periodStart || undefined}
              className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none" />
          </div>
        </div>
        {dateError && <p className="text-xs font-bold text-rose-700">⚠️ {dateError}</p>}
        {periodEnd && periodEnd > SBR_END_DATE && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-ink-secondary leading-relaxed">
            📅 الفترة الضريبية المدخلة تنتهي بعد 31 ديسمبر 2026 — خارج النطاق الزمني الحالي لتسهيلات الأعمال الصغيرة وفق القواعد الحالية.
          </div>
        )}
        {periodEnd && periodEnd <= SBR_END_DATE && (
          <p className="text-[11px] text-emerald-700 font-bold">✅ الفترة تنتهي في أو قبل 31 ديسمبر 2026</p>
        )}
      </div>

      {/* Step 4: Current revenue */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">٤</span>
          <h2 className="text-sm sm:text-base font-extrabold text-ink">إيرادات الفترة الضريبية الحالية</h2>
        </div>
        <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-sky-900 leading-relaxed">
          يُستخدم حد الإيرادات (3,000,000 درهم) لتحديد أهلية التسهيل. الإيرادات هي إجمالي الدخل من الأنشطة التجارية — وليست الدخل الخاضع للضريبة بعد الخصومات.
        </div>
        <AedInput id="curRev" label="إيرادات الفترة الضريبية الحالية *"
          hint="إجمالي إيرادات النشاط التجاري للفترة قبل خصم المصروفات." value={currentRev} onChange={setCurrentRev} />
        {sanitizeNumber(currentRev) > 0 && (
          <div className={`rounded-xl border p-3 text-xs font-bold ${sanitizeNumber(currentRev) <= SBR_REVENUE_THRESHOLD ? "border-emerald-200 bg-emerald-50/60 text-emerald-800" : "border-rose-200 bg-rose-50/60 text-rose-800"}`}>
            {sanitizeNumber(currentRev) <= SBR_REVENUE_THRESHOLD
              ? `✅ الإيرادات (${formatAED(sanitizeNumber(currentRev))} د.إ) ضمن حد 3,000,000 درهم`
              : `❌ الإيرادات (${formatAED(sanitizeNumber(currentRev))} د.إ) تتجاوز حد 3,000,000 درهم`}
          </div>
        )}
      </div>

      {/* Step 5: Prior periods */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">٥</span>
          <h2 className="text-sm sm:text-base font-extrabold text-ink">الفترات الضريبية السابقة</h2>
        </div>
        <TriToggle label="هل كانت لديك فترات ضريبية سابقة ضمن نطاق ضريبة الشركات؟" value={hasPrior}
          onChange={setHasPrior} options={[{ l: "نعم", v: TRI.YES }, { l: "لا", v: TRI.NO }]} />
        {hasPrior === TRI.YES && (
          <div className="space-y-3">
            <p className="text-xs text-ink-muted leading-relaxed">أدخل إيرادات كل فترة سابقة ذات صلة. يجب ألا تتجاوز إيرادات أي فترة 3,000,000 درهم للأهلية.</p>
            {priorPeriods.map((p, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-2 items-end">
                <div>
                  <label className="block text-xs font-bold text-ink-secondary mb-1">اسم / وصف الفترة {i + 1}</label>
                  <input type="text" value={p.label} placeholder={`مثال: 2023-2024`}
                    onChange={e => { const arr = [...priorPeriods]; arr[i] = { ...arr[i], label: e.target.value }; setPriorPeriods(arr); }}
                    className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none" />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <AedInput id={`prior_${i}`} label={`إيرادات الفترة ${i + 1}`} value={p.revenue}
                      onChange={v => { const arr = [...priorPeriods]; arr[i] = { ...arr[i], revenue: v }; setPriorPeriods(arr); }} />
                  </div>
                  {priorPeriods.length > 1 && (
                    <button type="button" onClick={() => setPriorPeriods(priorPeriods.filter((_, j) => j !== i))}
                      className="shrink-0 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-2.5 hover:bg-rose-100 transition-all mb-5">✕</button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setPriorPeriods([...priorPeriods, { label: "", revenue: "0" }])}
              className="text-xs font-bold text-brand hover:underline">+ إضافة فترة سابقة أخرى</button>
            {highestPriorRevenue > 0 && (
              <div className={`rounded-xl border p-3 text-xs font-bold ${highestPriorRevenue <= SBR_REVENUE_THRESHOLD ? "border-emerald-200 bg-emerald-50/60 text-emerald-800" : "border-rose-200 bg-rose-50/60 text-rose-800"}`}>
                أعلى إيرادات سابقة: {formatAED(highestPriorRevenue)} د.إ
                {highestPriorRevenue <= SBR_REVENUE_THRESHOLD ? " ✅ ضمن الحد" : " ❌ تتجاوز الحد"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 6: QFZP */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">٦</span>
          <h2 className="text-sm sm:text-base font-extrabold text-ink">وضع المنطقة الحرة (QFZP)</h2>
        </div>
        <TriToggle label="هل أنت شخص مؤهل قائم في منطقة حرة (QFZP) وفق لوائح FTA؟" value={isQFZP} onChange={setIsQFZP} />
        {isQFZP === TRI.YES && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-900 leading-relaxed">
            ❌ الأشخاص المؤهلون القائمون في المناطق الحرة (QFZP) غير مؤهلين لاختيار تسهيلات الأعمال الصغيرة.
          </div>
        )}
        {isQFZP === TRI.UNSURE && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 leading-relaxed">
            ⚠️ وضع QFZP غير محدد — يُنصح بمراجعة متخصص ضريبي. هذه الحاسبة لا تُحقق من وضع QFZP.
          </div>
        )}
      </div>

      {/* Step 7: MNE */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">٧</span>
          <h2 className="text-sm sm:text-base font-extrabold text-ink">المجموعات متعددة الجنسيات</h2>
        </div>
        <TriToggle label="هل تنتمي المنشأة إلى مجموعة متعددة الجنسيات كبيرة؟" value={isMNE} onChange={setIsMNE} />
        {isMNE === TRI.YES && (
          <div className="space-y-3">
            <AedInput id="mneRev" label="الإيرادات العالمية الموحدة للمجموعة (درهم)"
              hint={`الحد المقرر: ${formatAEDInt(MNE_GLOBAL_REVENUE_THRESHOLD)} درهم (3.15 مليار). إذا تجاوزت الإيرادات هذا الحد فالمنشأة غير مؤهلة.`}
              value={mneRevenue} onChange={setMneRevenue} />
            {sanitizeNumber(mneRevenue) > 0 && (
              <div className={`rounded-xl border p-3 text-xs font-bold ${sanitizeNumber(mneRevenue) <= MNE_GLOBAL_REVENUE_THRESHOLD ? "border-emerald-200 bg-emerald-50/60 text-emerald-800" : "border-rose-200 bg-rose-50/60 text-rose-800"}`}>
                {sanitizeNumber(mneRevenue) <= MNE_GLOBAL_REVENUE_THRESHOLD
                  ? `✅ الإيرادات العالمية ضمن الحد المقرر`
                  : `❌ الإيرادات العالمية تتجاوز ${formatAEDInt(MNE_GLOBAL_REVENUE_THRESHOLD)} درهم`}
              </div>
            )}
          </div>
        )}
        {isMNE === TRI.UNSURE && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">⚠️ الوضع غير محدد — يتطلب مراجعة.</div>
        )}
      </div>

      {/* Step 8: Related entities */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">٨</span>
          <h2 className="text-sm sm:text-base font-extrabold text-ink">الكيانات والأعمال المرتبطة</h2>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">لا ينبغي تجزئة الأعمال بشكل مصطنع للبقاء دون حد 3 ملايين درهم — وهو أمر قد يعرض المنشأة لمخاطر ضريبية.</p>
        <TriToggle label="هل توجد أعمال أو كيانات مرتبطة قد تشكل نشاطاً واحداً اقتصادياً؟" value={relatedEntities} onChange={setRelatedEntities} />
        {relatedEntities === TRI.YES && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 leading-relaxed">
            ⚠️ قد تحتاج الحالة مراجعة للتأكد من عدم وجود تجزئة مصطنعة للأعمال — يُنصح بمراجعة مستشار ضريبي.
          </div>
        )}
      </div>

      {/* Eligibility Checklist */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
        <h3 className="text-sm font-extrabold text-ink flex items-center gap-2"><span>📋</span><span>قائمة شروط الأهلية:</span></h3>
        <div className="divide-y divide-brand-border/40">
          {evaluation.checklistItems.map((item, i) => (
            <ChecklistRow key={i} label={item.label} status={item.status} note={item.note} />
          ))}
        </div>
      </div>

      {/* Primary Result Card */}
      <div className="rounded-2xl border-2 border-brand bg-white shadow-xl overflow-hidden">
        <div className={`p-6 text-white ${rc.gradient}`}>
          <div className="flex items-center gap-3.5">
            <span className="text-4xl sm:text-5xl">{rc.emoji}</span>
            <div>
              <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold mb-1">{rc.badge}</span>
              <h2 className="text-xl sm:text-2xl font-black">{rc.title}</h2>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Summary metrics */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-brand-border bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-bold text-ink-muted">حد الإيرادات</p>
              <p className="text-base font-black text-rose-700 mt-0.5">3,000,000.00 د.إ</p>
              <p className="text-[10px] text-ink-muted">للفترة الحالية وكل فترة سابقة</p>
            </div>
            <div className={`rounded-xl border p-3.5 ${evaluation.curRev <= SBR_REVENUE_THRESHOLD ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/50"}`}>
              <p className="text-[11px] font-bold text-ink-muted">إيرادات الفترة الحالية</p>
              <p className={`text-base font-black mt-0.5 ${evaluation.curRev <= SBR_REVENUE_THRESHOLD ? "text-emerald-700" : "text-rose-700"}`}>{formatAED(evaluation.curRev)} د.إ</p>
              <p className="text-[10px] text-ink-muted">{evaluation.curRev <= SBR_REVENUE_THRESHOLD ? "✓ ضمن الحد" : "✗ يتجاوز الحد"}</p>
            </div>
            <div className={`rounded-xl border p-3.5 ${evaluation.priorRev <= SBR_REVENUE_THRESHOLD ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/50"}`}>
              <p className="text-[11px] font-bold text-ink-muted">أعلى إيرادات سابقة</p>
              <p className={`text-base font-black mt-0.5 ${evaluation.priorRev <= SBR_REVENUE_THRESHOLD ? "text-emerald-700" : "text-rose-700"}`}>{hasPrior === TRI.YES ? formatAED(evaluation.priorRev) + " د.إ" : "لا توجد فترات سابقة"}</p>
              <p className="text-[10px] text-ink-muted">{hasPrior !== TRI.YES ? "—" : evaluation.priorRev <= SBR_REVENUE_THRESHOLD ? "✓ ضمن الحد" : "✗ يتجاوز الحد"}</p>
            </div>
          </div>

          {/* Reasons */}
          {evaluation.reasons.length > 0 && (
            <div className="rounded-xl border border-brand-border/80 bg-slate-50 p-4 space-y-2">
              <p className="text-xs font-extrabold text-ink">📌 الأسباب:</p>
              <ul className="space-y-1.5">
                {evaluation.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-ink-secondary">
                    <span className="shrink-0 font-black text-rose-600">•</span><span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {evaluation.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-1">
              <p className="text-xs font-extrabold text-amber-900">⚠️ تنبيهات:</p>
              {evaluation.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-800 leading-relaxed">{w}</p>
              ))}
            </div>
          )}

          {/* Potentially eligible guidance */}
          {evaluation.result === SBR_RESULT.POTENTIALLY_ELIGIBLE && (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                <p className="text-xs font-extrabold text-emerald-900">✅ ماذا يعني ذلك؟</p>
                <p className="text-xs text-emerald-800 leading-relaxed">يمكن للشخص المؤهل <strong>اختيار</strong> تسهيلات الأعمال الصغيرة عند تقديم الإقرار الضريبي وفق بقية الشروط النظامية. التسهيل اختيار (election) وليس إعفاءً تلقائياً.</p>
                <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                  <li>قد يُعامَل الشخص كأن ليس لديه دخل خاضع للضريبة للفترة المؤهلة.</li>
                  <li>قد تتوفر إقرارات ضريبية مبسّطة.</li>
                  <li>التزامات التسجيل والإيداع لدى FTA قد تبقى سارية.</li>
                </ul>
              </div>
              <button type="button" onClick={() => setShowTradeoff(!showTradeoff)}
                className="text-xs font-bold text-brand hover:underline flex items-center gap-1.5">
                <span>⚖️</span><span>قبل اختيار التسهيل — تنبيهات مهمة</span><span>{showTradeoff ? "▲" : "▼"}</span>
              </button>
              {showTradeoff && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 leading-relaxed space-y-2">
                  <p className="font-extrabold">⚠️ قد يؤثر اختيار التسهيل على:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>الاستفادة من الخسائر الضريبية المرحّلة.</li>
                    <li>مراكز خصم الفوائد.</li>
                    <li>بعض المزايا والأرصدة الضريبية الأخرى.</li>
                  </ul>
                  <p>قد يؤثر اختيار التسهيل على الاستفادة من بعض المزايا أو الأرصدة الضريبية — يُنصح بمراجعة أثر الاختيار على وضع المنشأة مع مستشار ضريبي.</p>
                </div>
              )}
            </div>
          )}

          {/* Cross-link to CT Calculator */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏛️</span>
              <p className="text-xs font-bold text-indigo-900">
                {evaluation.result === SBR_RESULT.NOT_ELIGIBLE
                  ? "اعرف ضريبة الشركات التقديرية في حال عدم التسهيل"
                  : "قارن النتيجة مع ضريبة الشركات العادية"}
              </p>
            </div>
            <Link href="/ar/ae/corporate-tax-calculator"
              className="shrink-0 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-black px-4 py-2.5 transition shadow">
              حاسبة ضريبة الشركات ←
            </Link>
          </div>

          {/* Reset */}
          <div className="flex justify-end">
            <button type="button" onClick={handleReset}
              className="rounded-xl border border-brand-border px-4 py-2 text-xs font-bold text-ink-secondary hover:border-brand hover:text-brand transition-all">
              ↺ إعادة تعيين
            </button>
          </div>
        </div>
      </div>

      {/* Print summary */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-ink flex items-center gap-2"><span>🖨️</span><span>ملخص أهلية التسهيلات قابل للطباعة</span></h3>
          <button type="button" onClick={() => setShowPrint(!showPrint)} className="text-xs font-bold text-brand hover:underline">{showPrint ? "إخفاء" : "إنشاء الملخص"}</button>
        </div>
        {showPrint && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
            <div className="border-b border-slate-300 pb-3">
              <h4 className="text-base font-black text-ink">ملخص تقديري لأهلية تسهيلات الأعمال الصغيرة</h4>
              <p className="text-[11px] text-ink-muted mt-0.5">هذا الملخص تقديري استرشادي وليس قراراً رسمياً أو اعتماداً من FTA.</p>
            </div>
            <table className="w-full text-xs border-collapse">
              <tbody className="divide-y divide-slate-200">
                {[
                  ["نوع الشخص", PERSON_OPTIONS.find(o => o.val === personType)?.label || "-"],
                  ["الإقامة الضريبية", residency === TRI.YES ? "مقيم" : residency === TRI.NO ? "غير مقيم" : "غير متأكد"],
                  ["الفترة الضريبية", periodStart && periodEnd ? `${periodStart} — ${periodEnd}` : "—"],
                  ["إيرادات الفترة الحالية", formatAED(evaluation.curRev) + " د.إ"],
                  ["أعلى إيرادات سابقة", hasPrior === TRI.YES ? formatAED(evaluation.priorRev) + " د.إ" : "لا توجد فترات سابقة"],
                  ["وضع QFZP", isQFZP === TRI.YES ? "نعم" : isQFZP === TRI.NO ? "لا" : "غير متأكد"],
                  ["عضوية MNE", isMNE === TRI.YES ? "نعم" : isMNE === TRI.NO ? "لا" : "غير متأكد"],
                  ["نتيجة الأهلية", rc.title],
                  ["تاريخ الحساب", today],
                ].map(([k, v], i) => (
                  <tr key={i}><td className="py-1.5 px-2 font-bold text-ink-secondary">{k}</td><td className="py-1.5 px-2 font-bold text-ink text-left">{v}</td></tr>
                ))}
              </tbody>
            </table>
            {evaluation.reasons.length > 0 && (
              <div className="text-xs text-ink-secondary"><p className="font-bold mb-1">الأسباب:</p>{evaluation.reasons.map((r,i)=><p key={i}>• {r}</p>)}</div>
            )}
            <p className="text-[10px] text-ink-muted border-t border-slate-200 pt-3 leading-relaxed">هذه الأداة تقديرية وتعتمد على البيانات التي يدخلها المستخدم ولا تمثل قراراً رسمياً من الهيئة الاتحادية للضرائب.</p>
            <button type="button" onClick={() => window.print()} className="rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-black px-4 py-2.5 transition">طباعة / حفظ PDF 🖨️</button>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
        <h3 className="text-xs font-extrabold text-ink flex items-center gap-2"><span>⚖️</span><span>إخلاء المسؤولية</span></h3>
        <p className="text-[11px] text-ink-secondary leading-relaxed">هذه الأداة تقديرية وتعتمد على البيانات التي يدخلها المستخدم، ولا تمثل قراراً رسمياً من الهيئة الاتحادية للضرائب أو تأكيداً نهائياً للأهلية.</p>
        <p className="text-[11px] text-ink-secondary leading-relaxed">تسهيلات الأعمال الصغيرة تخضع لشروط وفترات محددة، كما أن اختيار التسهيل يتم ضمن إجراءات ضريبة الشركات.</p>
        <p className="text-[11px] text-ink-secondary leading-relaxed">يرجى الرجوع إلى <a href={FTA_SBR_URL} target="_blank" rel="noopener noreferrer" className="text-brand underline font-bold">الهيئة الاتحادية للضرائب</a> أو مستشار ضريبي مؤهل عند الحاجة إلى تحديد رسمي.</p>
      </div>

      {/* Official source */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-ink-secondary"><span>🏛️</span><span>المصدر: <strong className="text-ink">الهيئة الاتحادية للضرائب — دولة الإمارات العربية المتحدة</strong></span></div>
        <div className="flex gap-3 text-[11px]">
          <a href={FTA_SBR_URL} target="_blank" rel="noopener noreferrer" className="text-brand underline font-bold">تسهيلات الأعمال الصغيرة ↗</a>
          <a href={FTA_CT_URL} target="_blank" rel="noopener noreferrer" className="text-brand underline font-bold">ضريبة الشركات — FTA ↗</a>
        </div>
      </div>

    </div>
  );
}
