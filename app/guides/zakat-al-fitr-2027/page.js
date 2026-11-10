import Link from "next/link";
import { FOUNDER, founderSchema } from "@/lib/founder";
import { SITE_URL, SITE_ORG_ID } from "@/lib/siteConfig";
import { editorialFontClass } from "@/lib/editorialFonts";
import { formatArabicDate } from "@/lib/changelog";

const PATH = "/guides/zakat-al-fitr-2027";
const PUBLISHED = "2026-11-10";
const UPDATED = "2026-11-10";

// Per-person amounts as set by each country's fatwa authority (see SOURCES).
const SA_KG = 3; // Permanent Committee: one sa' ≈ 3 kg of staple food
const AE_KG = 2.5; // UAE Fatwa Council: 2.5 kg rice
const AE_CASH_2026 = 25; // UAE Fatwa Council: AED 25 (1447H / 2026). 2027 not announced yet.

export const metadata = {
  title: "زكاة الفطر 2027: المقدار في السعودية والإمارات وموعد إخراجها",
  description:
    "كم زكاة الفطر 2027 عن الفرد؟ نحو 3 كغ طعاماً في السعودية، و2.5 كغ أرز أو 25 درهماً (تقدير 2026) في الإمارات. الموعد، ومن تجب عليه، وجدول جاهز لأسرتك مع المصادر الرسمية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "زكاة الفطر 2027: كم تُخرج، ومتى، وعن مَن؟",
    description: "القولان في السعودية والإمارات بالأرقام، وحساب جاهز لأسرتك.",
    url: `${SITE_URL}${PATH}`,
    type: "article",
    locale: "ar_SA",
  },
};

const FAQ = [
  {
    q: "كم زكاة الفطر 2027 في الإمارات بالدرهم؟",
    a: "لم تُعلن بعد. كانت 25 درهماً عن الفرد في 2026، ويعلن مجلس الإمارات للإفتاء الشرعي قيمة 2027 قبل رمضان.",
  },
  {
    q: "هل يجوز إخراج زكاة الفطر نقداً في السعودية؟",
    a: "اللجنة الدائمة للإفتاء تنص على إخراجها طعاماً من قوت البلد لا نقوداً. ويمكنك أن تدفع مالاً لجهة موثوقة تشتري الطعام وتُخرجه عنك.",
  },
  {
    q: "كم كيلو زكاة الفطر عن الشخص الواحد؟",
    a: "نحو 3 كغ في السعودية بتقدير اللجنة الدائمة، و2.5 كغ من الأرز في الإمارات بتقدير مجلس الإفتاء.",
  },
  {
    q: "أقيم في الخليج وأهلي في بلد آخر، أين أُخرجها؟",
    a: "يرى كثير من العلماء أنها تُخرج حيث تكون ليلة العيد، ويجوز أن توكّل من يُخرجها عنك. راجع جهة الفتوى في بلدك للتفاصيل.",
  },
];

const SOURCES = [
  "فتاوى اللجنة الدائمة للبحوث العلمية والإفتاء: المجموعة الثانية 8/266 (المقدار)، والمجموعة الأولى 9/379 (النقد).",
  "مجلس الإمارات للإفتاء الشرعي: فتوى مقادير زكاة الفطر والكفارات لعام 1447هـ / 2026م، 8 فبراير 2026.",
  "تقديرات فلكية لغرة رمضان وشوال 1448هـ؛ المعتمد إعلان الرؤية الرسمي في كل بلد.",
  "المنصة الوطنية للعمل الخيري «إحسان»: برنامج زكاة الفطر.",
];

const TIMELINE = [
  { when: "1 رمضان 1448 · نحو 8 فبراير 2027", who: "الإمارات:", text: "يصح تقديمها من أول الشهر للحاجة." },
  { when: "قبل العيد بيوم أو يومين", who: "السعودية:", text: "أول وقت يجوز إخراجها فيه." },
  { when: "فجر يوم العيد · نحو 9 أو 10 مارس 2027", who: "أفضل وقت في البلدين:", text: "بعد الفجر وقبل صلاة العيد.", hot: true },
  { when: "صلاة العيد", who: "السعودية:", text: "ينتهي وقتها بدخول الإمام للصلاة." },
  { when: "غروب شمس يوم العيد", who: "الإمارات:", text: "آخر وقت الأداء، وما بعده قضاء لا يجوز التأخير إليه إلا لضرورة." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": `${SITE_URL}${PATH}#article`,
      headline: "زكاة الفطر 2027: كم تُخرج، ومتى، وعن مَن؟",
      description: metadata.description,
      inLanguage: "ar",
      datePublished: PUBLISHED,
      dateModified: UPDATED,
      mainEntityOfPage: `${SITE_URL}${PATH}`,
      author: founderSchema(SITE_URL),
      publisher: { "@id": SITE_ORG_ID },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}${PATH}#faq`,
      mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "الأدلة", item: `${SITE_URL}/guides` },
        { "@type": "ListItem", position: 3, name: "زكاة الفطر 2027", item: `${SITE_URL}${PATH}` },
      ],
    },
  ],
};

const green = "text-[var(--guide-green)]";
const pCls = "mt-4 text-[17px] leading-[2.15] [text-wrap:pretty] sm:text-[18px]";

function Ref({ n }) {
  return (
    <sup className={`font-bold ${green}`}>
      <a href="#sources" className="text-inherit no-underline">{n}</a>
    </sup>
  );
}

function Section({ id, kicker, title, note, children }) {
  return (
    <section aria-labelledby={id} className="mt-14 flex flex-col gap-6 md:mt-20 md:flex-row md:items-start md:gap-16">
      <div className="min-w-0 md:max-w-[700px] md:flex-1">
        {kicker && <p className={`q-mono m-0 mb-1.5 text-[13px] ${green}`}>{kicker}</p>}
        <h2 id={id} className="q-serif m-0 text-[26px] font-bold leading-[1.5] md:text-[32px]">{title}</h2>
        {children}
      </div>
      {note ? (
        <aside className="min-w-0 border-t border-[var(--guide-line)] pt-1.5 text-sm leading-[1.95] text-[var(--text-2)] md:w-[280px] md:flex-none">
          {note}
        </aside>
      ) : (
        <div className="hidden md:block md:w-[280px] md:flex-none" />
      )}
    </section>
  );
}

export default function ZakatAlFitr2027Guide() {
  return (
    <div className={`${editorialFontClass} bg-[var(--guide-bg)] text-[var(--text)]`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero band */}
      <div className="relative overflow-hidden border-b border-[var(--guide-line)] bg-[var(--guide-band)]">
        <svg aria-hidden="true" width="100%" height="100%" className="absolute inset-0 opacity-[0.12]">
          <defs>
            <pattern id="qstar" width="72" height="72" patternUnits="userSpaceOnUse">
              <g fill="none" stroke="var(--guide-green)" strokeWidth="1">
                <rect x="16" y="16" width="40" height="40" />
                <rect x="16" y="16" width="40" height="40" transform="rotate(45 36 36)" />
                <circle cx="36" cy="36" r="7" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#qstar)" />
        </svg>

        <div className="relative mx-auto max-w-[1120px] px-5 pb-9 pt-5 sm:px-7 md:pb-14 md:pt-6">
          <nav aria-label="مسار التنقل" className="flex gap-2 text-[13px] text-[var(--text-2)]">
            <Link href="/" className="text-[var(--text-2)]">الرئيسية</Link>
            <span aria-hidden="true">‹</span>
            <Link href="/guides" className="text-[var(--text-2)]">الأدلة</Link>
            <span aria-hidden="true">‹</span>
            <span>زكاة الفطر 2027</span>
          </nav>

          <div className="mt-9 flex flex-col gap-10 md:flex-row md:items-end md:gap-16">
            <div className="min-w-0 md:flex-1">
              <p className={`m-0 mb-3.5 inline-flex items-center gap-2 text-sm font-bold ${green}`}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" />
                </svg>
                دليل رمضان 1448هـ
              </p>
              <h1 className="q-serif m-0 text-[34px] font-bold leading-[1.35] [text-wrap:balance] md:text-[54px]">
                زكاة الفطر 2027: كم تُخرج، ومتى، وعن مَن؟
              </h1>
              <p className="mt-5 max-w-[600px] text-[17px] leading-[2] text-[var(--text-2)] [text-wrap:pretty] sm:text-[19px]">
                المقدار في السعودية غير المقدار في الإمارات، وحكم النقد مختلف. هنا القولان بالأرقام، وحساب جاهز لأسرتك.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-[18px] gap-y-2 text-sm text-[var(--text-2)]">
                <span className="inline-flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static SVG avatar */}
                  <img src={FOUNDER.avatar} alt="" width={36} height={36} className="h-9 w-9 flex-none rounded-full" />
                  <span>كتبه <strong className="text-[var(--text)]">{FOUNDER.nameAr}</strong></span>
                </span>
                <span>حُدّث في <time dateTime={UPDATED} className="q-mono text-[var(--text)]">{formatArabicDate(UPDATED)}</time></span>
                <span>7 دقائق قراءة</span>
              </div>
            </div>

            <div className="min-w-0 overflow-hidden rounded-[14px] border border-[var(--guide-line)] bg-[var(--surface)] shadow-[0_24px_48px_-28px_rgba(31,92,74,0.45)] md:w-[380px] md:flex-none">
              <p className="m-0 bg-[var(--guide-green)] px-[22px] py-3 text-[13px] font-bold text-[var(--guide-band)]">الجواب المختصر، عن كل فرد</p>
              <div className="border-b border-[var(--guide-line)] px-[22px] py-[18px]">
                <p className="m-0 text-[13px] font-bold text-[var(--text-2)]">السعودية</p>
                <p className="q-mono m-0 mt-0.5 text-[40px] leading-[1.3]">≈ {SA_KG} كغ</p>
                <p className="m-0 text-sm text-[var(--text-2)]">أرز أو تمر، طعاماً لا نقداً</p>
              </div>
              <div className="border-b border-[var(--guide-line)] px-[22px] py-[18px]">
                <p className="m-0 text-[13px] font-bold text-[var(--text-2)]">الإمارات</p>
                <p className="q-mono m-0 mt-0.5 text-[40px] leading-[1.3]">{AE_CASH_2026} درهماً</p>
                <p className="m-0 text-sm text-[var(--text-2)]">أو {AE_KG} كغ أرز · تقدير 2026</p>
              </div>
              <p className="m-0 px-[22px] py-3.5 text-sm leading-[1.8]">
                آخر موعد: قبل صلاة العيد، المتوقع <strong>9 أو 10 مارس 2027</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1120px] px-5 sm:px-7">
        <article>
          <Section
            id="why"
            title="لماذا يتكرر السؤال كل سنة؟"
            note={<><strong className="text-[var(--text)]">ما هو الصاع؟</strong> مكيال للحجم لا للوزن، ولذلك يختلف وزنه بحسب نوع الطعام. من هنا جاء اختلاف التقدير بالكيلو بين الجهات.</>}
          >
            <p className={pCls}>
              <span className={`q-serif float-right mb-0 ml-3 mt-2 text-[64px] font-bold leading-[0.9] ${green}`}>ف</span>ي الأيام الأخيرة من رمضان يدور السؤال نفسه في كل بيت: كم نُخرج هذه السنة، وهل ندفعها مالاً أم نشتري أرزاً؟ والجواب يختلف فعلاً من بلد إلى آخر، لأن جهة الفتوى في السعودية وجهة الفتوى في الإمارات قدّرتا المقدار بطريقتين مختلفتين.
            </p>
            <p className={pCls}>
              هذا الدليل يضع القولين جنباً إلى جنب بالأرقام، ثم يحسبها لأسرتك. لا نرجّح بينهما ولا نُفتي؛ ننقل ما قررته كل جهة ونذكر مصدره في آخر الصفحة.
            </p>
            <blockquote className="m-0 mt-8 border-r-[3px] border-[var(--guide-green)] py-1 pr-[22px]">
              <p className="q-serif m-0 text-[20px] font-semibold leading-[2] md:text-[24px]">
                «فرض رسول الله ﷺ زكاة الفطر صاعاً من تمر، أو صاعاً من شعير، على العبد والحر، والذكر والأنثى، والصغير والكبير من المسلمين.»
              </p>
              <footer className="mt-2 text-sm text-[var(--text-2)]">عن عبد الله بن عمر رضي الله عنهما — متفق عليه</footer>
            </blockquote>
          </Section>

          <Section
            id="who"
            kicker="01"
            title="على مَن تجب؟"
            note="الفقر ليس مانعاً دائماً: من ملك زيادة عن حاجة يوم العيد وليلته لزمته، ولو كان هو نفسه ممن يأخذ الزكاة."
          >
            <p className={pCls}>
              على كل مسلم عنده يوم العيد وليلته ما يزيد على قوته وقوت من يعولهم. ويُخرجها ربّ الأسرة عن نفسه وعن كل من تلزمه نفقته: الزوجة والأولاد، صغيرهم وكبيرهم.<Ref n={1} />
            </p>
            <p className={`${pCls} text-[var(--text-2)]`}>الرضيع يُحسب فرداً كاملاً. أما الجنين فلا تجب عنه، ويُستحب إخراجها عنه.</p>
          </Section>

          <Section
            id="amount"
            kicker="02"
            title="كم المقدار في السعودية والإمارات؟"
            note={<><strong className="text-[var(--text)]">قيمة 2027 في الإمارات لم تُعلن بعد.</strong> يعلنها المجلس عادةً قبل رمضان، وقد كانت 25 درهماً في 2024 و2025 و2026. سنحدّث الرقم هنا يوم إعلانه.</>}
          >
            <p className={pCls}>
              <strong>في السعودية</strong> قدّرت اللجنة الدائمة للإفتاء الصاع بنحو <span className="q-mono">{SA_KG}</span> كيلوغرامات من قوت البلد، كالأرز أو التمر، وتنص على إخراجها طعاماً لا نقوداً.<Ref n={1} />
            </p>
            <p className={pCls}>
              <strong>في الإمارات</strong> حدّد مجلس الإمارات للإفتاء الشرعي المقدار بـ <span className="q-mono">{AE_KG}</span> كغ من الأرز عن كل شخص، وأجاز إخراج قيمتها نقداً، وقدّرها لعام 2026 بـ <span className="q-mono">{AE_CASH_2026}</span> درهماً.<Ref n={2} />
            </p>
            <div className="mt-6 rounded-md bg-[var(--guide-band)] px-5 py-[18px]">
              <p className={`m-0 text-[13px] font-bold ${green}`}>ملاحظة من السوق</p>
              <p className="m-0 mt-1.5 text-[17px] leading-[2]">
                كيس الأرز المعتاد بوزن <span className="q-mono">5</span> كغ يكفي عن شخصين في الإمارات (2 × 2.5)، لكنه <strong>لا يكفي</strong> عن شخصين في السعودية (2 × 3 = 6 كغ). لأسرة من خمسة في السعودية تحتاج 15 كغ: ثلاثة أكياس.
              </p>
            </div>
          </Section>

          <Section
            id="family"
            kicker="03"
            title="احسبها لأسرتك"
            note="أرقام الإمارات النقدية مبنية على تقدير 2026 وتتغيّر إن أعلن المجلس قيمة مختلفة لعام 2027."
          >
            <p className={`${pCls} text-[var(--text-2)]`}>اضرب عدد أفراد أسرتك في مقدار الفرد. الصف المظلل لأسرة من خمسة.</p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-[15px] sm:text-base">
                <thead>
                  <tr className="border-b-2 border-[var(--guide-green)] text-[13px] text-[var(--text-2)]">
                    <th scope="col" className="px-2.5 py-2 text-start">الأفراد</th>
                    <th scope="col" className="px-2.5 py-2 text-start">السعودية (طعاماً)</th>
                    <th scope="col" className="px-2.5 py-2 text-start">الإمارات (أرزاً)</th>
                    <th scope="col" className="px-2.5 py-2 text-start">الإمارات (نقداً، 2026)</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <tr key={n} className={`border-b border-[var(--guide-line)] ${n === 5 ? "bg-[var(--guide-band)]" : ""}`}>
                      <th scope="row" className="px-2.5 py-[11px] text-start font-semibold">{n}</th>
                      <td className="q-mono px-2.5 py-[11px]">{n * SA_KG} كغ</td>
                      <td className="q-mono px-2.5 py-[11px]">{n * AE_KG} كغ</td>
                      <td className="q-mono px-2.5 py-[11px]">{n * AE_CASH_2026} درهماً</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link
              href="/zakat-al-fitr"
              className="mt-6 flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-[var(--orange)] px-[22px] py-[18px] text-[var(--on-orange)] no-underline"
            >
              <span>
                <strong className="text-lg">حاسبة زكاة الفطر</strong>
                <span className="block text-sm">أدخل عدد الأفراد واختر بلدك، والنتيجة فورية</span>
              </span>
              <span className="text-[17px] font-bold">احسب الآن ←</span>
            </Link>
          </Section>

          <Section
            id="where"
            kicker="04"
            title="أين تدفعها؟"
            note={<>الدفع لمنصة أو جمعية هو <strong className="text-[var(--text)]">توكيل</strong>: أنت تدفع المال وهي تشتري الطعام وتسلّمه عنك. ولهذا يصح في السعودية مع أن الفتوى هناك تمنع إعطاء الفقير نقوداً.</>}
          >
            <p className={pCls}>
              <strong>في السعودية:</strong> تسلّمها طعاماً لمستحق تعرفه، أو توكّل جهة موثوقة. المنصة الوطنية للعمل الخيري «إحسان» تستقبل زكاة الفطر رقمياً: تحدد المنطقة وعدد الأفراد وتدفع، وتتولى هي إخراجها أرزاً في وقتها الشرعي.<Ref n={4} />
            </p>
            <p className={pCls}>
              <strong>في الإمارات:</strong> عبر صندوق الزكاة أو الجمعيات الخيرية المرخّصة، طعاماً أو نقداً. ويدعو المجلس إلى تسليمها مبكراً حتى تصل إلى مستحقيها قبل يوم العيد.<Ref n={2} />
            </p>
          </Section>

          <Section
            id="when"
            kicker="05"
            title="متى تُخرج في 2027؟"
            note="إن وكّلت منصة أو جمعية فادفع قبل الموعد بأيام؛ هي تُخرجها في وقتها الشرعي، لكنها تحتاج وقتاً للتجهيز."
          >
            <p className={`${pCls} text-[var(--text-2)]`}>التواريخ الميلادية تقدير فلكي، والمعتمد إعلان رؤية الهلال.<Ref n={3} /></p>
            <ol className="m-0 mt-7 list-none border-r-2 border-[var(--guide-line)] p-0">
              {TIMELINE.map((t) => (
                <li key={t.when} className="relative pb-[26px] pr-[26px] last:pb-0">
                  <span
                    aria-hidden="true"
                    className={`absolute -right-[7px] top-2 h-3 w-3 rounded-full border-2 ${t.hot ? "border-[var(--orange)] bg-[var(--orange)]" : "border-[var(--guide-green)] bg-[var(--guide-bg)]"}`}
                  />
                  <p className={`q-mono m-0 text-[13px] font-bold ${t.hot ? "text-[var(--accent-text)]" : green}`}>{t.when}</p>
                  <p className="m-0 mt-1 text-[17px] leading-[1.95]"><strong>{t.who}</strong> {t.text}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="mistakes" kicker="06" title="ثلاثة أخطاء نراها كثيراً">
            <p className={pCls}><strong>نقل فتوى بلد إلى بلد آخر.</strong> قيمة 25 درهماً تقدير إماراتي؛ من يقيم في السعودية يتبع ما تفتي به جهتها.</p>
            <p className={pCls}><strong>حساب الأسرة ناقصاً.</strong> كل من تعوله يُحسب، ومنهم الرضيع الذي وُلد قبل غروب شمس آخر يوم من رمضان.</p>
            <p className={pCls}><strong>شراء كيس واحد «والباقي تقريباً».</strong> المقدار عن كل فرد محدد؛ احسب المجموع أولاً ثم اشترِ.</p>
          </Section>

          <Section id="faq" title="أسئلة شائعة">
            <dl className="m-0 mt-[18px] border-t border-[var(--guide-line)]">
              {FAQ.map(({ q, a }) => (
                <div key={q} className="border-b border-[var(--guide-line)] py-5">
                  <dt className="text-lg font-bold leading-[1.7]">{q}</dt>
                  <dd className="m-0 mt-2 text-base leading-[2] text-[var(--text-2)]">{a}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <section id="sources" aria-labelledby="sources-title" className="mt-14 max-w-[700px] scroll-mt-24 border-t-2 border-[var(--guide-green)] pt-[26px] md:mt-20">
            <h2 id="sources-title" className={`m-0 text-[15px] font-bold ${green}`}>المصادر</h2>
            <ol className="mt-3 list-decimal ps-[22px] text-sm leading-[2.05] text-[var(--text-2)]">
              {SOURCES.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <p className="mt-[18px] text-sm leading-[1.95] text-[var(--text-2)]">
              وجدت خطأ أو رقماً تغيّر؟{" "}
              <Link href="/contact" className="font-semibold text-[var(--accent-text)]">اكتب لنا</Link> ونصحّحه ونسجّله في{" "}
              <Link href="/changelog" className="font-semibold text-[var(--accent-text)]">سجل التحديثات</Link>.
            </p>
          </section>
        </article>

        <section className="mt-[72px] border-t border-[var(--guide-line)] pb-14 pt-8">
          <h2 className="m-0 text-[15px] font-bold text-[var(--text-2)]">أكمل حسابات رمضان</h2>
          <div className="mt-2.5 grid gap-x-12 sm:grid-cols-3">
            {[
              ["/zakat-calculator", "حاسبة زكاة المال"],
              ["/kaffara-calculator", "حاسبة الكفارة وفدية الصيام"],
              ["/date-converter", "تحويل التاريخ الهجري"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="border-b border-[var(--guide-line)] py-3.5 text-[17px] font-semibold text-[var(--text)] no-underline">
                {label} ←
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
