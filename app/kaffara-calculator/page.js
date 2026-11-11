import KaffaraCalculator from "@/components/KaffaraCalculator";
import ToolGuideSection from "@/components/ToolGuideSection";
import { kaffaraTypes, countryMealPresets } from "@/lib/kaffaraData";

export const metadata = {
  title: "جدول الكفارات وقيمتها 2026 | كفارة اليمين وفدية الصيام",
  description:
    "احسب مقدار كفارة اليمين، فدية صيام رمضان للمريض وكبير السن، كفارة النذر، وفدية محظورات الإحرام بدقة سواء عيناً بالطعام والأرز أو نقداً بالريال والعملات.",
  alternates: { canonical: "/kaffara-calculator" },
};

const guideData = {
  currentPath: "/kaffara-calculator",
  aboutTitle: "دليل أحكام الكفارات والفدية الشرعية ومقادير الإطعام والصيام",
  aboutContent: [
    "شُرعت الكفارات والفدية في الشريعة الإسلامية لحِكَمٍ جليلة؛ فالكفارة (مأخوذة من الكفر وهو الستر والتغطية) هي عبادة مالية أو بدنية شُرعت تكفيراً للذنب وستراً للخطيئة وجبراً لما وقع فيه العبد من تقصير، كالحنث في اليمين المعقودة أو النذر. أما الفدية، فهي عوض وبدل واجب عما فات المسلم من واجبات لعذر مشروع، كفدية من عجز عن صيام رمضان لكبر أو مرض مزمن، أو فدية ارتكاب محظور من محظورات الإحرام لحاجة.",
    "يُقدّر الإطعام الواجب شرعاً في الفدية والكفارة بـ 'نصف صاع' من غالب قوت أهل البلد عن كل مسكين (وهو ما يعادل حوالي 1.25 إلى 1.5 كيلوجرام من الأرز أو القمح)، أو تقديم وجبة مشبعة غداءً أو عشاءً يستوفي بها المسكين طعامه المعتاد، كما يجوز إخراج قيمتها نقداً وفقاً لفتوى جماعة من الفقهاء والعديد من دور الإفتاء المعاصرة تيسيراً وسداً لحاجة الفقير.",
    "في كفارة اليمين المنعقدة، بيّن القرآن الكريم في سورة المائدة أنها كفارة تخيير في مرحلتها الأولى: المسلم مخير بين إطعام عشرة مساكين أو كسوتهم أو تحرير رقبة. والخطأ الشائع لدى كثير من الناس هو المسارعة إلى صيام ثلاثة أيام مباشرة مع قدرتهم المالية؛ والصواب أنه لا يجوز الانتقال إلى الصيام إلا عند العجز الحقيقي عن الإطعام والكسوة.",
    "أما فدية صيام رمضان، فتجب على من عجز عن الصيام عجزاً كلياً دائماً لا يُرجى زواله (كالشيخ الفاني والمريض بمرض مزمن كالفشل الكلوي أو السكري الحاد)، ومقدارها إطعام مسكين واحد عن كل يوم أفطره، ويجوز إخراجها يوماً بيوم أو جمعها وإخراجها كاملة في نهاية شهر رمضان المبارك.",
  ],
  stepsTitle: "كيفية استخدام حاسبة الكفارات والفدية خطوة بخطوة:",
  steps: [
    {
      title: "تحديد نوع الكفارة أو الفدية",
      desc: "اختر ما ترغب في حسابه: فدية صيام رمضان، كفارة يمين، كفارة نذر، كفارة جماع، أو فدية إحرام.",
    },
    {
      title: "إدخال عدد الأيام أو الأيمان",
      desc: "حدد عدد أيام الإفطار (مثلاً 30 يوماً لشهر رمضان) أو عدد الأيمان والنذور التي وقع الحنث فيها.",
    },
    {
      title: "اختيار وسيلة الإخراج (نقداً أو طعاماً)",
      desc: "اختر الحساب نقداً بقيمة الوجبة لدولتك، أو عيناً بالأرز والحبوب بالكيلوجرام والصاع.",
    },
    {
      title: "معاينة النتيجة والبدائل الشرعية",
      desc: "تُظهر لك الحاسبة عدد المساكين المطلوب إطعامهم، وكمية الأرز أو المبلغ الإجمالي، مع بيان حكم الصيام عند العجز.",
    },
  ],
  example: {
    title: "مثال تطبيقي عملي بالأرقام (كفارة يمين وفدية صيام شهر كاملاً):",
    scenario:
      "شخص حنث في يمينين اثنين، ووالده شيخ كبير عاجز عن صيام شهر رمضان كاملاً (30 يوماً). يريد معرفة الواجب عليهما بالريال السعودي وبكيلوجرامات الأرز (باعتبار الوجبة 15 ريالاً ونصف الصاع 1.35 كجم):",
    calculation: [
      { label: "كفارة اليمينين (2 يمين × 10 مساكين)", value: "إطعام 20 مسكيناً" },
      { label: "تكلفة اليمينين نقداً (20 × 15 ريال)", value: "300.00 ريال سعودي (أو 27 كجم أرز)" },
      { label: "فدية صيام شهر رمضان (30 يوماً × 1 مسكين)", value: "إطعام 30 مسكيناً" },
      { label: "تكلفة فدية الصيام نقداً (30 × 15 ريال)", value: "450.00 ريال سعودي (أو 40.5 كجم أرز)" },
    ],
    result:
      "إجمالي الواجب عن اليمينين هو 300 ريال، وإجمالي فدية صيام رمضان للوالد هو 450 ريالاً، وتُدفع للفقراء والمساكين.",
  },
  faqs: [
    {
      question: "هل يجوز الصيام مباشرة في كفارة اليمين دون إطعام المساكين؟",
      answer:
        "لا يجوز شرعاً الانتقال إلى صيام ثلاثة أيام في كفارة اليمين إلا لمن كان عاجزاً مالياً عجزاً تاماً عن إطعام عشرة مساكين أو كسوتهم. فمن كان يملك سعة من المال وصام دون إطعام لم تجزئه كفارته وبقيت في ذمته بنص القرآن الكريم.",
    },
    {
      question: "هل يجوز إعطاء كفارة اليمين لمسكين واحد على مدار عشرة أيام؟",
      answer:
        "ذهب الحنفية إلى جواز إطعام مسكين واحد طعام عشرة أيام (بأن يطعمه كل يوم وجبتين أو يعطيه نصف صاع يومياً لمدة 10 أيام)، بينما اشترط جمهور الفقهاء (المالكية والشافعية والحنابلة) إطعام عشرة مساكين متفرقين بأعيانهم عملاً بظاهر النص القرآني 'فَإِطْعَامُ عَشَرَةِ مَسَاكِينَ'.",
    },
    {
      question: "متى تُخرج فدية صيام رمضان لكبير السن أو المريض المزمن؟",
      answer:
        "يجوز إخراج الفدية يوماً بيوم بعد مغرب كل يوم أفطره، ويجوز تأخيرها وجمعها وإخراجها كاملة لعدة أيام أو لكامل الشهر في آخره (كما كان يفعل أنس بن مالك رضي الله عنه حين كبر). ولا يصح إخراجها كاملة مقدماً قبل دخول شهر رمضان.",
    },
    {
      question: "ما الفرق بين فدية الصيام وقضاء الصيام؟",
      answer:
        "القضاء (صيام يوم مكان اليوم) واجب على من أفطر لعذر مؤقت يزول (كالمرض العارض أو السفر أو الحيض والنفاس)، ولا تجزئه الفدية. أما الفدية (الإطعام) فتكون فقط لمن لا يستطيع الصيام مطلقاً لعذر دائم مستمر كمرض مزمن لا يُرجى شفاؤه أو شيخوخة هرمة.",
    },
    {
      question: "هل يصح دفع الكفارة نقداً للجمعيات الخيرية؟",
      answer:
        "نعم، يصح توكيل الجمعيات الخيرية والمؤسسات الإغاثية المعتمدة رسمياً في دفع الكفارات والفدية؛ حيث تتولى الجمعية شراء الطعام والأرز وتوزيعه على المستحقين والفقراء المسجلين لديها نيابة عنك.",
    },
  ],
};

const KT_CSS = `
.kt{max-width:64rem;margin:2.5rem auto 0;padding:0 1rem;display:grid;gap:1.5rem}
.kt h2{margin:0;font-size:1.35rem;font-weight:800;color:var(--text)}
.kt p{margin:0;color:var(--text-2);font-size:.92rem;line-height:1.8}
.kt-wrap{border:1px solid var(--border);border-radius:1.25rem;overflow:hidden;background:var(--surface)}
.kt table{width:100%;border-collapse:collapse;font-size:.88rem;color:var(--text)}
.kt th{background:var(--bg);color:var(--text-2);font-weight:700;font-size:.78rem;text-align:start;padding:.7rem .75rem;border-bottom:1px solid var(--border)}
.kt td{padding:.75rem;border-bottom:1px solid var(--border);vertical-align:top;line-height:1.65}
.kt tr:last-child td{border-bottom:0}
.kt td strong{font-weight:800}
.kt .kt-num{font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:700}
.kt .kt-src{color:var(--text-3);font-size:.75rem}
@media (max-width:639px){
  .kt-stack thead{display:none}
  .kt-stack tr{display:grid;gap:.15rem;padding:.75rem;border-bottom:1px solid var(--border)}
  .kt-stack tr:last-child{border-bottom:0}
  .kt-stack td{padding:0;border:0}
  .kt-stack td[data-l]::before{content:attr(data-l) ": ";color:var(--text-2);font-weight:600}
}
`;

const fmt = (n) => (Number.isInteger(n) ? n.toLocaleString("en-US") : n.toFixed(1));

function KaffaraTables() {
  const ksa = countryMealPresets.find((c) => c.code === "KSA");
  return (
    <section className="kt" aria-labelledby="kt-title">
      <style>{KT_CSS}</style>
      <div>
        <h2 id="kt-title">جدول الكفارات والفدية ومقاديرها</h2>
        <p>
          كل كفارة بالإطعام تُقدّر بعدد المساكين، ولكل مسكين نصف صاع (نحو 1.5 كغ) من قوت البلد أو قيمة وجبة.
          القيمة بالريال تقريبية على أساس {ksa.cost} ريالاً للمسكين، وتختلف حسب ما تعلنه الجهة المفتية في بلدك.
        </p>
      </div>
      <div className="kt-wrap">
        <table className="kt-stack">
          <thead>
            <tr><th scope="col">الكفارة</th><th scope="col">الواجب</th><th scope="col">عدد المساكين</th><th scope="col">عند العجز</th><th scope="col">تقريباً بالريال</th></tr>
          </thead>
          <tbody>
            {kaffaraTypes.map((k) => (
              <tr key={k.id}>
                <td><strong>{k.title}</strong></td>
                <td data-l="الواجب">{k.shortDesc}</td>
                <td data-l="عدد المساكين" className="kt-num">
                  {k.ruleType === "taam_per_day" ? "1 عن كل يوم" : k.personsPerUnit}
                </td>
                <td data-l="عند العجز">{k.fastingAlternative || "لا بديل بالصيام (العاجز يطعم)"}</td>
                <td data-l="تقريباً بالريال" className="kt-num">
                  {k.ruleType === "taam_per_day"
                    ? `${fmt(ksa.cost)} ر.س لليوم`
                    : `${fmt(k.personsPerUnit * ksa.cost)} ر.س`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 id="kt-countries">قيمة الكفارة حسب الدولة</h2>
        <p>قيمة إطعام مسكين واحد كما تعلنها الجهات المختصة أو المتعارف عليها، ومنها تُحسب كفارة اليمين (10 مساكين) وفدية رمضان كاملاً (30 يوماً).</p>
      </div>
      <div className="kt-wrap">
        <table className="kt-stack">
          <thead>
            <tr><th scope="col">الدولة</th><th scope="col">إطعام مسكين</th><th scope="col">كفارة اليمين</th><th scope="col">فدية 30 يوماً</th><th scope="col">المصدر</th></tr>
          </thead>
          <tbody>
            {countryMealPresets.map((c) => (
              <tr key={c.code}>
                <td><strong>{c.country}</strong></td>
                <td data-l="إطعام مسكين" className="kt-num">{fmt(c.cost)} {c.currency}</td>
                <td data-l="كفارة اليمين" className="kt-num">{fmt(c.cost * 10)} {c.currency}</td>
                <td data-l="فدية 30 يوماً" className="kt-num">{fmt(c.cost * 30)} {c.currency}</td>
                <td data-l="المصدر" className="kt-src">{c.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function KaffaraPage() {
  return (
    <div className="py-6 sm:py-10">
      {/* 1. Calculator on top */}
      <KaffaraCalculator />

      {/* 2. Reference tables (answers "جدول الكفارات") */}
      <KaffaraTables />

      {/* 2. Standardized Guide, FAQs, and Related Tools */}
      <ToolGuideSection {...guideData} />
    </div>
  );
}

