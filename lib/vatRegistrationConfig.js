/**
 * ═══════════════════════════════════════════════════════════════
 *  SAUDI VAT REGISTRATION CONFIG & DECISION ENGINE
 *  Official ZATCA rules:
 *  - Mandatory threshold: SAR 375,000
 *  - Voluntary threshold: SAR 187,500
 *  - Non-resident rules: Mandatory if obligated to pay VAT in KSA
 * ═══════════════════════════════════════════════════════════════
 */

export const VAT_MANDATORY_THRESHOLD = 375000;
export const VAT_VOLUNTARY_THRESHOLD = 187500;

export const REGISTRATION_STATUS = {
  MANDATORY: "mandatory",
  VOLUNTARY: "voluntary",
  BELOW_THRESHOLD: "below_threshold",
  NON_RESIDENT_SPECIAL: "non_resident_special",
  NON_RESIDENT_NOT_OBLIGATED: "non_resident_not_obligated",
};

export const ZATCA_OFFICIAL_URL =
  "https://zatca.gov.sa/en/eServices/Pages/eServices-002.aspx";

/**
 * Clean numeric input safely, never returning negative.
 */
export function sanitizeNumber(val) {
  if (val === null || val === undefined || val === "") return 0;
  const cleaned = String(val).replace(/,/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) || num < 0 ? 0 : num;
}

/**
 * Format SAR currency cleanly.
 */
export function formatSAR(num) {
  return Number(num || 0).toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format plain integer with commas for badges/labels.
 */
export function formatInt(num) {
  return Number(num || 0).toLocaleString("ar-SA", {
    maximumFractionDigits: 0,
  });
}

/**
 * Evaluates VAT registration eligibility under Saudi ZATCA regulations.
 *
 * @param {Object} params
 * @param {boolean} params.isResident - Is the entity/person resident in Saudi Arabia?
 * @param {boolean} params.obligatedToPaySaudiVat - If non-resident, is entity obligated for KSA VAT supplies?
 * @param {number|string} params.grossPreviousSupplies - Total supplies during previous 12 months
 * @param {number|string} params.exemptSupplies - Exempt supplies during previous 12 months (Article 29/30)
 * @param {number|string} params.outOfScopeSupplies - Supplies outside scope of VAT
 * @param {number|string} params.capitalAssetSales - Sales of capital assets (excluded from threshold)
 * @param {number|string} params.expectedSupplies - Expected taxable supplies in next 12 months
 * @param {number|string} params.previousTaxableExpenses - Taxable expenses during previous 12 months
 * @param {number|string} params.expectedTaxableExpenses - Expected taxable expenses in next 12 months
 *
 * @returns {Object} Full evaluation results with reasons, numbers, and comparisons
 */
export function evaluateVatEligibility({
  isResident = true,
  obligatedToPaySaudiVat = false,
  grossPreviousSupplies = 0,
  exemptSupplies = 0,
  outOfScopeSupplies = 0,
  capitalAssetSales = 0,
  expectedSupplies = 0,
  previousTaxableExpenses = 0,
  expectedTaxableExpenses = 0,
}) {
  // Sanitize all inputs
  const grossPrev = sanitizeNumber(grossPreviousSupplies);
  const exempt = sanitizeNumber(exemptSupplies);
  const outOfScope = sanitizeNumber(outOfScopeSupplies);
  const capital = sanitizeNumber(capitalAssetSales);

  const expectedTaxableSupplies = sanitizeNumber(expectedSupplies);
  const prevExpenses = sanitizeNumber(previousTaxableExpenses);
  const expExpenses = sanitizeNumber(expectedTaxableExpenses);

  // Total deductions
  const totalExclusions = exempt + outOfScope + capital;

  // Calculated taxable supplies for previous 12 months (never negative)
  const taxablePreviousSupplies = Math.max(0, grossPrev - totalExclusions);

  // Non-resident branch
  if (!isResident) {
    if (obligatedToPaySaudiVat) {
      return {
        status: REGISTRATION_STATUS.NON_RESIDENT_SPECIAL,
        titleAr: "حالة خاصة تحتاج إلى مراجعة (تسجيل غير المقيمين)",
        badgeAr: "غير مقيم — تسجيل إلزامي",
        badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
        isResident: false,
        obligatedToPaySaudiVat: true,
        grossPrev,
        totalExclusions,
        exempt,
        outOfScope,
        capital,
        taxablePreviousSupplies,
        expectedTaxableSupplies,
        prevExpenses,
        expExpenses,
        highestSuppliesValue: Math.max(taxablePreviousSupplies, expectedTaxableSupplies),
        thresholdCompared: null,
        difference: null,
        primaryReason:
          "الأشخاص غير المقيمين في المملكة العربية السعودية الذين يقدمون توريدات خاضعة للضريبة ويكونون ملزمين بسدادها ملزمون بالتسجيل في ضريبة القيمة المضافة بصرف النظر عن حجم التوريدات أو حد الـ 375,000 ريال، إما مباشرة أو بتعيين ممثل ضريبي معتمد لدى الهيئة.",
        detailedExplanation:
          "تنص اللائحة التنفيذية لنظام ضريبة القيمة المضافة في المملكة على أنه لا ينطبق حد التسجيل الإلزامي العام (375,000 ريال) على الأشخاص غير المقيمين؛ فإذا كنت غير مقيم ومطالباً بسداد الضريبة عن توريدات في المملكة لا تخضع لآلية الاحتساب العكسي من قِبل العميل، فيجب عليك التسجيل لدى هيئة الزكاة والضريبة والجمارك (ZATCA).",
        thresholdProgressPercent: 100,
      };
    } else {
      return {
        status: REGISTRATION_STATUS.NON_RESIDENT_NOT_OBLIGATED,
        titleAr: "غير ملزم بالتسجيل حالياً (غير مقيم دون التزام توريد محلي)",
        badgeAr: "غير مقيم",
        badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
        isResident: false,
        obligatedToPaySaudiVat: false,
        grossPrev,
        totalExclusions,
        exempt,
        outOfScope,
        capital,
        taxablePreviousSupplies,
        expectedTaxableSupplies,
        prevExpenses,
        expExpenses,
        highestSuppliesValue: 0,
        thresholdCompared: null,
        difference: null,
        primaryReason:
          "بناءً على إفادتك، المنشأة غير مقيمة في المملكة ولا تقوم بتوريدات تستلزم سداد ضريبة القيمة المضافة محلياً (مثل الحالات التي يُطبق فيها التكليف العكسي للعميل الخاضع للضريبة داخل المملكة).",
        detailedExplanation:
          "إذا لم تكن منشأتك ملزمة بسداد الضريبة عن التوريدات داخل السعودية، فلا يترتب عليك التسجيل في ضريبة القيمة المضافة السعودية حالياً. في حال تغير طبيعة التوريدات مستقبلاً لتشمل مبيعات مباشرة لعملاء غير مسجلين بالمملكة، يجب إعادة التقييم فوراً.",
        thresholdProgressPercent: 0,
      };
    }
  }

  // Resident branch: check mandatory first
  const prevExceedsMandatory = taxablePreviousSupplies > VAT_MANDATORY_THRESHOLD;
  const expExceedsMandatory = expectedTaxableSupplies > VAT_MANDATORY_THRESHOLD;

  if (prevExceedsMandatory || expExceedsMandatory) {
    let triggeredMetricLabel = "";
    let primaryTriggerValue = 0;

    if (prevExceedsMandatory && expExceedsMandatory) {
      triggeredMetricLabel =
        "التوريدات السابقة (آخر 12 شهراً) والتوريدات المتوقعة (الـ 12 شهراً القادمة)";
      primaryTriggerValue = Math.max(taxablePreviousSupplies, expectedTaxableSupplies);
    } else if (prevExceedsMandatory) {
      triggeredMetricLabel = "التوريدات الخاضعة الفعلية خلال آخر 12 شهراً";
      primaryTriggerValue = taxablePreviousSupplies;
    } else {
      triggeredMetricLabel = "التوريدات الخاضعة المتوقعة خلال الـ 12 شهراً القادمة";
      primaryTriggerValue = expectedTaxableSupplies;
    }

    const difference = primaryTriggerValue - VAT_MANDATORY_THRESHOLD;

    return {
      status: REGISTRATION_STATUS.MANDATORY,
      titleAr: "التسجيل الإلزامي مطلوب",
      badgeAr: "تسجيل إلزامي",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300 font-extrabold",
      isResident: true,
      obligatedToPaySaudiVat: false,
      grossPrev,
      totalExclusions,
      exempt,
      outOfScope,
      capital,
      taxablePreviousSupplies,
      expectedTaxableSupplies,
      prevExpenses,
      expExpenses,
      highestSuppliesValue: Math.max(taxablePreviousSupplies, expectedTaxableSupplies),
      thresholdCompared: VAT_MANDATORY_THRESHOLD,
      difference,
      triggeredMetricLabel,
      primaryTriggerValue,
      primaryReason: `تجاوزت ${triggeredMetricLabel} حد التسجيل الإلزامي البالغ ${formatSAR(
        VAT_MANDATORY_THRESHOLD
      )} ريال سعودي.`,
      detailedExplanation: `يلتزم الشخص المقيم الذي يمارس نشاطاً اقتصادياً بتقديم طلب تسجيل لدى هيئة الزكاة والضريبة والجمارك (ZATCA) في موعد أقصاه نهاية الشهر التالي للشهر الذي تجاوزت فيه التوريدات الخاضعة حد الـ 375,000 ريال، أو قبل بدء التوريدات المتوقعة تجاوز هذا الحد.`,
      thresholdProgressPercent: Math.min(
        100,
        Math.round((primaryTriggerValue / VAT_MANDATORY_THRESHOLD) * 100)
      ),
    };
  }

  // Check voluntary threshold
  const prevExceedsVoluntary = taxablePreviousSupplies > VAT_VOLUNTARY_THRESHOLD;
  const expExceedsVoluntary = expectedTaxableSupplies > VAT_VOLUNTARY_THRESHOLD;
  const prevExpensesExceedsVoluntary = prevExpenses > VAT_VOLUNTARY_THRESHOLD;
  const expExpensesExceedsVoluntary = expExpenses > VAT_VOLUNTARY_THRESHOLD;

  if (
    prevExceedsVoluntary ||
    expExceedsVoluntary ||
    prevExpensesExceedsVoluntary ||
    expExpensesExceedsVoluntary
  ) {
    const qualifyingTriggers = [];
    if (prevExceedsVoluntary) {
      qualifyingTriggers.push(`التوريدات السابقة (${formatSAR(taxablePreviousSupplies)} ر.س)`);
    }
    if (expExceedsVoluntary) {
      qualifyingTriggers.push(`التوريدات المتوقعة (${formatSAR(expectedTaxableSupplies)} ر.س)`);
    }
    if (prevExpensesExceedsVoluntary) {
      qualifyingTriggers.push(`المصروفات السابقة (${formatSAR(prevExpenses)} ر.س)`);
    }
    if (expExpensesExceedsVoluntary) {
      qualifyingTriggers.push(`المصروفات المتوقعة (${formatSAR(expExpenses)} ر.س)`);
    }

    const primaryTriggerValue = Math.max(
      taxablePreviousSupplies,
      expectedTaxableSupplies,
      prevExpenses,
      expExpenses
    );
    const differenceAboveVoluntary = primaryTriggerValue - VAT_VOLUNTARY_THRESHOLD;
    const distanceToMandatory = Math.max(0, VAT_MANDATORY_THRESHOLD - primaryTriggerValue);

    return {
      status: REGISTRATION_STATUS.VOLUNTARY,
      titleAr: "مؤهل للتسجيل الاختياري",
      badgeAr: "مؤهل اختيارياً",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300 font-bold",
      isResident: true,
      obligatedToPaySaudiVat: false,
      grossPrev,
      totalExclusions,
      exempt,
      outOfScope,
      capital,
      taxablePreviousSupplies,
      expectedTaxableSupplies,
      prevExpenses,
      expExpenses,
      highestSuppliesValue: Math.max(taxablePreviousSupplies, expectedTaxableSupplies),
      thresholdCompared: VAT_VOLUNTARY_THRESHOLD,
      difference: differenceAboveVoluntary,
      distanceToMandatory,
      primaryTriggerValue,
      qualifyingTriggers,
      primaryReason: `لم تصل التوريدات إلى حد التسجيل الإلزامي (375,000 ريال)، ولكنك تجاوزت حد التسجيل الاختياري البالغ ${formatSAR(
        VAT_VOLUNTARY_THRESHOLD
      )} ريال سعودي.`,
      detailedExplanation: `يحق للمنشأة التي تجاوزت توريداتها الخاضعة أو مصروفاتها الخاضعة للضريبة مبلغ 187,500 ريال التقدم للتسجيل اختيارياً لدى ZATCA، للاستفادة من خصم واسترداد ضريبة المدخلات على المشتريات والمصروفات، وبناء مصداقية مالية مع العملاء من قطاع الأعمال (B2B).`,
      thresholdProgressPercent: Math.min(
        100,
        Math.round((primaryTriggerValue / VAT_MANDATORY_THRESHOLD) * 100)
      ),
    };
  }

  // Below both thresholds
  const highestSupplies = Math.max(taxablePreviousSupplies, expectedTaxableSupplies);
  const highestValue = Math.max(highestSupplies, prevExpenses, expExpenses);
  const distanceToVoluntary = Math.max(0, VAT_VOLUNTARY_THRESHOLD - highestValue);

  return {
    status: REGISTRATION_STATUS.BELOW_THRESHOLD,
    titleAr: "غير ملزم بالتسجيل حالياً",
    badgeAr: "دون حد التسجيل",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    isResident: true,
    obligatedToPaySaudiVat: false,
    grossPrev,
    totalExclusions,
    exempt,
    outOfScope,
    capital,
    taxablePreviousSupplies,
    expectedTaxableSupplies,
    prevExpenses,
    expExpenses,
    highestSuppliesValue: highestSupplies,
    thresholdCompared: VAT_VOLUNTARY_THRESHOLD,
    difference: distanceToVoluntary,
    primaryTriggerValue: highestValue,
    primaryReason:
      "بناءً على البيانات المدخلة حالياً، لم تصل التوريدات أو المصروفات إلى حد التسجيل الاختياري (187,500 ريال) أو الإلزامي (375,000 ريال).",
    detailedExplanation:
      "لا توجد مطالبة نظامية بالتسجيل في ضريبة القيمة المضافة في الوقت الراهن. يوصى بمراقبة حجم التوريدات والمصروفات شهرياً؛ فإذا بلغت أو توقعت بلوغ 187,500 ريال تصبح مؤهلاً للتسجيل الاختياري، وإذا تجاوزت 375,000 ريال تصبح ملزماً بالتسجيل نظاماً.",
    thresholdProgressPercent: Math.min(
      100,
      Math.round((highestValue / VAT_MANDATORY_THRESHOLD) * 100)
    ),
  };
}
