"use client";

/**
 * components/FinalSettlementCalculator.jsx  (Saudi Arabia)
 * Qemlo style: glossy orange tiles, 26px cards, 16px controls, mobile sticky
 * result bar. The calculation (useMemo `calc`), helpers, REASONS, the notice
 * and termination handlers and the printable document structure are UNCHANGED.
 * Changes: CSS only + (1) default demo values match the example on the page
 * so the server-rendered result is meaningful, (2) Arabic hamza typos fixed,
 * (3) notice-period text reflects the 2025 amendments to Art. 75,
 * (4) Escape closes the document, (5) rel=noopener on WhatsApp share,
 * (6) mobile sticky result bar.
 */

import React, { useState, useMemo, useEffect, useRef, useId } from "react";
import { SITE_URL } from "../lib/siteConfig";
import { calculateFinalSettlement } from "../lib/finalSettlementCalc";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDuration(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = Math.floor(totalMonths % 12);
  const days = Math.round(((totalMonths % 12) - months) * 30);
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "سنة" : "سنوات"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "شهر" : "أشهر"}`);
  if (days > 0 && years === 0) parts.push(`${days} يوماً`);
  return parts.length ? parts.join(" و") : "أقل من شهر";
}

const REASONS = [
  { id: "terminate", label: "فسخ من صاحب العمل" },
  { id: "resign", label: "استقالة الموظف" },
  { id: "retire", label: "تقاعد / بلوغ السن" },
  { id: "mutual", label: "إنهاء بالتراضي" },
  { id: "fixed_expired", label: "انتهاء عقد محدد" },
  { id: "female_special", label: "استثناء المرأة (م/87)" },
];

// ─── Styles (Qemlo: tokens --c-* with fallbacks) ───────────────────────────────
const CSS = `
.fs{--bg:var(--c-bg,#F5F5F2);--ink:var(--c-ink,#0D0D0D);--ac:var(--c-accent,#FF6A1A);--sf:var(--c-surface,#FFFFFF);--mu:var(--c-muted,#55554F);--ln:var(--c-line,#D9D9D3);--er:var(--error,#B42318);--g:linear-gradient(160deg,#FF9B63 0%,#FF6A1A 55%,#EE5A0B 100%);color:var(--ink);font-size:15px;line-height:1.7;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .fs{--bg:var(--c-bg,#0D0D0D);--ink:var(--c-ink,#F5F5F2);--sf:var(--c-surface,#181816);--mu:var(--c-muted,#B4B4AD);--ln:var(--c-line,#34342F);--er:var(--error,#FF8A80);color-scheme:dark}}
:root[data-theme="dark"] .fs{--bg:var(--c-bg,#0D0D0D);--ink:var(--c-ink,#F5F5F2);--sf:var(--c-surface,#181816);--mu:var(--c-muted,#B4B4AD);--ln:var(--c-line,#34342F);--er:var(--error,#FF8A80);color-scheme:dark}
.fs *,.fs *::before,.fs *::after{box-sizing:border-box}
.fs h1,.fs h2,.fs h3{margin:0;line-height:1.3}
.fs-stack{display:flex;flex-direction:column;gap:1rem}
/* Desktop: form on one side, live result pinned beside it */
@media(min-width:960px){
  .fs-stack{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,380px);align-items:start}
  .fs-stack>.fs-intro{grid-column:1/-1}
  .fs-stack>.fs-card:not(.fs-intro){grid-column:1}
  .fs-stack>.fs-res{grid-column:2;grid-row:2/span 6;position:sticky;top:5rem;max-height:calc(100vh - 6rem);overflow-y:auto;overscroll-behavior:contain}
  .fs-stack>.fs-res .fs-hero .big{font-size:clamp(1.8rem,3vw,2.4rem)}
  .fs-stack>.fs-res .fs-hero{padding:1.2rem 1.25rem}
  .fs-stack>.fs-res .fs-bd{padding:.6rem 1.25rem .9rem}
  .fs-stack>.fs-res .fs-line{padding-block:.55rem}
  .fs-stack>.fs-res .fs-line .s{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .fs-stack>.fs-res .fs-line.net{display:none}
  .fs-stack>.fs-res .fs-acts{padding:.9rem 1.25rem}
}

/* Cards */
.fs-card{background:var(--sf);border:1px solid var(--ln);border-radius:26px;padding:1.1rem;display:flex;flex-direction:column;gap:1.1rem;min-width:0}
@media(min-width:640px){.fs-card{padding:1.5rem}}
.fs-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:.75rem}
.fs-top h1{font-size:clamp(1.35rem,4.6vw,1.9rem);font-weight:800}
.fs-top p{margin:.4rem 0 0;font-size:.92rem;color:var(--mu)}
.fs-badges{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.8rem;padding:0;list-style:none}
.fs-badge{border:1px solid var(--ln);border-radius:10px;padding:.2rem .65rem;font-size:.76rem;font-weight:800;white-space:nowrap;background:var(--bg)}

/* Section head: number sits in a glossy tile */
.fs-head{display:flex;align-items:center;gap:.75rem}
.fs-num{flex:none;width:40px;height:40px;display:grid;place-items:center;border-radius:13px;color:#0D0D0D;background:var(--g);font-weight:800;font-size:15px;box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -2px 0 rgba(0,0,0,.12),0 4px 10px -4px rgba(238,90,11,.55)}
.fs-head h2{font-size:1.05rem;font-weight:800}

/* Fields */
.fs-grid{display:grid;gap:.9rem;grid-template-columns:1fr}
@media(min-width:640px){.fs-g2{grid-template-columns:1fr 1fr}.fs-g3{grid-template-columns:1fr 1fr 1fr}}
.fs-label{display:block;font-size:.88rem;font-weight:700;margin-bottom:.4rem}
.fs-note-s{margin:.4rem 0 0;font-size:.8rem;line-height:1.7;color:var(--mu)}
.fs-in{width:100%;min-width:0;min-height:52px;padding:.6rem .9rem;font:inherit;font-size:17px;font-weight:700;color:var(--ink);background:var(--sf);border:2px solid var(--ln);border-radius:16px}
.fs-in:hover{border-color:var(--mu)}
.fs-in::placeholder{color:var(--mu);opacity:.8;font-weight:600}
.fs-in[type="date"]{font-size:15px}
.fs-in[type="number"],.fs-in[type="date"]{direction:ltr;text-align:center;font-variant-numeric:tabular-nums}
.fs-in:focus-visible,.fs-btn:focus-visible,.fs-tg:focus-visible,.fs-exp:focus-visible,.fs-sbar-b:focus-visible{outline:3px solid var(--ink);outline-offset:2px}

/* Toggle buttons */
.fs-tgrid{display:grid;gap:.6rem;grid-template-columns:1fr 1fr}
@media(min-width:640px){.fs-t3{grid-template-columns:1fr 1fr 1fr}}
.fs-t3s{grid-template-columns:repeat(3,minmax(0,1fr))}
.fs-t3s .fs-tg{padding:.6rem .45rem;text-align:center}
.fs-tg{border:2px solid var(--ln);border-radius:16px;background:var(--sf);color:var(--ink);padding:.7rem .8rem;text-align:start;font:inherit;font-size:.88rem;font-weight:800;cursor:pointer;min-height:48px;transition:border-color .15s}
.fs-tg:hover{border-color:var(--ink)}
.fs-tg small{display:block;font-weight:600;font-size:.74rem;color:var(--mu);margin-top:2px;line-height:1.5}
.fs-tg[aria-pressed="true"]{background:var(--g);color:#0D0D0D;border-color:var(--ink);box-shadow:inset 0 1px 0 rgba(255,255,255,.5)}
.fs-tg[aria-pressed="true"] small{color:#0D0D0D;opacity:.85}

/* Notes and boxes */
.fs-note{border:1px solid var(--ln);border-radius:16px;background:var(--bg);padding:.75rem .9rem;font-size:.85rem;line-height:1.8}
.fs-note.warn{border-style:dashed}
.fs-note.bad{border:2px solid var(--er);color:var(--er);font-weight:700}
.fs-note.fix{border:2px solid var(--ink)}
.fs-box{border:1px solid var(--ln);border-radius:18px;background:var(--bg);padding:.9rem 1rem;display:flex;flex-direction:column;gap:.5rem;font-size:.9rem}
.fs-row{display:flex;justify-content:space-between;gap:.75rem;align-items:baseline}
.fs-row b{white-space:nowrap}
.fs-total{border:2px solid var(--ink);border-radius:16px;padding:.75rem 1rem;display:flex;justify-content:space-between;align-items:center;gap:.75rem;font-weight:800}
.fs-total span:last-child{font-size:clamp(1.1rem,5vw,1.35rem);font-weight:800;white-space:nowrap}
.fs-sub{font-size:.88rem;font-weight:800;margin:0 0 .6rem}
.fs-sub.ded{color:var(--er)}
.fs-stats{display:grid;gap:.6rem;grid-template-columns:1fr 1fr}
.fs-stats>:first-child{grid-column:1/-1}
@media(min-width:640px){.fs-stats{grid-template-columns:1fr 1fr 1fr}.fs-stats>:first-child{grid-column:auto}}

/* Optional details for the printable form */
.fs-opt{border:1px dashed var(--ln);border-radius:18px;background:var(--bg)}
.fs-opt summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:.75rem;padding:.8rem 1rem;font-size:.9rem;font-weight:800;min-height:48px;border-radius:18px}
.fs-opt summary::-webkit-details-marker{display:none}
.fs-opt summary small{display:block;font-size:.76rem;font-weight:600;color:var(--mu)}
.fs-opt summary::after{content:"+";font-size:1.2rem;font-weight:800;flex:none}
.fs-opt[open] summary::after{content:"−"}
.fs-opt summary:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.fs-opt .fs-grid{padding:0 1rem 1rem}

/* Result: glossy orange hero */
.fs-res{border:1px solid var(--ln);border-radius:26px;background:var(--sf);overflow:hidden;scroll-margin-top:1rem}
.fs-hero{background:var(--g);color:#0D0D0D;padding:1.4rem;box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -3px 0 rgba(0,0,0,.1)}
@media(min-width:640px){.fs-hero{padding:1.7rem}}
.fs-hero p{margin:0}
.fs-hero .big{font-size:clamp(2.2rem,9vw,3.2rem);font-weight:800;line-height:1.15;margin-top:.4rem;direction:ltr;unicode-bidi:isolate;text-align:start}
.fs-hero .big span{font-size:1.1rem;font-weight:800}
.fs-bd{padding:1.1rem 1.25rem;display:flex;flex-direction:column;gap:.25rem}
.fs-line{display:flex;justify-content:space-between;gap:.75rem;padding:.7rem 0;border-bottom:1px solid var(--ln)}
.fs-line .t{font-weight:800;font-size:.9rem}
.fs-line .s{font-size:.78rem;color:var(--mu);margin-top:2px;line-height:1.6}
.fs-line .a{font-weight:800;white-space:nowrap;direction:ltr;unicode-bidi:isolate}
.fs-line.gross{border:1px solid var(--ln);border-radius:14px;background:var(--bg);padding-inline:.8rem;margin-top:.4rem}
.fs-line.ded .t,.fs-line.ded .a{color:var(--er)}
.fs-line.net{background:var(--g);color:#0D0D0D;border:2px solid var(--ink);border-radius:16px;padding:.9rem .9rem;margin-top:.6rem;box-shadow:inset 0 1px 0 rgba(255,255,255,.5)}
.fs-line.net .t,.fs-line.net .a{font-size:1.05rem;font-weight:800;color:#0D0D0D}
.fs-acts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem;padding:1rem 1.25rem 1.25rem;border-top:1px solid var(--ln)}
.fs-acts .fs-btn{padding-inline:.5rem;font-size:.86rem}
.fs-acts .fs-btn.pri{grid-column:1/-1;font-size:.95rem}
.fs-btn{border:2px solid var(--ln);border-radius:16px;background:var(--sf);color:var(--ink);padding:.6rem 1.1rem;font:inherit;font-size:.92rem;font-weight:800;cursor:pointer;min-height:48px}
.fs-btn:hover{border-color:var(--ink)}
.fs-btn.pri{background:var(--g);color:#0D0D0D;border-color:var(--ink);box-shadow:inset 0 1px 0 rgba(255,255,255,.5)}
.fs-btn.pri:hover{opacity:.92}
.fs-exp{width:100%;text-align:start;background:none;border:0;border-top:1px solid var(--ln);color:var(--ink);padding:.9rem 1.25rem;font:inherit;font-size:.92rem;font-weight:800;cursor:pointer;display:flex;justify-content:space-between;min-height:48px}
.fs-exp:focus-visible{outline-offset:-3px}
.fs-calcs{padding:0 1.25rem 1.25rem;display:flex;flex-direction:column;gap:.6rem}
.fs-calc{border:1px solid var(--ln);border-radius:16px;padding:.8rem .9rem;background:var(--bg)}
.fs-calc p{margin:0}
.fs-calc .f{font-size:.8rem;margin:.3rem 0;word-break:break-word;direction:rtl}
.fs-calc .l{font-size:.78rem;color:var(--mu)}
.fs-disc{margin:0 1.25rem 1.25rem;border:1px dashed var(--ln);border-radius:16px;padding:.8rem .95rem;font-size:.78rem;line-height:1.8;color:var(--mu)}

/* Mobile sticky result bar */
.fs-sbar{position:fixed;inset-inline:0;bottom:0;z-index:20;display:flex;transition:transform .2s ease;align-items:center;justify-content:space-between;gap:.75rem;padding:.65rem 1rem calc(.65rem + env(safe-area-inset-bottom,0px));background:var(--sf);border-top:1px solid var(--ln);box-shadow:0 -8px 24px -12px rgba(0,0,0,.25)}
.fs-sbar.off{transform:translateY(110%);visibility:hidden}
@media(min-width:960px){.fs-sbar{display:none}}
.fs-sbar-t{display:grid;min-width:0}
.fs-sbar-t span{font-size:.76rem;font-weight:600;color:var(--mu)}
.fs-sbar-t b{font-size:1.2rem;font-weight:800;line-height:1.3;direction:ltr;unicode-bidi:isolate;text-align:start}
.fs-sbar-b{flex:none;min-height:48px;padding:.5rem 1.1rem;font:inherit;font-size:.92rem;font-weight:800;color:#0D0D0D;background:var(--g);border:2px solid var(--ink);border-radius:16px;cursor:pointer}

/* Document modal: always ink on white for clean print */
.fs-modal{position:fixed;inset:0;z-index:50;background:rgba(13,13,13,.75);overflow-y:auto;padding:16px;display:flex;justify-content:center;align-items:flex-start}
.fs-sheet{width:100%;max-width:720px;background:#fff;color:#0D0D0D;border:2px solid #0D0D0D;border-radius:20px;overflow:hidden}
.fs-bar{position:sticky;top:0;background:#fff;border-bottom:2px solid #0D0D0D;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;gap:8px;z-index:2;flex-wrap:wrap}
.fs-bar .fs-btn{background:#fff;color:#0D0D0D;border-color:#0D0D0D;padding:6px 12px;min-height:40px;border-radius:12px}
.fs-bar .fs-btn.pri{background:#FF6A1A}
.fs-bar .fs-btn:hover{background:#0D0D0D;color:#fff}
.fs-paper{padding:28px;display:flex;flex-direction:column;gap:22px;color:#0D0D0D;background:#fff;font-size:14px}
.fs-paper h3{font-size:14px;font-weight:700;border-bottom:1px solid #0D0D0D;padding-bottom:4px;margin-bottom:10px}
.fs-paper table{width:100%;border-collapse:collapse}
.fs-paper th,.fs-paper td{border:1px solid #0D0D0D;padding:8px 10px;text-align:right}
.fs-paper thead th{background:#0D0D0D;color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.fs-paper tr.g td{background:#EDEDEA;font-weight:700;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.fs-paper tfoot td{background:#FF6A1A;color:#0D0D0D;font-weight:700;border-width:2px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.fs-info{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px}
.fs-info small{display:block;font-size:11px;font-weight:700;color:#55554F}
.fs-sig{display:grid;grid-template-columns:1fr 1fr;gap:40px;text-align:center;font-size:12px}
.fs-sig .ln{border-bottom:2px solid #0D0D0D;height:44px;margin:8px 8px 6px}

@media print{
  body *{visibility:hidden}
  #settlement-document,#settlement-document *{visibility:visible}
  #settlement-document{position:absolute;inset:0;width:100%;padding:12mm}
  .fs-sbar{display:none!important}
}
@media (prefers-reduced-motion:reduce){.fs *{transition:none!important;scroll-behavior:auto!important}}
`;

// ─── Sub-components (unchanged) ────────────────────────────────────────────────
function SectionHeader({ num, title }) {
  return (
    <div className="fs-head">
      <div className="fs-num" aria-hidden="true">{num}</div>
      <h2 id={`fs-s${num}`}>{title}</h2>
    </div>
  );
}

function Field({ label, note, children }) {
  const id = useId();
  return (
    <div>
      <label className="fs-label" htmlFor={id}>{label}</label>
      {children(id)}
      {note && <p className="fs-note-s">{note}</p>}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <Field label={label}>
      {(id) => (
        <input id={id} type="text" className="fs-in" value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

function NumInput({ label, value, onChange, note }) {
  return (
    <Field label={label} note={note}>
      {(id) => (
        <input id={id} type="number" inputMode="decimal" min="0" className="fs-in" value={value}
          onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

function DateInput({ label, value, onChange }) {
  return (
    <Field label={label}>
      {(id) => (
        <input id={id} type="date" className="fs-in" value={value}
          onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

function ToggleGroup({ label, options, value, onChange, cols3, compact }) {
  return (
    <div role="group" aria-label={label}>
      <span className="fs-label">{label}</span>
      <div className={`fs-tgrid ${compact ? "fs-t3s" : cols3 ? "fs-t3" : ""}`}>
        {options.map((o) => (
          <button key={o.id} type="button" className="fs-tg" aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}>
            {o.label}
            {o.desc && <small>{o.desc}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Line({ label, sub, amount, type }) {
  const ded = type === "deduct";
  return (
    <div className={`fs-line ${type === "gross" ? "gross" : ""} ${ded ? "ded" : ""} ${type === "net" ? "net" : ""}`}>
      <div>
        <p className="t" style={{ margin: 0 }}>{label}</p>
        {sub ? <p className="s" style={{ margin: 0 }}>{sub}</p> : null}
      </div>
      <p className="a" style={{ margin: 0 }}>
        {ded && amount > 0 ? "−" : ""}{fmt(Math.abs(amount))} ر.س
      </p>
    </div>
  );
}

function CalcExplain({ title, formula, law }) {
  return (
    <div className="fs-calc">
      <p style={{ fontSize: 13, fontWeight: 700 }}>{title}</p>
      <p className="f">{formula}</p>
      <p className="l">{law}</p>
    </div>
  );
}

function DocRow({ label, value, cls }) {
  return (
    <tr className={cls}>
      <td>{label}</td>
      <td>{value}</td>
    </tr>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function FinalSettlementCalculator() {
  const resultRef = useRef(null);
  const closeRef = useRef(null);
  const openerRef = useRef(null);
  // Mobile bar is only useful while the result is still below the screen.
  const [barOn, setBarOn] = useState(true);

  const [employeeName, setEmployeeName] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [position, setPosition] = useState("");

  const [contractType, setContractType] = useState("indefinite");
  const [terminationReason, setTerminationReason] = useState("terminate");
  // Demo defaults = the worked example on the page (6 years 4 months, 15 days
  // in the last month). Fixed dates keep the server-rendered result stable.
  const [joiningDate, setJoiningDate] = useState("2020-01-15");
  const [lastWorkingDate, setLastWorkingDate] = useState("2026-05-15");
  const [customLastMonthDays, setCustomLastMonthDays] = useState("");

  const [basicSalary, setBasicSalary] = useState("8000");
  const [housingAllowance, setHousingAllowance] = useState("2000");
  const [transportAllowance, setTransportAllowance] = useState("1000");
  const [otherAllowances, setOtherAllowances] = useState("0");
  const [monthlyDivisor, setMonthlyDivisor] = useState("30");

  const [unusedLeaveDays, setUnusedLeaveDays] = useState("18");
  const [leaveWageBase, setLeaveWageBase] = useState("actual");

  const [noticeRequired, setNoticeRequired] = useState("60");
  const [noticeServed, setNoticeServed] = useState("0");
  const [noticeBeneficiary, setNoticeBeneficiary] = useState("employee");

  const [unpaidSalary, setUnpaidSalary] = useState("0");
  const [overtimeAmount, setOvertimeAmount] = useState("0");
  const [bonuses, setBonuses] = useState("0");
  const [otherAdditions, setOtherAdditions] = useState("0");

  const [loans, setLoans] = useState("0");
  const [companyAssets, setCompanyAssets] = useState("0");
  const [otherDeductions, setOtherDeductions] = useState("0");

  const [showDocument, setShowDocument] = useState(false);
  const [expandedCalc, setExpandedCalc] = useState(false);
  const [copied, setCopied] = useState(false);
  const [calcDate, setCalcDate] = useState("");

  // Client-only date label (avoids hydration mismatch)
  useEffect(() => {
    setCalcDate(new Date().toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" }));
  }, []);

  // Escape closes the printable document; focus moves in and back out
  useEffect(() => {
    if (!showDocument) return;
    const opener = openerRef.current;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setShowDocument(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [showDocument]);

  // Hide the mobile bar once the result is on screen or already scrolled past
  useEffect(() => {
    const el = resultRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      setBarOn(!entry.isIntersecting && entry.boundingClientRect.top > 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleTerminationChange = (rId) => {
    setTerminationReason(rId);
    if (rId === "resign") {
      setNoticeBeneficiary("employer");
      setNoticeRequired("30");
    } else if (rId === "terminate") {
      setNoticeBeneficiary("employee");
      setNoticeRequired("60");
    }
  };

  const track = (name, data) => {
    if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
      window.trackEvent(name, data);
    }
  };

  const scrollToResult = () => {
    const el = resultRef.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  // ─── Calculation ─────────────────────────────────────────────────────────────
  // The math lives in lib/finalSettlementCalc.js so tests exercise the real code.
  const calc = useMemo(() => {
    const result = calculateFinalSettlement({
      basicSalary, housingAllowance, transportAllowance, otherAllowances, monthlyDivisor,
      joiningDate, lastWorkingDate, customLastMonthDays, terminationReason, contractType,
      unusedLeaveDays, leaveWageBase, noticeRequired, noticeServed, noticeBeneficiary,
      unpaidSalary, overtimeAmount, bonuses, otherAdditions, loans, companyAssets, otherDeductions,
    });
    return { ...result, serviceDurationLabel: formatDuration(result.serviceMonths) };
  }, [
    basicSalary, housingAllowance, transportAllowance, otherAllowances, monthlyDivisor,
    joiningDate, lastWorkingDate, customLastMonthDays, terminationReason, contractType,
    unusedLeaveDays, leaveWageBase, noticeRequired, noticeServed, noticeBeneficiary,
    unpaidSalary, overtimeAmount, bonuses, otherAdditions, loans, companyAssets, otherDeductions,
  ]);

  // Tracking: calculator_used once; result_generated debounced (not per keystroke)
  const usedRef = useRef(false);
  useEffect(() => {
    if (usedRef.current) return;
    usedRef.current = true;
    track("calculator_used", { tool: "final-settlement" });
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      track("result_generated", {
        tool: "final-settlement",
        termination_reason: terminationReason,
        contract_type: contractType,
        net_amount: Math.round(calc.netSettlement),
        eosb: Math.round(calc.eosb),
        leave_pay: Math.round(calc.leavePay),
      });
    }, 2000);
    return () => clearTimeout(t);
  }, [calc.netSettlement, terminationReason, contractType]);

  const shareText = useMemo(
    () => `ملخص تصفية المخالصة النهائية (Saudi Final Settlement):
• مدة الخدمة: ${calc.serviceDurationLabel} (${calc.serviceYears.toFixed(2)} سنة)
• الأجر الفعلي الشهري: ${fmt(calc.totalWage)} ر.س
• مكافأة نهاية الخدمة (م/84 و85): ${fmt(calc.eosb)} ر.س
• آخر راتب مستحق: ${fmt(calc.lastMonthPay)} ر.س
• بدل رصيد الإجازات (م/111): ${fmt(calc.leavePay)} ر.س
• بدل مهلة الإشعار: ${calc.noticeAddition > 0 ? `+${fmt(calc.noticeAddition)} ر.س (للموظف)` : calc.noticeDeduction > 0 ? `-${fmt(calc.noticeDeduction)} ر.س (خصم)` : "0 ر.س"}
• إجمالي الخصومات (سلف وعهد): -${fmt(calc.dedBase)} ر.س
═════════════════════════
صافي المخالصة النهائية المستحقة: ${fmt(calc.netSettlement)} ر.س

احسب مخالصتك وأنشئ نموذجك التقديري مجاناً:
${SITE_URL}/ar/sa/final-settlement-calculator`,
    [calc]
  );

  const reasonLabel = REASONS.find((r) => r.id === terminationReason)?.label || "";
  const gratuityStatus =
    calc.esobPercent === 1 ? { cls: "", mark: "✓ مستحقة كاملة" } :
      calc.esobPercent === 0 ? { cls: "bad", mark: "✗ غير مستحقة" } :
        { cls: "warn", mark: "! مستحقة جزئياً" };

  return (
    <div className="fs fs-stack">
      <style>{CSS}</style>

      {/* Header */}
      <div className="fs-card fs-intro">
        <div className="fs-top">
          <div>
            <h1>حاسبة المخالصة النهائية في السعودية</h1>
            <p>تصفية كاملة لجميع مستحقات العامل وفق المواد 75 و84 و85 و111 من نظام العمل</p>
            <ul className="fs-badges">
              <li className="fs-badge">محدث 2026 — نظام العمل السعودي</li>
              <li className="fs-badge">مجانية وبدون تسجيل</li>
              <li className="fs-badge">نموذج مخالصة للطباعة</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 1 */}
      <section className="fs-card" aria-labelledby="fs-s1">
        <SectionHeader num="1" title="العقد ومدة الخدمة" />
        <ToggleGroup
          label="نوع العقد"
          value={contractType}
          onChange={setContractType}
          options={[
            { id: "indefinite", label: "عقد غير محدد المدة", desc: "مفتوح بدون تاريخ انتهاء" },
            { id: "fixed", label: "عقد محدد المدة", desc: "بتاريخ انتهاء مسبق" },
          ]}
        />

        <ToggleGroup
          label="سبب إنهاء العلاقة العمالية"
          value={terminationReason}
          onChange={handleTerminationChange}
          options={REASONS}
          cols3
        />

        <div className="fs-grid fs-g3">
          <DateInput label="تاريخ الالتحاق بالعمل" value={joiningDate} onChange={setJoiningDate} />
          <DateInput label="آخر يوم عمل فعلي" value={lastWorkingDate} onChange={setLastWorkingDate} />
          <NumInput
            label="أيام عمل الشهر الأخير (لآخر راتب)"
            value={customLastMonthDays !== "" ? customLastMonthDays : calc.daysWorked}
            onChange={setCustomLastMonthDays}
            note="تُحتسب تلقائياً من تاريخ الخروج، ويمكن تعديلها"
          />
        </div>

        {calc.serviceMonths > 0 && (
          <div className="fs-box fs-row" style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600 }}>مدة الخدمة المحتسبة</span>
            <span style={{ textAlign: "end" }}>
              <b>{calc.serviceDurationLabel}</b>
              <span className="fs-note-s" style={{ display: "block", margin: 0 }}>({calc.serviceYears.toFixed(3)} سنة)</span>
            </span>
          </div>
        )}

        <details className="fs-opt">
          <summary>
            <span>
              بيانات نموذج المخالصة (اختياري)
              <small>الاسم وجهة العمل تظهر في النموذج المطبوع فقط ولا تؤثر في الحساب</small>
            </span>
          </summary>
          <div className="fs-grid fs-g2">
            <TextInput label="اسم الموظف (للنموذج)" value={employeeName} onChange={setEmployeeName} placeholder="محمد علي الزهراني" />
            <TextInput label="اسم جهة العمل / الشركة" value={employerName} onChange={setEmployerName} placeholder="شركة الخليج للمقاولات" />
            <TextInput label="المسمى الوظيفي" value={position} onChange={setPosition} placeholder="مهندس مدني أول" />
            <TextInput label="رقم الهوية الوطنية / الإقامة" value={employeeId} onChange={setEmployeeId} placeholder="1xxxxxxxxx" />
          </div>
        </details>
      </section>

      {/* 2 */}
      <section className="fs-card" aria-labelledby="fs-s2">
        <SectionHeader num="2" title="هيكل الراتب والأجر الفعلي" />
        <div className="fs-grid fs-g2">
          <NumInput label="الراتب الأساسي الشهري (ر.س)" value={basicSalary} onChange={setBasicSalary} />
          <NumInput label="بدل السكن الشهري (ر.س)" value={housingAllowance} onChange={setHousingAllowance} />
          <NumInput label="بدل النقل الشهري (ر.س)" value={transportAllowance} onChange={setTransportAllowance} />
          <NumInput label="بدلات ثابتة دورية أخرى (ر.س)" value={otherAllowances} onChange={setOtherAllowances} />
        </div>

        <div>
          <ToggleGroup
            label="قاسم الشهر لحساب الأجر اليومي"
            value={monthlyDivisor}
            onChange={setMonthlyDivisor}
            compact
            options={[
              { id: "30", label: "÷30", desc: "الأشيع بالسعودية" },
              { id: "26", label: "÷26", desc: "بعض العقود" },
              { id: "22", label: "÷22", desc: "أيام العمل الفعلية" },
            ]}
          />
          <p className="fs-note-s">
            ÷30 هو الأساس الافتراضي الأكثر استخداماً في عقود العمل السعودية. يمكن تغييره إن نصّ العقد على خلاف ذلك.
          </p>
        </div>

        <div className="fs-stats">
          {[
            ["الأجر الفعلي الإجمالي", calc.totalWage, true],
            ["الأجر اليومي", calc.daily, false],
            ["أجر الساعة (÷8)", calc.daily / 8, false],
          ].map(([l, v, hi]) => (
            <div key={l} className="fs-box" style={{ borderColor: hi ? "var(--ink)" : undefined, borderWidth: hi ? 2 : 1, gap: 2 }}>
              <span style={{ fontSize: 12, color: "var(--mu)" }}>{l}</span>
              <b style={{ fontSize: 16 }}>{fmt(v)} ر.س</b>
            </div>
          ))}
        </div>
      </section>

      {/* 3 */}
      <section className="fs-card" aria-labelledby="fs-s3">
        <SectionHeader num="3" title="مكافأة نهاية الخدمة — المادتان 84 و 85" />
        <div className="fs-box">
          <div className="fs-row">
            <span>السنوات الأولى (حتى 5 سنوات): {calc.y1.toFixed(2)} سنة × نصف شهر</span>
            <b>{fmt(calc.y1Full)} ر.س</b>
          </div>
          {calc.y2 > 0 && (
            <div className="fs-row">
              <span>السنوات التالية (بعد 5): {calc.y2.toFixed(2)} سنة × شهر كامل</span>
              <b>{fmt(calc.y2Full)} ر.س</b>
            </div>
          )}
          <div className="fs-row" style={{ borderTop: "1px solid var(--ln)", paddingTop: 8, fontWeight: 700 }}>
            <span>المكافأة الأصلية (100٪)</span>
            <b>{fmt(calc.fullGratuity)} ر.س</b>
          </div>
          {calc.esobPercent < 1 && (
            <div className="fs-row" style={{ color: "var(--er)", fontWeight: 700 }}>
              <span>نسبة الاستحقاق المطبقة</span>
              <b>× {(calc.esobPercent * 100).toFixed(1)}٪</b>
            </div>
          )}
        </div>

        <div className={`fs-note ${gratuityStatus.cls}`} role="status">
          <b>{gratuityStatus.mark}</b> — {calc.esobNote}
        </div>

        <div className="fs-total">
          <span>مكافأة نهاية الخدمة المستحقة</span>
          <span>{fmt(calc.eosb)} ر.س</span>
        </div>
      </section>

      {/* 4 */}
      <section className="fs-card" aria-labelledby="fs-s4">
        <SectionHeader num="4" title="بدل رصيد الإجازة السنوية — المادة 111" />
        <NumInput label="رصيد الإجازة السنوية غير المستنفد (بالأيام)" value={unusedLeaveDays} onChange={setUnusedLeaveDays} />
        <div>
          <ToggleGroup
            label="أساس حساب بدل الإجازة"
            value={leaveWageBase}
            onChange={setLeaveWageBase}
            options={[
              { id: "actual", label: "الأجر الفعلي الإجمالي", desc: "الأشمل — المعتمد قضائياً غالباً" },
              { id: "basic", label: "الراتب الأساسي فقط", desc: "بعض العقود تنص عليه" },
            ]}
          />
          <p className="fs-note-s">
            المادة (111) تُلزم بتعويض نقدي عن الإجازات غير المستنفدة. تعتمد المحاكم العمالية غالباً الأجر الفعلي الإجمالي.
          </p>
        </div>
        {calc.leaveDays > 0 && (
          <div className="fs-box">
            <div className="fs-row">
              <span>أجر اليوم المحتسب ({leaveWageBase === "basic" ? "الأساسي" : "الإجمالي"})</span>
              <b>{fmt(calc.leaveDailyRate)} ر.س</b>
            </div>
            <div className="fs-row">
              <span>الحساب: {calc.leaveDays} يوم × {fmt(calc.leaveDailyRate)} ر.س</span>
              <b>{fmt(calc.leavePay)} ر.س</b>
            </div>
          </div>
        )}
      </section>

      {/* 5 */}
      <section className="fs-card" aria-labelledby="fs-s5">
        <SectionHeader num="5" title="بدل مهلة الإشعار — المادتان 75 و 76" />
        {contractType === "fixed" ? (
          <div className="fs-note warn">
            <b>! عقد محدد المدة:</b> لا تنطبق أحكام مهلة الإشعار القياسية وفق المادتين (75) و(76) من نظام العمل.
          </div>
        ) : (
          <>
            <div className="fs-note">
              <b>المادة (75) بعد تعديلات 2025:</b> للعقد غير المحدد المدة مع الأجر الشهري، مهلة الإشعار 30 يوماً على الأقل عند إنهاء العامل للعقد و60 يوماً على الأقل عند إنهاء صاحب العمل. والطرف المخل بالمهلة يلتزم بتعويض الطرف الآخر بأجر المدة غير المخدومة (م/76).
            </div>

            <ToggleGroup
              label="التعويض لصالح"
              value={noticeBeneficiary}
              onChange={setNoticeBeneficiary}
              options={[
                { id: "employee", label: "للموظف (إضافة +)", desc: "عند إنهاء المنشأة للعقد دون إعطاء الموظف مهلة الإشعار كاملة" },
                { id: "employer", label: "لصاحب العمل (خصم −)", desc: "عند استقالة الموظف وتركه العمل فوراً قبل انقضاء مهلة الإشعار" },
              ]}
            />

            <div className="fs-grid fs-g2">
              <NumInput
                label="مهلة الإشعار المطلوبة نظاماً (بالأيام)"
                value={noticeRequired}
                onChange={setNoticeRequired}
                note="30 يوماً لإنهاء العامل — 60 يوماً لإنهاء صاحب العمل (الحد الأدنى للأجر الشهري)"
              />
              <NumInput label="فترة الإشعار المخدومة فعلياً (بالأيام)" value={noticeServed} onChange={setNoticeServed} />
            </div>

            {calc.missedDays > 0 ? (
              <div className={`fs-note ${noticeBeneficiary === "employer" ? "fix" : ""}`}>
                <div className="fs-row"><span>أيام الإشعار غير المخدومة</span><b>{calc.missedDays} يوم</b></div>
                <div className="fs-row" style={{ marginTop: 6 }}>
                  <span>{noticeBeneficiary === "employee" ? "تعويض يُضاف لمستحقات الموظف (+)" : "تعويض يُخصم من مستحقات الموظف (−)"}</span>
                  <b style={{ fontSize: 17 }}>{noticeBeneficiary === "employer" ? "−" : "+"}{fmt(calc.noticePay)} ر.س</b>
                </div>
              </div>
            ) : (
              <div className="fs-note"><b>✓</b> {calc.noticeNote || "فترة الإشعار خُدمت كاملة"}</div>
            )}
          </>
        )}
      </section>

      {/* 6 */}
      <section className="fs-card" aria-labelledby="fs-s6">
        <SectionHeader num="6" title="مستحقات وخصومات أخرى" />
        <div>
          <p className="fs-sub">إضافات ومستحقات أخرى (+)</p>
          <div className="fs-grid fs-g2">
            <NumInput label="رواتب متأخرة غير مصروفة (ر.س)" value={unpaidSalary} onChange={setUnpaidSalary} />
            <NumInput label="بدل أوفر تايم مستحق (ر.س)" value={overtimeAmount} onChange={setOvertimeAmount} />
            <NumInput label="مكافآت ومنح مستحقة (ر.س)" value={bonuses} onChange={setBonuses} />
            <NumInput label="إضافات أخرى (ر.س)" value={otherAdditions} onChange={setOtherAdditions} />
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--ln)", paddingTop: 16 }}>
          <p className="fs-sub ded">خصومات واستقطاعات (−)</p>
          <div className="fs-grid fs-g2">
            <NumInput label="سلف وقروض مستحقة للشركة (ر.س)" value={loans} onChange={setLoans} />
            <NumInput label="عهد وأصول شركة غير مُردودة (ر.س)" value={companyAssets} onChange={setCompanyAssets} />
            <NumInput label="خصومات أخرى (ر.س)" value={otherDeductions} onChange={setOtherDeductions} />
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="fs-res" ref={resultRef} aria-label="النتيجة">
        <div className="fs-hero" aria-live="polite" aria-atomic="true">
          <p style={{ fontSize: 14, fontWeight: 800 }}>إجمالي المخالصة النهائية الصافية</p>
          <p className="big">{fmt(calc.netSettlement)} <span>ر.س</span></p>
        </div>

        <div className="fs-bd">
          <Line label="آخر راتب مستحق" sub={`${calc.daysWorked} يوماً × ${fmt(calc.daily)} ر.س/يوم`} amount={calc.lastMonthPay} />
          <Line label="مكافأة نهاية الخدمة المستحقة" sub={calc.esobNote} amount={calc.eosb} />
          <Line
            label="بدل رصيد الإجازة السنوية"
            sub={calc.leaveDays > 0 ? `${calc.leaveDays} يوم × ${fmt(calc.leaveDailyRate)} ر.س` : "لم تُدخل أيام إجازة"}
            amount={calc.leavePay}
          />
          {calc.noticeAddition > 0 && <Line label="بدل مهلة الإشعار (لصالح الموظف)" sub={calc.noticeNote} amount={calc.noticeAddition} />}
          {calc.noticePay === 0 && <Line label="بدل مهلة الإشعار" sub={calc.noticeNote} amount={0} />}
          {calc.addTotal > 0 && <Line label="مستحقات أخرى" amount={calc.addTotal} />}
          <Line label="إجمالي المستحقات" amount={calc.grossDues} type="gross" />
          {calc.noticeDeduction > 0 && (
            <Line label="خصم مهلة الإشعار غير المخدومة (لصاحب العمل)" sub={`${calc.missedDays} يوماً غير مخدومة`} amount={calc.noticeDeduction} type="deduct" />
          )}
          {calc.dedBase > 0 && <Line label="إجمالي الخصومات الأخرى" sub="سلف وعهد مستحقة" amount={calc.dedBase} type="deduct" />}
          <Line label="صافي المخالصة النهائية المستحقة" amount={calc.netSettlement} type="net" />
        </div>

        <div className="fs-acts">
          <button type="button" className="fs-btn pri" onClick={(e) => {
            openerRef.current = e.currentTarget;
            setShowDocument(true);
            track("print_download_clicked", { tool: "final-settlement", action: "view_document", net_settlement: Math.round(calc.netSettlement) });
          }}>
            إنشاء نموذج مخالصة قابل للطباعة
          </button>
          <button type="button" className="fs-btn" onClick={(e) => {
            openerRef.current = e.currentTarget;
            track("print_download_clicked", { tool: "final-settlement", action: "print_pdf", net_settlement: Math.round(calc.netSettlement) });
            setShowDocument(true);
            setTimeout(() => window.print(), 150);
          }}>
            طباعة
          </button>
          <button type="button" className="fs-btn" onClick={() => {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
            track("share_clicked", { tool: "final-settlement", method: "whatsapp" });
          }}>
            واتساب
          </button>
          <button type="button" className="fs-btn" onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(shareText);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
              track("share_clicked", { tool: "final-settlement", method: "clipboard" });
            }
          }}>
            {copied ? "✓ تم النسخ" : "نسخ الملخص"}
          </button>
        </div>

        <button type="button" className="fs-exp" aria-expanded={expandedCalc} onClick={() => setExpandedCalc(!expandedCalc)}>
          <span>كيف تم الحساب؟ — المعادلات والمواد النظامية</span>
          <span aria-hidden="true">{expandedCalc ? "−" : "+"}</span>
        </button>
        {expandedCalc && (
          <div className="fs-calcs">
            <CalcExplain
              title="1. آخر راتب مستحق"
              formula={`(${fmt(calc.totalWage)} ر.س ÷ ${calc.divisor}) × ${calc.daysWorked} يوم = ${fmt(calc.lastMonthPay)} ر.س`}
              law="حساب نسبي للأجر اليومي عن أيام الشهر الأخير المعمولة فعلاً"
            />
            <CalcExplain
              title="2. مكافأة نهاية الخدمة"
              formula={`أول 5 سنوات: ${fmt(calc.totalWage)} × 0.5 × ${calc.y1.toFixed(2)} = ${fmt(calc.y1Full)} ر.س${calc.y2 > 0 ? ` | بعد 5 سنوات: ${fmt(calc.totalWage)} × 1.0 × ${calc.y2.toFixed(2)} = ${fmt(calc.y2Full)} ر.س` : ""
                } | نسبة الاستحقاق ${(calc.esobPercent * 100).toFixed(1)}٪ → ${fmt(calc.eosb)} ر.س`}
              law="المادة (84) للحساب الأساسي — المادة (85) لتدرج الاستقالة — المادة (87) لاستثناء المرأة"
            />
            <CalcExplain
              title="3. بدل رصيد الإجازة السنوية"
              formula={`${calc.leaveDays} يوم × (${fmt(calc.leaveBase)} ر.س ÷ ${calc.divisor}) = ${calc.leaveDays} × ${fmt(calc.leaveDailyRate)} = ${fmt(calc.leavePay)} ر.س`}
              law="المادة (111) من نظام العمل: حق تعويض نقدي كامل عن الإجازات السنوية غير المستنفدة عند ترك العمل"
            />
            {calc.noticePay > 0 && (
              <CalcExplain
                title="4. بدل مهلة الإشعار"
                formula={`${calc.missedDays} يوم غير مخدوم × ${fmt(calc.daily)} ر.س/يوم = ${fmt(calc.noticePay)} ر.س`}
                law="المادتان (75) و(76): حق التعويض عن فترة الإشعار غير المخدومة في العقود غير المحددة المدة"
              />
            )}
            <CalcExplain
              title="5. الإجمالي والصافي"
              formula={`إجمالي المستحقات ${fmt(calc.grossDues)} - إجمالي الخصومات ${fmt(calc.dedTotal)} = صافي المخالصة ${fmt(calc.netSettlement)} ر.س`}
              law="التصفية الإجمالية النهائية لجميع حقوق ومديونيات الطرفين"
            />
          </div>
        )}

        <div className="fs-disc">
          <b>ملاحظة وإخلاء مسؤولية قانوني:</b> هذه الحاسبة تقديرية واسترشادية لتصفية مستحقات العامل وفق المواد (75، 84، 85، 111) من نظام العمل السعودي الصادر بالمرسوم الملكي (م/51) وتعديلاته. ليست بديلاً عن الاستشارة القانونية أو التسوية الرسمية المعتمدة من جهة العمل. للنزاعات العمالية، يُرجى الرجوع لمنصة <b>ودي</b> التابعة لوزارة الموارد البشرية والتنمية الاجتماعية (hrsd.gov.sa). <b>آخر تحديث للمحتوى:</b> 2026م.
        </div>
      </section>

      {/* Mobile sticky result bar */}
      {!showDocument && (
        <div className={`fs-sbar ${barOn ? "" : "off"}`} role="region" aria-label="ملخص النتيجة">
          <div className="fs-sbar-t">
            <span>صافي المخالصة</span>
            <b>{fmt(calc.netSettlement)} ر.س</b>
          </div>
          <button type="button" className="fs-sbar-b" onClick={scrollToResult}>التفاصيل ↓</button>
        </div>
      )}

      {/* Document modal (always black on white for clean print) */}
      {showDocument && (
        <div className="fs-modal" role="dialog" aria-modal="true" aria-label="نموذج مخالصة نهائية">
          <div className="fs-sheet">
            <div className="fs-bar">
              <b style={{ fontSize: 14 }}>نموذج مخالصة نهائية تقديرية</b>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="fs-btn pri" onClick={() => {
                  track("print_download_clicked", { tool: "final-settlement", action: "modal_print_pdf", net_settlement: Math.round(calc.netSettlement) });
                  window.print();
                }}>طباعة / PDF</button>
                <button type="button" className="fs-btn" ref={closeRef} onClick={() => setShowDocument(false)}>إغلاق</button>
              </div>
            </div>

            <div className="fs-paper" id="settlement-document">
              <div style={{ textAlign: "center", borderBottom: "3px solid #0D0D0D", paddingBottom: 16 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>نموذج مخالصة نهائية تقديرية</h2>
                <p style={{ margin: "6px 0 0", fontSize: 13 }}>Estimated Final Employment Settlement Statement</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#55554F" }}>
                  وفق أحكام نظام العمل السعودي الصادر بالمرسوم الملكي رقم (م/51) وتعديلاته 2026
                </p>
              </div>

              <div>
                <h3>بيانات الأطراف وفترة العقد</h3>
                <div className="fs-info">
                  {[
                    ["اسم الموظف", employeeName || "—"],
                    ["جهة العمل / الشركة", employerName || "—"],
                    ["المسمى الوظيفي", position || "—"],
                    ["رقم الهوية / الإقامة", employeeId || "—"],
                    ["تاريخ الالتحاق", joiningDate],
                    ["آخر يوم عمل", lastWorkingDate],
                    ["مدة الخدمة الكاملة", calc.serviceDurationLabel],
                    ["سبب إنهاء الخدمة", reasonLabel],
                  ].map(([l, v]) => (
                    <div key={l}><small>{l}</small><b>{v}</b></div>
                  ))}
                </div>
              </div>

              <div>
                <h3>بيان المستحقات والخصومات التفصيلي</h3>
                <table>
                  <thead><tr><th>البند</th><th>المبلغ (ر.س)</th></tr></thead>
                  <tbody>
                    <DocRow label="1. آخر راتب مستحق (نسبي)" value={fmt(calc.lastMonthPay)} />
                    <DocRow label="2. مكافأة نهاية الخدمة" value={fmt(calc.eosb)} />
                    <DocRow label="3. بدل رصيد الإجازة السنوية" value={fmt(calc.leavePay)} />
                    {calc.noticeAddition > 0 && <DocRow label="4. بدل مهلة الإشعار (لصالح الموظف +)" value={fmt(calc.noticeAddition)} />}
                    {calc.noticePay === 0 && <DocRow label="4. بدل مهلة الإشعار" value="0.00" />}
                    {calc.unpaidSalary > 0 && <DocRow label="رواتب متأخرة غير مصروفة" value={fmt(calc.unpaidSalary)} />}
                    {calc.overtimeAmount > 0 && <DocRow label="بدل أوفر تايم مستحق" value={fmt(calc.overtimeAmount)} />}
                    {calc.bonuses > 0 && <DocRow label="مكافآت ومنح" value={fmt(calc.bonuses)} />}
                    {calc.otherAdditions > 0 && <DocRow label="إضافات أخرى" value={fmt(calc.otherAdditions)} />}
                    <DocRow label="إجمالي المستحقات" value={fmt(calc.grossDues)} cls="g" />
                    {calc.noticeDeduction > 0 && <DocRow label="(−) خصم مهلة الإشعار (لصاحب العمل)" value={`(${fmt(calc.noticeDeduction)})`} />}
                    {calc.loans > 0 && <DocRow label="(−) سلف وقروض مستحقة" value={`(${fmt(calc.loans)})`} />}
                    {calc.companyAssets > 0 && <DocRow label="(−) عهد وأصول شركة" value={`(${fmt(calc.companyAssets)})`} />}
                    {calc.otherDeductions > 0 && <DocRow label="(−) خصومات أخرى" value={`(${fmt(calc.otherDeductions)})`} />}
                  </tbody>
                  <tfoot>
                    <tr><td>صافي المخالصة النهائية المستحقة</td><td>{fmt(calc.netSettlement)} ر.س</td></tr>
                  </tfoot>
                </table>
              </div>

              <div style={{ border: "1px solid #0D0D0D", padding: "10px 14px", fontSize: 12 }}>
                <p style={{ margin: 0 }}><b>أساس الحساب:</b> الأجر الفعلي الإجمالي = {fmt(calc.totalWage)} ر.س/شهر | قاسم الشهر: ÷{calc.divisor} | الأجر اليومي: {fmt(calc.daily)} ر.س</p>
                <p style={{ margin: "4px 0 0" }}><b>مدة الخدمة:</b> {calc.serviceYears.toFixed(3)} سنة ({calc.serviceDurationLabel})</p>
              </div>

              <div>
                <h3>التوقيعات والإقرار</h3>
                <p style={{ fontSize: 12, margin: "0 0 18px" }}>
                  بتوقيع هذا النموذج التقديري، يُقرّ الطرفان باستلام وتسليم جميع المستحقات المبيّنة أعلاه وبراءة كل منهما تجاه الآخر من أي مطالبات عمالية تتعلق بفترة الخدمة المنتهية، ما لم يُنصّ صراحة على خلاف ذلك.
                </p>
                <div className="fs-sig">
                  <div>
                    <b>توقيع الموظف واستلام المبلغ</b>
                    <div className="ln" />
                    <div>{employeeName || "الاسم"}</div>
                    <div>التاريخ: ___________</div>
                  </div>
                  <div>
                    <b>توقيع وختم جهة العمل</b>
                    <div className="ln" />
                    <div>{employerName || "الجهة"}</div>
                    <div>التاريخ: ___________</div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #0D0D0D", paddingTop: 12, textAlign: "center", fontSize: 11 }}>
                <p style={{ margin: 0 }}>تاريخ إصدار النموذج: {calcDate}</p>
                <p style={{ margin: "4px 0" }}>أُنشئت بواسطة حاسبة المخالصة النهائية — منصة الأدوات العربية</p>
                <p style={{ margin: 0, fontWeight: 700 }}>
                  تنبيه قانوني: الحسابات والوثائق الناتجة هي نماذج تقديرية استرشادية مبنية على المدخلات، ولا تُعد مستنداً رسمياً حكومياً أو بديلاً عن السجلات الرسمية لصاحب العمل أو الاستشارة القانونية المتخصصة.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}