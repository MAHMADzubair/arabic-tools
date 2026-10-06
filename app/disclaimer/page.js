export const metadata = {
  title: "إخلاء المسؤولية | Qemlo",
  description:
    "إخلاء المسؤولية القانونية، المالية، الشرعية، والصحية لحاسبات وأدوات منصة Qemlo.",
};

// Edit this by hand whenever the disclaimer actually changes.
// (The old code printed today's date, so the page always claimed it was just updated.)
const LAST_UPDATED = "أكتوبر 2026";

const CSS = `
.terms {
  --c-surface: var(--surface, #FFFFFF);
  --c-ink: var(--ink, #0D0D0D);
  --c-ink-soft: var(--ink-soft, #4A4A46);
  --c-line: var(--line, #D9D9D3);
  --c-signal: var(--signal, #FF6A1A);
  --c-on-ink: var(--on-ink, #FFFFFF);

  padding: 2.5rem 1rem 4rem;
  color: var(--c-ink);
  font-family: inherit;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .terms {
    --c-surface: var(--surface, #181816);
    --c-ink: var(--ink, #F5F5F2);
    --c-ink-soft: var(--ink-soft, #B4B4AD);
    --c-line: var(--line, #34342F);
    --c-on-ink: var(--on-ink, #0D0D0D);
  }
}
:root[data-theme="dark"] .terms {
  --c-surface: var(--surface, #181816);
  --c-ink: var(--ink, #F5F5F2);
  --c-ink-soft: var(--ink-soft, #B4B4AD);
  --c-line: var(--line, #34342F);
  --c-on-ink: var(--on-ink, #0D0D0D);
}
.terms *, .terms *::before, .terms *::after { box-sizing: border-box; }

.terms-wrap { max-width: 46rem; margin-inline: auto; }

.terms-head { margin-block-end: 2rem; padding-inline-start: 1rem; border-inline-start: 4px solid var(--c-ink); }
.terms-badge { display: inline-block; margin: 0 0 0.7rem; padding: 0.2rem 0.75rem; font-size: 0.78rem; font-weight: 700; border: 1px solid var(--c-ink); border-radius: 999px; }
.terms-title { margin: 0; font-size: 2rem; font-weight: 800; line-height: 1.3; }
@media (min-width: 640px) { .terms-title { font-size: 2.4rem; } }
.terms-date { margin: 0.6rem 0 0; font-size: 0.85rem; color: var(--c-ink-soft); }

.terms-card { background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 16px; padding: 1.5rem; }
@media (min-width: 640px) { .terms-card { padding: 2.25rem; } }

.terms-sec { padding-block: 1.75rem; border-block-start: 1px solid var(--c-line); }
.terms-sec:first-child { padding-block-start: 0; border-block-start: 0; }
.terms-sec:last-child { padding-block-end: 0; }
.terms-h2 { display: flex; align-items: center; gap: 0.7rem; margin: 0 0 0.8rem; font-size: 1.2rem; font-weight: 800; line-height: 1.5; }
.terms-n { flex: none; display: inline-grid; place-items: center; width: 2rem; height: 2rem; font-size: 0.9rem; font-weight: 800; color: var(--c-on-ink); background: var(--c-ink); border-radius: 6px; }
.terms-p { margin: 0; font-size: 1rem; line-height: 2; color: var(--c-ink-soft); }
.terms-p + .terms-p { margin-block-start: 0.9rem; }
.terms-p strong { color: var(--c-ink); }

/* The key section: orange is used as a bar, not as text */
.terms-key { padding: 1.5rem 1.25rem; border: 2px solid var(--c-ink); border-inline-start: 10px solid var(--c-signal); border-radius: 12px; }
.terms-card > .terms-key { margin-block: 0 1.75rem; }
.terms-card > .terms-key + .terms-sec { border-block-start: 0; padding-block-start: 0; }

@media print {
  .terms { padding: 0; }
  .terms-card { border: 0; padding: 0; }
}
`;

export default function DisclaimerPage() {
  return (
    <div className="terms">
      <style>{CSS}</style>

      <article className="terms-wrap">
        {/* Header */}
        <header className="terms-head">
          <p className="terms-badge">تنبيه قانوني هام</p>
          <h1 className="terms-title">إخلاء المسؤولية</h1>
          <p className="terms-date">آخر تحديث: {LAST_UPDATED}</p>
        </header>

        {/* Content */}
        <div className="terms-card">
          <section className="terms-sec terms-key" id="nature" aria-labelledby="d1">
            <h2 className="terms-h2" id="d1">
              <span className="terms-n" aria-hidden="true">1</span>
              <span>طبيعة الأدوات والمعلومات الاسترشادية</span>
            </h2>
            <p className="terms-p">
              جميع الحاسبات، والمحولات، والمحتويات، والأمثلة التوضيحية المنشورة على منصة <strong>«Qemlo»</strong> مقدمة لأغراض <strong>إعلامية، تثقيفية، واسترشادية عامة فقط</strong>. لا تشكل أي من النتائج الصادرة عن هذه الأدوات استشارة مالية، استثمارية، ضريبية، قانونية، شرعية، أو طبية ملزمة أو مهنية.
            </p>
          </section>

          <section className="terms-sec" id="financial" aria-labelledby="d2">
            <h2 className="terms-h2" id="d2">
              <span className="terms-n" aria-hidden="true">2</span>
              <span>إخلاء المسؤولية المالية والاستثمارية</span>
            </h2>
            <p className="terms-p">
              تعتمد حاسبات القروض، التمويل العقاري، الراتب الصافي، مكافأة نهاية الخدمة، الفائدة المركبة، والعائد على الاستثمار (ROI) على معادلات رياضية قياسية وقوانين عمل معلنة. إلا أن الشروط الفعلية للبنوك وشركات التمويل وجهات العمل قد تتضمن رسوماً إضافية، تأمينات، أو لوائح داخلية تختلف عن النماذج الحسابية العامة.
            </p>
            <p className="terms-p">
              لا يتحمل الموقع أي مسؤولية عن أي قرارات مالية، استثمارية، أو قروض يتم اتخاذها بناءً على المخرجات التقديرية لهذه الحاسبات.
            </p>
          </section>

          <section className="terms-sec" id="sharia" aria-labelledby="d3">
            <h2 className="terms-h2" id="d3">
              <span className="terms-n" aria-hidden="true">3</span>
              <span>إخلاء المسؤولية الشرعية والفقهية</span>
            </h2>
            <p className="terms-p">
              في أدوات الزكاة، الميراث، زكاة الفطر، والكفارات، تم بناء الخوارزميات وفق الراجح والمعتمد لدى كبرى المجامع الفقهية ودور الإفتاء الرسمية. ومع ذلك، فإن بعض المسائل الفقهية الدقيقة (كالديون المشكوك فيها، أو الحالات المركبة في الميراث، أو الخلافات الفقهية بين المذاهب) تتطلب فتوى شرعية خاصة من عالم أو جهة إفتاء معتمدة تناسب خصوصية حالة السائل.
            </p>
          </section>

          <section className="terms-sec" id="health" aria-labelledby="d4">
            <h2 className="terms-h2" id="d4">
              <span className="terms-n" aria-hidden="true">4</span>
              <span>إخلاء المسؤولية الصحية (كتلة الجسم BMI)</span>
            </h2>
            <p className="terms-p">
              مؤشر كتلة الجسم (BMI) واحتياجات السعرات الحرارية هي مؤشرات إحصائية عامة وفق معايير منظمة الصحة العالمية، ولا تأخذ في الحسبان نسبة الدهون مقابل العضلات للرياضيين، أو الحالات الصحية الخاصة، أو فترات الحمل. لا تغني هذه النتائج بأي حال عن الاستشارة الطبية المباشرة مع طبيب مختص أو أخصائي تغذية معتمد.
            </p>
          </section>

          <section className="terms-sec" id="rates" aria-labelledby="d5">
            <h2 className="terms-h2" id="d5">
              <span className="terms-n" aria-hidden="true">5</span>
              <span>أسعار الفضة والعملات</span>
            </h2>
            <p className="terms-p">
              يتم جلب أسعار الفضة وأسعار الصرف عبر واجهات برمجية خارجية (APIs) أو أسعار معيارية دورية. قد يحدث تأخير أو اختلاف طفيف بين الأسعار المعروضة وأسعار السوق الفورية الفعلية في بلدك، لذا يُرجى التحقق من الأسعار المحلية عند إجراء المعاملات الكبرى.
            </p>
          </section>

          <section className="terms-sec" id="limitation" aria-labelledby="d6">
            <h2 className="terms-h2" id="d6">
              <span className="terms-n" aria-hidden="true">6</span>
              <span>تحديد المسؤولية</span>
            </h2>
            <p className="terms-p">
              باستخدامك للموقع، فإنك توافق صراحة على أن استخدامك للأدوات يقع على مسؤوليتك الشخصية الكاملة، وأن الموقع وفريق العمل غير مسؤولين بأي شكل من الأشكال عن أي أضرار مادية، خسائر أرباح، أو التزامات ناتجة عن استخدام أو عدم القدرة على استخدام هذه الخدمات.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}