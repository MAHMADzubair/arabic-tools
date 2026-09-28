/**
 * UAE VAT REGISTRATION CONFIG & DECISION ENGINE
 * FTA rules: mandatory AED 375,000 / voluntary AED 187,500
 * Sources: https://tax.gov.ae/en/services/vat.registration.aspx
 */

export const UAE_VAT_MANDATORY_THRESHOLD = 375000;
export const UAE_VAT_VOLUNTARY_THRESHOLD = 187500;

export const FTA_OFFICIAL_URL = "https://tax.gov.ae/en/services/vat.registration.aspx";
export const FTA_REGISTRATION_URL = "https://tax.gov.ae/en/content/registration.for.vat.aspx";

export const REGISTRATION_STATUS = {
  MANDATORY: "mandatory",
  VOLUNTARY: "voluntary",
  BELOW_THRESHOLD: "below_threshold",
  NON_RESIDENT_SPECIAL: "non_resident_special",
  NON_RESIDENT_NOT_LIABLE: "non_resident_not_liable",
};

export function sanitizeNumber(val) {
  if (val === null || val === undefined || val === "") return 0;
  const cleaned = String(val).replace(/,/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) || num < 0 ? 0 : num;
}

export function formatAED(num) {
  return Number(num || 0).toLocaleString("ar-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatInt(num) {
  return Number(num || 0).toLocaleString("ar-AE", { maximumFractionDigits: 0 });
}

/**
 * Evaluate UAE VAT registration eligibility under FTA rules.
 * Key UAE difference vs Saudi: expected window is 30 DAYS (not 12 months).
 */
export function evaluateUaeVatEligibility({
  isResident = true,
  makesUaeTaxableSupplies = false,
  otherPartyLiable = null,
  prev12MonthSupplies = 0,
  next30DaysSupplies = 0,
  prev12MonthExpenses = 0,
  next30DaysExpenses = 0,
}) {
  const prev12S = sanitizeNumber(prev12MonthSupplies);
  const next30S = sanitizeNumber(next30DaysSupplies);
  const prev12E = sanitizeNumber(prev12MonthExpenses);
  const next30E = sanitizeNumber(next30DaysExpenses);

  // Non-resident branch
  if (!isResident) {
    if (!makesUaeTaxableSupplies) {
      return {
        status: REGISTRATION_STATUS.NON_RESIDENT_NOT_LIABLE,
        titleAr: "غير مطالب بالتسجيل حالياً (غير مقيم)",
        badgeAr: "غير مقيم",
        badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
        isResident: false, makesUaeTaxableSupplies: false, otherPartyLiable: null,
        prev12S, next30S, prev12E, next30E,
        primaryTriggerValue: 0, thresholdCompared: null, difference: null,
        primaryReason: "لا تقوم المنشأة بتوريدات خاضعة داخل الإمارات، لذا لا يترتب عليها التزام بالتسجيل حالياً.",
        detailedExplanation: "في حال تغيّر طبيعة النشاط لاحقاً لتشمل توريدات خاضعة داخل الإمارات، يتعين إعادة التقييم فوراً.",
        thresholdProgressPercent: 0,
      };
    }
    if (otherPartyLiable === true) {
      return {
        status: REGISTRATION_STATUS.NON_RESIDENT_NOT_LIABLE,
        titleAr: "طرف آخر مسؤول عن احتساب الضريبة",
        badgeAr: "غير مقيم — احتساب عكسي",
        badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
        isResident: false, makesUaeTaxableSupplies: true, otherPartyLiable: true,
        prev12S, next30S, prev12E, next30E,
        primaryTriggerValue: 0, thresholdCompared: null, difference: null,
        primaryReason: "بما أن هناك طرفاً آخر في الإمارات مسؤولاً عن احتساب وسداد الضريبة (آلية الاحتساب العكسي)، فلا يلزمك التسجيل المستقل حالياً.",
        detailedExplanation: "إذا كان المشتري مسجلاً لدى FTA وتُطبَّق عليه آلية الاحتساب العكسي، فإنه يتولى الإعلان عن الضريبة وسدادها. يُنصح بمراجعة متخصص ضريبي للتأكد.",
        thresholdProgressPercent: 0,
      };
    }
    // Non-resident + taxable UAE supplies + no/unsure other party
    return {
      status: REGISTRATION_STATUS.NON_RESIDENT_SPECIAL,
      titleAr: "حالة خاصة: قد يكون التسجيل الإلزامي مطلوباً",
      badgeAr: "غير مقيم — تسجيل إلزامي محتمل",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      isResident: false, makesUaeTaxableSupplies: true, otherPartyLiable,
      prev12S, next30S, prev12E, next30E,
      primaryTriggerValue: 0, thresholdCompared: null, difference: null,
      primaryReason: "قد يكون التسجيل الإلزامي مطلوباً بغض النظر عن قيمة التوريدات. لا ينطبق حد الـ 375,000 درهم على غير المقيمين الذين يقومون بتوريدات خاضعة في الإمارات.",
      detailedExplanation: "وفق لوائح FTA، يلتزم الشخص غير المقيم الذي يقدّم توريدات خاضعة داخل الإمارات بالتسجيل فور بدء هذه التوريدات إذا لم يكن هناك طرف آخر مسجل مسؤول عن احتساب الضريبة. يمكن تقديم طلب التسجيل عبر منصة EmaraTax.",
      thresholdProgressPercent: 100,
    };
  }

  // Resident — mandatory check
  const prevExceedsMandatory  = prev12S  > UAE_VAT_MANDATORY_THRESHOLD;
  const next30ExceedsMandatory = next30S > UAE_VAT_MANDATORY_THRESHOLD;

  if (prevExceedsMandatory || next30ExceedsMandatory) {
    let triggeredLabel = "";
    let primaryTriggerValue = 0;
    if (prevExceedsMandatory && next30ExceedsMandatory) {
      triggeredLabel = "التوريدات الفعلية (آخر 12 شهراً) والتوريدات المتوقعة (الـ 30 يوماً القادمة)";
      primaryTriggerValue = Math.max(prev12S, next30S);
    } else if (prevExceedsMandatory) {
      triggeredLabel = "التوريدات الخاضعة والواردات الفعلية خلال آخر 12 شهراً";
      primaryTriggerValue = prev12S;
    } else {
      triggeredLabel = "التوريدات الخاضعة والواردات المتوقعة خلال الـ 30 يوماً القادمة";
      primaryTriggerValue = next30S;
    }
    return {
      status: REGISTRATION_STATUS.MANDATORY,
      titleAr: "التسجيل الإلزامي مطلوب",
      badgeAr: "تسجيل إلزامي",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300 font-extrabold",
      isResident: true, makesUaeTaxableSupplies: true, otherPartyLiable: null,
      prev12S, next30S, prev12E, next30E,
      triggeredLabel, primaryTriggerValue,
      thresholdCompared: UAE_VAT_MANDATORY_THRESHOLD,
      difference: primaryTriggerValue - UAE_VAT_MANDATORY_THRESHOLD,
      prevExceedsMandatory, next30ExceedsMandatory,
      primaryReason: `تجاوزت ${triggeredLabel} حد التسجيل الإلزامي البالغ ${formatAED(UAE_VAT_MANDATORY_THRESHOLD)} درهم.`,
      detailedExplanation: "يلتزم كل شخص مقيم يمارس نشاطاً اقتصادياً بتقديم طلب التسجيل في ضريبة القيمة المضافة لدى الهيئة الاتحادية للضرائب (FTA) فور تجاوز التوريدات الخاضعة للضريبة والواردات حد الـ 375,000 درهم خلال آخر 12 شهراً، أو عند التوقع بتجاوز هذا الحد خلال الـ 30 يوماً القادمة.",
      thresholdProgressPercent: Math.min(100, Math.round((primaryTriggerValue / UAE_VAT_MANDATORY_THRESHOLD) * 100)),
    };
  }

  // Resident — voluntary check
  const prevSuppliesV  = prev12S  > UAE_VAT_VOLUNTARY_THRESHOLD;
  const next30SuppliesV = next30S > UAE_VAT_VOLUNTARY_THRESHOLD;
  const prevExpensesV  = prev12E  > UAE_VAT_VOLUNTARY_THRESHOLD;
  const next30ExpensesV = next30E > UAE_VAT_VOLUNTARY_THRESHOLD;

  if (prevSuppliesV || next30SuppliesV || prevExpensesV || next30ExpensesV) {
    const qualifyingTriggers = [];
    if (prevSuppliesV)   qualifyingTriggers.push(`التوريدات السابقة — ${formatAED(prev12S)} د.إ`);
    if (next30SuppliesV) qualifyingTriggers.push(`التوريدات المتوقعة (30 يوماً) — ${formatAED(next30S)} د.إ`);
    if (prevExpensesV)   qualifyingTriggers.push(`المصروفات الخاضعة السابقة — ${formatAED(prev12E)} د.إ`);
    if (next30ExpensesV) qualifyingTriggers.push(`المصروفات المتوقعة (30 يوماً) — ${formatAED(next30E)} د.إ`);
    const primaryTriggerValue = Math.max(prev12S, next30S, prev12E, next30E);
    return {
      status: REGISTRATION_STATUS.VOLUNTARY,
      titleAr: "مؤهل للتسجيل الاختياري",
      badgeAr: "مؤهل اختيارياً",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300 font-bold",
      isResident: true, makesUaeTaxableSupplies: true, otherPartyLiable: null,
      prev12S, next30S, prev12E, next30E,
      qualifyingTriggers, primaryTriggerValue,
      thresholdCompared: UAE_VAT_VOLUNTARY_THRESHOLD,
      difference: primaryTriggerValue - UAE_VAT_VOLUNTARY_THRESHOLD,
      distanceToMandatory: Math.max(0, UAE_VAT_MANDATORY_THRESHOLD - primaryTriggerValue),
      prevSuppliesV, next30SuppliesV, prevExpensesV, next30ExpensesV,
      primaryReason: `لم تبلغ التوريدات حد الإلزام (375,000 درهم)، غير أن بعض القيم تجاوزت حد التسجيل الاختياري البالغ ${formatAED(UAE_VAT_VOLUNTARY_THRESHOLD)} درهم.`,
      detailedExplanation: "يحق لك التقدم للتسجيل الاختياري في ضريبة القيمة المضافة لدى الهيئة الاتحادية للضرائب (FTA)، مما يُمكّنك من استرداد ضريبة المدخلات على مشترياتك وتكاليفك التشغيلية.",
      thresholdProgressPercent: Math.min(100, Math.round((primaryTriggerValue / UAE_VAT_MANDATORY_THRESHOLD) * 100)),
    };
  }

  // Below both thresholds
  const highestValue = Math.max(prev12S, next30S, prev12E, next30E);
  return {
    status: REGISTRATION_STATUS.BELOW_THRESHOLD,
    titleAr: "غير ملزم بالتسجيل حالياً",
    badgeAr: "دون حد التسجيل",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    isResident: true, makesUaeTaxableSupplies: true, otherPartyLiable: null,
    prev12S, next30S, prev12E, next30E,
    primaryTriggerValue: highestValue,
    thresholdCompared: UAE_VAT_VOLUNTARY_THRESHOLD,
    difference: Math.max(0, UAE_VAT_VOLUNTARY_THRESHOLD - highestValue),
    distanceToMandatory: Math.max(0, UAE_VAT_MANDATORY_THRESHOLD - highestValue),
    primaryReason: "بناءً على البيانات المدخلة حالياً، لم تتجاوز القيم حدود التسجيل الإلزامي أو الاختياري في ضريبة القيمة المضافة.",
    detailedExplanation: "لا تلتزم المنشأة بالتسجيل في الوقت الحالي. يُنصح بمراجعة هذه الحاسبة بشكل دوري خاصةً عند نمو حجم الأعمال.",
    thresholdProgressPercent: Math.min(100, Math.round((highestValue / UAE_VAT_MANDATORY_THRESHOLD) * 100)),
  };
}
