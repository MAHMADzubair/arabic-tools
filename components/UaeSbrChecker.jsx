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



// ─── Small helpers ─────────────────────────────────────────────────────────────*

function AedInput({ id, label, hint, value, onChange, optional = false }) {

  return (

    <div>

      <label htmlFor={id} className="block text-xs font-bold text-[var(--text-2)] mb-1">

        {label}{optional && <span className="mr-1 text-[var(--text-3)] font-normal">(اختياري)</span>}

      </label>

      <div className="relative">

        <input id={id} type="number" inputMode="decimal" min="0" value={value}

          onChange={(e) => onChange(e.target.value)} placeholder="0"

          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-bold text-[var(--text)] focus:border-[var(--orange)] focus:outline-none" />

        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-3)]">د.إ</span>

      </div>

      {hint && <p className="mt-1 text-[11px] text-[var(--text-3)] leading-relaxed">{hint}</p>}

    </div>

  );

}



function TriToggle({ label, value, onChange, options }) {

  const opts = options || [{ l: "نعم", v: TRI.YES }, { l: "لا", v: TRI.NO }, { l: "غير متأكد", v: TRI.UNSURE }];

  return (

    <div>

      <p className="text-xs font-bold text-[var(--text-2)] mb-2">{label}</p>

      <div className={`grid gap-2 max-w-sm`} style={{ gridTemplateColumns: `repeat(${opts.length}, 1fr)` }}>

        {opts.map(({ l, v }) => (

          <button key={v} type="button" onClick={() => onChange(v)}

            className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${value === v ? "border-[var(--orange)] bg-[var(--orange)] text-[var(--on-orange)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--orange)]"}`}>

            {l}

          </button>

        ))}

      </div>

    </div>

  );

}



function ChecklistRow({ label, status, note }) {

  const icon = status === "pass" ? "✓" : status === "fail" ? "×" : "!";

  const color = status === "pass" ? "sbr-success-text" : status === "fail" ? "sbr-error-text" : "sbr-warning-text";

  return (

    <div className="flex items-start gap-2.5 py-2 border-b border-[var(--border)]/40 last:border-b-0">

      <span className="text-base shrink-0 mt-0.5">{icon}</span>

      <div>

        <p className={`text-xs font-bold ${color}`}>{label}</p>

        {note && <p className="text-[10px] text-[var(--text-3)]">{note}</p>}

      </div>

    </div>

  );

}



const PERSON_OPTIONS = [

  { val: PERSON_TYPE.COMPANY,        label: "شركة / شخص اعتباري" },

  { val: PERSON_TYPE.NATURAL_PERSON, label: "شخص طبيعي يمارس نشاطاً تجارياً" },

  { val: PERSON_TYPE.FREE_ZONE,      label: "منشأة في منطقة حرة" },

  { val: PERSON_TYPE.UNSURE,         label: "غير متأكد" },

];




function SbrStyles() {
  return (
    <style>{`
      .sbr-root{
        --bg:#F5F5F2;
        --surface:#FFFFFF;
        --surface-2:#ECECE7;
        --border:#D4D4CE;
        --text:#0D0D0D;
        --text-2:#555555;
        --text-3:#6B6B66;
        --card:#0D0D0D;
        --card-text:#FFFFFF;
        --card-muted:#B5B5B0;
        --card-border:#2A2A2A;
        --orange:#FF5B04;
        --orange-hover:#FF7A33;
        --orange-press:#E64F00;
        --on-orange:#0D0D0D;
        --success:#137A47;
        --warning:#8A5A00;
        --error:#C8321F;
        color:var(--text);
      }
      @media (prefers-color-scheme:dark){
        :root:not([data-theme="light"]) .sbr-root{
          --bg:#0D0D0D;
          --surface:#161616;
          --surface-2:#1D1D1D;
          --border:#2A2A2A;
          --text:#F5F5F2;
          --text-2:#B5B5B0;
          --text-3:#8E8E89;
          --card:#F5F5F2;
          --card-text:#0D0D0D;
          --card-muted:#555555;
          --card-border:#D4D4CE;
          --success:#4ADE80;
          --warning:#FBBF24;
          --error:#FF7A6B;
        }
      }
      :root[data-theme="dark"] .sbr-root{
        --bg:#0D0D0D;
        --surface:#161616;
        --surface-2:#1D1D1D;
        --border:#2A2A2A;
        --text:#F5F5F2;
        --text-2:#B5B5B0;
        --text-3:#8E8E89;
        --card:#F5F5F2;
        --card-text:#0D0D0D;
        --card-muted:#555555;
        --card-border:#D4D4CE;
        --success:#4ADE80;
        --warning:#FBBF24;
        --error:#FF7A6B;
      }
      .sbr-root :focus-visible{
        outline:2px solid var(--orange);
        outline-offset:3px;
      }
      .sbr-hero{
        position:relative;
        overflow:hidden;
      }
      .sbr-hero::after{
        content:"";
        position:absolute;
        inset-inline-end:-42px;
        top:-42px;
        width:150px;
        height:150px;
        border:28px solid var(--orange);
        border-radius:999px;
        opacity:.12;
        pointer-events:none;
      }
      .sbr-hero-mark{
        width:52px;
        height:52px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        flex:none;
        border-radius:14px;
        background:var(--orange);
        color:var(--on-orange);
        font-size:.72rem;
        font-weight:900;
        letter-spacing:.08em;
      }
      .sbr-kicker-mark{
        width:22px;
        height:22px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        border:1px solid var(--border);
        border-radius:7px;
        color:var(--orange);
        font-weight:900;
      }
      .sbr-preset{
        border-color:var(--border)!important;
        background:var(--surface)!important;
        color:var(--text-2)!important;
      }
      .sbr-preset:hover{
        border-color:var(--orange)!important;
        color:var(--text)!important;
      }
      .sbr-success,
      .sbr-error,
      .sbr-warning,
      .sbr-neutral{
        background:var(--card);
        color:var(--card-text);
        border-bottom:5px solid var(--orange);
      }
      .sbr-success{border-bottom-color:var(--success)}
      .sbr-error{border-bottom-color:var(--error)}
      .sbr-warning{border-bottom-color:var(--warning)}
      .sbr-neutral{border-bottom-color:var(--orange)}
      .sbr-success-soft{
        border-color:color-mix(in srgb,var(--success) 35%,var(--border))!important;
        background:color-mix(in srgb,var(--success) 8%,var(--surface))!important;
      }
      .sbr-error-soft{
        border-color:color-mix(in srgb,var(--error) 35%,var(--border))!important;
        background:color-mix(in srgb,var(--error) 8%,var(--surface))!important;
      }
      .sbr-warning-soft{
        border-color:color-mix(in srgb,var(--warning) 35%,var(--border))!important;
        background:color-mix(in srgb,var(--warning) 8%,var(--surface))!important;
      }
      .sbr-success-text{color:var(--success)!important}
      .sbr-error-text{color:var(--error)!important}
      .sbr-warning-text{color:var(--warning)!important}
      @media print{
        .sbr-root{
          --surface:#fff;
          --surface-2:#f5f5f2;
          --border:#d4d4ce;
          --text:#0d0d0d;
          --text-2:#555;
          --text-3:#6b6b66;
          --card:#0d0d0d;
          --card-text:#fff;
        }
      }
    `}</style>
  );
}

export default function UaeSbrChecker() {

  // ── State ──────────────────────────────────────────────────────────────────*

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



  // ── Derived ────────────────────────────────────────────────────────────────*

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



  // ── Reset ──────────────────────────────────────────────────────────────────*

  const handleReset = useCallback(() => {

    setPersonType(PERSON_TYPE.COMPANY); setResidency(TRI.YES);

    setPeriodStart(""); setPeriodEnd(""); setCurrentRev("0");

    setHasPrior(TRI.NO); setPriorPeriods([{ label: "", revenue: "0" }]);

    setIsQFZP(TRI.NO); setIsMNE(TRI.NO); setMneRevenue("0");

    setRelatedEntities(TRI.NO); setShowPrint(false); setShowTradeoff(false);

  }, []);



  // ── Preset loader ──────────────────────────────────────────────────────────*

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



  // ── Result appearance ──────────────────────────────────────────────────────*

  const resultConfig = {
    [SBR_RESULT.POTENTIALLY_ELIGIBLE]: {
      tone: "sbr-success",
      marker: "✓",
      title: "قد تكون مؤهلاً لتسهيلات الأعمال الصغيرة",
      badge: "أهلية محتملة",
    },
    [SBR_RESULT.NOT_ELIGIBLE]: {
      tone: "sbr-error",
      marker: "×",
      title: "غير مؤهل بناءً على البيانات المدخلة",
      badge: "غير مؤهل",
    },
    [SBR_RESULT.REVIEW_REQUIRED]: {
      tone: "sbr-warning",
      marker: "!",
      title: "حالتك تحتاج إلى مراجعة إضافية",
      badge: "مراجعة مطلوبة",
    },
    [SBR_RESULT.OUTSIDE_TIME_WINDOW]: {
      tone: "sbr-neutral",
      marker: "—",
      title: "الفترة الضريبية خارج النطاق الزمني الحالي للتسهيل",
      badge: "خارج النطاق الزمني",
    },
  };

  const rc = resultConfig[evaluation.result];



  return (

    <div className="sbr-root space-y-6" dir="rtl">
      <SbrStyles />



      {/* Hero */}

      <div className="sbr-hero rounded-[28px] border border-[var(--card-border)] bg-[var(--card)] p-6 text-[var(--card-text)]">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <span className="sbr-hero-mark" aria-hidden="true">SBR</span>

            <div>

              <h1 className="text-xl sm:text-2xl font-black leading-tight">حاسبة أهلية تسهيلات الأعمال الصغيرة في الإمارات</h1>

              <p className="mt-1 text-sm text-[var(--card-muted)]">تقدير الأهلية لاختيار تسهيلات الأعمال الصغيرة في ضريبة الشركات الإماراتية — حد 3,000,000 درهم</p>

            </div>

          </div>

          <span className="shrink-0 rounded-full bg-[var(--surface)]/20 border border-[var(--orange)] px-3 py-1 text-xs font-bold whitespace-nowrap">محدث سبتمبر 2026 — FTA</span>

        </div>

      </div>



      {/* Date warning banner */}

      <div className="rounded-xl border sbr-warning-soft p-4 flex items-start gap-3">

        <span className="text-xl shrink-0">📅</span>

        <p className="text-xs sbr-warning-text leading-relaxed">

          <strong>تنبيه:</strong> وفق التوجيهات الحالية لـ FTA، تسهيلات الأعمال الصغيرة تسري على الفترات الضريبية التي <strong>تنتهي في أو قبل 31 ديسمبر 2026</strong>. يُنصح بمراجعة أحدث إرشادات الهيئة الاتحادية للضرائب.

        </p>

      </div>



      {/* Presets */}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 ">

        <div className="flex items-center gap-2 mb-3"><span className="sbr-kicker-mark" aria-hidden="true">+</span><span className="text-xs font-extrabold text-[var(--text)]">نماذج سريعة:</span></div>

        <div className="flex flex-wrap gap-2">

          {[

            { id:"ex1", label:"إيرادات 2.2M (مؤهل)",              cls:"sbr-preset" },

            { id:"ex2", label:"إيرادات 3.4M (غير مؤهل)",          cls:"sbr-preset"         },

            { id:"ex3", label:"فترة سابقة 3.2M (غير مؤهل)",       cls:"sbr-preset"         },

            { id:"ex4", label:"QFZP (غير مؤهل)",                   cls:"sbr-preset"   },

            { id:"ex5", label:"فترة تنتهي مارس 2027",              cls:"sbr-preset"      },

          ].map(p => (

            <button key={p.id} type="button" onClick={() => loadPreset(p.id)}

              className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all ${p.cls}`}>{p.label}</button>

          ))}

        </div>

      </div>



      {/* Step 1: Person type */}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5  space-y-4">

        <div className="flex items-center gap-2.5 border-b border-[var(--border)]/60 pb-3">

          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--orange)] text-xs font-black text-[var(--card-text)]">١</span>

          <h2 className="text-sm sm:text-base font-extrabold text-[var(--text)]">ما نوع الشخص؟</h2>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

          {PERSON_OPTIONS.map(({ val, label }) => (

            <button key={val} type="button" onClick={() => { setPersonType(val); if (val === PERSON_TYPE.FREE_ZONE && isQFZP === TRI.NO) setIsQFZP(TRI.UNSURE); }}

              className={`rounded-xl border p-3 text-center text-xs font-bold transition-all ${personType === val ? "border-[var(--orange)] bg-[var(--orange)] text-[var(--on-orange)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--orange)]"}`}>

              {label}

            </button>

          ))}

        </div>

        {personType === PERSON_TYPE.FREE_ZONE && (

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-2)] leading-relaxed">

            منشآت المناطق الحرة المصنفة كـ QFZP غير مؤهلة لتسهيلات الأعمال الصغيرة. ستُسأل لاحقاً عن وضع QFZP.

          </div>

        )}

      </div>



      {/* Step 2: Residency */}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5  space-y-4">

        <div className="flex items-center gap-2.5 border-b border-[var(--border)]/60 pb-3">

          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--orange)] text-xs font-black text-[var(--card-text)]">٢</span>

          <h2 className="text-sm sm:text-base font-extrabold text-[var(--text)]">الإقامة لأغراض ضريبة الشركات</h2>

        </div>

        <TriToggle label="هل أنت شخص مقيم لأغراض ضريبة الشركات في الإمارات؟" value={residency} onChange={setResidency} />

        {residency === TRI.NO && (

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs sbr-error-text leading-relaxed">

            تسهيلات الأعمال الصغيرة مخصصة للأشخاص المقيمين وفق الشروط النظامية — حالتك تحتاج مراجعة إضافية.

          </div>

        )}

      </div>



      {/* Step 3: Tax period */}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5  space-y-4">

        <div className="flex items-center gap-2.5 border-b border-[var(--border)]/60 pb-3">

          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--orange)] text-xs font-black text-[var(--card-text)]">٣</span>

          <h2 className="text-sm sm:text-base font-extrabold text-[var(--text)]">الفترة الضريبية</h2>

        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          <div>

            <label className="block text-xs font-bold text-[var(--text-2)] mb-1">تاريخ بداية الفترة الضريبية</label>

            <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} max={periodEnd || undefined}

              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-bold text-[var(--text)] focus:border-[var(--orange)] focus:outline-none" />

          </div>

          <div>

            <label className="block text-xs font-bold text-[var(--text-2)] mb-1">تاريخ نهاية الفترة الضريبية</label>

            <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} min={periodStart || undefined}

              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-bold text-[var(--text)] focus:border-[var(--orange)] focus:outline-none" />

          </div>

        </div>

        {dateError && <p className="text-xs font-bold sbr-error-text">{dateError}</p>}

        {periodEnd && periodEnd > SBR_END_DATE && (

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-2)] leading-relaxed">

            الفترة الضريبية المدخلة تنتهي بعد 31 ديسمبر 2026 — خارج النطاق الزمني الحالي لتسهيلات الأعمال الصغيرة وفق القواعد الحالية.

          </div>

        )}

        {periodEnd && periodEnd <= SBR_END_DATE && (

          <p className="text-[11px] sbr-success-text font-bold">الفترة تنتهي في أو قبل 31 ديسمبر 2026</p>

        )}

      </div>



      {/* Step 4: Current revenue */}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5  space-y-4">

        <div className="flex items-center gap-2.5 border-b border-[var(--border)]/60 pb-3">

          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--orange)] text-xs font-black text-[var(--card-text)]">٤</span>

          <h2 className="text-sm sm:text-base font-extrabold text-[var(--text)]">إيرادات الفترة الضريبية الحالية</h2>

        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-2)] leading-relaxed">

          يُستخدم حد الإيرادات (3,000,000 درهم) لتحديد أهلية التسهيل. الإيرادات هي إجمالي الدخل من الأنشطة التجارية — وليست الدخل الخاضع للضريبة بعد الخصومات.

        </div>

        <AedInput id="curRev" label="إيرادات الفترة الضريبية الحالية *"

          hint="إجمالي إيرادات النشاط التجاري للفترة قبل خصم المصروفات." value={currentRev} onChange={setCurrentRev} />

        {sanitizeNumber(currentRev) > 0 && (

          <div className={`rounded-xl border p-3 text-xs font-bold ${sanitizeNumber(currentRev) <= SBR_REVENUE_THRESHOLD ? "sbr-success-soft" : "sbr-error-soft"}`}>

            {sanitizeNumber(currentRev) <= SBR_REVENUE_THRESHOLD

              ? `الإيرادات (${formatAED(sanitizeNumber(currentRev))} د.إ) ضمن حد 3,000,000 درهم`

              : `الإيرادات (${formatAED(sanitizeNumber(currentRev))} د.إ) تتجاوز حد 3,000,000 درهم`}

          </div>

        )}

      </div>



      {/* Step 5: Prior periods */}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5  space-y-4">

        <div className="flex items-center gap-2.5 border-b border-[var(--border)]/60 pb-3">

          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--orange)] text-xs font-black text-[var(--card-text)]">٥</span>

          <h2 className="text-sm sm:text-base font-extrabold text-[var(--text)]">الفترات الضريبية السابقة</h2>

        </div>

        <TriToggle label="هل كانت لديك فترات ضريبية سابقة ضمن نطاق ضريبة الشركات؟" value={hasPrior}

          onChange={setHasPrior} options={[{ l: "نعم", v: TRI.YES }, { l: "لا", v: TRI.NO }]} />

        {hasPrior === TRI.YES && (

          <div className="space-y-3">

            <p className="text-xs text-[var(--text-3)] leading-relaxed">أدخل إيرادات كل فترة سابقة ذات صلة. يجب ألا تتجاوز إيرادات أي فترة 3,000,000 درهم للأهلية.</p>

            {priorPeriods.map((p, i) => (

              <div key={i} className="grid gap-3 sm:grid-cols-2 items-end">

                <div>

                  <label className="block text-xs font-bold text-[var(--text-2)] mb-1">اسم / وصف الفترة {i + 1}</label>

                  <input type="text" value={p.label} placeholder={`مثال: 2023-2024`}

                    onChange={e => { const arr = [...priorPeriods]; arr[i] = { ...arr[i], label: e.target.value }; setPriorPeriods(arr); }}

                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] focus:border-[var(--orange)] focus:outline-none" />

                </div>

                <div className="flex gap-2 items-end">

                  <div className="flex-1">

                    <AedInput id={`prior_${i}`} label={`إيرادات الفترة ${i + 1}`} value={p.revenue}

                      onChange={v => { const arr = [...priorPeriods]; arr[i] = { ...arr[i], revenue: v }; setPriorPeriods(arr); }} />

                  </div>

                  {priorPeriods.length > 1 && (

                    <button type="button" onClick={() => setPriorPeriods(priorPeriods.filter((_, j) => j !== i))}

                      className="shrink-0 rounded-xl border border-[var(--border)] bg-rose-50 sbr-error-text text-xs font-bold px-2.5 py-2.5 hover:bg-rose-100 transition-all mb-5">✕</button>

                  )}

                </div>

              </div>

            ))}

            <button type="button" onClick={() => setPriorPeriods([...priorPeriods, { label: "", revenue: "0" }])}

              className="text-xs font-bold text-[var(--orange)] hover:underline">+ إضافة فترة سابقة أخرى</button>

            {highestPriorRevenue > 0 && (

              <div className={`rounded-xl border p-3 text-xs font-bold ${highestPriorRevenue <= SBR_REVENUE_THRESHOLD ? "sbr-success-soft" : "sbr-error-soft"}`}>

                أعلى إيرادات سابقة: {formatAED(highestPriorRevenue)} د.إ

                {highestPriorRevenue <= SBR_REVENUE_THRESHOLD ? " ضمن الحد" : " تتجاوز الحد"}

              </div>

            )}

          </div>

        )}

      </div>



      {/* Step 6: QFZP */}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5  space-y-4">

        <div className="flex items-center gap-2.5 border-b border-[var(--border)]/60 pb-3">

          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--orange)] text-xs font-black text-[var(--card-text)]">٦</span>

          <h2 className="text-sm sm:text-base font-extrabold text-[var(--text)]">وضع المنطقة الحرة (QFZP)</h2>

        </div>

        <TriToggle label="هل أنت شخص مؤهل قائم في منطقة حرة (QFZP) وفق لوائح FTA؟" value={isQFZP} onChange={setIsQFZP} />

        {isQFZP === TRI.YES && (

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs sbr-error-text leading-relaxed">

            الأشخاص المؤهلون القائمون في المناطق الحرة (QFZP) غير مؤهلين لاختيار تسهيلات الأعمال الصغيرة.

          </div>

        )}

        {isQFZP === TRI.UNSURE && (

          <div className="rounded-xl border sbr-warning-soft p-3 text-xs sbr-warning-text leading-relaxed">

            وضع QFZP غير محدد — يُنصح بمراجعة متخصص ضريبي. هذه الحاسبة لا تُحقق من وضع QFZP.

          </div>

        )}

      </div>



      {/* Step 7: MNE */}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5  space-y-4">

        <div className="flex items-center gap-2.5 border-b border-[var(--border)]/60 pb-3">

          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--orange)] text-xs font-black text-[var(--card-text)]">٧</span>

          <h2 className="text-sm sm:text-base font-extrabold text-[var(--text)]">المجموعات متعددة الجنسيات</h2>

        </div>

        <TriToggle label="هل تنتمي المنشأة إلى مجموعة متعددة الجنسيات كبيرة؟" value={isMNE} onChange={setIsMNE} />

        {isMNE === TRI.YES && (

          <div className="space-y-3">

            <AedInput id="mneRev" label="الإيرادات العالمية الموحدة للمجموعة (درهم)"

              hint={`الحد المقرر: ${formatAEDInt(MNE_GLOBAL_REVENUE_THRESHOLD)} درهم (3.15 مليار). إذا تجاوزت الإيرادات هذا الحد فالمنشأة غير مؤهلة.`}

              value={mneRevenue} onChange={setMneRevenue} />

            {sanitizeNumber(mneRevenue) > 0 && (

              <div className={`rounded-xl border p-3 text-xs font-bold ${sanitizeNumber(mneRevenue) <= MNE_GLOBAL_REVENUE_THRESHOLD ? "sbr-success-soft" : "sbr-error-soft"}`}>

                {sanitizeNumber(mneRevenue) <= MNE_GLOBAL_REVENUE_THRESHOLD

                  ? `الإيرادات العالمية ضمن الحد المقرر`

                  : `الإيرادات العالمية تتجاوز ${formatAEDInt(MNE_GLOBAL_REVENUE_THRESHOLD)} درهم`}

              </div>

            )}

          </div>

        )}

        {isMNE === TRI.UNSURE && (

          <div className="rounded-xl border sbr-warning-soft p-3 text-xs sbr-warning-text">الوضع غير محدد — يتطلب مراجعة.</div>

        )}

      </div>



      {/* Step 8: Related entities */}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5  space-y-4">

        <div className="flex items-center gap-2.5 border-b border-[var(--border)]/60 pb-3">

          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--orange)] text-xs font-black text-[var(--card-text)]">٨</span>

          <h2 className="text-sm sm:text-base font-extrabold text-[var(--text)]">الكيانات والأعمال المرتبطة</h2>

        </div>

        <p className="text-xs text-[var(--text-3)] leading-relaxed">لا ينبغي تجزئة الأعمال بشكل مصطنع للبقاء دون حد 3 ملايين درهم — وهو أمر قد يعرض المنشأة لمخاطر ضريبية.</p>

        <TriToggle label="هل توجد أعمال أو كيانات مرتبطة قد تشكل نشاطاً واحداً اقتصادياً؟" value={relatedEntities} onChange={setRelatedEntities} />

        {relatedEntities === TRI.YES && (

          <div className="rounded-xl border sbr-warning-soft p-3 text-xs sbr-warning-text leading-relaxed">

            قد تحتاج الحالة مراجعة للتأكد من عدم وجود تجزئة مصطنعة للأعمال — يُنصح بمراجعة مستشار ضريبي.

          </div>

        )}

      </div>



      {/* Eligibility Checklist */}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5  space-y-3">

        <h3 className="text-sm font-extrabold text-[var(--text)] flex items-center gap-2"><span className="sbr-kicker-mark" aria-hidden="true">✓</span><span>قائمة شروط الأهلية:</span></h3>

        <div className="divide-y divide-brand-border/40">

          {evaluation.checklistItems.map((item, i) => (

            <ChecklistRow key={i} label={item.label} status={item.status} note={item.note} />

          ))}

        </div>

      </div>



      {/* Primary Result Card */}

      <div className="rounded-2xl border-2 border-[var(--orange)] bg-[var(--surface)]  overflow-hidden">

        <div className={`p-6 text-[var(--card-text)] ${rc.gradient}`}>

          <div className="flex items-center gap-3.5">

            <span className="text-4xl sm:text-5xl">{rc.marker}</span>

            <div>

              <span className="inline-block rounded-full bg-[var(--surface)]/20 px-2.5 py-0.5 text-xs font-bold mb-1">{rc.badge}</span>

              <h2 className="text-xl sm:text-2xl font-black">{rc.title}</h2>

            </div>

          </div>

        </div>



        <div className="p-6 space-y-5">

          {/* Summary metrics */}

          <div className="grid gap-3 sm:grid-cols-3">

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3.5">

              <p className="text-[11px] font-bold text-[var(--text-3)]">حد الإيرادات</p>

              <p className="text-base font-black sbr-error-text mt-0.5">3,000,000.00 د.إ</p>

              <p className="text-[10px] text-[var(--text-3)]">للفترة الحالية وكل فترة سابقة</p>

            </div>

            <div className={`rounded-xl border p-3.5 ${evaluation.curRev <= SBR_REVENUE_THRESHOLD ? "sbr-success-soft" : "sbr-error-soft"}`}>

              <p className="text-[11px] font-bold text-[var(--text-3)]">إيرادات الفترة الحالية</p>

              <p className={`text-base font-black mt-0.5 ${evaluation.curRev <= SBR_REVENUE_THRESHOLD ? "sbr-success-text" : "sbr-error-text"}`}>{formatAED(evaluation.curRev)} د.إ</p>

              <p className="text-[10px] text-[var(--text-3)]">{evaluation.curRev <= SBR_REVENUE_THRESHOLD ? "✓ ضمن الحد" : "✗ يتجاوز الحد"}</p>

            </div>

            <div className={`rounded-xl border p-3.5 ${evaluation.priorRev <= SBR_REVENUE_THRESHOLD ? "sbr-success-soft" : "sbr-error-soft"}`}>

              <p className="text-[11px] font-bold text-[var(--text-3)]">أعلى إيرادات سابقة</p>

              <p className={`text-base font-black mt-0.5 ${evaluation.priorRev <= SBR_REVENUE_THRESHOLD ? "sbr-success-text" : "sbr-error-text"}`}>{hasPrior === TRI.YES ? formatAED(evaluation.priorRev) + " د.إ" : "لا توجد فترات سابقة"}</p>

              <p className="text-[10px] text-[var(--text-3)]">{hasPrior !== TRI.YES ? "—" : evaluation.priorRev <= SBR_REVENUE_THRESHOLD ? "✓ ضمن الحد" : "✗ يتجاوز الحد"}</p>

            </div>

          </div>



          {/* Reasons */}

          {evaluation.reasons.length > 0 && (

            <div className="rounded-xl border border-[var(--border)]/80 bg-[var(--surface-2)] p-4 space-y-2">

              <p className="text-xs font-extrabold text-[var(--text)]">📌 الأسباب:</p>

              <ul className="space-y-1.5">

                {evaluation.reasons.map((r, i) => (

                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-2)]">

                    <span className="shrink-0 font-black sbr-error-text">•</span><span>{r}</span>

                  </li>

                ))}

              </ul>

            </div>

          )}



          {/* Warnings */}

          {evaluation.warnings.length > 0 && (

            <div className="rounded-xl border sbr-warning-soft p-4 space-y-1">

              <p className="text-xs font-extrabold sbr-warning-text">تنبيهات:</p>

              {evaluation.warnings.map((w, i) => (

                <p key={i} className="text-xs sbr-warning-text leading-relaxed">{w}</p>

              ))}

            </div>

          )}



          {/* Potentially eligible guidance */}

          {evaluation.result === SBR_RESULT.POTENTIALLY_ELIGIBLE && (

            <div className="space-y-3">

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-2">

                <p className="text-xs font-extrabold sbr-success-text">ماذا يعني ذلك؟</p>

                <p className="text-xs sbr-success-text leading-relaxed">يمكن للشخص المؤهل <strong>اختيار</strong> تسهيلات الأعمال الصغيرة عند تقديم الإقرار الضريبي وفق بقية الشروط النظامية. التسهيل اختيار (election) وليس إعفاءً تلقائياً.</p>

                <ul className="text-xs sbr-success-text space-y-1 list-disc list-inside">

                  <li>قد يُعامَل الشخص كأن ليس لديه دخل خاضع للضريبة للفترة المؤهلة.</li>

                  <li>قد تتوفر إقرارات ضريبية مبسّطة.</li>

                  <li>التزامات التسجيل والإيداع لدى FTA قد تبقى سارية.</li>

                </ul>

              </div>

              <button type="button" onClick={() => setShowTradeoff(!showTradeoff)}

                className="text-xs font-bold text-[var(--orange)] hover:underline flex items-center gap-1.5">

                <span className="sbr-kicker-mark" aria-hidden="true">!</span><span>قبل اختيار التسهيل — تنبيهات مهمة</span><span>{showTradeoff ? "▲" : "▼"}</span>

              </button>

              {showTradeoff && (

                <div className="rounded-xl border sbr-warning-soft p-4 text-xs sbr-warning-text leading-relaxed space-y-2">

                  <p className="font-extrabold">قد يؤثر اختيار التسهيل على:</p>

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

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">

            <div className="flex items-center gap-2">

              <span className="text-xl">🏛️</span>

              <p className="text-xs font-bold text-[var(--text)]">

                {evaluation.result === SBR_RESULT.NOT_ELIGIBLE

                  ? "اعرف ضريبة الشركات التقديرية في حال عدم التسهيل"

                  : "قارن النتيجة مع ضريبة الشركات العادية"}

              </p>

            </div>

            <Link href="/ar/ae/corporate-tax-calculator"

              className="shrink-0 rounded-xl bg-[var(--card)] hover:bg-[var(--card)] text-[var(--card-text)] text-xs font-black px-4 py-2.5 transition ">

              حاسبة ضريبة الشركات ←

            </Link>

          </div>



          {/* Reset */}

          <div className="flex justify-end">

            <button type="button" onClick={handleReset}

              className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--text-2)] hover:border-[var(--orange)] hover:text-[var(--orange)] transition-all">

              ↺ إعادة تعيين

            </button>

          </div>

        </div>

      </div>



      {/* Print summary */}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5  space-y-3">

        <div className="flex items-center justify-between">

          <h3 className="text-sm font-extrabold text-[var(--text)] flex items-center gap-2"><span className="sbr-kicker-mark" aria-hidden="true">↧</span><span>ملخص أهلية التسهيلات قابل للطباعة</span></h3>

          <button type="button" onClick={() => setShowPrint(!showPrint)} className="text-xs font-bold text-[var(--orange)] hover:underline">{showPrint ? "إخفاء" : "إنشاء الملخص"}</button>

        </div>

        {showPrint && (

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5 space-y-4">

            <div className="border-b border-[var(--border)] pb-3">

              <h4 className="text-base font-black text-[var(--text)]">ملخص تقديري لأهلية تسهيلات الأعمال الصغيرة</h4>

              <p className="text-[11px] text-[var(--text-3)] mt-0.5">هذا الملخص تقديري استرشادي وليس قراراً رسمياً أو اعتماداً من FTA.</p>

            </div>

            <table className="w-full text-xs border-collapse">

              <tbody className="divide-y divide-[var(--border)]">

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

                  <tr key={i}><td className="py-1.5 px-2 font-bold text-[var(--text-2)]">{k}</td><td className="py-1.5 px-2 font-bold text-[var(--text)] text-left">{v}</td></tr>

                ))}

              </tbody>

            </table>

            {evaluation.reasons.length > 0 && (

              <div className="text-xs text-[var(--text-2)]"><p className="font-bold mb-1">الأسباب:</p>{evaluation.reasons.map((r,i)=><p key={i}>• {r}</p>)}</div>

            )}

            <p className="text-[10px] text-[var(--text-3)] border-t border-[var(--border)] pt-3 leading-relaxed">هذه الأداة تقديرية وتعتمد على البيانات التي يدخلها المستخدم ولا تمثل قراراً رسمياً من الهيئة الاتحادية للضرائب.</p>

            <button type="button" onClick={() => window.print()} className="rounded-xl bg-[var(--orange)] hover:bg-[var(--orange-press)] text-[var(--card-text)] text-xs font-black px-4 py-2.5 transition">طباعة / حفظ PDF 🖨️</button>

          </div>

        )}

      </div>



      {/* Disclaimer */}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5 space-y-2">

        <h3 className="text-xs font-extrabold text-[var(--text)] flex items-center gap-2"><span className="sbr-kicker-mark" aria-hidden="true">!</span><span>إخلاء المسؤولية</span></h3>

        <p className="text-[11px] text-[var(--text-2)] leading-relaxed">هذه الأداة تقديرية وتعتمد على البيانات التي يدخلها المستخدم، ولا تمثل قراراً رسمياً من الهيئة الاتحادية للضرائب أو تأكيداً نهائياً للأهلية.</p>

        <p className="text-[11px] text-[var(--text-2)] leading-relaxed">تسهيلات الأعمال الصغيرة تخضع لشروط وفترات محددة، كما أن اختيار التسهيل يتم ضمن إجراءات ضريبة الشركات.</p>

        <p className="text-[11px] text-[var(--text-2)] leading-relaxed">يرجى الرجوع إلى <a href={FTA_SBR_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--orange)] underline font-bold">الهيئة الاتحادية للضرائب</a> أو مستشار ضريبي مؤهل عند الحاجة إلى تحديد رسمي.</p>

      </div>



      {/* Official source */}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">

        <div className="flex items-center gap-2 text-xs text-[var(--text-2)]"><span className="sbr-kicker-mark" aria-hidden="true">↗</span><span>المصدر: <strong className="text-[var(--text)]">الهيئة الاتحادية للضرائب — دولة الإمارات العربية المتحدة</strong></span></div>

        <div className="flex gap-3 text-[11px]">

          <a href={FTA_SBR_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--orange)] underline font-bold">تسهيلات الأعمال الصغيرة ↗</a>

          <a href={FTA_CT_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--orange)] underline font-bold">ضريبة الشركات — FTA ↗</a>

        </div>

      </div>



    </div>

  );

}
