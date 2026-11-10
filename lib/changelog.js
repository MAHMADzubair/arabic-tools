/**
 * lib/changelog.js
 *
 * Public changelog for /changelog and the "latest update" strip on /contact.
 * Rule: log every change that alters a calculator result, its legal wording or
 * its scope. Do not log design, performance or typo-only changes.
 * Each entry must map to a merged change on main. Newest first.
 */

export const CHANGE_TYPES = {
  legal: { label: "تحديث نظامي", tone: "accent" },
  fix: { label: "تصحيح", tone: "danger" },
};

export const CHANGELOG = [
  {
    id: "sa-overtime-page-copy",
    date: "2026-11-10",
    country: "sa",
    type: "fix",
    title: "حاسبة العمل الإضافي السعودية: تصحيح الشرح والأمثلة",
    summary:
      "كانت صفحة الحاسبة تقول إن الساعة الإضافية تساوي 150% من أجر الساعة الأساسي، وأمثلتها مبنية على الأساسي وحده. الحاسبة نفسها كانت تطبق المادة 107 بشكل صحيح (أجر الساعة الفعلي + 50% من الأساسي) منذ 19 أكتوبر، فصحّحنا النص والأمثلة والأسئلة الشائعة لتطابقها، وصارت خانات الساعات تعرض «أجر فعلي + 50% أساسي» بدل «150%».",
    before: "مثال الصفحة: 16 ساعة × 60 = 960 ريال (على الأساسي فقط)",
    after: "المثال مع بدلات 2,400 ريال: 16 ساعة × 70 = 1,120 ريال",
    who: "كل من قرأ شرح الصفحة وراتبه يشمل بدلات؛ نتيجة الحاسبة لم تتغيّر.",
    source: "نظام العمل — المادة 107",
    href: "/overtime-calculator/saudi",
  },
  {
    id: "uae-sbr-2029",
    date: "2026-11-09",
    country: "ae",
    type: "legal",
    title: "إعفاء الأعمال الصغيرة من ضريبة الشركات صار حتى 2029",
    summary:
      "مدّد القرار الوزاري 131 لسنة 2026 تسهيلات الأعمال الصغيرة ثلاث سنوات. حدّثنا أداة التحقق من الأهلية وكل بطاقة تشير إليها في الموقع، مع بقاء حد الإيرادات 3,000,000 درهم كما هو.",
    before: "الفترات الضريبية المنتهية حتى 31-12-2026",
    after: "الفترات الضريبية المنتهية حتى 31-12-2029",
    action: "إن كنت استبعدت شركتك لأن المدة تنتهي في 2026، أعد التحقق.",
    who: "الشركات المقيمة في الإمارات التي لا تتجاوز إيراداتها 3,000,000 درهم.",
    source: "وزارة المالية — القرار الوزاري 131/2026، والهيئة الاتحادية للضرائب",
    href: "/ar/ae/small-business-relief-checker",
    cta: "تحقق من أهليتك",
  },
  {
    id: "uae-einvoicing-md197-cd173",
    date: "2026-11-09",
    country: "ae",
    type: "legal",
    title: "الفوترة الإلكترونية: قراران جديدان",
    summary:
      "أضفنا القرار الوزاري 197 لسنة 2026، وأهم ما فيه استثناء مؤقت لمدة 24 شهراً للمعاملات بين أعضاء المجموعة الضريبية الواحدة. وأضفنا قرار مجلس الوزراء 173 لسنة 2026 الذي ألغى جدول الغرامات السابق (106 لسنة 2025).",
    before: "جدول غرامات القرار 106/2025",
    after: "القرار 173/2026: 5,000 درهم عند أول مخالفة لعدم تطبيق النظام",
    who: "الشركات الخاضعة لضريبة القيمة المضافة ضمن نطاق B2B وB2G.",
    source: "وزارة المالية — القرار الوزاري 197/2026 وقرار مجلس الوزراء 173/2026",
    href: "/ar/ae/e-invoicing-readiness-checker",
  },
  {
    id: "sa-zatca-wave-25-deadline",
    date: "2026-11-09",
    country: "sa",
    type: "fix",
    title: "الموجة 25 من الفوترة الإلكترونية: صياغة الموعد",
    summary:
      "كانت الأداة تعرض 1 فبراير 2027 كتاريخ «بدء» الربط، والصحيح أنه آخر موعد للربط مع منصة فاتورة. وصار العد التنازلي يُحسب بتوقيت السعودية بدل توقيت جهاز المستخدم.",
    before: "يبدأ الربط اعتباراً من 1 فبراير 2027",
    after: "آخر موعد للربط: 1 فبراير 2027",
    who: "المنشآت التي بلغت إيراداتها الخاضعة للضريبة 187,500 ريال في أي سنة من 2022 إلى 2025.",
    source: "هيئة الزكاة والضريبة والجمارك — إشعار الموجة 25",
    href: "/ar/sa/zatca-wave-checker",
  },
  {
    id: "sa-final-settlement-restored",
    date: "2026-11-04",
    country: "sa",
    type: "fix",
    title: "حاسبة المخالصة النهائية: استعادة الأداة",
    summary:
      "أثناء تحديث تصميم الحاسبات استُبدلت هذه الأداة بالخطأ بحاسبة الإجازة السنوية. أعدناها كما كانت، بمنطق المواد 84 و85 و87 و111 الذي سبق التحقق منه.",
    who: "من فتح الحاسبة في 3 نوفمبر 2026 فظهرت له أداة أخرى؛ أعد الحساب الآن.",
    source: "نظام العمل — وزارة الموارد البشرية والتنمية الاجتماعية",
    href: "/ar/sa/final-settlement-calculator",
  },
  {
    id: "sa-overtime-article-107",
    date: "2026-11-03",
    country: "sa",
    type: "fix",
    title: "دليل أدوات السعودية: شرح المادة 107 للعمل الإضافي",
    summary:
      "كان الدليل يصف أجر الساعة الإضافية بأنه 150% من أجر الساعة الأساسي. والمادة 107 تنص على أجر الساعة الفعلي (مع البدلات) مضافاً إليه 50% من أجر الساعة الأساسي، فصحّحنا الشرح والمثال. (تصحيح لهذا السجل في 10 نوفمبر: كتبنا هنا سابقاً أن حاسبة العمل الإضافي ما زالت تحسب على الأساسي، والصحيح أنها تطبق المادة 107 منذ 19 أكتوبر 2026؛ الخطأ كان في نص صفحتها، وصُحّح في التحديث أعلاه.)",
    before: "مثال الدليل لـ 10 ساعات: 625.00 ريال",
    after: "المثال نفسه بعد التصحيح: 770.83 ريال",
    who: "كل موظف في القطاع الخاص راتبه يشمل بدل سكن أو نقل.",
    source: "نظام العمل — المادة 107",
    href: "/ar/sa",
  },
  {
    id: "uae-notice-article-35",
    date: "2026-11-03",
    country: "ae",
    type: "fix",
    title: "حاسبة فترة الإشعار: الإجازة والاستثناءات",
    summary:
      "أضفنا حكم المادة 35: إذا قُدّم الإشعار أثناء إجازة العامل فلا تبدأ المهلة إلا من اليوم التالي لعودته. ووضّحنا أن الحاسبة لا تشمل الفصل أو ترك العمل دون إنذار وفق المادتين 44 و45.",
    before: "المهلة تبدأ من تاريخ تقديم الإشعار",
    after: "المهلة تبدأ من تاريخ سريان الإشعار",
    who: "من قدّم إشعار الاستقالة أو تلقاه وهو في إجازة.",
    source: "المرسوم بقانون اتحادي 33 لسنة 2021 — وزارة الموارد البشرية والتوطين",
    href: "/ar/ae/notice-period-calculator",
  },
  {
    id: "sa-gosi-2026-rates",
    date: "2026-10-26",
    country: "sa",
    type: "legal",
    title: "حاسبة الراتب: شرح نسب التأمينات في 2026",
    summary:
      "حدّثنا شرح الصفحة ومثالها العملي ليطابقا النسب المطبقة في 2026 على المشتركين الجدد، بعد أن كان المثال مبنياً على موظف من النظام السابق. الحاسبة نفسها كانت تطبق هذه النسب حسب تاريخ الراتب.",
    before: "المثال: موظف على النظام السابق، استقطاع 9%",
    after: "المثال: مشترك جديد، 9.5% حتى يونيو 2026 ثم 10% من يوليو (يضاف ساند 0.75%)",
    who: "الموظفون السعوديون المسجلون في التأمينات وفق النظام الجديد.",
    source: "المؤسسة العامة للتأمينات الاجتماعية",
    href: "/salary-calculator/saudi",
  },
  {
    id: "eg-gratuity-law-14-2025",
    date: "2026-10-26",
    country: "eg",
    type: "legal",
    title: "مكافأة نهاية الخدمة: قانون العمل الجديد",
    summary:
      "نقلنا الحاسبة وشرحها من قانون العمل 12 لسنة 2003 إلى القانون 14 لسنة 2025، وحدّثنا أرقام المواد المذكورة في الصفحة.",
    before: "القانون 12/2003 — المادة 126",
    after: "القانون 14/2025 — المادة 172",
    who: "العاملون في القطاع الخاص المصري.",
    source: "قانون العمل المصري رقم 14 لسنة 2025",
    href: "/gratuity-calculator/egypt",
  },
];

export const COUNTRY_LABELS = { sa: "السعودية", ae: "الإمارات", eg: "مصر" };

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

/** "2026-11-09" → "9 نوفمبر 2026" (Western digits, matching the rest of the site). */
export function formatArabicDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${AR_MONTHS[m - 1]} ${y}`;
}

/** "2026-11" → "نوفمبر 2026" */
export function formatArabicMonth(key) {
  const [y, m] = key.split("-").map(Number);
  return `${AR_MONTHS[m - 1]} ${y}`;
}

export function getLatestChange() {
  return CHANGELOG[0];
}

export function getChangelogStats() {
  const byType = { legal: 0, fix: 0 };
  const byCountry = {};
  for (const e of CHANGELOG) {
    byType[e.type] += 1;
    byCountry[e.country] = (byCountry[e.country] || 0) + 1;
  }
  const oldest = CHANGELOG[CHANGELOG.length - 1].date;
  return { total: CHANGELOG.length, byType, byCountry, since: oldest.slice(0, 7), lastUpdated: CHANGELOG[0].date };
}

/** Groups entries (excluding the featured latest one) by YYYY-MM, newest first. */
export function getChangelogByMonth({ skipLatest = true } = {}) {
  const list = skipLatest ? CHANGELOG.slice(1) : CHANGELOG;
  const groups = [];
  for (const e of list) {
    const key = e.date.slice(0, 7);
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, label: formatArabicMonth(key), entries: [] };
      groups.push(g);
    }
    g.entries.push(e);
  }
  return groups;
}
