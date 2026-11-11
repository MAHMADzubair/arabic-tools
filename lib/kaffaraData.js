/**
 * lib/kaffaraData.js — kaffara/fidya rules and per-country meal values.
 * Shared by the calculator (client) and the page's reference table (server).
 */
// Types of Kaffarah and Fidya
export const kaffaraTypes = [
  {
    id: "fasting_fidya",
    icon: "moon",
    title: "فدية الصيام (عجز دائم أو مرض)",
    shortDesc: "إطعام مسكين واحد عن كل يوم أفطره المريض المزمن أو الشيخ الكبير.",
    ruleType: "taam_per_day", // 1 مسكين لكل يوم
    personsPerUnit: 1,
    unitLabel: "عدد أيام الإفطار",
    defaultUnits: 30,
    rulingNote: "تجب على من عجز عن الصيام عجزاً كلياً مستمراً لكبر سن أو مرض لا يُرجى برؤه.",
    extraNote: "من كان مرضه يُرجى شفاؤه، أو كان مسافراً، أو حاملاً أو مرضعاً قادرة على الصيام بعد زوال العذر، فعليه القضاء ولا تجزئ الفدية عنه.",
    fastingAlternative: null, // لا صيام عليه لأنه عاجز أصلاً
  },
  {
    id: "yameen_kaffara",
    icon: "scale",
    title: "كفارة اليمين المنعقدة",
    shortDesc: "إطعام 10 مساكين أو كسوتهم، ومن عجز صام 3 أيام.",
    ruleType: "fixed_persons",
    personsPerUnit: 10,
    unitLabel: "عدد الأيمان المنكوث بها",
    defaultUnits: 1,
    rulingNote: "كفارة مخيرة: إطعام 10 مساكين أو كسوتهم، فإن عجز تماماً صام 3 أيام.",
    extraNote: "الحاسبة تحسب الإطعام فقط. إن اخترت الكسوة فاحسب كسوة كل مسكين بما يجزئه في الصلاة.",
    fastingAlternative: "صيام 3 أيام عند العجز المالي التام",
  },
  {
    id: "nadhr_kaffara",
    icon: "scroll",
    title: "كفارة النذر المعلق",
    shortDesc: "إطعام 10 مساكين (حكمها ككفارة اليمين تماماً).",
    ruleType: "fixed_persons",
    personsPerUnit: 10,
    unitLabel: "عدد النذور التي لم تفِ بها",
    defaultUnits: 1,
    rulingNote: "قال رسول الله ﷺ: 'كفارة النذر كفارة يمين'.",
    extraNote: "يختلف الحكم بحسب نوع النذر (نذر طاعة معيّن، أو نذر مطلق، أو نذر لجاج). راجع أهل العلم في حالتك قبل الاكتفاء بالكفارة.",
    fastingAlternative: "صيام 3 أيام عند العجز المالي التام",
  },
  {
    id: "ramadan_major",
    icon: "sun",
    title: "كفارة الجماع في نهار رمضان",
    shortDesc: "كفارة مغلظة مرتبة: صيام شهرين متتابعين، فإن عجز فإطعام 60 مسكيناً.",
    ruleType: "fixed_persons",
    personsPerUnit: 60,
    unitLabel: "عدد الأيام المنتهكة",
    defaultUnits: 1,
    rulingNote: "كفارة مرتبة شرعاً: عتق رقبة، فإن لم يجد فصيام شهرين متتابعين (60 يوماً)، فإن عجز فإطعام 60 مسكيناً.",
    extraNote: null,
    fastingAlternative: "صيام شهرين متتابعين (60 يوماً) وهو الأصل قبل الإطعام",
  },
  {
    id: "ihram_fidyah",
    icon: "kaaba",
    title: "فدية محظورات الإحرام (الأذى)",
    shortDesc: "إطعام 6 مساكين، أو صيام 3 أيام، أو ذبح شاة (فدية من صيام أو صدقة أو نسك).",
    ruleType: "fixed_persons",
    personsPerUnit: 6,
    unitLabel: "عدد المحظورات المرتكبة",
    defaultUnits: 1,
    rulingNote: "تجب عند ارتكاب محظور من محظورات الإحرام لعذر (كحلق الرأس أو التطيب أو لبس المخيط). وهي على التخيير.",
    extraNote: null,
    fastingAlternative: "صيام 3 أيام أو ذبح شاة بالحرم",
  },
];

// Average cost of feeding 1 poor person per day by country (وجبة إطعام مسكين)
export const countryMealPresets = [
  { code: "KSA", country: "السعودية", cost: 15, currency: "SAR", note: "وجبة مشبعة أو نصف صاع أرز (10 - 20 ر.س). راجع ما تعلنه الجهة المفتية لديك." },
  { code: "UAE", country: "الإمارات", cost: 20, currency: "AED", note: "مجلس الإمارات للإفتاء الشرعي لعام 1447هـ / 2026م: 20 د.إ للمسكين (كفارة اليمين 200 د.إ)." },
  { code: "EGY", country: "مصر", cost: 30, currency: "EGP", note: "الحد الأدنى لإطعام مسكين عن اليوم، كما أعلنته دار الإفتاء المصرية لعام 2026." },
  { code: "QAR", country: "قطر", cost: 15, currency: "QAR", note: "إدارة صندوق الزكاة القطرية" },
  { code: "KWD", country: "الكويت", cost: 1.5, currency: "KWD", note: "بيت الزكاة الكويتي (دينار ونصف)" },
  { code: "JOR", country: "الأردن", cost: 1.5, currency: "JOD", note: "دائرة الإفتاء العام الأردنية" },
  { code: "OMN", country: "عمان", cost: 1.5, currency: "OMR", note: "وزارة الأوقاف والشؤون الدينية" },
  { code: "GLOBAL", country: "أوروبا / أمريكا", cost: 10, currency: "USD", note: "المراكز الإسلامية في الخارج (10$ للوجبة)" },
];
