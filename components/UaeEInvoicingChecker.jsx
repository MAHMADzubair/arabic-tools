"use client";

// UAE e-Invoicing Readiness Checker — redesigned UI (single self-contained file).
// Drop-in replacement: no new imports beyond your existing config, no CSS file.
// Requires Tailwind (already used by the previous version).
//
// Business logic, scoring, deadline calculation, analytics events, presets and
// state shape are IDENTICAL to the previous version. Only presentation, layout,
// interaction polish, accessibility and RTL handling changed.

import { useState, useMemo, useEffect, useId, useRef } from "react";
import {
  REVENUE_THRESHOLD_LARGE_BUSINESS,
  MOF_ASP_DIRECTORY_URL,
  BUSINESS_TYPE,
  TRANSACTION_TYPE,
  CURRENT_SYSTEM,
  ASP_STATUS,
  ANSWER_LEVEL,
  evaluateEInvoicingReadiness,
} from "@/lib/uaeEInvoicingConfig";

// ─── Readiness pillars (labels/weights; scores come from the config) ────────
const PILLARS = [
  {
    key: "asp",
    label: "جاهزية مزود الخدمة المعتمد (ASP)",
    weight: 25,
    desc: "التعاقد مع مزود ASP والتواصل المباشر معه.",
  },
  {
    key: "system",
    label: "جاهزية الأنظمة والربط التقني (API / ERP)",
    weight: 25,
    desc: "نوع البرنامج المحاسبي والقدرة على التكامل البرمجي عبر API.",
  },
  {
    key: "dataStructure",
    label: "هيكلة بيانات الفواتير (PINT-AE / XML)",
    weight: 20,
    desc: "إمكانية إصدار الفواتير بصيغة بيانات منظمة بدلاً من PDF.",
  },
  {
    key: "masterData",
    label: "البيانات الضريبية وسجلات العملاء والموردين",
    weight: 15,
    desc: "اكتمال أرقام التسجيل الضريبي (TRN) والأسماء والعناوين القانونية.",
  },
  {
    key: "testing",
    label: "الاختبار والعمليات التشغيلية (Sandbox / Testing)",
    weight: 15,
    desc: "إجراء اختبارات تجريبية قبل موعد الإلزام.",
  },
];

// ─── Scoped brand tokens + a few rules Tailwind can't express ───────────────
const QM_CSS = `
.qm-einv {
  /* Locked brand */
  --qm-ink: #0d0d0d;
  --qm-ivory: #f5f5f2;
  --qm-orange: #ff5b04;
  --qm-orange-hover: #e94f00;

  /* Neutrals */
  --qm-surface: #ffffff;
  --qm-subtle: #ecece7;
  --qm-border: #dddcd6;
  --qm-border-strong: #bdbcb5;
  --qm-text: #0d0d0d;
  --qm-text-2: #5f5f5b;
  --qm-text-3: #6b6b66; /* muted text that still passes AA on white + ivory */
  --qm-muted: #85857f; /* decorative only (icons, disabled) — NOT for text */

  /* Tints / accessible orange for TEXT on light surfaces
     (#FF5B04 on white is only ~3.1:1, so text/links use the darker shade) */
  --qm-orange-tint: #fff1e8;
  --qm-orange-line: #ffc9a6;
  --qm-orange-text: #b33f00;

  /* Status (muted, never compete with Signal Orange) */
  --qm-success: #2f6b4a;
  --qm-success-tint: #e9f3ed;
  --qm-warning: #8a5a00;
  --qm-warning-tint: #fbf1dc;
  --qm-danger: #a32a1f;
  --qm-danger-tint: #fbe9e6;

  /* Radii */
  --qm-r-input: 12px;
  --qm-r-card: 16px;
  --qm-r-surface: 24px;

  color: var(--qm-text);
}

/* Smooth but fast */
.qm-einv .qm-t {
  transition: background-color 180ms ease, border-color 180ms ease,
    color 180ms ease, box-shadow 180ms ease, width 240ms ease;
}

/* ── Motion preferences ───────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .qm-einv .qm-t {
    transition: none !important;
  }
}

/* ── Print: keep the report, drop the chrome ──────────────────────────── */
@media print {
  .qm-einv {
    --qm-ivory: #ffffff;
  }
  .qm-einv .qm-no-print {
    display: none !important;
  }
  .qm-einv .qm-avoid-break {
    break-inside: avoid;
  }
}
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const cx = (...a) => a.filter(Boolean).join(" ");

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qm-orange)] focus-visible:ring-offset-2";

// Keeps English abbreviations readable inside RTL text.
const Ltr = ({ children, className }) => (
  <bdi dir="ltr" className={className}>
    {children}
  </bdi>
);

// Revenue: state stays a plain digit string (same shape as before), the UI
// shows it with thousands separators. Arabic-Indic digits are normalised.
const toLatinDigits = (s) =>
  String(s)
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
const sanitizeRevenue = (s) =>
  toLatinDigits(s).replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "").slice(0, 13);
const withCommas = (raw) => (raw ? raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "");

// ─── Icons (inline, stroke-based — no new dependency) ───────────────────────
function Icon({ name, className = "h-4 w-4" }) {
  const p = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
    focusable: "false",
  };
  switch (name) {
    case "check":
      return (
        <svg {...p}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case "next": // forward in RTL = points left
      return (
        <svg {...p}>
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
      );
    case "prev": // back in RTL = points right
      return (
        <svg {...p}>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      );
    case "external":
      return (
        <svg {...p}>
          <path d="M15 3h6v6" />
          <path d="M10 14 21 3" />
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
      );
    case "printer":
      return (
        <svg {...p}>
          <path d="M6 9V2h12v7" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
      );
    case "reset":
      return (
        <svg {...p}>
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      );
    default: // info
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      );
  }
}

// ─── Static option data (labels only — values come from the config enums) ───
const BUSINESS_OPTIONS = [
  {
    id: BUSINESS_TYPE.PRIVATE,
    title: "شركة أو منشأة خاصة",
    desc: "الشركات والمؤسسات التجارية في القطاع الخاص الخاضعة لضريبة القيمة المضافة.",
    short: "منشأة خاصة",
  },
  {
    id: BUSINESS_TYPE.GOVERNMENT,
    title: "جهة حكومية",
    desc: "الوزارات والهيئات والدوائر والمؤسسات الحكومية.",
    short: "جهة حكومية",
  },
];

const TX_OPTIONS = [
  {
    id: TRANSACTION_TYPE.B2B,
    abbr: "B2B",
    title: "شركة إلى شركة",
    desc: "بيع وتوريد السلع والخدمات إلى شركات ومؤسسات أخرى داخل الدولة وخارجها.",
    inScope: true,
  },
  {
    id: TRANSACTION_TYPE.B2G,
    abbr: "B2G",
    title: "شركة إلى جهة حكومية",
    desc: "توريد السلع أو تقديم الخدمات للوزارات والدوائر والهيئات والمؤسسات الحكومية.",
    inScope: true,
  },
  {
    id: TRANSACTION_TYPE.B2C,
    abbr: "B2C",
    title: "شركة إلى مستهلك",
    desc: "البيع المباشر للأفراد والمستهلكين النهائيين: نقاط بيع، تجارة تجزئة، متاجر إلكترونية.",
    inScope: false,
  },
];

const SYSTEM_OPTIONS = [
  { id: CURRENT_SYSTEM.ERP, label: "نظام ERP أو برنامج محاسبي متقدم", sub: "مثل SAP وOracle وOdoo وZoho Books وMicrosoft Dynamics" },
  { id: CURRENT_SYSTEM.CLOUD, label: "برنامج فوترة أو محاسبة سحابي", sub: "برامج فوترة جاهزة أو اشتراكات سحابية متخصصة" },
  { id: CURRENT_SYSTEM.EXCEL, label: "جداول إكسل أو نماذج يدوية", sub: "إصدار الفواتير يدوياً وتعبئة البيانات جدولياً" },
  { id: CURRENT_SYSTEM.WORD_PDF, label: "ملفات Word أو PDF ثابتة", sub: "كتابة الفاتورة وطباعتها كملف PDF يدوي" },
  { id: CURRENT_SYSTEM.OTHER, label: "نظام آخر أو برمجة مخصصة", sub: "نظام داخلي تم تطويره خصيصاً للمنشأة" },
];

const ASP_OPTIONS = [
  { id: ASP_STATUS.YES, label: "نعم، تم التعاقد" },
  { id: ASP_STATUS.NO, label: "لا، لم نختر بعد" },
  { id: ASP_STATUS.UNSURE, label: "غير متأكد / قيد البحث" },
];

const ANSWER_OPTIONS = [
  { id: ANSWER_LEVEL.YES, label: "نعم" },
  { id: ANSWER_LEVEL.PARTIAL, label: "جزئياً" },
  { id: ANSWER_LEVEL.NO, label: "لا" },
  { id: ANSWER_LEVEL.UNSURE, label: "غير متأكد" },
];

const REVENUE_CHIPS = [
  { label: "5 مليون", val: "5000000" },
  { label: "25 مليون", val: "25000000" },
  { label: "50 مليون (الحد)", val: "50000000" },
  { label: "100 مليون", val: "100000000" },
];

const STEPS = [
  { number: 1, title: "بيانات المنشأة" },
  { number: 2, title: "نوع المعاملات" },
  { number: 3, title: "نظام الفوترة" },
  { number: 4, title: "الجاهزية التقنية" },
];

// ─── Preset Configurations (unchanged) ───────────────────────────────────────
const PRESETS = [
  {
    id: "large_b2b",
    label: "منشأة كبرى (60 مليون — B2B)",
    config: {
      businessType: BUSINESS_TYPE.PRIVATE,
      revenue: "60000000",
      transactionTypes: [TRANSACTION_TYPE.B2B],
      currentSystem: CURRENT_SYSTEM.ERP,
      aspStatus: ASP_STATUS.NO,
      apiIntegration: ANSWER_LEVEL.YES,
      partyDataUpdated: ANSWER_LEVEL.PARTIAL,
      taxDataUpdated: ANSWER_LEVEL.YES,
      structuredInvoiceCapability: ANSWER_LEVEL.PARTIAL,
      aspContacted: ANSWER_LEVEL.YES,
      integrationTesting: ANSWER_LEVEL.NO,
    },
  },
  {
    id: "sme_b2b",
    label: "منشأة متوسطة أو صغيرة (10 مليون — B2B)",
    config: {
      businessType: BUSINESS_TYPE.PRIVATE,
      revenue: "10000000",
      transactionTypes: [TRANSACTION_TYPE.B2B],
      currentSystem: CURRENT_SYSTEM.CLOUD,
      aspStatus: ASP_STATUS.NO,
      apiIntegration: ANSWER_LEVEL.PARTIAL,
      partyDataUpdated: ANSWER_LEVEL.YES,
      taxDataUpdated: ANSWER_LEVEL.YES,
      structuredInvoiceCapability: ANSWER_LEVEL.NO,
      aspContacted: ANSWER_LEVEL.NO,
      integrationTesting: ANSWER_LEVEL.NO,
    },
  },
  {
    id: "b2c_only",
    label: "مبيعات أفراد فقط (B2C)",
    config: {
      businessType: BUSINESS_TYPE.PRIVATE,
      revenue: "8000000",
      transactionTypes: [TRANSACTION_TYPE.B2C],
      currentSystem: CURRENT_SYSTEM.CLOUD,
      aspStatus: ASP_STATUS.NO,
      apiIntegration: ANSWER_LEVEL.NO,
      partyDataUpdated: ANSWER_LEVEL.NO,
      taxDataUpdated: ANSWER_LEVEL.YES,
      structuredInvoiceCapability: ANSWER_LEVEL.NO,
      aspContacted: ANSWER_LEVEL.NO,
      integrationTesting: ANSWER_LEVEL.NO,
    },
  },
  {
    id: "gov",
    label: "جهة حكومية",
    config: {
      businessType: BUSINESS_TYPE.GOVERNMENT,
      revenue: "0",
      transactionTypes: [TRANSACTION_TYPE.B2G],
      currentSystem: CURRENT_SYSTEM.ERP,
      aspStatus: ASP_STATUS.YES,
      apiIntegration: ANSWER_LEVEL.YES,
      partyDataUpdated: ANSWER_LEVEL.YES,
      taxDataUpdated: ANSWER_LEVEL.YES,
      structuredInvoiceCapability: ANSWER_LEVEL.YES,
      aspContacted: ANSWER_LEVEL.YES,
      integrationTesting: ANSWER_LEVEL.PARTIAL,
    },
  },
];

// ═══ UI PRIMITIVES ═══════════════════════════════════════════════════════════

// Tooltip: Ink background, white text. Opens on hover/focus/tap, closes on
// Escape or outside tap, and keeps itself inside the viewport on small screens.
function InfoTip({ term, title, explanation }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false); // opened by click/tap/Enter, stays until dismissed
  const [shift, setShift] = useState(0);
  const id = useId();
  const wrapRef = useRef(null);
  const tipRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setShift(0);
      return;
    }
    const el = tipRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      if (r.left < 12) setShift(12 - r.left);
      else if (r.right > vw - 12) setShift(vw - 12 - r.right);
    }
    const close = () => {
      setOpen(false);
      setPinned(false);
    };
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close();
    };
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className="relative inline-flex align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => !pinned && setOpen(false)}
    >
      <button
        type="button"
        onClick={() => {
          // hover already opened it on desktop → first click pins, second closes
          if (!open || !pinned) {
            setOpen(true);
            setPinned(true);
          } else {
            setOpen(false);
            setPinned(false);
          }
        }}
        aria-label={`توضيح مصطلح ${term}`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        className={cx(
          "inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--qm-text-3)] hover:text-[var(--qm-text)] qm-t",
          focusRing
        )}
      >
        <Icon name="info" className="h-[18px] w-[18px]" />
      </button>
      {open && (
        <span
          ref={tipRef}
          id={id}
          role="tooltip"
          dir="rtl"
          style={{ left: "50%", transform: `translateX(calc(-50% + ${shift}px))` }}
          className="absolute bottom-full z-50 mb-2 w-[min(18rem,calc(100vw-2rem))] rounded-[10px] bg-[var(--qm-ink)] px-3.5 py-3 text-start text-[13px] leading-6 text-white"
        >
          <span className="mb-0.5 block font-bold">
            <Ltr>{title || term}</Ltr>
          </span>
          <span className="block text-[#d8d8d2]">{explanation}</span>
        </span>
      )}
    </span>
  );
}

// Selectable card (radio or checkbox) — real input underneath for keyboard,
// screen readers and form semantics; custom visuals on top.
function OptionCard({ type = "radio", name, checked, onChange, children, className }) {
  return (
    <label className={cx("relative block cursor-pointer", className)}>
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className={cx(
          "qm-t flex h-full gap-3 rounded-[16px] border p-4 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--qm-orange)] peer-focus-visible:ring-offset-2",
          checked
            ? "border-[var(--qm-orange)] bg-[var(--qm-orange-tint)]"
            : "border-[var(--qm-border)] bg-[var(--qm-surface)] hover:border-[var(--qm-border-strong)]"
        )}
      >
        <span className="min-w-0 flex-1">{children}</span>
        <span
          aria-hidden="true"
          className={cx(
            "qm-t mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border",
            type === "radio" ? "rounded-full" : "rounded-md",
            checked
              ? "border-[var(--qm-orange)] bg-[var(--qm-orange)] text-[var(--qm-ink)]"
              : "border-[var(--qm-border-strong)] bg-[var(--qm-surface)] text-transparent"
          )}
        >
          <Icon name="check" className="h-3 w-3" />
        </span>
      </span>
    </label>
  );
}

// Compact segmented answer control (Yes / Partial / No / Unsure)
function AnswerGroup({ name, value, onChange, legend }) {
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{legend}</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ANSWER_OPTIONS.map((o) => {
          const checked = value === o.id;
          return (
            <label key={o.id} className="relative block cursor-pointer">
              <input
                type="radio"
                name={name}
                checked={checked}
                onChange={() => onChange(o.id)}
                className="peer sr-only"
              />
              <span
                className={cx(
                  "qm-t flex min-h-[44px] items-center justify-center rounded-xl border px-2 text-center text-sm font-semibold peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--qm-orange)] peer-focus-visible:ring-offset-2",
                  checked
                    ? "border-[var(--qm-orange)] bg-[var(--qm-orange-tint)] text-[var(--qm-text)]"
                    : "border-[var(--qm-border)] bg-[var(--qm-surface)] text-[var(--qm-text-2)] hover:border-[var(--qm-border-strong)] hover:text-[var(--qm-text)]"
                )}
              >
                {o.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function PrimaryButton({ children, className, ...rest }) {
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        // Ink text on Signal Orange = 6.3:1 (white on orange is only 3.1:1)
        "qm-t inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[var(--qm-orange)] px-6 text-base font-bold text-[var(--qm-ink)] hover:bg-[var(--qm-orange-hover)]",
        focusRing,
        className
      )}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className, ...rest }) {
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        "qm-t inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[var(--qm-ink)] bg-transparent px-5 text-base font-semibold text-[var(--qm-ink)] hover:bg-[var(--qm-subtle)]",
        focusRing,
        className
      )}
    >
      {children}
    </button>
  );
}

function Callout({ title, children }) {
  return (
    <div
      role="note"
      className="flex gap-3 rounded-2xl border border-[var(--qm-orange-line)] bg-[var(--qm-orange-tint)] p-4"
    >
      <span className="mt-0.5 shrink-0 text-[var(--qm-orange-text)]">
        <Icon name="info" className="h-5 w-5" />
      </span>
      <div className="text-sm leading-7 text-[var(--qm-text-2)]">
        {title && <p className="mb-0.5 font-bold text-[var(--qm-text)]">{title}</p>}
        {children}
      </div>
    </div>
  );
}

function Progress({ value, label, className }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={label}
      className={cx("h-2 w-full overflow-hidden rounded-full bg-[var(--qm-subtle)]", className)}
    >
      <div
        className="qm-t h-full rounded-full bg-[var(--qm-orange)]"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function Stepper({ current, onGo }) {
  return (
    <div className="qm-no-print">
      {/* Desktop / tablet */}
      <ol className="hidden items-start sm:flex" aria-label="خطوات التقييم">
        {STEPS.map((s, i) => {
          const isActive = current === s.number;
          const isPast = current > s.number;
          return (
            <li key={s.number} className={cx("flex items-start", i < STEPS.length - 1 && "flex-1")}>
              <button
                type="button"
                onClick={() => onGo(s.number)}
                aria-current={isActive ? "step" : undefined}
                className={cx("group flex items-center gap-3 rounded-xl py-1 pe-3 text-start", focusRing)}
              >
                <span
                  className={cx(
                    "qm-t flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold tabular-nums",
                    isActive && "border-[var(--qm-orange)] bg-[var(--qm-orange)] text-[var(--qm-ink)]",
                    isPast && "border-[var(--qm-ink)] bg-[var(--qm-ink)] text-white",
                    !isActive && !isPast && "border-[var(--qm-border-strong)] bg-transparent text-[var(--qm-text-3)]"
                  )}
                >
                  {isPast ? <Icon name="check" className="h-4 w-4" /> : String(s.number).padStart(2, "0")}
                </span>
                <span
                  className={cx(
                    "qm-t text-sm font-semibold leading-6",
                    isActive ? "text-[var(--qm-text)]" : isPast ? "text-[var(--qm-text-2)]" : "text-[var(--qm-text-3)]"
                  )}
                >
                  {s.title}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cx(
                    "qm-t mx-1 mt-[18px] h-px flex-1",
                    isPast ? "bg-[var(--qm-ink)]" : "bg-[var(--qm-border)]"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact */}
      <div className="sm:hidden">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--qm-text)]">
            الخطوة <span className="tabular-nums">{current}</span> من <span className="tabular-nums">{STEPS.length}</span>
          </p>
          <p className="text-sm text-[var(--qm-text-2)]">{STEPS[current - 1].title}</p>
        </div>
        <Progress value={(current / STEPS.length) * 100} label="التقدم في التقييم" />
      </div>
    </div>
  );
}

function StepHeading({ eyebrow, title, hint, headingRef }) {
  return (
    <header>
      <p className="mb-1.5 text-sm font-semibold text-[var(--qm-orange-text)]">{eyebrow}</p>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-[1.375rem] font-bold leading-9 text-[var(--qm-text)] outline-none sm:text-[1.625rem]"
      >
        {title}
      </h2>
      {hint && <p className="mt-1.5 text-[0.9375rem] leading-7 text-[var(--qm-text-2)]">{hint}</p>}
    </header>
  );
}

// ═══ MAIN COMPONENT ══════════════════════════════════════════════════════════
export default function UaeEInvoicingChecker() {
  const [currentStep, setCurrentStep] = useState(1);
  const [resultsUnlocked, setResultsUnlocked] = useState(false);

  // Form state — unchanged shape and defaults
  const [businessType, setBusinessType] = useState(BUSINESS_TYPE.PRIVATE);
  const [revenue, setRevenue] = useState("50000000");
  const [transactionTypes, setTransactionTypes] = useState([TRANSACTION_TYPE.B2B]);
  const [currentSystem, setCurrentSystem] = useState(CURRENT_SYSTEM.ERP);
  const [aspStatus, setAspStatus] = useState(ASP_STATUS.NO);
  const [apiIntegration, setApiIntegration] = useState(ANSWER_LEVEL.PARTIAL);
  const [partyDataUpdated, setPartyDataUpdated] = useState(ANSWER_LEVEL.YES);
  const [taxDataUpdated, setTaxDataUpdated] = useState(ANSWER_LEVEL.YES);
  const [structuredInvoiceCapability, setStructuredInvoiceCapability] = useState(ANSWER_LEVEL.PARTIAL);
  const [aspContacted, setAspContacted] = useState(ANSWER_LEVEL.NO);
  const [integrationTesting, setIntegrationTesting] = useState(ANSWER_LEVEL.NO);

  const [hasStarted, setHasStarted] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTransactionType = (type) => {
    setTransactionTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  };

  // Evaluate results — logic untouched
  const result = useMemo(() => {
    return evaluateEInvoicingReadiness({
      businessType,
      revenue,
      transactionTypes,
      currentSystem,
      aspStatus,
      apiIntegration,
      partyDataUpdated,
      taxDataUpdated,
      structuredInvoiceCapability,
      aspContacted,
      integrationTesting,
    });
  }, [
    businessType,
    revenue,
    transactionTypes,
    currentSystem,
    aspStatus,
    apiIntegration,
    partyDataUpdated,
    taxDataUpdated,
    structuredInvoiceCapability,
    aspContacted,
    integrationTesting,
  ]);

  // Analytics (privacy-safe) — unchanged
  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
        window.trackEvent("einvoice_checker_started", { tool: "uae-einvoice-checker" });
      }
    }
  }, [hasStarted]);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
      window.trackEvent("einvoice_checker_completed", {
        score_band: result.bandLabelAr,
        score_total: result.scores.total,
        is_in_scope: result.inScope,
      });

      if (!result.inScope) {
        window.trackEvent("einvoice_result_b2c_only", {});
      } else if (businessType === BUSINESS_TYPE.PRIVATE && parseFloat(revenue) >= REVENUE_THRESHOLD_LARGE_BUSINESS) {
        window.trackEvent("einvoice_result_large_business", {});
      } else if (businessType === BUSINESS_TYPE.PRIVATE) {
        window.trackEvent("einvoice_result_small_business", {});
      }
    }
  }, [result.bandLabelAr, result.scores.total, result.inScope, businessType, revenue]);

  // ── Navigation helpers (UI only) ───────────────────────────────────────────
  const cardRef = useRef(null);
  const headingRef = useRef(null);
  const prevStepRef = useRef(currentStep);

  const goToStep = (n) => {
    setCurrentStep(n);
    if (n === 4) setResultsUnlocked(true);
  };

  // Move focus to the new step heading and bring the card into view on mobile
  useEffect(() => {
    if (prevStepRef.current === currentStep) return; // initial mount / StrictMode re-run
    prevStepRef.current = currentStep;
    headingRef.current?.focus({ preventScroll: true });
    const top = cardRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) cardRef.current.scrollIntoView({ block: "start" });
  }, [currentStep]);

  const handleReset = () => {
    setBusinessType(BUSINESS_TYPE.PRIVATE);
    setRevenue("50000000");
    setTransactionTypes([TRANSACTION_TYPE.B2B]);
    setCurrentSystem(CURRENT_SYSTEM.ERP);
    setAspStatus(ASP_STATUS.NO);
    setApiIntegration(ANSWER_LEVEL.PARTIAL);
    setPartyDataUpdated(ANSWER_LEVEL.YES);
    setTaxDataUpdated(ANSWER_LEVEL.YES);
    setStructuredInvoiceCapability(ANSWER_LEVEL.PARTIAL);
    setAspContacted(ANSWER_LEVEL.NO);
    setIntegrationTesting(ANSWER_LEVEL.NO);
    setResultsUnlocked(false);
    setCurrentStep(1);
  };

  const handlePresetSelect = (preset) => {
    const { config } = preset;
    setBusinessType(config.businessType);
    setRevenue(config.revenue);
    setTransactionTypes(config.transactionTypes);
    setCurrentSystem(config.currentSystem);
    setAspStatus(config.aspStatus);
    setApiIntegration(config.apiIntegration);
    setPartyDataUpdated(config.partyDataUpdated);
    setTaxDataUpdated(config.taxDataUpdated);
    setStructuredInvoiceCapability(config.structuredInvoiceCapability);
    setAspContacted(config.aspContacted);
    setIntegrationTesting(config.integrationTesting);
    goToStep(4);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const showResult = () => {
    document.getElementById("readiness-result")?.scrollIntoView({ block: "start" });
  };

  // ── Derived display values (presentation only) ─────────────────────────────
  const isPrivate = businessType === BUSINESS_TYPE.PRIVATE;
  const revenueNum = parseFloat(revenue || 0);
  const aboveThreshold = revenueNum >= REVENUE_THRESHOLD_LARGE_BUSINESS;

  const summary = [
    { k: "نوع المنشأة", v: BUSINESS_OPTIONS.find((o) => o.id === businessType)?.short },
    isPrivate && revenue
      ? { k: "الإيرادات السنوية", v: `${withCommas(revenue)} د.إ`, ltr: true }
      : null,
    {
      k: "المعاملات",
      v: TX_OPTIONS.filter((o) => transactionTypes.includes(o.id))
        .map((o) => o.abbr)
        .join(" ، "),
      ltr: true,
    },
    currentStep > 2
      ? { k: "نظام الفوترة", v: SYSTEM_OPTIONS.find((o) => o.id === currentSystem)?.label }
      : null,
    currentStep > 2
      ? { k: "مزود الخدمة (ASP)", v: ASP_OPTIONS.find((o) => o.id === aspStatus)?.label }
      : null,
  ].filter(Boolean);

  const questions = [
    { n: "01", text: "هل نظام الفوترة لديك قادر على الربط عبر API؟", value: apiIntegration, set: setApiIntegration, tip: { term: "API", title: "الربط البرمجي (API)", explanation: "واجهة برمجية تسمح لبرنامجك المحاسبي بإرسال واستقبال بيانات الفواتير تلقائياً مع مزود الخدمة المعتمد دون الحاجة لرفع يدوي." } },
    { n: "02", text: "هل بيانات العملاء والموردين محدثة ومكتملة؟", value: partyDataUpdated, set: setPartyDataUpdated },
    { n: "03", text: "هل البيانات الضريبية للمنشأة (TRN) صحيحة ومحدثة؟", value: taxDataUpdated, set: setTaxDataUpdated, tip: { term: "TRN", title: "رقم التسجيل الضريبي (TRN)", explanation: "الرقم الذي تمنحه الهيئة الاتحادية للضرائب للمنشأة المسجلة في ضريبة القيمة المضافة، ويجب أن يكون صحيحاً في كل فاتورة." } },
    { n: "04", text: "هل يمكن لنظامك إنتاج فواتير بصيغة XML مهيكلة؟", value: structuredInvoiceCapability, set: setStructuredInvoiceCapability, tip: { term: "PINT-AE", title: "مواصفة PINT-AE", explanation: "المواصفة الفنية المعتمدة في دولة الإمارات لتنسيق ملفات فواتير XML وفق معايير شبكة Peppol لضمان تبادل آلي موحد وخالٍ من الأخطاء." } },
    { n: "05", text: "هل تم التواصل المباشر مع مزود خدمة معتمد (ASP)؟", value: aspContacted, set: setAspContacted },
    { n: "06", text: "هل بدأت اختبار التكامل الفني (Testing)؟", value: integrationTesting, set: setIntegrationTesting },
  ];

  const pillarRows = PILLARS.map((p) => {
    const score = result.scores[p.key];
    const pct = Math.round((score / p.weight) * 100);
    return { ...p, score, pct };
  });

  const pillarTag = (pct) =>
    pct >= 80
      ? { text: "جاهز", cls: "bg-[var(--qm-success-tint)] text-[var(--qm-success)]" }
      : pct >= 50
        ? { text: "قيد التقدم", cls: "bg-[var(--qm-subtle)] text-[var(--qm-text-2)]" }
        : { text: "يحتاج إلى عمل", cls: "bg-[var(--qm-warning-tint)] text-[var(--qm-warning)]" };

  const priorityTag = (p) =>
    p === "critical"
      ? { text: "أولوية قصوى", cls: "bg-[var(--qm-danger-tint)] text-[var(--qm-danger)]" }
      : p === "high"
        ? { text: "أولوية مرتفعة", cls: "bg-[var(--qm-warning-tint)] text-[var(--qm-warning)]" }
        : { text: "أولوية عادية", cls: "bg-[var(--qm-subtle)] text-[var(--qm-text-2)]" };

  // ═══ RENDER ════════════════════════════════════════════════════════════════
  return (
    <div className="qm-einv space-y-8 sm:space-y-10" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: QM_CSS }} />
      {/* ── Presets ───────────────────────────────────────────────────────── */}
      <div className="qm-no-print flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
        <span className="shrink-0 text-sm font-semibold text-[var(--qm-text-2)]">جرّب نموذجاً جاهزاً:</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetSelect(p)}
              className={cx(
                "qm-t rounded-lg border border-[var(--qm-border)] bg-[var(--qm-surface)] px-3 py-1.5 text-sm font-medium text-[var(--qm-text-2)] hover:border-[var(--qm-ink)] hover:text-[var(--qm-text)]",
                focusRing
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tool surface ──────────────────────────────────────────────────── */}
      <section
        ref={cardRef}
        aria-label="أداة تقييم الجاهزية"
        className="qm-no-print scroll-mt-4 overflow-hidden rounded-[24px] border border-[var(--qm-border)] bg-[var(--qm-surface)] shadow-[0_1px_2px_rgba(13,13,13,0.04),0_8px_24px_-12px_rgba(13,13,13,0.08)]"
      >
        <div className="grid lg:grid-cols-[minmax(0,1fr)_288px]">
          {/* Main column */}
          <div className="p-5 sm:p-8 lg:p-10">
            <Stepper current={currentStep} onGo={goToStep} />
            <hr className="my-6 border-[var(--qm-border)] sm:my-8" />

            {/* ── STEP 1 ─────────────────────────────────────────────── */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <StepHeading
                  headingRef={headingRef}
                  eyebrow="الخطوة 01"
                  title="ما نوع منشأتك؟"
                  hint="تحدد وزارة المالية مراحل الإلزام بالفوترة الإلكترونية استناداً إلى طبيعة المنشأة وحجم إيراداتها السنوية."
                />

                <fieldset>
                  <legend className="sr-only">نوع المنشأة</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {BUSINESS_OPTIONS.map((o) => (
                      <OptionCard
                        key={o.id}
                        name="business-type"
                        checked={businessType === o.id}
                        onChange={() => setBusinessType(o.id)}
                      >
                        <span className="block text-base font-bold leading-7 text-[var(--qm-text)]">{o.title}</span>
                        <span className="mt-0.5 block text-sm leading-6 text-[var(--qm-text-2)]">{o.desc}</span>
                      </OptionCard>
                    ))}
                  </div>
                </fieldset>

                {isPrivate && (
                  <div>
                    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <label htmlFor="revenue-input" className="text-base font-bold text-[var(--qm-text)]">
                        الإيرادات السنوية
                      </label>
                      <span className="text-sm text-[var(--qm-text-3)]">
                        حد المرحلة الأولى: <span className="tabular-nums" dir="ltr">50,000,000</span> د.إ
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        id="revenue-input"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        dir="ltr"
                        value={withCommas(revenue)}
                        onChange={(e) => setRevenue(sanitizeRevenue(e.target.value))}
                        placeholder="50,000,000"
                        aria-describedby="revenue-hint"
                        className="qm-t w-full rounded-xl border border-[var(--qm-border-strong)] bg-[var(--qm-surface)] py-4 ps-[5.5rem] pe-4 text-start text-2xl font-bold tabular-nums text-[var(--qm-text)] placeholder:text-[var(--qm-muted)] focus:border-[var(--qm-orange)] focus:outline-none focus:ring-2 focus:ring-[var(--qm-orange)]/30"
                      />
                      <span
                        aria-hidden="true"
                        dir="ltr"
                        className="pointer-events-none absolute inset-y-0 start-0 flex items-center gap-1.5 border-e border-[var(--qm-border)] ps-4 pe-3 text-sm font-bold text-[var(--qm-text-2)]"
                      >
                        AED
                      </span>
                    </div>
                    <p id="revenue-hint" className="mt-2 text-sm text-[var(--qm-text-3)]">
                      المبلغ بالدرهم الإماراتي (AED / د.إ). مثال: <span className="tabular-nums" dir="ltr">50,000,000</span> د.إ
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-sm text-[var(--qm-text-3)]">خيارات شائعة:</span>
                      {REVENUE_CHIPS.map((chip) => {
                        const on = revenue === chip.val;
                        return (
                          <button
                            key={chip.val}
                            type="button"
                            aria-pressed={on}
                            onClick={() => setRevenue(chip.val)}
                            className={cx(
                              "qm-t rounded-lg border px-3 py-1.5 text-sm font-semibold",
                              on
                                ? "border-[var(--qm-orange)] bg-[var(--qm-orange-tint)] text-[var(--qm-text)]"
                                : "border-[var(--qm-border)] bg-[var(--qm-surface)] text-[var(--qm-text-2)] hover:border-[var(--qm-ink)]",
                              focusRing
                            )}
                          >
                            {chip.label}
                          </button>
                        );
                      })}
                    </div>

                    <p
                      aria-live="polite"
                      className="mt-4 rounded-xl bg-[var(--qm-subtle)] px-4 py-3 text-sm leading-7 text-[var(--qm-text)]"
                    >
                      {aboveThreshold
                        ? "إيرادات المنشأة تبلغ أو تتجاوز 50 مليون درهم — تقع ضمن المرحلة الأولى المقررة للمنشآت الكبرى."
                        : "إيرادات المنشأة أقل من 50 مليون درهم — تقع ضمن المرحلة الثانية لعموم المنشآت."}
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <PrimaryButton onClick={() => goToStep(2)} className="w-full sm:w-auto">
                    <span>التالي</span>
                    <Icon name="next" />
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* ── STEP 2 ─────────────────────────────────────────────── */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <StepHeading
                  headingRef={headingRef}
                  eyebrow="الخطوة 02"
                  title="ما نوع معاملاتك التجارية؟"
                  hint="حدّد كل ما ينطبق على منشأتك. يمكنك اختيار أكثر من نوع، ويجب اختيار نوع واحد على الأقل."
                />

                <fieldset>
                  <legend className="sr-only">أنواع المعاملات</legend>
                  <div className="space-y-3">
                    {TX_OPTIONS.map((tx) => {
                      const checked = transactionTypes.includes(tx.id);
                      return (
                        <OptionCard
                          key={tx.id}
                          type="checkbox"
                          name="transaction-types"
                          checked={checked}
                          onChange={() => toggleTransactionType(tx.id)}
                        >
                          <span className="flex items-start gap-4">
                            <span
                              dir="ltr"
                              className="w-14 shrink-0 text-2xl font-bold leading-9 tracking-tight text-[var(--qm-text)]"
                            >
                              {tx.abbr}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="text-base font-bold leading-7 text-[var(--qm-text)]">{tx.title}</span>
                                <span
                                  className={cx(
                                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                    tx.inScope
                                      ? "bg-[var(--qm-subtle)] text-[var(--qm-text-2)]"
                                      : "bg-[var(--qm-warning-tint)] text-[var(--qm-warning)]"
                                  )}
                                >
                                  {tx.inScope ? "نطاق إلزامي" : "خارج النطاق حالياً"}
                                </span>
                              </span>
                              <span className="mt-0.5 block text-sm leading-6 text-[var(--qm-text-2)]">{tx.desc}</span>
                            </span>
                          </span>
                        </OptionCard>
                      );
                    })}
                  </div>
                </fieldset>

                {transactionTypes.length === 1 && transactionTypes[0] === TRANSACTION_TYPE.B2C && (
                  <Callout title="توضيح تنظيمي لمعاملات B2C">
                    المعاملات مع المستهلكين الأفراد (<Ltr>B2C</Ltr>) تقع حالياً خارج النطاق الإلزامي لمنظومة الفوترة الإلكترونية في المرحلة الحالية، ولا يُعد هذا إعفاءً دائماً؛ إذ قد تتغير المتطلبات مستقبلاً بقرار من الوزير.
                  </Callout>
                )}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <SecondaryButton onClick={() => goToStep(1)} className="w-full sm:w-auto">
                    <Icon name="prev" />
                    <span>السابق</span>
                  </SecondaryButton>
                  <PrimaryButton onClick={() => goToStep(3)} className="w-full sm:w-auto">
                    <span>التالي</span>
                    <Icon name="next" />
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* ── STEP 3 ─────────────────────────────────────────────── */}
            {currentStep === 3 && (
              <div className="space-y-9">
                <StepHeading
                  headingRef={headingRef}
                  eyebrow="الخطوة 03"
                  title="كيف تصدر فواتيرك اليوم؟"
                  hint={
                    <>
                      اختر الوسيلة الأساسية المستخدمة حالياً، ثم حدّد موقفك من التعاقد مع مزود خدمة معتمد. وتشمل الأنظمة المتقدمة برامج <Ltr>ERP</Ltr>
                      <InfoTip
                        term="ERP"
                        title="ERP"
                        explanation="نظام تخطيط موارد المنشأة: برنامج متكامل تدير به المحاسبة والمبيعات والمشتريات، وغالباً منه تصدر الفواتير."
                      />
                    </>
                  }
                />

                <div>
                  <fieldset>
                    <legend className="mb-3 text-base font-bold text-[var(--qm-text)]">
                      ما الوسيلة الأساسية المستخدمة حالياً في إصدار فواتير منشأتك؟
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {SYSTEM_OPTIONS.map((sys) => (
                        <OptionCard
                          key={sys.id}
                          name="current-system"
                          checked={currentSystem === sys.id}
                          onChange={() => setCurrentSystem(sys.id)}
                        >
                          <span className="block text-[0.9375rem] font-bold leading-7 text-[var(--qm-text)]">{sys.label}</span>
                          <span className="mt-0.5 block text-[0.8125rem] leading-6 text-[var(--qm-text-3)]">{sys.sub}</span>
                        </OptionCard>
                      ))}
                    </div>
                  </fieldset>

                  {(currentSystem === CURRENT_SYSTEM.WORD_PDF || currentSystem === CURRENT_SYSTEM.EXCEL) && (
                    <div className="mt-4">
                      <Callout title="معلومة مهمة">
                        ملفات PDF وWord والبريد الإلكتروني لا تُعد فواتير إلكترونية بموجب النظام الإماراتي المعتمد. ستحتاج منشأتك إلى اعتماد برنامج محاسبي أو التكامل مع مزود معتمد لإنتاج بيانات فواتير منظمة.
                      </Callout>
                    </div>
                  )}
                </div>

                <div>
                  <fieldset>
                    <legend className="mb-3 flex items-center gap-1 text-base font-bold text-[var(--qm-text)]">
                      <span>هل اخترت مزود خدمة معتمداً وتعاقدت معه؟</span>
                      <InfoTip
                        term="ASP"
                        title="مزود خدمة معتمد (ASP)"
                        explanation="جهة تقنية معتمدة رسمياً من وزارة المالية في دولة الإمارات تعمل كنقطة ربط (Access Point) عبر شبكة Peppol لتحويل الفواتير إلى صيغة PINT-AE المعتمدة والإبلاغ عنها للجهات الضريبية."
                      />
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {ASP_OPTIONS.map((opt) => (
                        <OptionCard
                          key={opt.id}
                          name="asp-status"
                          checked={aspStatus === opt.id}
                          onChange={() => setAspStatus(opt.id)}
                        >
                          <span className="block text-[0.9375rem] font-bold leading-7 text-[var(--qm-text)]">{opt.label}</span>
                        </OptionCard>
                      ))}
                    </div>
                  </fieldset>

                  <p className="mt-4 text-sm leading-7 text-[var(--qm-text-2)]">
                    <span>قائمة المزودين المعتمدين: </span>
                    <a
                      href={MOF_ASP_DIRECTORY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cx(
                        "inline-flex items-center gap-1 rounded font-semibold text-[var(--qm-orange-text)] underline underline-offset-4",
                        focusRing
                      )}
                    >
                      <span>استعراض القائمة الرسمية على موقع وزارة المالية</span>
                      <Icon name="external" className="h-3.5 w-3.5" />
                    </a>
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <SecondaryButton onClick={() => goToStep(2)} className="w-full sm:w-auto">
                    <Icon name="prev" />
                    <span>السابق</span>
                  </SecondaryButton>
                  <PrimaryButton onClick={() => goToStep(4)} className="w-full sm:w-auto">
                    <span>التالي</span>
                    <Icon name="next" />
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* ── STEP 4 ─────────────────────────────────────────────── */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <StepHeading
                  headingRef={headingRef}
                  eyebrow="الخطوة 04"
                  title="ما مدى جاهزية أنظمتك وبياناتك؟"
                  hint="أجب عن الأسئلة الستة التالية لتحديد درجة جاهزية منشأتك وخطة العمل التنفيذية. تتحدث النتيجة فوراً مع كل إجابة."
                />

                <div className="divide-y divide-[var(--qm-border)] border-y border-[var(--qm-border)]">
                  {questions.map((q, idx) => (
                    <div key={q.n} className="py-5">
                      <div className="mb-3 flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="w-7 shrink-0 pt-0.5 text-sm font-bold tabular-nums text-[var(--qm-orange-text)]"
                        >
                          {q.n}
                        </span>
                        <p className="flex-1 text-base font-semibold leading-7 text-[var(--qm-text)]">
                          {q.text}
                          {q.tip && (
                            <>
                              {" "}
                              <InfoTip {...q.tip} />
                            </>
                          )}
                        </p>
                      </div>
                      <AnswerGroup
                        name={`q-${idx + 1}`}
                        legend={q.text}
                        value={q.value}
                        onChange={q.set}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                    <SecondaryButton onClick={() => goToStep(3)} className="w-full sm:w-auto">
                      <Icon name="prev" />
                      <span>السابق</span>
                    </SecondaryButton>
                    <button
                      type="button"
                      onClick={handleReset}
                      className={cx(
                        "qm-t inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-[var(--qm-text-2)] hover:text-[var(--qm-text)]",
                        focusRing
                      )}
                    >
                      <Icon name="reset" />
                      <span>إعادة ضبط الحقول</span>
                    </button>
                  </div>
                  <PrimaryButton onClick={showResult} className="w-full sm:w-auto">
                    <span>عرض النتيجة</span>
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>

          {/* Context sidebar (desktop only) — answers so far, never the result */}
          <aside
            aria-label="ملخص التقييم"
            className="hidden border-s border-[var(--qm-border)] bg-[var(--qm-ivory)] p-8 lg:block"
          >
            <p className="text-sm font-semibold text-[var(--qm-text-3)]">التقييم</p>
            <p className="mt-1 text-xl font-bold text-[var(--qm-text)]">
              الخطوة <span className="tabular-nums">{currentStep}</span> من <span className="tabular-nums">{STEPS.length}</span>
            </p>
            <Progress value={(currentStep / STEPS.length) * 100} label="التقدم في التقييم" className="mt-4 bg-[var(--qm-border)]" />

            <dl className="mt-8 space-y-4">
              {summary.map((row) => (
                <div key={row.k}>
                  <dt className="text-xs font-semibold text-[var(--qm-text-3)]">{row.k}</dt>
                  <dd className="mt-0.5 text-sm font-semibold leading-6 text-[var(--qm-text)]">
                    {row.ltr ? <bdi dir="ltr" className="tabular-nums">{row.v}</bdi> : row.v}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 border-t border-[var(--qm-border)] pt-5 text-xs leading-6 text-[var(--qm-text-3)]">
              تتم الحسابات داخل متصفحك ولا تُرسل إجاباتك إلى أي خادم.
            </p>
          </aside>
        </div>
      </section>

      {/* ━━ RESULT DASHBOARD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {resultsUnlocked && (
        <div id="readiness-result" className="scroll-mt-4 space-y-6 sm:space-y-8">
          {/* Heading + actions */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="mb-1.5 text-sm font-semibold text-[var(--qm-orange-text)]">نتيجة التقييم</p>
              <h2 className="text-[1.625rem] font-bold leading-[1.45] text-[var(--qm-text)] sm:text-[2.125rem]">
                تقرير الجاهزية والجدول الزمني الرسمي
              </h2>
            </div>
            <div className="qm-no-print flex shrink-0 gap-2">
              <SecondaryButton onClick={handlePrint} className="min-h-[44px] flex-1 sm:flex-none">
                <Icon name="printer" />
                <span>طباعة التقرير</span>
              </SecondaryButton>
              <SecondaryButton onClick={handleReset} className="min-h-[44px] flex-1 sm:flex-none">
                <Icon name="reset" />
                <span>إعادة التقييم</span>
              </SecondaryButton>
            </div>
          </div>

          {/* Status + score */}
          <div className="qm-avoid-break rounded-[24px] border border-[var(--qm-border)] bg-[var(--qm-surface)] p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,22rem)] lg:items-center">
              <div>
                <p className="text-sm font-semibold text-[var(--qm-text-3)]">مستوى الجاهزية</p>
                <p className="mt-1 text-[2rem] font-bold leading-[1.3] text-[var(--qm-text)] sm:text-[2.5rem]">
                  {result.bandLabelAr}
                </p>
                <p className="mt-3 max-w-xl text-base leading-8 text-[var(--qm-text-2)]">
                  بناءً على إجاباتك، هذه درجة جاهزيتك التشغيلية والخطوات المقترحة قبل موعد التطبيق.
                </p>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[3.5rem] font-bold leading-none tabular-nums text-[var(--qm-text)]" dir="ltr">
                    {result.scores.total}%
                  </span>
                  <span className="text-base font-semibold text-[var(--qm-text-2)]">جاهزية تشغيلية</span>
                </div>
                <Progress value={result.scores.total} label="درجة الجاهزية التشغيلية" className="mt-4 h-2.5" />
              </div>
            </div>
            <p className="mt-6 border-t border-[var(--qm-border)] pt-4 text-sm leading-7 text-[var(--qm-text-3)]">
              درجة الجاهزية هي تقييم إرشادي مبني على إجاباتك وليست تأكيداً رسمياً للامتثال القانوني أو الفني.
            </p>
          </div>

          {/* Scope + deadlines */}
          <div className="qm-avoid-break rounded-[24px] border border-[var(--qm-border)] bg-[var(--qm-surface)] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 max-w-2xl">
                <p className="text-sm font-semibold text-[var(--qm-text-3)]">الجدول الزمني والنطاق التنظيمي</p>
                <h3 className="mt-1 text-xl font-bold leading-9 text-[var(--qm-text)] sm:text-2xl">
                  {result.categoryLabelAr}
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-7 text-[var(--qm-text-2)]">{result.scopeNoteAr}</p>
              </div>
              <span
                className={cx(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold",
                  result.inScope
                    ? "bg-[var(--qm-ink)] text-white"
                    : "bg-[var(--qm-subtle)] text-[var(--qm-text-2)]"
                )}
              >
                {result.inScope ? "خاضع للإلزام التدريجي" : "خارج النطاق الإلزامي حالياً"}
              </span>
            </div>

            {result.inScope && result.timeline && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {/* Deadline 1 — appoint ASP (primary) */}
                <div className="rounded-[16px] border border-[var(--qm-orange-line)] bg-[var(--qm-orange-tint)] p-5 sm:p-6">
                  <p className="text-sm font-semibold text-[var(--qm-text-2)]">
                    الموعد الأول · تعيين مزود الخدمة المعتمد (<Ltr>ASP</Ltr>)
                  </p>
                  <p className="mt-2 text-[1.75rem] font-bold leading-10 text-[var(--qm-text)] sm:text-[2rem]">
                    {result.timeline.aspDeadlineAr}
                  </p>
                  {mounted && result.aspCountdown && (
                    <p
                      className={cx(
                        "mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold",
                        result.aspCountdown.passed
                          ? "bg-[var(--qm-danger-tint)] text-[var(--qm-danger)]"
                          : "bg-[var(--qm-surface)] text-[var(--qm-orange-text)]"
                      )}
                    >
                      {result.aspCountdown.labelAr}
                    </p>
                  )}
                  {result.timeline.notesAr && (
                    <p className="mt-3 text-sm leading-6 text-[var(--qm-text-2)]">{result.timeline.notesAr}</p>
                  )}
                </div>

                {/* Deadline 2 — mandatory go-live */}
                <div className="rounded-[16px] border border-[var(--qm-border)] bg-[var(--qm-surface)] p-5 sm:p-6">
                  <p className="text-sm font-semibold text-[var(--qm-text-2)]">
                    الموعد الثاني · بدء التطبيق الإلزامي
                  </p>
                  <p className="mt-2 text-[1.75rem] font-bold leading-10 text-[var(--qm-text)] sm:text-[2rem]">
                    {result.timeline.implementationDeadlineAr}
                  </p>
                  {mounted && result.implementationCountdown && (
                    <p
                      className={cx(
                        "mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold",
                        result.implementationCountdown.passed
                          ? "bg-[var(--qm-danger-tint)] text-[var(--qm-danger)]"
                          : "bg-[var(--qm-subtle)] text-[var(--qm-text)]"
                      )}
                    >
                      {result.implementationCountdown.labelAr}
                    </p>
                  )}
                  <p className="mt-3 text-sm leading-6 text-[var(--qm-text-2)]">
                    يجب أن تكون أنظمتك متصلة بمزود الخدمة المعتمد وجاهزة لإرسال واستقبال الفواتير بصيغة <Ltr>PINT-AE</Ltr>.
                  </p>
                </div>
              </div>
            )}

            {!result.inScope && (
              <div className="mt-6">
                <Callout title="معاملات المستهلكين الأفراد (B2C)">
                  لا توجد مواعيد إلزامية محددة حالياً لمعاملات المستهلكين الأفراد (<Ltr>B2C</Ltr>). يُنصح بمتابعة القرارات التنظيمية القادمة لوزارة المالية التي ستحدد آليات ونطاق شمول هذه المعاملات مستقبلاً.
                </Callout>
              </div>
            )}
          </div>

          {/* Action plan */}
          <div className="rounded-[24px] border border-[var(--qm-border)] bg-[var(--qm-surface)] p-6 sm:p-8">
            <h3 className="text-xl font-bold leading-9 text-[var(--qm-text)] sm:text-2xl">خطواتك التالية</h3>
            <p className="mt-1 text-[0.9375rem] leading-7 text-[var(--qm-text-2)]">
              بناءً على الثغرات المرصودة في إجاباتك، هذه الخطوات مرتبة حسب الأولوية.
            </p>

            <ol className="mt-5 divide-y divide-[var(--qm-border)] border-y border-[var(--qm-border)]">
              {result.actionPlan.map((act, idx) => {
                const tag = priorityTag(act.priority);
                return (
                  <li key={idx} className="qm-avoid-break flex gap-4 py-5 sm:gap-5">
                    <span
                      aria-hidden="true"
                      className="w-8 shrink-0 pt-0.5 text-lg font-bold tabular-nums text-[var(--qm-orange-text)]"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <h4 className="text-base font-bold leading-7 text-[var(--qm-text)] sm:text-lg">{act.title}</h4>
                        <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-semibold", tag.cls)}>
                          {tag.text}
                        </span>
                      </div>
                      <p className="mt-1 text-[0.9375rem] leading-7 text-[var(--qm-text-2)]">{act.description}</p>
                      {act.linkUrl && (
                        <a
                          href={act.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cx(
                            "mt-2 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-[var(--qm-orange-text)] underline underline-offset-4",
                            focusRing
                          )}
                        >
                          <span>{act.linkText}</span>
                          <Icon name="external" className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Pillar breakdown */}
          <div className="qm-avoid-break rounded-[24px] border border-[var(--qm-border)] bg-[var(--qm-surface)] p-6 sm:p-8">
            <h3 className="text-xl font-bold leading-9 text-[var(--qm-text)] sm:text-2xl">تفصيل الدرجة عبر المحاور الخمسة</h3>
            <p className="mt-1 text-[0.9375rem] leading-7 text-[var(--qm-text-2)]">
              تقييم موضوعي مبني على 5 محاور تقنية وتشغيلية أساسية (من 0 إلى 100%).
            </p>

            <ul className="mt-5 divide-y divide-[var(--qm-border)] border-y border-[var(--qm-border)]">
              {pillarRows.map((p) => {
                const tag = pillarTag(p.pct);
                return (
                  <li key={p.key} className="py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="text-[0.9375rem] font-bold leading-7 text-[var(--qm-text)]">{p.label}</span>
                      <span className="flex items-center gap-2 text-sm text-[var(--qm-text-2)]">
                        <span className="tabular-nums" dir="ltr">
                          {p.score} / {p.weight}
                        </span>
                        <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-semibold", tag.cls)}>{tag.text}</span>
                      </span>
                    </div>
                    <Progress value={p.pct} label={p.label} className="mt-2.5" />
                    <p className="mt-2 text-sm leading-6 text-[var(--qm-text-3)]">{p.desc}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Official source + disclaimer */}
          <div className="rounded-2xl border border-[var(--qm-border)] bg-[var(--qm-ivory)] p-5 text-sm leading-7 text-[var(--qm-text-2)] sm:p-6">
            <p className="mb-1 font-bold text-[var(--qm-text)]">إخلاء مسؤولية تنظيمي وقانوني</p>
            <p>
              هذه الأداة إرشادية وتساعد على تقييم الجدول الزمني والجاهزية التشغيلية بناءً على المعلومات التي تدخلها والمتطلبات الرسمية المتاحة وقت آخر مراجعة (أكتوبر 2026). لا تمثل استشارة ضريبية أو قانونية، ولا تؤكد الامتثال الرسمي. يُرجى الرجوع إلى وزارة المالية والهيئة الاتحادية للضرائب ومزود خدمة معتمد (<Ltr>ASP</Ltr>) عند اتخاذ القرارات الملزمة.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}