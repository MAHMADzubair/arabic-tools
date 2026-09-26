import { notFound } from "next/navigation";
import {
  COUNTRY_CODES,
  CATEGORIES,
  getCountryById,
  getToolsByCategory,
  getActiveTools,
} from "@/lib/registry";

export function generateStaticParams() {
  return COUNTRY_CODES.map((code) => ({ country: code }));
}

// ─── Country Specific Hub Configuration ───────────────────────────────────────
const COUNTRY_HUBS = {
  sa: {
    heroTitle: "منظومة الأدوات المالية ونظام العمل في السعودية",
    heroSubtitle:
      "الدليل والمجمع الرقمي المتكامل للموظفين وأصحاب الأعمال في المملكة العربية السعودية: حاسبات معتمدة للرواتب، مكافأة نهاية الخدمة، ساعات العمل الإضافي، وضريبة القيمة المضافة وفق أحدث الأنظمة والقرارات الملكية لعام 2026.",
    seoTitle: "أدوات وحاسبات السعودية 2026 | حاسبة الراتب، مكافأة نهاية الخدمة، الأوفر تايم، والضريبة",
    seoDesc:
      "دليل ومجمع الأدوات المالية ونظام العمل في المملكة العربية السعودية 2026: احسب صافي الراتب بعد خصم التأمينات GOSI وساند، مكافأة نهاية الخدمة (م 84 و85)، ساعات العمل الإضافي 150%، وضريبة 15%.",
    stats: [
      { label: "العملة الرسمية", value: "ريال سعودي (SAR)", icon: "🇸🇦" },
      { label: "ضريبة القيمة المضافة", value: "15% (ZATCA)", icon: "🧾" },
      { label: "التأمينات الاجتماعية", value: "GOSI 10% (معاشات وساند)", icon: "🛡️" },
      { label: "نظام العمل والعمال", value: "المرسوم الملكي م/51", icon: "⚖️" },
      { label: "معدل العمل الإضافي", value: "150% (المادة 107)", icon: "⏱️" },
      { label: "منصة توثيق العقود", value: "قوى (Qiwa)", icon: "💼" },
    ],
    primaryTools: [
      {
        id: "salary",
        nameAr: "حاسبة الراتب الصافي في السعودية",
        nameEn: "Saudi Net Salary Calculator",
        icon: "💰",
        badge: "GOSI وساند 10%",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        href: "/salary-calculator/saudi",
        desc: "احسب صافي راتبك المحول للبنك بعد خصم 10% للتأمينات وساند للمواطنين، مع تفصيل بدلات السكن والنقل ومنصة قوى.",
        highlights: [
          "خصم 10% تأمينات وساند للمواطن",
          "حصة المنشأة 11.75% مسددة عنك",
          "سقف أجر الاشتراك 45,000 ريال",
          "0% ضريبة دخل شخصية",
        ],
      },
      {
        id: "gratuity",
        nameAr: "حاسبة مكافأة نهاية الخدمة في السعودية",
        nameEn: "Saudi Gratuity Calculator",
        icon: "🎖️",
        badge: "المادتان 84 و 85 نظام العمل",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        href: "/gratuity-calculator/saudi",
        desc: "احسب مستحقات نهاية الخدمة وفق الأجر الفعلي وحالات انتهاء العقد بفسخ من المنشأة أو استقالة متدرجة أو تقاعد.",
        highlights: [
          "نصف شهر لأول 5 سنوات وشهر كامل بعدها",
          "تطبيق جدول الاستقالة (م/85)",
          "استثناء المرأة العاملة بموجب م/87",
          "مطابقة لاجتهادات المحاكم العمالية",
        ],
      },
      {
        id: "overtime",
        nameAr: "حاسبة العمل الإضافي في السعودية",
        nameEn: "Saudi Overtime Calculator",
        icon: "⏱️",
        badge: "المادة 107 بنسبة 150%",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        href: "/overtime-calculator/saudi",
        desc: "احسب أجر ساعات الأوفر تايم بمعدل أجر الساعة + 50% من الأساسي، واحتساب ساعات العطلات الأسبوعية والأعياد 150% كاملة.",
        highlights: [
          "معدل الساعة الإضافية 1.5 من الأساسي",
          "ساعات العطلات والأعياد 150%",
          "سقف ساعات العمل 720 ساعة سنوياً",
          "مطابقة لمسيرات حماية الأجور",
        ],
      },
      {
        id: "vat",
        nameAr: "حاسبة ضريبة القيمة المضافة 15%",
        nameEn: "Saudi VAT Calculator 15%",
        icon: "🧾",
        badge: "هيئة الزكاة والضريبة ZATCA",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        href: "/vat-calculator/saudi",
        desc: "احسب الضريبة المضافة 15% أو افصل واستخرج السعر الأصلي غير الشامل بالقسمة على 1.15 لجميع فواتير منظومة فاتورة.",
        highlights: [
          "النسبة الأساسية 15% الرسمية",
          "إضافة الضريبة أو استخراجها فوراً",
          "متوافق مع معايير الفوترة الإلكترونية",
          "فصل الإجمالي والضريبة لبيانات الفاتورة",
        ],
      },
    ],
    upcomingTool: {
      tag: "الأداة القادمة — قيد التطوير والإطلاق",
      title: "حاسبة المخالصة النهائية في السعودية (Saudi Final Settlement Calculator)",
      desc: "الأداة الأكثر طلباً في سوق العمل السعودي لتصفية كامل مستحقات العامل عند انتهاء العلاقة العمالية، وتجمع تلقائياً: الراتب المتبقي لأيام الشهر الأخير + مكافأة نهاية الخدمة (م 84/85) + التعويض المالي عن رصيد الإجازات السنوية غير المستنفدة + بدل مهلة الإنذار وخصم السلف والعهد في مسير مخالصة عمالية رسمي معتمد.",
      status: "قريباً جداً في هذا المجمع",
      plannedFeatures: [
        "تصفية شاملة لكسور الشهر الأخير",
        "حساب رصيد الإجازات السنوية المتبقية بالأيام",
        "تسوية مكافأة نهاية الخدمة بالأجر الفعلي",
        "خصم السلف والعهد وإصدار سند المخالصة",
      ],
    },
    guideTitle: "الدليل الشامل للأنظمة المالية وحقوق العمل في المملكة العربية السعودية",
    guideIntro:
      "تتميز بيئة الأعمال في المملكة العربية السعودية بتشريعات عمالية ومالية محكمة تهدف إلى حماية حقوق أطراف الإنتاج وتسهيل ممارسة الأعمال تماشياً مع رؤية السعودية 2030.",
    guidePoints: [
      {
        title: "1. نظام الرواتب والاستقطاعات والتأمينات (GOSI):",
        body: "لا تفرض المملكة أي ضريبة دخل على رواتب الأفراد المواطنين أو المقيمين. الاستقطاع المالي الوحيد من راتب الموظف السعودي هو اشتراك التأمينات الاجتماعية (GOSI) بنسبة 10% (9% للمعاشات التقاعدية + 1% لنظام التأمين ضد التعطل ساند) محسوبة على الراتب الأساسي وبدل السكن بحد أقصى 45 ألف ريال. بينما يتحمل صاحب العمل 11.75% عن السعودي، و2% أخطار مهنية عن المقيم دون أي استقطاع من راتب المقيم.",
      },
      {
        title: "2. مكافأة نهاية الخدمة والأجر الفعلي (المادتان 84 و 85):",
        body: "تُحسب مكافأة نهاية الخدمة في نظام العمل السعودي على 'الأجر الفعلي' الأخير (الأساسي + بدل السكن + بدل النقل). يستحق العامل نصف شهر عن أول 5 سنوات وشهر كامل عن كل سنة تالية. وفي حال الاستقالة، تُطبق نسب المادة (85): لا شيء لأقل من سنتين، ثلث المكافأة من 2 إلى 5 سنوات، ثلثا المكافأة من 5 إلى 10 سنوات، وكامل المكافأة بعد 10 سنوات خدمة.",
      },
      {
        title: "3. العمل الإضافي وساعات التشغيل القصوى (المادة 107):",
        body: "يُلزم نظام العمل المنشأة بدفع أجر الساعة مضافاً إليه 50% من الأجر الأساسي (150%) عن كل ساعة إضافية. كما تُعتبر ساعات العمل المنجزة خلال العطلات الأسبوعية والأعياد الرسمية (كاليوم الوطني ويومي الفطر والأضحى) عملاً إضافياً كاملاً بنسبة 150%. ولا يجوز تشغيل العامل أكثر من 720 ساعة إضافية سنوياً إلا بضوابط استثنائية.",
      },
      {
        title: "4. ضريبة القيمة المضافة ومنظومة الفوترة الإلكترونية (ZATCA):",
        body: "تُطبق المملكة نسبة 15% كضريبة قيمة مضافة قياسية على معظم السلع والخدمات المبيعة. وتلزم هيئة الزكاة والضريبة والجمارك المنشآت بالربط والتكامل عبر منظومة 'فاتورة' وإدراج رمز الاستجابة السريعة (QR Code) وتضمين البيانات الضريبية بدقة.",
      },
    ],
    example: {
      title: "مثال عملي رقمي شامل لموظف في الرياض:",
      scenario: "موظف سعودي براتب أساسي 10,000 ريال، وبدل سكن 2,500 ريال، وبدل نقل 1,000 ريال (إجمالي الراتب 13,500 ريال). أنجز 10 ساعات عمل إضافية عادية في الشهر، ويستعد بعد 4 سنوات لتسوية استقالته:",
      items: [
        { label: "الأجر الخاضع للتأمينات (أساسي + سكن)", value: "12,500.00 ر.س" },
        { label: "خصم التأمينات الاجتماعية (10% GOSI وساند)", value: "- 1,250.00 ر.س" },
        { label: "صافي الراتب الشهري الاعتيادي", value: "12,250.00 ر.س" },
        { label: "أجر الساعة الأساسي (10,000 ÷ 240 ساعة)", value: "41.67 ر.س / ساعة" },
        { label: "بدل العمل الإضافي لـ 10 ساعات (41.67 × 1.5 × 10)", value: "+ 625.00 ر.س" },
        { label: "إجمالي المحول لحسابه البنكي للشهر", value: "12,875.00 ر.س" },
        { label: "الأجر الفعلي لحساب نهاية الخدمة (الراتب كاملاً)", value: "13,500.00 ر.س" },
        { label: "أصل المكافأة عن 4 سنوات (4 × 0.5 × 13,500)", value: "27,000.00 ر.س" },
        { label: "المستحق عند الاستقالة بعد 4 سنوات (الثلث م/85)", value: "9,000.00 ر.س" },
      ],
    },
    faqs: [
      {
        q: "ما هي الاستقطاعات الإلزامية من راتب الموظف في السعودية؟",
        a: "الاستقطاع الإلزامي الوحيد هو اشتراك التأمينات الاجتماعية ونظام ساند بنسبة 10% من (الراتب الأساسي + بدل السكن) للمواطنين السعوديين فقط بحد أقصى 45 ألف ريال لوعاء الاشتراك. لا توجد أي ضريبة دخل على رواتب المواطنين أو المقيمين بالمملكة.",
      },
      {
        q: "كيف تحسب مكافأة نهاية الخدمة إذا استقال الموظف في السعودية؟",
        a: "تخضع الاستقالة للمادة (85) من نظام العمل السعودي: إذا كانت مدة الخدمة أقل من سنتين فلا يستحق مكافأة؛ وإذا كانت بين سنتين و5 سنوات يستحق ثلث المكافأة؛ وإذا كانت بين 5 و10 سنوات يستحق ثلثي المكافأة؛ وإذا بلغت 10 سنوات فأكثر استحق المكافأة كاملة.",
      },
      {
        q: "كيف يُحسب أجر العمل الإضافي وفق المادة (107) في السعودية؟",
        a: "يستحق العامل أجر الساعة مضافاً إليه 50% من أجره الأساسي (أي 150% من أجر الساعة) عن كل ساعة عمل إضافية. كما تُحتسب جميع ساعات العمل المؤداة في أيام العطلات الأسبوعية والأعياد الرسمية بنسبة 150% كاملة.",
      },
      {
        q: "كيف أستخرج السعر قبل الضريبة من فاتورة شاملة لضريبة الـ 15%؟",
        a: "لاستخراج السعر قبل الضريبة، اقسم المبلغ الإجمالي على 1.15. لمعرفة قيمة الضريبة ذاتها، اطرح الناتج من المبلغ الإجمالي أو اضرب السعر غير الشامل في 0.15.",
      },
      {
        q: "ما هي حاسبة المخالصة النهائية وما الفرق بينها وبين حاسبة مكافأة نهاية الخدمة؟",
        a: "حاسبة مكافأة نهاية الخدمة تحسب بند المكافأة فقط، بينما حاسبة المخالصة النهائية تجمع كافة مستحقات تصفية الحساب: كسر راتب الشهر الأخير + مكافأة نهاية الخدمة + المقابل المالي لرصيد الإجازات السنوية غير المستنفدة + بدل مهلة الإنذار مخصوماً منها السلف والعهد في وثيقة تصفية عمالية واحدة.",
      },
    ],
  },

  ae: {
    heroTitle: "منظومة الأدوات المالية وقانون العمل في الإمارات",
    heroSubtitle:
      "المجمع الرقمي المعتمد للأدوات المالية وتشريعات العمل في دولة الإمارات العربية المتحدة: حاسبات دقيقة للرواتب عبر نظام حماية الأجور (WPS)، مكافأة نهاية الخدمة للمرسوم 33 لسنة 2021، ساعات العمل الإضافي، وضريبة القيمة المضافة 5%.",
    seoTitle: "أدوات وحاسبات الإمارات 2026 | حاسبة الراتب، مكافأة نهاية الخدمة، الأوفر تايم، وضريبة 5%",
    seoDesc:
      "دليل ومجمع الأدوات المالية وقانون العمل في دولة الإمارات 2026: احسب صافي الراتب عبر نظام حماية الأجور WPS، مكافأة نهاية الخدمة (قانون 33 م 51)، ساعات العمل الإضافي 125% و150%، وضريبة 5%.",
    stats: [
      { label: "العملة الرسمية", value: "درهم إماراتي (AED)", icon: "🇦🇪" },
      { label: "ضريبة القيمة المضافة", value: "5% قياسية (FTA)", icon: "🧾" },
      { label: "ضريبة دخل الأفراد", value: "0% معفاة تماماً", icon: "🛡️" },
      { label: "قانون العمل الجديد", value: "المرسوم بقانون 33 لسنة 2021", icon: "⚖️" },
      { label: "معدل العمل الإضافي", value: "125% نهاراً / 150% ليلاً", icon: "⏱️" },
      { label: "نظام تحويل الأجور", value: "WPS المعتمد من MOHRE", icon: "💼" },
    ],
    primaryTools: [
      {
        id: "salary",
        nameAr: "حاسبة الراتب الصافي في الإمارات",
        nameEn: "UAE Net Salary Calculator",
        icon: "💰",
        badge: "نظام حماية الأجور WPS",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        href: "/salary-calculator/uae",
        desc: "احسب صافي راتبك الشهري المحول بالدرهم الإماراتي بدون أي ضرائب دخل للأفراد، مع تنظيم بدلات السكن والمواصلات.",
        highlights: [
          "0% ضريبة دخل شخصية للأفراد",
          "متوافق مع مسيرات حماية الأجور WPS",
          "فصل الراتب الأساسي عن البدلات",
          "مطابق لعقود عمل وزارة الموارد البشرية",
        ],
      },
      {
        id: "gratuity",
        nameAr: "حاسبة مكافأة نهاية الخدمة في الإمارات",
        nameEn: "UAE Gratuity Calculator",
        icon: "🎖️",
        badge: "المادة 51 قانون العمل الجديد",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        href: "/gratuity-calculator/uae",
        desc: "احسب مكافأة نهاية الخدمة بالقطاع الخاص الإماراتي بدقة: 21 يوماً عن أول 5 سنوات و30 يوماً بعدها وبدون أي خصم على الاستقالة.",
        highlights: [
          "أجر 21 يوماً عن كل سنة (1 إلى 5)",
          "أجر 30 يوماً عن كل سنة تالية",
          "إلغاء خصومات الاستقالة بالكامل",
          "سقف أقصى لا يتجاوز أجر سنتين",
        ],
      },
      {
        id: "overtime",
        nameAr: "حاسبة العمل الإضافي في الإمارات",
        nameEn: "UAE Overtime Calculator",
        icon: "⏱️",
        badge: "المادة 19 (125% و 150%)",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        href: "/overtime-calculator/uae",
        desc: "احسب أجر ساعات الأوفر تايم النهارية بمعدل 125%، وساعات العمل الليلية أو أيام الراحة الأسبوعية بمعدل 150% بدقة.",
        highlights: [
          "أجر الساعة + 25% للعمل الإضافي النهاري",
          "أجر الساعة + 50% للعمل الليلي (10م - 4ف)",
          "ساعات العطلة الأسبوعية والراحة 150%",
          "الحد الأقصى ساعتان إضافيتان يومياً",
        ],
      },
      {
        id: "vat",
        nameAr: "حاسبة ضريبة القيمة المضافة 5%",
        nameEn: "UAE VAT Calculator 5%",
        icon: "🧾",
        badge: "الهيئة الاتحادية للضرائب FTA",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        href: "/vat-calculator/uae",
        desc: "احسب ضريبة الـ 5% المعتمدة من الهيئة الاتحادية للضرائب، أو استخرج أصل السعر غير الشامل بالقسمة على 1.05 فوراً.",
        highlights: [
          "النسبة القياسية المعتمدة 5%",
          "إضافة الضريبة أو استخراجها بسهولة",
          "مطابقة لاشتراطات الفاتورة الضريبية",
          "توضيح السلع الصفرية والمعفاة",
        ],
      },
    ],
    upcomingTool: {
      tag: "الأداة القادمة — قيد التطوير والإطلاق",
      title: "حاسبة التسوية النهائية وتصفية المستحقات في الإمارات (UAE Final Settlement Calculator)",
      desc: "أداة متقدمة صُممت خصيصاً لسوق العمل الإماراتي تجمع: الراتب المستحق للشهر الأخير + مكافأة نهاية الخدمة المحسوبة بالمادة 51 + بدل رصيد الإجازات السنوية غير المستخدمة المحسوب على الراتب الإجمالي + تذكرة العودة للمغادرين وفق معايير وزارة الموارد البشرية والتوطين (MOHRE).",
      status: "قريباً جداً في هذا المجمع",
      plannedFeatures: [
        "تسوية الراتب الأخير ونظام WPS",
        "حساب المقابل المالي لرصيد الإجازات السنوية",
        "تطبيق سقف السنتين لمكافأة نهاية الخدمة",
        "إصدار نموذج التصفية العمالية النهائي",
      ],
    },
    guideTitle: "دليل تشريعات العمل والضرائب في دولة الإمارات العربية المتحدة",
    guideIntro:
      "تعتبر دولة الإمارات العربية المتحدة بيئة استثمارية وعمالية عالمية جاذبة، تحظى بتشريعات متطورة ومرنة تحفظ حقوق الموظفين وأصحاب الشركات بكفاءة وشفافية مطلقة.",
    guidePoints: [
      {
        title: "1. نظام الرواتب وحماية الأجور (WPS):",
        body: "لا تفرض دولة الإمارات أي ضريبة دخل شخصية على رواتب وأجور الموظفين والعمال في كافة إمارات الدولة والمناطق الحرة. تلزم وزارة الموارد البشرية والتوطين (MOHRE) جميع منشآت القطاع الخاص بتحويل أجور العاملين عبر نظام حماية الأجور (WPS) المصرفي لضمان السداد في المواعيد المقررة وبالمبالغ المسجلة في العقود.",
      },
      {
        title: "2. قانون العمل الجديد (مرسوم بقانون 33 لسنة 2021 والمادة 51):",
        body: "أحدث قانون العمل الإماراتي الجديد نقلة نوعية؛ حيث ألغى الفروقات السابقة بين إنهاء العقد والاستقالة. يستحق الموظف مكافأة نهاية الخدمة كاملة إذا أكمل سنة خدمة مستمرة بمعدل: 21 يوماً عن كل سنة من السنوات الخمس الأولى، و30 يوماً عن كل سنة تالية، محسوبة على الراتب الأساسي فقط، وبشرط ألا يتجاوز إجمالي المكافأة أجر سنتين كاملتين.",
      },
      {
        title: "3. تنظيم ساعات العمل الإضافي (المادة 19):",
        body: "حدد القانون ساعات العمل العادية بـ 8 ساعات يومياً أو 48 أسبوعياً. وفي حال العمل الإضافي، يستحق العامل أجر الساعة + 25% من الراتب الأساسي للساعات النهارية، ويرتفع التعويض إلى أجر الساعة + 50% إذا وقع العمل بين 10 مساءً و4 صباحاً أو في أيام الراحة الأسبوعية والعطل الرسمية.",
      },
      {
        title: "4. ضريبة القيمة المضافة (5% FTA):",
        body: "تُطبق دولة الإمارات ضريبة القيمة المضافة بنسبة 5% كأحد أدنى المعدلات عالمياً، وتخضع معظم التعاملات التجارية والتوريدات لهذه النسبة، مع وجود قطاعات خاضعة للنسبة الصفرية (كالرعاية الصحية والتعليم الأساسي والنقل الدولي) وتوريدات معفاة كالخدمات المالية المحددة.",
      },
    ],
    example: {
      title: "مثال عملي رقمي شامل لموظف في دبي:",
      scenario: "موظف في شركة تجارية بدبي براتب أساسي 12,000 درهم وبدلات 4,000 درهم (إجمالي الراتب 16,000 درهم). أنجز 12 ساعة إضافية نهارية و4 ساعات ليلية خلال الشهر، وبلغت مدة خدمته 6 سنوات متصلة عند انتهاء التعاقد:",
      items: [
        { label: "إجمالي الراتب التعاقدي الشهري", value: "16,000.00 د.إ" },
        { label: "ضريبة الدخل الشخصية المستقطعة", value: "0.00 د.إ (معفى)" },
        { label: "أجر الساعة الأساسي (12,000 ÷ 240)", value: "50.00 د.إ / ساعة" },
        { label: "بدل الساعات النهارية (12 ساعة × 50 × 1.25)", value: "+ 750.00 د.إ" },
        { label: "بدل الساعات الليلية (4 ساعات × 50 × 1.50)", value: "+ 300.00 د.إ" },
        { label: "إجمالي الراتب المحول عبر WPS للشهر", value: "17,050.00 د.إ" },
        { label: "أول 5 سنوات مكافأة (5 × 21 يوماً = 105 أيام)", value: "42,000.00 د.إ (105 × 400)" },
        { label: "السنة السادسة مكافأة (30 يوماً × 400)", value: "12,000.00 د.إ" },
        { label: "إجمالي مكافأة نهاية الخدمة (بدون خصم استقالة)", value: "54,000.00 درهم إماراتي" },
      ],
    },
    faqs: [
      {
        q: "هل توجد ضريبة دخل على الرواتب في دولة الإمارات؟",
        a: "لا، لا تُفرض أي ضريبة دخل على أجور ورواتب الأفراد العاملين في دولة الإمارات سواء كانوا مواطنين أو مقيمين، ويستلم الموظف راتبه كاملاً عبر نظام حماية الأجور (WPS) دون استقطاع ضريبي.",
      },
      {
        q: "هل يتم خصم جزء من مكافأة نهاية الخدمة في حال الاستقالة بالإمارات؟",
        a: "وفقاً للمرسوم بقانون اتحادي رقم 33 لسنة 2021 المعمول به حالياً، تم إلغاء كافة بنود الخصم في حال الاستقالة؛ حيث يستحق العامل مكافأته كاملة طالما أكمل سنة خدمة مستمرة متصلة.",
      },
      {
        q: "كيف تُحسب مكافأة نهاية الخدمة في الإمارات وفق المادة (51)؟",
        a: "تُحسب على الراتب الأساسي الأخير بواقع: أجر 21 يوماً عن كل سنة من السنوات الخمس الأولى، وأجر 30 يوماً عن كل سنة تالية للسنوات الخمس الأولى، مع احتساب كسور السنة بنسبة ما قضي منها بالعمل، وبشرط ألا تتجاوز المكافأة أجر سنتين كاملتين.",
      },
      {
        q: "ما هي النسبة المستحقة لساعات العمل الإضافي في قانون العمل الإماراتي؟",
        a: "يستحق العامل أجر الساعة مضافاً إليه 25% من الأجر الأساسي عن العمل الإضافي النهاري (125%)، وتزيد النسبة إلى 50% (150%) إذا كان العمل الإضافي بين الساعة 10 مساءً و 4 صباحاً أو في أيام الراحة الأسبوعية.",
      },
      {
        q: "كيف تحسب ضريبة القيمة المضافة 5% في الإمارات؟",
        a: "لحساب الضريبة أضف 5% على السعر الأصلي (المبلغ × 0.05). وإذا كان السعر شاملاً الضريبة وتريد استخراج السعر قبل الضريبة، اقسم السعر الإجمالي على 1.05.",
      },
    ],
  },
};

// ─── Metadata ─────────────────────────────────────────────────────────────────
export function generateMetadata({ params }) {
  const country = getCountryById(params.country);
  if (!country) return {};

  const hub = COUNTRY_HUBS[params.country];
  const title = hub ? hub.seoTitle : `أدوات ${country.nameAr} المالية ونظام العمل 2026 | الأدوات العربية`;
  const description = hub ? hub.seoDesc : country.metaDesc;
  const canonical = `https://arabic-tools-xi.vercel.app/ar/${country.code}/`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "الأدوات العربية",
      locale: "ar_AR",
      type: "website",
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function CountryPage({ params }) {
  const country = getCountryById(params.country);
  if (!country) notFound();

  const hub = COUNTRY_HUBS[params.country] || null;
  const allActiveTools = getActiveTools();
  const secondaryTools = allActiveTools.filter(
    (t) =>
      !["salary-calculator", "gratuity-calculator", "overtime-calculator", "vat-calculator"].includes(
        t.id
      ) &&
      (t.category === "finance" || t.category === "islamic" || t.category === "everyday")
  ).slice(0, 6);

  // FAQ Schema JSON-LD
  const faqSchema = hub
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: hub.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      }
    : null;

  // Breadcrumbs Schema JSON-LD
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "الرئيسية",
        item: "https://arabic-tools-xi.vercel.app/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: country.nameAr,
        item: `https://arabic-tools-xi.vercel.app/ar/${country.code}/`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 text-ink pb-20">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero-gradient px-4 py-14 sm:py-20 text-white">
        <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        
        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
            <span className="text-xl">{country.flag}</span>
            <span className="text-white">{country.nameAr}</span>
            <span className="opacity-40">|</span>
            <span className="text-white/80">{country.nameEn}</span>
            <span className="rounded-full bg-emerald-400/30 px-2 py-0.5 text-[10px] text-emerald-200 font-bold">
              تحديث 2026
            </span>
          </div>

          <h1 className="mb-4 text-3xl font-black leading-tight sm:text-5xl">
            {hub ? hub.heroTitle : `الأدوات المالية ونظام العمل لـ ${country.nameAr}`}
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            {hub ? hub.heroSubtitle : country.metaDesc}
          </p>

          {/* Quick Regulatory Facts Strip */}
          {hub && (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 max-w-3xl mx-auto text-right">
              {hub.stats.map((stat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm shadow-sm"
                >
                  <span className="text-xl shrink-0">{stat.icon}</span>
                  <div className="min-w-0">
                    <span className="block text-[11px] text-white/70 font-medium">{stat.label}</span>
                    <span className="block text-xs font-bold text-white truncate">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── GCC Country Switcher Navigation ──────────────────────────────────── */}
      <nav className="sticky top-0 z-30 border-b border-brand-border bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-xs font-bold text-ink-muted shrink-0 pl-1">اختر الدولة:</span>
            {COUNTRY_CODES.map((code) => {
              const c = getCountryById(code);
              const isActive = code === params.country;
              return (
                <a
                  key={code}
                  href={`/ar/${code}/`}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                    isActive
                      ? "border-brand bg-brand text-white shadow-sm"
                      : "border-brand-border bg-white text-ink-secondary hover:border-brand-200 hover:bg-brand-light hover:text-brand"
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.nameAr.split(" ")[0] === "المملكة" ? "السعودية" : c.nameAr.split(" ")[0] === "الإمارات" ? "الإمارات" : c.nameAr}</span>
                </a>
              );
            })}
          </div>

          <a
            href="/"
            className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-bold text-ink-secondary hover:bg-brand-light hover:text-brand transition-colors"
          >
            <span>🌐</span>
            <span>كل الأدوات العامة</span>
          </a>
        </div>
      </nav>

      {/* ─── Main Content Container ───────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 pt-10 space-y-14">

        {/* ─── 1. Featured Core Cluster Tools (4 Priority Tools) ───────────────── */}
        {hub && (
          <section id="core-cluster" className="scroll-mt-20">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-brand-border pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand uppercase tracking-wider mb-1">
                  <span>💎</span>
                  <span>الحزمة الأساسية الأكثر طلباً</span>
                </div>
                <h2 className="text-2xl font-black text-ink">
                  أهم 4 حاسبات مالية وعمالية لـ {country.nameAr}
                </h2>
              </div>
              <p className="text-xs text-ink-muted">
                محدثة بدقة وفق التشريعات الرسمية المعتمدة لعام 2026
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {hub.primaryTools.map((tool) => (
                <a
                  key={tool.id}
                  href={tool.href}
                  className="group relative flex flex-col justify-between rounded-2xl border-2 border-brand-border bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-card-hover"
                >
                  <div>
                    {/* Header Strip */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-2xl shadow-sm group-hover:scale-105 transition-transform">
                          {tool.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-ink group-hover:text-brand transition-colors">
                            {tool.nameAr}
                          </h3>
                          <span className="text-[11px] text-ink-muted font-medium block">
                            {tool.nameEn}
                          </span>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-ink-secondary mb-4">
                      {tool.desc}
                    </p>

                    {/* Bullet Highlights */}
                    <ul className="space-y-1.5 border-t border-brand-border/60 pt-3 text-[11px] text-ink-secondary font-medium">
                      {tool.highlights.map((h, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-brand font-bold">✓</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-brand-border/60 pt-3 text-xs font-bold text-brand group-hover:text-brand-dark">
                    <span>افتح الحاسبة المخصصة الآن</span>
                    <span className="text-base transition-transform group-hover:-translate-x-1">←</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ─── 2. Upcoming Tool Teaser / Next in Cluster ───────────────────────── */}
        {hub?.upcomingTool && (
          <section className="relative overflow-hidden rounded-3xl border-2 border-dashed border-brand/40 bg-gradient-to-br from-brand-light/70 via-white to-amber-50/50 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-bold text-brand">
                  <span>🚀</span>
                  <span>{hub.upcomingTool.tag}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-ink">
                  {hub.upcomingTool.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-ink-secondary">
                  {hub.upcomingTool.desc}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {hub.upcomingTool.plannedFeatures.map((f, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-white border border-brand-border px-2.5 py-1 text-[11px] font-bold text-ink-secondary shadow-xs"
                    >
                      ✨ {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center justify-center rounded-2xl bg-white border border-brand-border p-5 text-center shadow-sm">
                <span className="text-3xl mb-1">📋</span>
                <span className="text-xs font-extrabold text-brand-dark">جاهزية الإطلاق</span>
                <span className="mt-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">
                  {hub.upcomingTool.status}
                </span>
                <span className="mt-2 text-[10px] text-ink-muted">تغطية تشريعية كاملة 100%</span>
              </div>
            </div>
          </section>
        )}

        {/* ─── 3. Secondary Practical Tools for Country Users ─────────────────── */}
        <section id="additional-tools">
          <div className="mb-6 flex items-center justify-between border-b border-brand-border pb-3">
            <div>
              <h3 className="text-xl font-black text-ink">
                أدوات مالية وعملية مساندة لمستخدمي {country.nameAr}
              </h3>
              <p className="text-xs text-ink-muted">
                حاسبات تمويل وقروض وزكاة وتحويل عملات تناسب كافة احتياجاتك اليومية
              </p>
            </div>
            <a href="/" className="text-xs font-bold text-brand hover:underline">
              عرض كل الأدوات ←
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {secondaryTools.map((tool) => (
              <a
                key={tool.id}
                href={tool.href}
                className="group flex items-start gap-3 rounded-xl border border-brand-border bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-xl shadow-xs group-hover:scale-105 transition-transform">
                  {tool.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-ink group-hover:text-brand truncate">
                    {tool.nameAr}
                  </h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-secondary line-clamp-2">
                    {tool.descAr}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ─── 4. Detailed Editorial & Legal Framework Guide ───────────────────── */}
        {hub && (
          <section className="rounded-3xl border border-brand-border bg-white p-6 sm:p-10 shadow-sm space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3 py-1 text-xs font-extrabold text-brand mb-2">
                <span>📚</span>
                <span>الدليل المالي والتنفيذي</span>
              </div>
              <h2 className="text-2xl font-black text-ink sm:text-3xl">
                {hub.guideTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {hub.guideIntro}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {hub.guidePoints.map((point, index) => (
                <div key={index} className="rounded-2xl border border-brand-border/70 bg-brand-surface/40 p-5 space-y-2">
                  <h4 className="text-sm font-extrabold text-brand-dark">
                    {point.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-ink-secondary">
                    {point.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Numerical Example Case */}
            {hub.example && (
              <div className="rounded-2xl border-2 border-brand/20 bg-gradient-to-br from-white to-brand-surface p-6 shadow-xs">
                <div className="mb-4">
                  <span className="rounded-md bg-brand px-2.5 py-1 text-[10px] font-extrabold text-white">
                    حالة تطبيقية واقعية بالأرقام
                  </span>
                  <h3 className="mt-2 text-lg font-black text-ink">
                    {hub.example.title}
                  </h3>
                  <p className="mt-1 text-xs text-ink-secondary">
                    {hub.example.scenario}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {hub.example.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-brand-border/80 bg-white p-3 shadow-2xs flex flex-col justify-between"
                    >
                      <span className="text-[11px] font-semibold text-ink-muted">
                        {item.label}
                      </span>
                      <span className="text-sm font-extrabold text-brand-dark mt-1">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ─── 5. Frequently Asked Questions (FAQ Section) ────────────────────── */}
        {hub && (
          <section id="faqs" className="space-y-6">
            <div className="border-b border-brand-border pb-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand uppercase tracking-wider mb-1">
                <span>❓</span>
                <span>الأسئلة الشائعة والإجابات المعتمدة</span>
              </div>
              <h2 className="text-2xl font-black text-ink">
                أهم الأسئلة الشائعة حول أنظمة العمل والضرائب في {country.nameAr}
              </h2>
            </div>

            <div className="space-y-4">
              {hub.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-brand-border bg-white p-5 shadow-sm transition open:border-brand-300 open:shadow-md cursor-pointer"
                >
                  <summary className="flex items-center justify-between font-bold text-ink text-sm sm:text-base list-none">
                    <span>{faq.q}</span>
                    <span className="text-brand font-black text-lg transition-transform group-open:rotate-45 shrink-0 pr-2">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-ink-secondary border-t border-brand-border/60 pt-3">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ─── 6. General Categorized Tools for GCC ──────────────────────────── */}
        {!hub && (
          <section className="space-y-12">
            {CATEGORIES.map((cat) => {
              const tools = getToolsByCategory(cat.id);
              if (tools.length === 0) return null;
              return (
                <div key={cat.id} id={cat.id} className="scroll-mt-20">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <h3 className="text-xl font-extrabold text-ink">{cat.nameAr}</h3>
                    <div className="h-px flex-1 bg-brand-border" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tools.map((t) => (
                      <a
                        key={t.id}
                        href={t.href}
                        className="rounded-xl border border-brand-border bg-white p-5 shadow-sm transition hover:border-brand hover:shadow-md"
                      >
                        <h4 className="font-bold text-ink">{t.nameAr}</h4>
                        <p className="text-xs text-ink-secondary mt-1">{t.descAr}</p>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}

      </main>
    </div>
  );
}