"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  WAVES,
  ZATCA_PORTAL_URL,
  ZATCA_FATOORA_URL,
  WAVE_DATA_LAST_VERIFIED,
  WAVE_DATA_SOURCE,
  WAVE25_START_ISO,
  parseRevenue,
  formatThousands,
  checkEligibility,
} from "@/lib/zatcaWaveConfig";

/* ─────────────────────────────────────────────────────────────────────────────
   THEME — self-contained CSS variables.
   Why: Tailwind `dark:` follows the OS (media query) while the site background
   follows the site's own theme. When they disagree you get white-on-white text.
   This component therefore does NOT use `dark:` at all. Every colour comes from
   one variable set, so a surface and its text can never come from different themes.

   theme="light" (default) → always light, matches a light site
   theme="dark"            → always dark
   theme="auto"            → follows the OS (only use if the whole page does too)
───────────────────────────────────────────────────────────────────────────── */
const LIGHT = {
  "--zc-panel": "#FBF7F0",
  "--zc-card-a": "#FFFFFF",
  "--zc-card-b": "#F6F2EB",
  "--zc-surface": "#F5F1EA",
  "--zc-surface-2": "#EDE7DC",
  "--zc-field": "#FFFFFF",
  "--zc-field-bd": "#C9C2B6",
  "--zc-text": "#16130F",
  "--zc-muted": "#55554F",
  "--zc-faint": "#7A7A72",
  "--zc-line": "rgba(22,19,15,0.14)",
  "--zc-link": "#B23F00",
  "--zc-tint-bg": "rgba(255,91,4,0.12)",
  "--zc-tint-tx": "#9A3400",
  "--zc-hit-a": "#FFF1E3",
  "--zc-hit-b": "#FFF8EC",
  "--zc-overlay": "rgba(255,255,255,0.75)",
  "--zc-warn-bg": "#FFF6DC",
  "--zc-warn-bd": "#EBD08A",
  "--zc-warn-tx": "#5C4200",
  "--zc-info-bg": "#EAF1FD",
  "--zc-info-bd": "#B4CBF2",
  "--zc-info-tx": "#1E3A6E",
  "--zc-ok-bg": "#E7F6EE",
  "--zc-ok-bd": "#9FD6B8",
  "--zc-ok-tx": "#14543A",
  "--zc-err": "#B42318",
  "--zc-shadow": "0 14px 30px rgba(60,30,10,0.10)",
};

const DARK = {
  "--zc-panel": "#15120E",
  "--zc-card-a": "#241E17",
  "--zc-card-b": "#1C1711",
  "--zc-surface": "#211C16",
  "--zc-surface-2": "#2E271E",
  "--zc-field": "#0F0C09",
  "--zc-field-bd": "#4A4136",
  "--zc-text": "#F5F2EC",
  "--zc-muted": "#C4BDB2",
  "--zc-faint": "#948C80",
  "--zc-line": "rgba(255,255,255,0.14)",
  "--zc-link": "#FFB68A",
  "--zc-tint-bg": "rgba(255,91,4,0.22)",
  "--zc-tint-tx": "#FFB68A",
  "--zc-hit-a": "#3A2210",
  "--zc-hit-b": "#2B1B0D",
  "--zc-overlay": "rgba(0,0,0,0.28)",
  "--zc-warn-bg": "#3A2C0E",
  "--zc-warn-bd": "#7A5C16",
  "--zc-warn-tx": "#F5DDA0",
  "--zc-info-bg": "#14233D",
  "--zc-info-bd": "#2E4F8A",
  "--zc-info-tx": "#C3D7FA",
  "--zc-ok-bg": "#10301F",
  "--zc-ok-bd": "#1F6B43",
  "--zc-ok-tx": "#B8EACD",
  "--zc-err": "#FDA29B",
  "--zc-shadow": "0 14px 30px rgba(0,0,0,0.4)",
};

const vars = (o) => Object.entries(o).map(([k, v]) => `${k}:${v};`).join("");

const CSS = `
.zc-root{${vars(LIGHT)}background:var(--zc-panel);color:var(--zc-text);color-scheme:light;border:1px solid var(--zc-line);}
.zc-root[data-zc-theme="dark"]{${vars(DARK)}color-scheme:dark;}
@media (prefers-color-scheme: dark){.zc-root[data-zc-theme="auto"]{${vars(DARK)}color-scheme:dark;}}
.zc-root :where(h1,h2,h3,p,li,td,th,label,legend,strong,span,div,caption,small){color:inherit;}
.zc-root .zc-text{color:var(--zc-text);}
.zc-root .zc-muted{color:var(--zc-muted);}
.zc-root .zc-faint{color:var(--zc-faint);}
.zc-root .zc-err{color:var(--zc-err);}
.zc-root a.zc-link{color:var(--zc-link);font-weight:700;text-decoration:underline;text-underline-offset:3px;}
.zc-root .zc-focus:focus-visible{outline:2px solid #FF5B04;outline-offset:2px;}
.zc-root .zc-card{background:linear-gradient(to bottom,var(--zc-card-a),var(--zc-card-b));border:1px solid var(--zc-line);box-shadow:var(--zc-shadow);}
.zc-root .zc-surface{background:var(--zc-surface);border:1px solid var(--zc-line);}
.zc-root .zc-bordered{border:1px solid var(--zc-line);}
.zc-root .zc-head{background:var(--zc-surface-2);}
.zc-root .zc-line-t{border-top:1px solid var(--zc-line);}
.zc-root .zc-pill-idle{background:var(--zc-card-a);color:var(--zc-text);border:1px solid var(--zc-field-bd);}
.zc-root .zc-pill-idle:hover{border-color:#FF5B04;}
.zc-root .zc-pill-active{background:#C2410C;color:#fff;border:1px solid #C2410C;}
.zc-root .zc-field{background:var(--zc-field);color:var(--zc-text);border:1px solid var(--zc-field-bd);outline:none;}
.zc-root .zc-field::placeholder{color:var(--zc-faint);font-weight:400;}
.zc-root .zc-field:focus{border-color:#FF5B04;box-shadow:0 0 0 3px rgba(255,91,4,0.25);}
.zc-root .zc-field[aria-invalid="true"]{border-color:var(--zc-err);}
.zc-root .zc-warn{background:var(--zc-warn-bg);border:1px solid var(--zc-warn-bd);color:var(--zc-warn-tx);}
.zc-root .zc-info{background:var(--zc-info-bg);border:1px solid var(--zc-info-bd);color:var(--zc-info-tx);}
.zc-root .zc-ok{background:var(--zc-ok-bg);border:1px solid var(--zc-ok-bd);color:var(--zc-ok-tx);}
.zc-root .zc-hit{background:linear-gradient(to bottom,var(--zc-hit-a),var(--zc-hit-b));border:2px solid #C2410C;}
.zc-root .zc-overlay{background:var(--zc-overlay);}
.zc-root .zc-tint{background:var(--zc-tint-bg);color:var(--zc-tint-tx);}
.zc-root .zc-solid{background:#C2410C;color:#fff;}
.zc-root .zc-dot-off{background:var(--zc-surface-2);color:var(--zc-muted);}
.zc-root .zc-row-hit{background:var(--zc-card-a);border:1px solid rgba(194,65,12,0.6);}
.zc-root .zc-row-off{background:var(--zc-surface);border:1px solid var(--zc-line);}
.zc-root .zc-cell-over{background:var(--zc-tint-bg);color:var(--zc-tint-tx);}
.zc-root .zc-cell-equal{background:var(--zc-warn-bg);color:var(--zc-warn-tx);}
.zc-root .zc-cell-under{color:var(--zc-muted);}
.zc-root .zc-cell-na{color:var(--zc-faint);}
.zc-root table{border-collapse:collapse;width:100%;}
`;

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
   Wave dates and thresholds come from lib/zatcaWaveConfig.js (single source).
───────────────────────────────────────────────────────────────────────────── */
const YEARS = [2022, 2023, 2024, 2025];
const SITE_URL = "qemlo.com/ar/sa/zatca-wave-checker";

const EXAMPLE_RAW = { 2022: "", 2023: "420,000", 2024: "150,000", 2025: "90,000" };
const EMPTY_RAW = { 2022: "", 2023: "", 2024: "", 2025: "" };

/* ─────────────────────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────────────────────── */
const ICONS = {
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  x: (
    <>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </>
  ),
  minus: <path d="M6 12h12" />,
  equal: (
    <>
      <path d="M6 9h12" />
      <path d="M6 15h12" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h8" />
    </>
  ),
  reset: <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />,
  alert: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  wave: <path d="M2 12c0-4 2-6 4-6s4 4 4 4 2 4 4 4 4-6 4-6" />,
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </>
  ),
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />,
};

function Icon({ name, size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
}

const pillBase =
  "zc-focus inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-bold no-underline transition motion-reduce:transition-none";

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const toNums = (arr) => (arr || []).map(Number);
const isPastWave = (wave) => Number(wave.number) <= 24;

function cellState(wr, year, value) {
  if (!toNums(wr.wave.qualifyYears).includes(year)) return "na";
  if (value === null) return "empty";
  if (toNums(wr.triggerYears).includes(year)) return "over";
  if (toNums(wr.equalYears).includes(year)) return "equal";
  return "under";
}

const CELL_UI = {
  over: { label: "تجاوز", icon: "check", cls: "zc-cell-over" },
  equal: { label: "مساوٍ", icon: "equal", cls: "zc-cell-equal" },
  under: { label: "أقل", icon: "x", cls: "zc-cell-under" },
  na: { label: "خارج السنوات", icon: null, cls: "zc-cell-na" },
  empty: { label: "—", icon: null, cls: "zc-cell-na" },
};

/* ─────────────────────────────────────────────────────────────────────────────
   REVENUE FIELD (controlled)
───────────────────────────────────────────────────────────────────────────── */
function RevenueField({ year, value, error, onChange, onBlur }) {
  const id = `revenue-${year}`;
  const errId = `${id}-error`;
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={id} className="zc-text block text-sm font-bold">
        إيرادات خاضعة للضريبة {year}م
        <span className="zc-muted ms-2 text-xs font-normal">(يناير – ديسمبر)</span>
      </label>
      <div dir="ltr" className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(year, e.target.value)}
          onBlur={() => onBlur(year)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errId : undefined}
          className="zc-field w-full rounded-xl py-3 pl-4 pr-14 text-left text-base font-bold tabular-nums"
        />
        <span
          aria-hidden="true"
          className="zc-faint pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-semibold"
        >
          ريال
        </span>
      </div>
      {error && (
        <p id={errId} role="alert" className="zc-err text-xs font-semibold">
          أدخل رقماً صحيحاً (مثال: 250,000 أو ٢٥٠٠٠٠).
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LEDGER — years × waves
───────────────────────────────────────────────────────────────────────────── */
function Ledger({ waveResults, revenues }) {
  return (
    <div className="zc-bordered overflow-x-auto rounded-2xl">
      <table className="min-w-[400px] text-sm">
        <caption className="sr-only">
          مقارنة إيرادات كل سنة مع حد كل موجة من موجات الفوترة الإلكترونية
        </caption>
        <thead>
          <tr className="zc-head">
            <th scope="col" className="zc-muted px-3 py-3 text-start text-xs font-bold">
              السنة والإيرادات
            </th>
            {waveResults.map((wr) => (
              <th key={wr.wave.id} scope="col" className="zc-text px-2 py-3 text-center text-xs font-bold">
                الموجة {wr.wave.number}
                <span className="zc-muted mt-0.5 block font-normal tabular-nums">
                  أكثر من {wr.wave.thresholdFormatted}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {YEARS.map((year) => {
            const v = revenues[year];
            return (
              <tr key={year} className="zc-line-t">
                <th scope="row" className="px-3 py-3 text-start font-bold">
                  <span className="zc-text">{year}</span>
                  <span className="zc-muted block text-xs font-normal tabular-nums">
                    {v === null ? "غير مُدخلة" : `${formatThousands(v)} ريال`}
                  </span>
                </th>
                {waveResults.map((wr) => {
                  const ui = CELL_UI[cellState(wr, year, v)];
                  return (
                    <td key={wr.wave.id} className="px-1.5 py-2 text-center">
                      <span
                        className={`inline-flex min-h-[2rem] items-center justify-center gap-1 rounded-lg px-2 text-xs font-bold ${ui.cls}`}
                      >
                        {ui.icon && <Icon name={ui.icon} size={13} />}
                        {ui.label}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   WAVE STATUS ROW
───────────────────────────────────────────────────────────────────────────── */
function WaveRow({ wr, isFirst, daysLeft }) {
  const { wave, eligible, triggerYears } = wr;
  const showCountdown = eligible && Number(wave.number) === 25 && daysLeft !== null && daysLeft > 0;
  return (
    <li className={`rounded-2xl p-4 ${eligible ? "zc-row-hit" : "zc-row-off"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${eligible ? "zc-solid" : "zc-dot-off"
              }`}
          >
            <Icon name={eligible ? "check" : "minus"} size={14} />
          </span>
          <div>
            <p className="zc-text text-sm font-bold">
              الموجة {wave.number} — {wave.nameAr}
            </p>
            <p className="zc-muted text-xs">
              {eligible
                ? `مشمولة بسبب: ${toNums(triggerYears).join(" و ")}`
                : "لم تتجاوز الحد في السنوات المُدخلة"}
            </p>
          </div>
        </div>
        {isFirst && eligible && (
          <span className="zc-solid shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold">
            الأولى بالنسبة لك
          </span>
        )}
      </div>
      {eligible && (
        <p className="zc-muted mt-3 text-xs">
          {wave.mandateLabel}:{" "}
          <strong className="zc-text tabular-nums">{wave.mandateDateAr}</strong>
          {showCountdown && (
            <span className="zc-tint ms-2 rounded-full px-2 py-0.5 font-bold">بعد {daysLeft} يوماً</span>
          )}
        </p>
      )}
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   Props:
     theme               "light" | "dark" | "auto"   (default "light")
     showReferenceTable  true | false                 (default true; set false if
                         the page already renders its own waves table)
───────────────────────────────────────────────────────────────────────────── */
export default function ZatcaWaveChecker({ theme = "light", showReferenceTable = true }) {
  const [isVatRegistered, setIsVatRegistered] = useState(null);
  const [raw, setRaw] = useState(EMPTY_RAW);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [daysLeft, setDaysLeft] = useState(null);

  useEffect(() => {
    const deadlineMs = Date.parse(WAVE25_START_ISO);
    if (Number.isFinite(deadlineMs)) {
      setDaysLeft(Math.ceil((deadlineMs - Date.now()) / 86400000));
    }
  }, []);

  const handleVat = useCallback((val) => setIsVatRegistered(val), []);
  const handleChange = useCallback((year, str) => setRaw((p) => ({ ...p, [year]: str })), []);
  const handleBlur = useCallback((year) => {
    setRaw((p) => {
      const parsed = parseRevenue(p[year]);
      return parsed === null ? p : { ...p, [year]: formatThousands(parsed) };
    });
  }, []);
  const handleReset = useCallback(() => {
    setIsVatRegistered(null);
    setRaw(EMPTY_RAW);
    setCopied(false);
    setCopyFailed(false);
  }, []);
  const handleExample = useCallback(() => {
    setIsVatRegistered(true);
    setRaw(EXAMPLE_RAW);
  }, []);

  const revenues = useMemo(() => {
    const out = {};
    YEARS.forEach((y) => {
      out[y] = String(raw[y]).trim() === "" ? null : parseRevenue(raw[y]);
    });
    return out;
  }, [raw]);

  const invalid = useMemo(() => {
    const out = {};
    YEARS.forEach((y) => {
      out[y] = String(raw[y]).trim() !== "" && revenues[y] === null;
    });
    return out;
  }, [raw, revenues]);

  const anyTyped = YEARS.some((y) => String(raw[y]).trim() !== "");
  const missingYears = YEARS.filter((y) => revenues[y] === null);

  const result = useMemo(() => checkEligibility(revenues, isVatRegistered), [revenues, isVatRegistered]);

  const showResults = isVatRegistered === false || (isVatRegistered === true && anyTyped);
  const hasEqual =
    Array.isArray(result.waveResults) &&
    result.waveResults.some((wr) => (wr.equalYears || []).length > 0);

  const shareText = useMemo(() => {
    if (!showResults) return "";
    const tail = `\nنتيجة استرشادية، والإشعار الرسمي من زاتكا هو المرجع.\n${SITE_URL}`;
    if (result.status === "not_registered") {
      return `نتيجة حاسبة موجات زاتكا:\nمنشأتي غير مسجلة في ضريبة القيمة المضافة، وبالتالي لا تنطبق عليها متطلبات الربط والتكامل حسب ما أدخلته.${tail}`;
    }
    if (result.status === "below_all") {
      return `نتيجة حاسبة موجات زاتكا:\nلم تتجاوز إيراداتي المُدخلة حدود الموجات 23 و24 و25.${tail}`;
    }
    if (result.status === "eligible") {
      const w = result.earliestWave;
      return (
        `نتيجة حاسبة موجات زاتكا:\n` +
        `منشأتي ضمن ${w.nameAr} (الموجة ${w.number}).\n` +
        `${w.mandateLabel}: ${w.mandateDateAr}\n` +
        `السنة المُحدِّدة: ${toNums(result.earliestWaveTriggerYears).join(" و ")}` +
        tail
      );
    }
    return "";
  }, [result, showResults]);

  const handleCopy = useCallback(async () => {
    if (!shareText) return;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  }, [shareText]);

  const whatsappHref = shareText ? `https://wa.me/?text=${encodeURIComponent(shareText)}` : "#";

  const earliest = result.status === "eligible" ? result.earliestWave : null;
  const earliestIsPast = earliest ? isPastWave(earliest) : false;
  const earliestIs25 = earliest ? Number(earliest.number) === 25 : false;

  return (
    <section
      dir="rtl"
      data-zc-theme={theme}
      aria-labelledby="zatca-checker-title"
      className="zc-root mx-auto my-6 w-full max-w-2xl rounded-[28px] p-3 sm:my-8 sm:rounded-[32px] sm:p-6"
    >
      <style>{CSS}</style>

      {/* Header */}
      <header className="mb-5 px-1 pt-2 text-center sm:mb-6">
        <p className="zc-surface zc-muted mb-3 inline-flex min-h-[32px] items-center gap-2 rounded-full px-4 text-xs font-bold">
          <Icon name="wave" size={16} />
          <span>حاسبة موجات (مجموعات) الفوترة الإلكترونية — زاتكا</span>
        </p>

        <h1 id="zatca-checker-title" className="zc-text mb-3 text-2xl font-bold leading-snug tracking-tight sm:text-4xl">
          في أي موجة من الفوترة الإلكترونية أنت؟
          <br />
          تحقق من موجتك مع زاتكا
        </h1>

        <p className="zc-muted mx-auto max-w-xl text-sm leading-relaxed sm:text-base">
          أدخل إيراداتك الخاضعة لضريبة القيمة المضافة لكل سنة، وسنقارنها بحدود الموجات 23 و24 و25
          ونُبيّن السنة التي أدخلتك في كل موجة.
        </p>
      </header>

      <div className="zc-card rounded-3xl p-4 sm:p-6">
        {/* STEP 1 */}
        <fieldset className="mb-5">
          <legend className="zc-text mb-3 text-sm font-bold">
            الخطوة 1: هل منشأتك مسجلة في ضريبة القيمة المضافة؟
          </legend>
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
            {[
              { val: true, label: "نعم، مسجلة" },
              { val: false, label: "لا، غير مسجلة" },
            ].map(({ val, label }) => (
              <button
                key={String(val)}
                type="button"
                aria-pressed={isVatRegistered === val}
                onClick={() => handleVat(val)}
                className={`${pillBase} ${isVatRegistered === val ? "zc-pill-active" : "zc-pill-idle"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="zc-muted mt-2 text-xs">يشمل التسجيل الإلزامي والاختياري.</p>
        </fieldset>

        {/* STEP 2 */}
        {isVatRegistered === true && (
          <fieldset>
            <legend className="zc-text mb-3 text-sm font-bold">
              الخطوة 2: أدخل إيراداتك الخاضعة للضريبة بالريال السعودي
            </legend>

            <div className="zc-warn mb-4 flex items-start gap-2 rounded-xl p-3">
              <Icon name="info" size={16} className="mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed">
                <strong>المقصود بالإيرادات:</strong> الإيرادات الخاضعة لضريبة القيمة المضافة كما وردت
                في إقراراتك الضريبية، وليست صافي الربح. إن لم تكن متأكداً من الرقم فراجع إقرارك
                الضريبي أو محاسبك.
              </p>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
              {YEARS.map((year) => (
                <RevenueField
                  key={year}
                  year={year}
                  value={raw[year]}
                  error={invalid[year]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="zc-muted text-xs leading-relaxed">
                أدخل الإيرادات الخاضعة لضريبة القيمة المضافة كما وردت في إقراراتك، لا صافي الربح أو
                المبيعات المعفاة. اترك السنة فارغة إن لم تتوفر بياناتها؛ تُحسب النتيجة على السنوات المُدخلة فقط.
                يكفي إدخال سنة واحدة.
              </p>
              {!anyTyped && (
                <button
                  type="button"
                  onClick={handleExample}
                  className="zc-focus zc-link inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-2 text-xs"
                >
                  <Icon name="spark" size={14} />
                  جرّب مثالاً: تجاوز ثم انخفضت الإيرادات
                </button>
              )}
            </div>
          </fieldset>
        )}

        {/* RESULTS */}
        <div role="region" aria-live="polite" aria-label="نتيجة الحاسبة">
          {showResults && (
            <div className="mt-5 space-y-4">
              {result.status === "not_registered" && (
                <div className="zc-info rounded-2xl p-4">
                  <p className="mb-1.5 font-bold">تحقق من وضع التسجيل قبل استبعاد منشأتك</p>
                  <p className="text-sm leading-relaxed">
                    بناءً على إجابتك، لا يمكن لهذه الحاسبة تأكيد موجة الربط لمنشأة غير مسجلة حالياً. لا تعتبر
                    هذه النتيجة إعفاءً من التسجيل أو الفوترة الإلكترونية؛ فقد يلزم المقيم التسجيل عند تجاوز
                    التوريدات الخاضعة للضريبة حد 375,000 ريال خلال 12 شهراً أو توقع تجاوزه، كما توجد قواعد
                    خاصة لغير المقيمين الملزمين بسداد الضريبة. تحقق من وضع منشأتك لدى زاتكا قبل استبعادها من النطاق. راجع{" "}
                    <a href={ZATCA_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="zc-link">
                      بوابة زاتكا
                    </a>
                    .
                  </p>
                </div>
              )}

              {result.status === "not_answered" && (
                <div className="zc-surface flex items-start gap-2 rounded-2xl p-4">
                  <Icon name="info" size={18} className="zc-muted mt-0.5 shrink-0" />
                  <p className="zc-muted text-sm leading-relaxed">
                    لم نستطع قراءة رقم صحيح بعد. أدخل إيرادات سنة واحدة على الأقل بالأرقام العربية أو
                    الإنجليزية.
                  </p>
                </div>
              )}

              {(result.status === "eligible" || result.status === "below_all") && (
                <div className={`rounded-2xl p-4 sm:p-5 ${result.status === "eligible" ? "zc-hit" : "zc-ok"}`}>
                  {result.status === "eligible" ? (
                    <>
                      <p className="zc-text text-xl font-bold leading-snug">
                        نعم، منشأتك ضمن {earliest.nameAr} (الموجة {earliest.number})
                      </p>
                      <p className="zc-muted mt-2 text-sm leading-relaxed">
                        تجاوزت إيراداتك الخاضعة للضريبة{" "}
                        <strong className="zc-text">{earliest.thresholdFormatted} ريال</strong> في{" "}
                        <strong className="zc-text">
                          {toNums(result.earliestWaveTriggerYears).join(" و ")}
                        </strong>
                        ، ويكفي ذلك للاندراج حتى لو انخفضت إيراداتك بعدها.
                      </p>
                      <p className="zc-text mt-3 text-sm">
                        {earliest.mandateLabel}: <strong className="tabular-nums">{earliest.mandateDateAr}</strong>
                        {earliestIs25 && daysLeft !== null && daysLeft > 0 && (
                          <span className="zc-tint ms-2 rounded-full px-2 py-0.5 text-xs font-bold">
                            بعد {daysLeft} يوماً
                          </span>
                        )}
                      </p>
                      {earliestIsPast && (
                        <p className="zc-overlay zc-text mt-3 flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed">
                          <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
                          موعد هذه الموجة بدأ بالفعل. إن لم تُنجز الربط بعد فراجع حسابك في بوابة فاتورة
                          وإشعارات الهيئة في أقرب وقت.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold leading-snug">لم تتجاوز الحد في السنوات التي أدخلتها</p>
                      <p className="mt-2 text-sm leading-relaxed">
                        إيراداتك المُدخلة ليست أعلى من حدود الموجات 23 و24 و25 المُعلنة. تابع إعلانات
                        الموجات القادمة، فقد تأتي موجات بحدود أقل.
                      </p>
                      {missingYears.length > 0 && (
                        <p className="zc-overlay mt-3 rounded-xl p-3 text-xs leading-relaxed">
                          لم تُدخل: {missingYears.join("، ")}. هذه النتيجة لا تشمل تلك السنوات، فإن تجاوزت
                          الحد في إحداها فقد تتغير.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {(result.status === "eligible" || result.status === "below_all") && (
                <>
                  <div>
                    <h2 className="zc-text mb-2 text-sm font-bold">كيف حُسبت النتيجة؟</h2>
                    <Ledger waveResults={result.waveResults} revenues={revenues} />
                    <p className="zc-muted mt-2 text-xs leading-relaxed">
                      القاعدة: تُقارن كل سنة على حدة بحد كل موجة، ويكفي تجاوز الحد في سنة واحدة من
                      سنواتها. الشرط «أكثر من» وليس «يساوي أو أكثر».
                    </p>
                  </div>

                  {hasEqual && (
                    <div className="zc-warn flex items-start gap-2 rounded-xl p-3">
                      <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
                      <p className="text-xs leading-relaxed">
                        إيراداتك مساوية تماماً لأحد الحدود. صياغة زاتكا تقول إن الإيرادات «تجاوزت» الحد،
                        فالمساواة وحدها لا تحقق هذا الشرط بحسب الصياغة المنشورة. النتيجة استرشادية
                        والإشعار الرسمي من الهيئة هو المرجع.
                      </p>
                    </div>
                  )}

                  <ul className="space-y-2.5" aria-label="حالة كل موجة">
                    {result.waveResults.map((wr) => (
                      <WaveRow
                        key={wr.wave.id}
                        wr={wr}
                        isFirst={earliest ? wr.wave.id === earliest.id : false}
                        daysLeft={daysLeft}
                      />
                    ))}
                  </ul>
                </>
              )}

              {result.status === "eligible" && (
                <div className="zc-surface rounded-2xl p-4">
                  <h2 className="zc-text mb-2 text-sm font-bold">ماذا تفعل الآن؟</h2>
                  <ol className="zc-muted list-decimal space-y-1.5 ps-5 text-sm leading-relaxed">
                    <li>راجع البريد المسجل لمنشأتك لدى الهيئة بحثاً عن إشعار رسمي بالموجة.</li>
                    <li>تأكد أن نظام الفواتير أو المحاسبة لديك يدعم الربط والتكامل مع منصة فاتورة.</li>
                    <li>
                      اطلع على متطلبات الربط في{" "}
                      <a href={ZATCA_FATOORA_URL} target="_blank" rel="noopener noreferrer" className="zc-link">
                        بوابة فاتورة
                      </a>
                      .
                    </li>
                  </ol>
                </div>
              )}

              {(result.status === "eligible" ||
                result.status === "below_all" ||
                result.status === "not_registered") && (
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`${pillBase} ${copied ? "zc-pill-active" : "zc-pill-idle"}`}
                    >
                      <Icon name={copied ? "check" : "copy"} size={16} />
                      {copied ? "تم النسخ" : "نسخ النتيجة"}
                    </button>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${pillBase} zc-pill-idle`}
                    >
                      <Icon name="share" size={16} />
                      إرسال عبر واتساب
                    </a>
                    <button type="button" onClick={handleReset} className={`${pillBase} zc-pill-idle`}>
                      <Icon name="reset" size={16} />
                      إعادة تعيين
                    </button>
                    {copyFailed && (
                      <span role="alert" className="zc-err text-xs font-semibold">
                        تعذّر النسخ تلقائياً، حدّد النص وانسخه يدوياً.
                      </span>
                    )}
                  </div>
                )}

              <div className="zc-surface flex items-start gap-2 rounded-xl p-3.5">
                <Icon name="alert" size={16} className="zc-muted mt-0.5 shrink-0" />
                <div className="zc-muted space-y-1 text-[11px] leading-relaxed">
                  <p>
                    <strong className="zc-text">تنبيه:</strong> النتيجة استرشادية فقط، والإشعار الرسمي من
                    هيئة الزكاة والضريبة والجمارك هو المعتمد لتحديد الموجة الفعلية. تُحسب الأرقام داخل
                    متصفحك ولا تُخزَّن ولا تُرسَل إلى أي خادم.
                  </p>
                  <p>
                    آخر مراجعة للبيانات: {WAVE_DATA_LAST_VERIFIED} |{" "}
                    <a href={ZATCA_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="zc-link">
                      {WAVE_DATA_SOURCE}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {!showResults && (isVatRegistered !== null || anyTyped) && (
          <div className="mt-4">
            <button type="button" onClick={handleReset} className={`${pillBase} zc-pill-idle`}>
              <Icon name="reset" size={16} />
              إعادة تعيين
            </button>
          </div>
        )}
      </div>

      {/* STATIC REFERENCE TABLE (server-rendered text for search and AI answers) */}
      {showReferenceTable && (
        <section aria-labelledby="waves-ref-title" className="mt-6 px-1">
          <h2 id="waves-ref-title" className="zc-text mb-3 text-lg font-bold">
            جدول موجات الفوترة الإلكترونية (المرحلة الثانية)
          </h2>
          <div className="zc-bordered overflow-x-auto rounded-2xl">
            <table className="min-w-[460px] text-sm">
              <caption className="sr-only">حدود الإيرادات والسنوات المعتمدة ومواعيد الربط لكل موجة</caption>
              <thead>
                <tr className="zc-head">
                  <th scope="col" className="zc-muted px-3 py-3 text-start text-xs font-bold">الموجة</th>
                  <th scope="col" className="zc-muted px-3 py-3 text-start text-xs font-bold">حد الإيرادات</th>
                  <th scope="col" className="zc-muted px-3 py-3 text-start text-xs font-bold">السنوات المعتمدة</th>
                  <th scope="col" className="zc-muted px-3 py-3 text-start text-xs font-bold">الربط</th>
                </tr>
              </thead>
              <tbody>
                {WAVES.map((w) => (
                  <tr key={w.id} className="zc-line-t">
                    <th scope="row" className="zc-text px-3 py-3 text-start font-bold">
                      {w.nameAr}
                      <span className="zc-muted block text-xs font-normal">الموجة {w.number}</span>
                    </th>
                    <td className="px-3 py-3 tabular-nums">أكثر من {w.thresholdFormatted} ريال</td>
                    <td className="px-3 py-3 tabular-nums">{toNums(w.qualifyYears).join("، ")}</td>
                    <td className="px-3 py-3 text-xs leading-relaxed">
                      {w.mandateLabel} <strong className="tabular-nums">{w.mandateDateAr}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="zc-muted mt-2 text-xs leading-relaxed">
            المصدر: {WAVE_DATA_SOURCE}، آخر مراجعة {WAVE_DATA_LAST_VERIFIED}.
          </p>
        </section>
      )}
    </section>
  );
}