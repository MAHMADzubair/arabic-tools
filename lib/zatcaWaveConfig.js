/**
 * lib/zatcaWaveConfig.js
 *
 * Single source of truth for ZATCA Phase 2 e-invoicing wave (group) data.
 * Update ONLY this file when ZATCA announces a new wave.
 *
 * Official source: https://zatca.gov.sa (Fatoora / e-invoicing announcements)
 * Last verified: November 2026 (Wave 25 announced July 24, 2026 by ZATCA)
 *
 * ─── FACTS ───────────────────────────────────────────────────────────────────
 *  Revenue = VAT-taxable revenues as declared in VAT returns.
 *            NOT profit, NOT total gross sales, NOT exempt supplies.
 *  Logic:    strictly greater than (>) — equal to threshold does NOT trigger.
 *  Trigger:  exceeding in ANY ONE of the qualifying years is sufficient.
 *  ZATCA notifies targeted taxpayers at least 6 months before the mandate date,
 *  via the email registered on the ZATCA portal / Fatoora platform.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const ZATCA_FATOORA_URL =
  "https://zatca.gov.sa/en/E-Invoicing/Introduction/Pages/E-Invoicing-Waves.aspx";

export const ZATCA_PORTAL_URL =
  "https://zatca.gov.sa";

/** آخر مراجعة وتحقق من البيانات */
export const WAVE_DATA_LAST_VERIFIED = "نوفمبر 2026";
export const WAVE_DATA_SOURCE = "zatca.gov.sa";

/**
 * WAVES array — ordered from highest threshold to lowest.
 * Each wave object:
 *   id           — string key
 *   number       — display number
 *   nameAr       — full Arabic official name
 *   threshold    — SAR amount (strict >)
 *   qualifyYears — years to check
 *   mandateDate  — ISO date string (the ZATCA-announced mandate date)
 *   mandateDateAr — Arabic formatted display
 *   mandateLabel  — Arabic label for the date ("آخر موعد للربط" vs "تاريخ بدء الربط")
 *   announced    — when ZATCA announced this wave
 */
export const WAVES = [
  {
    id: "wave23",
    number: 23,
    nameAr: "المجموعة الثالثة والعشرون",
    threshold: 750_000,
    thresholdFormatted: "750,000",
    qualifyYears: [2022, 2023, 2024],
    mandateDate: "2026-03-31",
    mandateDateAr: "31 مارس 2026",
    mandateLabel: "كان آخر موعد للربط مع منصة فاتورة",
    announced: "أُعلن عنها رسمياً من هيئة الزكاة والضريبة والجمارك",
    colorClass: "wave-red",
  },
  {
    id: "wave24",
    number: 24,
    nameAr: "المجموعة الرابعة والعشرون",
    threshold: 375_000,
    thresholdFormatted: "375,000",
    qualifyYears: [2022, 2023, 2024],
    mandateDate: "2026-06-30",
    mandateDateAr: "30 يونيو 2026",
    mandateLabel: "كان آخر موعد للربط مع منصة فاتورة",
    announced: "أُعلن عنها رسمياً من هيئة الزكاة والضريبة والجمارك",
    colorClass: "wave-orange",
  },
  {
    id: "wave25",
    number: 25,
    nameAr: "المجموعة الخامسة والعشرون",
    threshold: 187_500,
    thresholdFormatted: "187,500",
    qualifyYears: [2022, 2023, 2024, 2025],
    mandateDate: "2027-02-01",
    mandateDateAr: "1 فبراير 2027",
    mandateLabel: "يبدأ الربط مع منصة فاتورة اعتباراً من",
    announced: "24 يوليو 2026",
    colorClass: "wave-amber",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATION ENGINE (pure functions — no React, no side effects)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a revenue string that may contain:
 *  - Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩)
 *  - Western digits (0-9)
 *  - Commas as thousand separators
 *  - Spaces as thousand separators
 * Returns a non-negative float, or NaN if truly unparseable.
 */
export function parseRevenue(raw) {
  if (raw === null || raw === undefined || raw === "") return null;
  // Replace Arabic-Indic digits with Western equivalents
  const westernised = raw
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[,،٬\s]/g, ""); // strip commas, Arabic comma, Arabic thousands sep, spaces
  if (westernised === "") return null;
  const n = parseFloat(westernised);
  if (isNaN(n) || n < 0) return null;
  return n;
}

/**
 * Format a number with thousands separators for display.
 * Uses Western digits to match the existing UI convention.
 */
export function formatThousands(n) {
  if (n === null || n === undefined) return "";
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/**
 * Core eligibility engine.
 *
 * @param {Object} revenues — { 2022: number|null, 2023: number|null, ... }
 * @param {boolean} isVatRegistered — null = not answered yet
 * @returns {Object} result object (see below)
 *
 * Result shape:
 * {
 *   status: "not_answered" | "not_registered" | "below_all" | "eligible",
 *   waveResults: [
 *     {
 *       wave: WaveObject,
 *       eligible: boolean,
 *       triggerYears: number[],  // which years exceeded threshold
 *       equalYears: number[],    // which years are exactly equal (edge case)
 *     },
 *     ...
 *   ],
 *   earliestWave: WaveObject | null,
 *   earliestWaveTriggerYears: number[],
 *   allEmpty: boolean,
 * }
 */
export function checkEligibility(revenues, isVatRegistered) {
  // Gate 1: VAT registration status not answered
  if (isVatRegistered === null) {
    return { status: "not_answered" };
  }

  // Gate 2: not VAT registered → e-invoicing Phase 2 does not apply
  if (isVatRegistered === false) {
    return { status: "not_registered" };
  }

  // Gate 3: check if all inputs are empty/null
  const allEmpty = WAVES.every((w) =>
    w.qualifyYears.every((yr) => revenues[yr] === null || revenues[yr] === undefined)
  );

  if (allEmpty) {
    return { status: "not_answered", allEmpty: true };
  }

  // Core wave checking
  const waveResults = WAVES.map((wave) => {
    const triggerYears = [];
    const equalYears = [];

    wave.qualifyYears.forEach((yr) => {
      const rev = revenues[yr];
      if (rev === null || rev === undefined) return;
      if (rev > wave.threshold) {
        triggerYears.push(yr);
      } else if (rev === wave.threshold) {
        equalYears.push(yr);
      }
    });

    return {
      wave,
      eligible: triggerYears.length > 0,
      triggerYears,
      equalYears,
    };
  });

  const eligibleWaves = waveResults.filter((r) => r.eligible);

  if (eligibleWaves.length === 0) {
    // Check if any year is exactly equal to any threshold (edge case)
    const anyEqual = waveResults.some((r) => r.equalYears.length > 0);
    return {
      status: "below_all",
      waveResults,
      earliestWave: null,
      earliestWaveTriggerYears: [],
      allEmpty: false,
      anyEqual,
    };
  }

  // Earliest = lowest wave number (highest threshold), which means they should
  // have been covered earliest. For user, we highlight the EARLIEST wave that
  // applies (smallest number = most urgent / already past or soonest).
  const earliestResult = eligibleWaves.reduce((prev, curr) =>
    prev.wave.number < curr.wave.number ? prev : curr
  );

  return {
    status: "eligible",
    waveResults,
    earliestWave: earliestResult.wave,
    earliestWaveTriggerYears: earliestResult.triggerYears,
    allEmpty: false,
    anyEqual: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIT TESTS  (run with: node lib/zatcaWaveConfig.js  or jest)
// ─────────────────────────────────────────────────────────────────────────────

export const UNIT_TESTS = [
  // 1. Below all thresholds — no eligibility
  {
    label: "below all thresholds",
    revenues: { 2022: 100_000, 2023: 50_000, 2024: 80_000, 2025: 90_000 },
    isVatRegistered: true,
    expect: { status: "below_all", earliestWave: null },
  },
  // 2. Exactly equal to Wave 25 threshold — NOT eligible (strict >)
  {
    label: "exactly equal to wave 25 threshold (187,500)",
    revenues: { 2022: 187_500, 2023: null, 2024: null, 2025: null },
    isVatRegistered: true,
    expect: { status: "below_all", anyEqual: true },
  },
  // 3. Just above Wave 25 threshold — eligible for Wave 25 only
  {
    label: "just above wave 25 (187,501)",
    revenues: { 2022: 187_501, 2023: null, 2024: null, 2025: null },
    isVatRegistered: true,
    expect: { status: "eligible", earliestWaveNumber: 25 },
  },
  // 4. Above Wave 24 threshold (375,001) — eligible for Wave 24 AND Wave 25
  {
    label: "above wave 24 threshold triggers both wave 24 and 25",
    revenues: { 2022: 375_001, 2023: null, 2024: null, 2025: null },
    isVatRegistered: true,
    expect: { status: "eligible", earliestWaveNumber: 24 },
  },
  // 5. Above Wave 23 threshold — eligible for Waves 23, 24, and 25
  {
    label: "above wave 23 threshold triggers all three waves",
    revenues: { 2022: 750_001, 2023: null, 2024: null, 2025: null },
    isVatRegistered: true,
    expect: { status: "eligible", earliestWaveNumber: 23 },
  },
  // 6. Only 2025 triggers — eligible for Wave 25 only (not 23/24 which don't include 2025)
  {
    label: "2025-only trigger: only qualifies for wave 25",
    revenues: { 2022: null, 2023: null, 2024: null, 2025: 200_000 },
    isVatRegistered: true,
    expect: { status: "eligible", earliestWaveNumber: 25, only2025Trigger: true },
  },
  // 7. Single year trigger (2023 = 250,000 — above 187,500 but NOT above 375,000) → Wave 25 only
  {
    label: "single year trigger (2023 at 250,000 — wave 25 only)",
    revenues: { 2022: null, 2023: 250_000, 2024: null, 2025: null },
    isVatRegistered: true,
    expect: { status: "eligible", earliestWaveNumber: 25 },
  },
  // 8. All years empty — not answered
  {
    label: "all years empty — not answered",
    revenues: { 2022: null, 2023: null, 2024: null, 2025: null },
    isVatRegistered: true,
    expect: { status: "not_answered", allEmpty: true },
  },
  // 9. Not VAT registered — short circuit
  {
    label: "not VAT registered",
    revenues: { 2022: 500_000, 2023: null, 2024: null, 2025: null },
    isVatRegistered: false,
    expect: { status: "not_registered" },
  },
  // 10. Revenue dropped after trigger year — still eligible (any-year rule)
  {
    label: "revenue dropped after trigger year — still eligible",
    revenues: { 2022: 400_000, 2023: 100_000, 2024: 50_000, 2025: 30_000 },
    isVatRegistered: true,
    expect: { status: "eligible", earliestWaveNumber: 24 },
  },
  // 11. Exactly 750,000 — does NOT trigger Wave 23 (strict >), triggers Wave 24 and 25
  {
    label: "exactly 750,000: not wave 23, triggers wave 24 and 25",
    revenues: { 2022: 750_000, 2023: null, 2024: null, 2025: null },
    isVatRegistered: true,
    expect: {
      status: "eligible",
      earliestWaveNumber: 24,
      wave23NotEligible: true,
      wave24Eligible: true,
      wave25Eligible: true,
    },
  },
  // 12. Exactly 375,000 — does NOT trigger Wave 24 (strict >), triggers Wave 25 only
  {
    label: "exactly 375,000: not wave 24, triggers wave 25 only",
    revenues: { 2022: 375_000, 2023: null, 2024: null, 2025: null },
    isVatRegistered: true,
    expect: {
      status: "eligible",
      earliestWaveNumber: 25,
      wave23NotEligible: true,
      wave24NotEligible: true,
      wave25Eligible: true,
    },
  },
  // 13. 2025-only 400,000 — Wave 25 only (2025 is not eligible for waves 23/24 even though 400k > 375k)
  {
    label: "2025-only 400,000: Wave 25 only",
    revenues: { 2022: null, 2023: null, 2024: null, 2025: 400_000 },
    isVatRegistered: true,
    expect: {
      status: "eligible",
      earliestWaveNumber: 25,
      wave23NotEligible: true,
      wave24NotEligible: true,
      wave25Eligible: true,
    },
  },
  // 14. 2022 = 800,000 — qualifies for all three waves, earliest = Wave 23
  {
    label: "2022 = 800,000: all three waves, earliest is Wave 23",
    revenues: { 2022: 800_000, 2023: null, 2024: null, 2025: null },
    isVatRegistered: true,
    expect: {
      status: "eligible",
      earliestWaveNumber: 23,
      allThreeWaves: true,
    },
  },
  // 15. 2024 = 800,000 — qualifies for all three waves, earliest highlighted = Wave 23
  {
    label: "2024 = 800,000: all three waves, earliest highlighted = Wave 23",
    revenues: { 2022: null, 2023: null, 2024: 800_000, 2025: null },
    isVatRegistered: true,
    expect: {
      status: "eligible",
      earliestWaveNumber: 23,
      allThreeWaves: true,
    },
  },
  // 16. Arabic-Indic digit parsing
  {
    label: "Arabic-Indic digits parse correctly",
    parseTest: { input: "٢٠٠٬٠٠٠", expected: 200_000 },
  },
];

/**
 * Run all unit tests (Node.js self-test mode).
 * Call: node lib/zatcaWaveConfig.js
 */
if (
  typeof process !== "undefined" &&
  process.argv &&
  process.argv[1]?.includes("zatcaWaveConfig")
) {
  let pass = 0;
  let fail = 0;

  UNIT_TESTS.forEach((t, i) => {
    if (t.parseTest) {
      const got = parseRevenue(t.parseTest.input);
      const ok = got === t.parseTest.expected;
      console.log(`${ok ? "✅" : "❌"} [${i + 1}] ${t.label} — parsed ${got} (expected ${t.parseTest.expected})`);
      ok ? pass++ : fail++;
      return;
    }

    const result = checkEligibility(t.revenues, t.isVatRegistered);
    const checks = [];

    if (t.expect.status) checks.push(result.status === t.expect.status);
    if (t.expect.earliestWaveNumber !== undefined)
      checks.push(result.earliestWave?.number === t.expect.earliestWaveNumber);
    if (t.expect.allEmpty !== undefined)
      checks.push(result.allEmpty === t.expect.allEmpty);
    if (t.expect.anyEqual !== undefined)
      checks.push(result.anyEqual === t.expect.anyEqual);
    if (t.expect.only2025Trigger) {
      const w25 = result.waveResults?.find((r) => r.wave.number === 25);
      checks.push(w25?.triggerYears?.includes(2025) === true);
      const w23 = result.waveResults?.find((r) => r.wave.number === 23);
      checks.push(!w23?.eligible);
      const w24 = result.waveResults?.find((r) => r.wave.number === 24);
      checks.push(!w24?.eligible);
    }
    if (t.expect.wave23NotEligible !== undefined) {
      const w23 = result.waveResults?.find((r) => r.wave.number === 23);
      checks.push(w23?.eligible === !t.expect.wave23NotEligible);
    }
    if (t.expect.wave24NotEligible !== undefined) {
      const w24 = result.waveResults?.find((r) => r.wave.number === 24);
      checks.push(w24?.eligible === !t.expect.wave24NotEligible);
    }
    if (t.expect.wave24Eligible !== undefined) {
      const w24 = result.waveResults?.find((r) => r.wave.number === 24);
      checks.push(w24?.eligible === t.expect.wave24Eligible);
    }
    if (t.expect.wave25Eligible !== undefined) {
      const w25 = result.waveResults?.find((r) => r.wave.number === 25);
      checks.push(w25?.eligible === t.expect.wave25Eligible);
    }
    if (t.expect.allThreeWaves) {
      const eligibleCount = result.waveResults?.filter((r) => r.eligible).length;
      checks.push(eligibleCount === 3);
    }

    const ok = checks.every(Boolean);
    console.log(`${ok ? "✅" : "❌"} [${i + 1}] ${t.label}`);
    if (!ok) {
      console.log("  Result:", JSON.stringify(result, null, 2));
      console.log("  Expected:", JSON.stringify(t.expect, null, 2));
    }
    ok ? pass++ : fail++;
  });

  console.log(`\n${pass} passed, ${fail} failed out of ${UNIT_TESTS.length} tests`);
  process.exit(fail > 0 ? 1 : 0);
}
