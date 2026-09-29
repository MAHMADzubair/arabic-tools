/**
 * UAE SMALL BUSINESS RELIEF (SBR) CONFIG & DECISION ENGINE
 * Federal Decree-Law No. 47 of 2022 — Corporate Tax
 * Ministerial Decision No. 73 of 2023 on Small Business Relief
 *
 * Key rules:
 *  - Resident persons only
 *  - Revenue <= AED 3,000,000 in current AND all prior relevant tax periods
 *  - NOT a Qualifying Free Zone Person (QFZP)
 *  - NOT a member of an MNE group with global consolidated revenue > AED 3.15B
 *  - Tax period must end on or before 31 December 2026 (current legislative timeframe)
 *
 * Source: https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics.aspx
 */

export const SBR_REVENUE_THRESHOLD      = 3_000_000;        // AED
export const SBR_END_DATE               = "2026-12-31";      // ISO date string
export const MNE_GLOBAL_REVENUE_THRESHOLD = 3_150_000_000;  // AED 3.15 billion

export const FTA_SBR_URL  = "https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics.aspx";
export const FTA_CT_URL   = "https://tax.gov.ae/en/taxes/corporate.tax.aspx";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const PERSON_TYPE = {
  COMPANY:        "company",
  NATURAL_PERSON: "natural_person",
  FREE_ZONE:      "free_zone",
  UNSURE:         "unsure",
};

export const TRI = {
  YES:   "yes",
  NO:    "no",
  UNSURE: "unsure",
};

export const SBR_RESULT = {
  POTENTIALLY_ELIGIBLE: "potentially_eligible",
  NOT_ELIGIBLE:         "not_eligible",
  REVIEW_REQUIRED:      "review_required",
  OUTSIDE_TIME_WINDOW:  "outside_time_window",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function sanitizeNumber(val) {
  if (val === null || val === undefined || val === "") return 0;
  const n = parseFloat(String(val).replace(/,/g, "").trim());
  return isNaN(n) || n < 0 ? 0 : n;
}

export function formatAED(num) {
  return Number(num || 0).toLocaleString("ar-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatAEDInt(num) {
  return Number(num || 0).toLocaleString("ar-AE", { maximumFractionDigits: 0 });
}

/**
 * Returns true if taxPeriodEnd (ISO string "YYYY-MM-DD") is within the SBR window.
 */
export function isWithinSbrWindow(taxPeriodEnd) {
  if (!taxPeriodEnd) return null;
  return taxPeriodEnd <= SBR_END_DATE;
}

// ─── Decision Engine ──────────────────────────────────────────────────────────

/**
 * Evaluates SBR eligibility from all collected inputs.
 *
 * @param {Object} p
 * @param {string}  p.personType          — PERSON_TYPE enum
 * @param {string}  p.residency           — TRI enum
 * @param {string}  p.taxPeriodStart      — "YYYY-MM-DD"
 * @param {string}  p.taxPeriodEnd        — "YYYY-MM-DD"
 * @param {number}  p.currentRevenue      — AED
 * @param {boolean} p.hasPriorPeriods     — true if prior CT periods exist
 * @param {number}  p.highestPriorRevenue — AED (highest across prior periods)
 * @param {string}  p.isQFZP              — TRI enum
 * @param {string}  p.isMNE               — TRI enum ("yes" if in MNE group)
 * @param {number}  p.mneGlobalRevenue    — AED (0 if isMNE !== "yes")
 * @param {string}  p.hasRelatedEntities  — TRI enum
 *
 * @returns {{ result, reasons, checklistItems, warnings }}
 */
export function evaluateSBR({
  personType      = PERSON_TYPE.COMPANY,
  residency       = TRI.YES,
  taxPeriodStart  = "",
  taxPeriodEnd    = "",
  currentRevenue  = 0,
  hasPriorPeriods = false,
  highestPriorRevenue = 0,
  isQFZP          = TRI.NO,
  isMNE           = TRI.NO,
  mneGlobalRevenue = 0,
  hasRelatedEntities = TRI.NO,
}) {
  const curRev    = sanitizeNumber(currentRevenue);
  const priorRev  = sanitizeNumber(highestPriorRevenue);
  const mneRev    = sanitizeNumber(mneGlobalRevenue);

  const reasons  = [];
  const warnings = [];
  let result     = SBR_RESULT.POTENTIALLY_ELIGIBLE;

  // ── 1. Date window check ───────────────────────────────────────────────────
  let periodInWindow = null;
  if (taxPeriodEnd) {
    periodInWindow = taxPeriodEnd <= SBR_END_DATE;
    if (!periodInWindow) {
      reasons.push("الفترة الضريبية المدخلة تنتهي بعد 31 ديسمبر 2026 — خارج النطاق الزمني الحالي للتسهيل.");
      result = SBR_RESULT.OUTSIDE_TIME_WINDOW;
    }
  }

  // ── 2. Residency ───────────────────────────────────────────────────────────
  if (result === SBR_RESULT.POTENTIALLY_ELIGIBLE) {
    if (residency === TRI.NO) {
      reasons.push("تسهيلات الأعمال الصغيرة مخصصة للأشخاص المقيمين — المنشأة غير مقيمة وفق الإجابة المدخلة.");
      result = SBR_RESULT.REVIEW_REQUIRED;
    } else if (residency === TRI.UNSURE) {
      reasons.push("وضع الإقامة لأغراض ضريبة الشركات غير محدد — يتطلب مراجعة إضافية.");
      result = SBR_RESULT.REVIEW_REQUIRED;
    }
  }

  // ── 3. Current period revenue ──────────────────────────────────────────────
  if (result === SBR_RESULT.POTENTIALLY_ELIGIBLE) {
    if (curRev > SBR_REVENUE_THRESHOLD) {
      reasons.push(`تجاوزت إيرادات الفترة الحالية (${formatAED(curRev)} د.إ) حد 3,000,000 درهم.`);
      result = SBR_RESULT.NOT_ELIGIBLE;
    }
  }

  // ── 4. Prior period revenue ────────────────────────────────────────────────
  if (result === SBR_RESULT.POTENTIALLY_ELIGIBLE && hasPriorPeriods) {
    if (priorRev > SBR_REVENUE_THRESHOLD) {
      reasons.push(`تجاوزت إيرادات فترة ضريبية سابقة (${formatAED(priorRev)} د.إ) حد 3,000,000 درهم.`);
      result = SBR_RESULT.NOT_ELIGIBLE;
    }
  }

  // ── 5. QFZP exclusion ─────────────────────────────────────────────────────
  if (result === SBR_RESULT.POTENTIALLY_ELIGIBLE) {
    if (isQFZP === TRI.YES) {
      reasons.push("الأشخاص المؤهلون القائمون في المناطق الحرة (QFZP) غير مؤهلين لاختيار تسهيلات الأعمال الصغيرة.");
      result = SBR_RESULT.NOT_ELIGIBLE;
    } else if (isQFZP === TRI.UNSURE) {
      reasons.push("وضع QFZP غير محدد — يتطلب مراجعة إضافية.");
      result = SBR_RESULT.REVIEW_REQUIRED;
    }
  }

  // ── 6. MNE exclusion ──────────────────────────────────────────────────────
  if (result === SBR_RESULT.POTENTIALLY_ELIGIBLE) {
    if (isMNE === TRI.YES) {
      if (mneRev > MNE_GLOBAL_REVENUE_THRESHOLD) {
        reasons.push(`الإيرادات العالمية الموحدة للمجموعة (${formatAED(mneRev)} د.إ) تتجاوز حد 3.15 مليار درهم.`);
        result = SBR_RESULT.NOT_ELIGIBLE;
      } else if (mneRev === 0) {
        warnings.push("تم اختيار الانتماء لمجموعة متعددة الجنسيات دون إدخال الإيرادات العالمية — يُنصح بإدخال القيمة للتحقق.");
      }
    } else if (isMNE === TRI.UNSURE) {
      reasons.push("وضع الانتماء لمجموعة متعددة الجنسيات غير محدد — يتطلب مراجعة.");
      result = SBR_RESULT.REVIEW_REQUIRED;
    }
  }

  // ── 7. Related entities warning (non-blocking) ────────────────────────────
  if (hasRelatedEntities === TRI.YES) {
    warnings.push("وجود كيانات أو أعمال مرتبطة قد يستدعي مراجعة للتأكد من عدم وجود تجزئة مصطنعة للأعمال.");
  }

  // ── Checklist ──────────────────────────────────────────────────────────────
  const checklistItems = [
    {
      label: "شخص مقيم لأغراض ضريبة الشركات",
      status: residency === TRI.YES ? "pass" : residency === TRI.NO ? "fail" : "warn",
    },
    {
      label: `إيرادات الفترة الحالية ≤ 3,000,000 د.إ`,
      status: curRev === 0 ? "warn" : curRev <= SBR_REVENUE_THRESHOLD ? "pass" : "fail",
    },
    {
      label: `أعلى إيرادات سابقة ≤ 3,000,000 د.إ`,
      status: !hasPriorPeriods ? "pass" : priorRev <= SBR_REVENUE_THRESHOLD ? "pass" : "fail",
      note: !hasPriorPeriods ? "(لا توجد فترات سابقة)" : null,
    },
    {
      label: "ليس شخصاً مؤهلاً في منطقة حرة (QFZP)",
      status: isQFZP === TRI.NO ? "pass" : isQFZP === TRI.YES ? "fail" : "warn",
    },
    {
      label: "ليس ضمن مجموعة MNE مستبعدة",
      status: isMNE === TRI.NO ? "pass" : isMNE === TRI.YES && mneRev > MNE_GLOBAL_REVENUE_THRESHOLD ? "fail" : isMNE === TRI.YES ? "warn" : "warn",
    },
    {
      label: "الفترة الضريبية تنتهي في أو قبل 31 ديسمبر 2026",
      status: periodInWindow === null ? "warn" : periodInWindow ? "pass" : "fail",
    },
  ];

  return { result, reasons, warnings, checklistItems, curRev, priorRev, mneRev, periodInWindow };
}
