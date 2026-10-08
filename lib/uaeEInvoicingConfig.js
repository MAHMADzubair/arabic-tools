/**
 * UAE E-INVOICING READINESS & COMPLIANCE CONFIGURATION
 *
 * Governing Framework:
 * - UAE Ministry of Finance (MoF) & Federal Tax Authority (FTA)
 * - Ministerial Decision No. 244 of 2025 and its official amendments (extending AED 50M+ ASP deadline to 30 October 2026)
 * - Peppol Interoperability Framework & PINT-AE (Peppol International Invoice - UAE Extension)
 *
 * Last Regulatory Review: October 2026
 *
 * Official Portals:
 * - MoF eInvoicing Portal (EN): https://mof.gov.ae/en/about-us/initiatives/einvoicing/
 * - MoF eInvoicing Portal (AR): https://mof.gov.ae/ar/about-us/initiatives/einvoicing/
 * - Official ASPs Directory:   https://mof.gov.ae/en/about-us/initiatives/einvoicing/einvoicing-accredited-service-providers-asps/
 * - FTA Portal:                 https://tax.gov.ae
 */

// ─── Regulatory Thresholds & Dates ──────────────────────────────────────────

export const REVENUE_THRESHOLD_LARGE_BUSINESS = 50_000_000; // 50M AED

export const REGULATORY_SCHEDULE = {
  // Phase 1: Large Private Businesses (Revenue >= 50M AED)
  phase1_large: {
    id: "phase1_large",
    nameAr: "المنشآت الخاصة الكبرى (إيرادات ≥ 50 مليون درهم)",
    nameEn: "Phase 1: Large Businesses (>= 50M AED)",
    revenueThreshold: REVENUE_THRESHOLD_LARGE_BUSINESS,
    aspDeadline: "2026-10-30", // Amended from 31 July 2026
    aspDeadlineAr: "30 أكتوبر 2026",
    implementationDeadline: "2027-01-01",
    implementationDeadlineAr: "1 يناير 2027",
    notesAr: "تم تمديد موعد تعيين مزود الخدمة المعتمد (ASP) لهذه الفئة بقرار رسمي إلى 30 أكتوبر 2026.",
  },

  // Phase 2: Smaller Private Businesses (Revenue < 50M AED)
  phase2_small: {
    id: "phase2_small",
    nameAr: "المنشآت الخاصة (إيرادات أقل من 50 مليون درهم)",
    nameEn: "Phase 2: Smaller Businesses (< 50M AED)",
    revenueThreshold: 0,
    aspDeadline: "2027-03-31",
    aspDeadlineAr: "31 مارس 2027",
    implementationDeadline: "2027-07-01",
    implementationDeadlineAr: "1 يوليو 2027",
    notesAr: "موعد الإلزام الكامل يبدأ في 1 يوليو 2027 مع وجوب اختيار مزود ASP قبل نهاية مارس 2027.",
  },

  // Government Entities
  government: {
    id: "government",
    nameAr: "الجهات الحكومية",
    nameEn: "Government Entities",
    aspDeadline: "2027-03-31",
    aspDeadlineAr: "31 مارس 2027",
    implementationDeadline: "2027-10-01",
    implementationDeadlineAr: "1 أكتوبر 2027",
    notesAr: "تسري المواعيد على المعاملات الحكومية (B2G و G2B و G2G).",
  },

  // B2C Scope
  b2c_scope: {
    id: "b2c_scope",
    nameAr: "المعاملات مع المستهلكين الأفراد (B2C)",
    nameEn: "Business-to-Consumer (B2C)",
    inMandatoryScope: false,
    notesAr: "المعاملات مع المستهلكين الأفراد (B2C) تقع حالياً خارج النطاق الإلزامي لمنظومة الفوترة الإلكترونية حتى يصدر قرار وزاري يحدد خلاف ذلك. قد تتغير المتطلبات مستقبلاً بقرار من الوزير.",
  },
};

// ─── Official URLs ───────────────────────────────────────────────────────────

export const MOF_EINVOICING_URL_EN = "https://mof.gov.ae/en/about-us/initiatives/einvoicing/";
export const MOF_EINVOICING_URL_AR = "https://mof.gov.ae/ar/about-us/initiatives/einvoicing/";
export const MOF_ASP_DIRECTORY_URL = "https://mof.gov.ae/en/about-us/initiatives/einvoicing/einvoicing-accredited-service-providers-asps/";
export const FTA_PORTAL_URL        = "https://tax.gov.ae";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const BUSINESS_TYPE = {
  PRIVATE: "private",
  GOVERNMENT: "government",
};

export const TRANSACTION_TYPE = {
  B2B: "b2b", // Business to Business
  B2G: "b2g", // Business to Government
  B2C: "b2c", // Business to Consumer
};

export const CURRENT_SYSTEM = {
  ERP: "erp",             // Enterprise ERP / Advanced accounting (SAP, Oracle, Odoo, Zoho, etc.)
  CLOUD: "cloud",         // Cloud invoicing software
  EXCEL: "excel",         // Excel spreadsheets / manual ledgers
  WORD_PDF: "word_pdf",   // Fixed PDF / Word templates
  OTHER: "other",
};

export const ASP_STATUS = {
  YES: "yes",
  NO: "no",
  UNSURE: "unsure",
};

export const ANSWER_LEVEL = {
  YES: "yes",
  PARTIAL: "partial",
  NO: "no",
  UNSURE: "unsure",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function sanitizeNumber(val) {
  if (val === null || val === undefined || val === "") return 0;
  const n = parseFloat(String(val).replace(/,/g, "").trim());
  return isNaN(n) || n < 0 ? 0 : n;
}

export function formatAED(num) {
  return Number(num || 0).toLocaleString("ar-AE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatAEDInt(num) {
  return Number(num || 0).toLocaleString("ar-AE", { maximumFractionDigits: 0 });
}

/**
 * Calculates countdown client/server-safely against target ISO date (YYYY-MM-DD).
 * Never returns negative days.
 *
 * @param {string} targetDateStr - e.g. "2026-10-30"
 * @param {Date} [currentDate] - optional date override for testing
 * @returns {{ passed: boolean, days: number, labelAr: string }}
 */
export function getDaysRemaining(targetDateStr, currentDate = null) {
  if (!targetDateStr) {
    return { passed: false, days: 0, labelAr: "غير محدد" };
  }

  const now = currentDate ? new Date(currentDate) : new Date();
  const target = new Date(`${targetDateStr}T23:59:59`);

  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { passed: true, days: 0, labelAr: "انتهى الموعد المحدد" };
  }

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return {
    passed: false,
    days,
    labelAr: `${days} يوماً متبقية`,
  };
}

// ─── Decision & Readiness Engine ─────────────────────────────────────────────

/**
 * Evaluates UAE E-Invoicing regulatory timeline and operational readiness.
 *
 * Deterministic separation:
 * A) REGULATORY TIMELINE & SCOPE
 * B) OPERATIONAL READINESS SCORE (0-100)
 */
export function evaluateEInvoicingReadiness({
  businessType = BUSINESS_TYPE.PRIVATE,
  revenue = 0,
  transactionTypes = [TRANSACTION_TYPE.B2B],
  currentSystem = CURRENT_SYSTEM.ERP,
  aspStatus = ASP_STATUS.NO,
  apiIntegration = ANSWER_LEVEL.NO,
  partyDataUpdated = ANSWER_LEVEL.NO,
  taxDataUpdated = ANSWER_LEVEL.NO,
  structuredInvoiceCapability = ANSWER_LEVEL.NO,
  aspContacted = ANSWER_LEVEL.NO,
  integrationTesting = ANSWER_LEVEL.NO,
  currentDate = null,
}) {
  const rev = sanitizeNumber(revenue);
  const types = Array.isArray(transactionTypes) ? transactionTypes : [transactionTypes];

  const hasB2B = types.includes(TRANSACTION_TYPE.B2B);
  const hasB2G = types.includes(TRANSACTION_TYPE.B2G);
  const hasB2C = types.includes(TRANSACTION_TYPE.B2C);
  const onlyB2C = hasB2C && !hasB2B && !hasB2G;

  // ─────────────────────────────────────────────────────────────────────────────
  // A) REGULATORY TIMELINE & SCOPE
  // ─────────────────────────────────────────────────────────────────────────────
  let timeline = null;
  let categoryLabelAr = "";
  let inScope = true;
  let scopeNoteAr = "";

  if (businessType === BUSINESS_TYPE.GOVERNMENT) {
    timeline = REGULATORY_SCHEDULE.government;
    categoryLabelAr = "جهة حكومية";
    scopeNoteAr = "تخضع المعاملات مع الجهات الحكومية (B2G و G2B و G2G) لجدول الجهات الحكومية المخصص.";
  } else if (onlyB2C) {
    timeline = REGULATORY_SCHEDULE.b2c_scope;
    categoryLabelAr = "منشأة بمعاملات موجهة للمستهلكين الأفراد (B2C) فقط";
    inScope = false;
    scopeNoteAr = "المعاملات مع المستهلكين الأفراد (B2C) تقع حالياً خارج النطاق الإلزامي لمنظومة الفوترة الإلكترونية حتى يصدر قرار وزاري يحدد خلاف ذلك. قد تتغير المتطلبات مستقبلاً بقرار من الوزير.";
  } else if (rev >= REVENUE_THRESHOLD_LARGE_BUSINESS) {
    timeline = REGULATORY_SCHEDULE.phase1_large;
    categoryLabelAr = "منشأة خاصة بإيرادات 50 مليون درهم أو أكثر (المرحلة الأولى)";
    if (hasB2C) {
      scopeNoteAr = "تنطبق المواعيد الإلزامية على معاملات المنشأة مع الشركات (B2B) والجهات الحكومية (B2G)، بينما تبقى معاملات B2C خارج النطاق الإلزامي حالياً.";
    } else {
      scopeNoteAr = "تخضع المنشأة لمتطلبات المرحلة الأولى استناداً لإيراداتها السنوية ونوع تعاملاتها.";
    }
  } else {
    timeline = REGULATORY_SCHEDULE.phase2_small;
    categoryLabelAr = "منشأة خاصة بإيرادات أقل من 50 مليون درهم (المرحلة الثانية)";
    if (hasB2C) {
      scopeNoteAr = "تنطبق المواعيد الإلزامية على معاملات المنشأة مع الشركات (B2B) والجهات الحكومية (B2G)، بينما تبقى معاملات B2C خارج النطاق الإلزامي حالياً.";
    } else {
      scopeNoteAr = "تخضع المنشأة لمتطلبات المرحلة الثانية المقررة لعموم المنشآت الخاضعة.";
    }
  }

  // Countdowns
  const aspCountdown = timeline?.aspDeadline
    ? getDaysRemaining(timeline.aspDeadline, currentDate)
    : null;

  const implementationCountdown = timeline?.implementationDeadline
    ? getDaysRemaining(timeline.implementationDeadline, currentDate)
    : null;

  // ─────────────────────────────────────────────────────────────────────────────
  // B) OPERATIONAL READINESS SCORE (0–100)
  // Transparent category breakdown:
  // 1. ASP Readiness: 25 pts
  // 2. System & Integration: 25 pts
  // 3. Structured Data Capability: 20 pts
  // 4. Tax & Master Data: 15 pts
  // 5. Testing & Operations: 15 pts
  // ─────────────────────────────────────────────────────────────────────────────

  // 1. ASP Readiness (25%)
  let aspScore = 0;
  if (aspStatus === ASP_STATUS.YES) {
    aspScore += 20;
    if (aspContacted === ANSWER_LEVEL.YES) aspScore += 5;
    else if (aspContacted === ANSWER_LEVEL.PARTIAL) aspScore += 2.5;
  } else if (aspStatus === ASP_STATUS.UNSURE) {
    aspScore += 5;
    if (aspContacted === ANSWER_LEVEL.YES) aspScore += 5;
    else if (aspContacted === ANSWER_LEVEL.PARTIAL) aspScore += 2.5;
  } else {
    // aspStatus === NO
    if (aspContacted === ANSWER_LEVEL.YES) aspScore += 7;
    else if (aspContacted === ANSWER_LEVEL.PARTIAL) aspScore += 3.5;
  }
  aspScore = Math.min(25, aspScore);

  // 2. System & Integration Readiness (25%)
  let systemScore = 0;
  if (currentSystem === CURRENT_SYSTEM.ERP) systemScore += 10;
  else if (currentSystem === CURRENT_SYSTEM.CLOUD) systemScore += 8;
  else if (currentSystem === CURRENT_SYSTEM.OTHER) systemScore += 4;
  // EXCEL and WORD_PDF get 0 for system capability

  if (apiIntegration === ANSWER_LEVEL.YES) systemScore += 15;
  else if (apiIntegration === ANSWER_LEVEL.PARTIAL) systemScore += 8;
  systemScore = Math.min(25, systemScore);

  // 3. Invoice & Structured Data Readiness (20%)
  let dataStructureScore = 0;
  if (structuredInvoiceCapability === ANSWER_LEVEL.YES) dataStructureScore += 15;
  else if (structuredInvoiceCapability === ANSWER_LEVEL.PARTIAL) dataStructureScore += 8;

  // Bonus for modern system capable of structured exports
  if (currentSystem === CURRENT_SYSTEM.ERP || currentSystem === CURRENT_SYSTEM.CLOUD) {
    dataStructureScore += 5;
  }
  dataStructureScore = Math.min(20, dataStructureScore);

  // 4. Tax & Master Data (15%)
  let masterDataScore = 0;
  if (partyDataUpdated === ANSWER_LEVEL.YES) masterDataScore += 7.5;
  else if (partyDataUpdated === ANSWER_LEVEL.PARTIAL) masterDataScore += 4;

  if (taxDataUpdated === ANSWER_LEVEL.YES) masterDataScore += 7.5;
  else if (taxDataUpdated === ANSWER_LEVEL.PARTIAL) masterDataScore += 4;
  masterDataScore = Math.min(15, masterDataScore);

  // 5. Testing & Operations (15%)
  let testingScore = 0;
  if (integrationTesting === ANSWER_LEVEL.YES) testingScore += 15;
  else if (integrationTesting === ANSWER_LEVEL.PARTIAL) testingScore += 8;
  testingScore = Math.min(15, testingScore);

  // Total Score (0 - 100)
  const totalScore = Math.round(
    aspScore + systemScore + dataStructureScore + masterDataScore + testingScore
  );

  // Score Bands:
  // 0–39: جاهزية منخفضة
  // 40–69: جاهزية متوسطة
  // 70–89: جاهزية جيدة
  // 90–100: جاهزية متقدمة (Never "Fully legally compliant", use "مستوى جاهزية تشغيلي مرتفع")
  let bandLabelAr = "";
  let bandColorClass = "";
  if (totalScore >= 90) {
    bandLabelAr = "مستوى جاهزية تشغيلي مرتفع";
    bandColorClass = "text-emerald-600 bg-emerald-50 border-emerald-200";
  } else if (totalScore >= 70) {
    bandLabelAr = "جاهزية جيدة";
    bandColorClass = "text-blue-600 bg-blue-50 border-blue-200";
  } else if (totalScore >= 40) {
    bandLabelAr = "جاهزية متوسطة";
    bandColorClass = "text-amber-600 bg-amber-50 border-amber-200";
  } else {
    bandLabelAr = "جاهزية منخفضة";
    bandColorClass = "text-rose-600 bg-rose-50 border-rose-200";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTION CHECKLIST GENERATOR
  // ─────────────────────────────────────────────────────────────────────────────
  const actionPlan = [];

  if (aspStatus !== ASP_STATUS.YES) {
    actionPlan.push({
      priority: "high",
      title: "اختيار والتعاقد مع مزود خدمة معتمد (ASP)",
      description:
        "يجب على المنشأة مراجعة قائمة مزودي الخدمات المعتمدين المنشورة لدى وزارة المالية واختيار مزود معتمد يتوافق مع طبيعة برنامجك المحاسبي لتمرير الفواتير عبر شبكة Peppol.",
      linkText: "استعراض قائمة مزودي الخدمات المعتمدين (وزارة المالية)",
      linkUrl: MOF_ASP_DIRECTORY_URL,
    });
  }

  if (currentSystem === CURRENT_SYSTEM.WORD_PDF || currentSystem === CURRENT_SYSTEM.EXCEL) {
    actionPlan.push({
      priority: "critical",
      title: "الانتقال الفوري إلى نظام فوترة رقمي مؤهل",
      description:
        "ملفات PDF وWord والبريد الإلكتروني والجداول اليدوية لا تُعد فواتير إلكترونية بموجب المنظومة الإماراتية الرسمية. يجب اعتماد نظام ERP أو برنامج محاسبي قادر على توليد بيانات منظمة متوافقة.",
    });
  }

  if (structuredInvoiceCapability !== ANSWER_LEVEL.YES) {
    actionPlan.push({
      priority: "high",
      title: "تجهيز توليد الفواتير بصيغة بيانات منظمة (PINT-AE / XML)",
      description:
        "تشترط المنظومة إصدار الفواتير بتنسيق XML مهيكل وفق مواصفة PINT-AE المعيارية لدولة الإمارات، والتنسيق مع مزود الـ ASP لضمان توافق الحقول الإلزامية.",
    });
  }

  if (partyDataUpdated !== ANSWER_LEVEL.YES) {
    actionPlan.push({
      priority: "medium",
      title: "تنقية وتحديث السجلات الأساسية للعملاء والموردين",
      description:
        "مراجعة وتحديث الأسماء القانونية، العناوين، والأرقام الضريبية (TRN) للشركاء التجاريين لضمان عدم رفض الفواتير عند التحقق الآلي في المنظومة.",
    });
  }

  if (taxDataUpdated !== ANSWER_LEVEL.YES) {
    actionPlan.push({
      priority: "medium",
      title: "مطابقة وتدقيق البيانات الضريبية للمنشأة",
      description:
        "التأكد من تسجيل الرقم الضريبي (TRN) الصحيح وبيانات التسجيل الضريبي المعتمدة لدى الهيئة الاتحادية للضرائب داخل إعدادات الفوترة.",
    });
  }

  if (apiIntegration !== ANSWER_LEVEL.YES) {
    actionPlan.push({
      priority: "medium",
      title: "بناء واجهات الربط البرمجي (API)",
      description:
        "التعاون مع الفريق التقني أو مزود النظام المحاسبي لتجهيز التكامل البرمجي التلقائي مع مزود الـ ASP لإرسال واستقبال الفواتير دون تدخل يدوي.",
    });
  }

  if (integrationTesting !== ANSWER_LEVEL.YES) {
    actionPlan.push({
      priority: "medium",
      title: "بدء اختبارات الربط والتكامل (Testing / Sandbox)",
      description:
        "إجراء اختبارات شاملة لإرسال واستلام نماذج الفواتير الإلكترونية في البيئة التجريبية للـ ASP قبل الموعد الإلزامي لتفادي أي تعطل تشغيلي.",
    });
  }

  // If user has high score and all completed:
  if (actionPlan.length === 0) {
    actionPlan.push({
      priority: "low",
      title: "المحافظة على الجاهزية ومراقبة التحديثات التنظيمية",
      description:
        "استمر في مراقبة النشرات والتعاميم الصادرة عن وزارة المالية والهيئة الاتحادية للضرائب لضمان التوافق مع أي تحسينات في مواصفة PINT-AE.",
      linkText: "بوابة الفوترة الإلكترونية — وزارة المالية",
      linkUrl: MOF_EINVOICING_URL_AR,
    });
  }

  return {
    timeline,
    categoryLabelAr,
    inScope,
    scopeNoteAr,
    aspCountdown,
    implementationCountdown,
    scores: {
      total: totalScore,
      asp: Math.round(aspScore),
      system: Math.round(systemScore),
      dataStructure: Math.round(dataStructureScore),
      masterData: Math.round(masterDataScore),
      testing: Math.round(testingScore),
    },
    bandLabelAr,
    bandColorClass,
    actionPlan,
  };
}
