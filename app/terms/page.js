export const metadata = {
  title: "شروط الاستخدام | Qemlo",
  description:
    "شروط وأحكام استخدام منصة Qemlo، حدود المسؤولية القانونية والاسترشادية، وحقوق الملكية الفكرية.",
};

// Edit this by hand whenever the terms actually change.
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
.terms-p strong { color: var(--c-ink); }
.terms-list { margin: 0.9rem 0 0; padding-inline-start: 1.4rem; display: grid; gap: 0.6rem; font-size: 0.95rem; line-height: 1.9; color: var(--c-ink-soft); }
.terms-list li::marker { color: var(--c-ink); }

/* The key section: orange is used as a bar, not as text */
.terms-key { margin-block-start: 0; padding: 1.5rem 1.25rem; border: 2px solid var(--c-ink); border-inline-start: 10px solid var(--c-signal); border-radius: 12px; }
.terms-card > .terms-key { margin-block: 1.75rem; }

@media print {
  .terms { padding: 0; }
  .terms-card { border: 0; padding: 0; }
}
`;

export default function TermsPage() {
  return (
    <div className="terms">
      <style>{CSS}</style>

      <article className="terms-wrap">
        {/* Header */}
        <header className="terms-head">
          <p className="terms-badge">الأحكام والشروط</p>
          <h1 className="terms-title">شروط الاستخدام</h1>
          <p className="terms-date">آخر تحديث: {LAST_UPDATED}</p>
        </header>

        {/* Content */}
        <div className="terms-card">
          <section className="terms-sec" id="agreement" aria-labelledby="t1">
            <h2 className="terms-h2" id="t1">
              <span className="terms-n" aria-hidden="true">1</span>
              <span>الموافقة على الشروط</span>
            </h2>
            <p className="terms-p">
              باستخدامك لمنصة «Qemlo» أو أي من الحاسبات والمحولات المتوفرة عليها، فإنك تقر وتوافق على الالتزام بشروط الاستخدام الموضحة هنا. إذا كنت لا توافق على هذه الشروط، يرجى التوقف عن استخدام الموقع.
            </p>
          </section>

          <section className="terms-sec terms-key" id="liability" aria-labelledby="t2">
            <h2 className="terms-h2" id="t2">
              <span className="terms-n" aria-hidden="true">2</span>
              <span>الطبيعة الاسترشادية وحدود المسؤولية</span>
            </h2>
            <p className="terms-p">
              كافة الأدوات والحاسبات المالية، والشرعية، والطبية (مثل مؤشر كتلة الجسم)، وحسابات الرواتب والقروض ونهاية الخدمة مقدمة <strong>لأغراض استرشادية وتثقيفية عامة فقط</strong>.
            </p>
            <ul className="terms-list">
              <li>الموقع لا يقدم استشارات مالية، استثمارية، قانونية، أو طبية ملزمة.</li>
              <li>لا يعتبر استخدام الحاسبات بديلاً عن مراجعة العقود الرسمية الموقعة مع جهات العمل، أو البنوك، أو الجهات الحكومية المختصة.</li>
              <li>لا يتحمل الموقع أو القائمون عليه أي مسؤولية قانونية أو مالية مباشرة أو غير مباشرة ناتجة عن اتخاذ أي قرارات مالية أو تجارية بناءً على نتائج هذه الحاسبات.</li>
            </ul>
          </section>

          <section className="terms-sec" id="ip" aria-labelledby="t3">
            <h2 className="terms-h2" id="t3">
              <span className="terms-n" aria-hidden="true">3</span>
              <span>الملكية الفكرية</span>
            </h2>
            <p className="terms-p">
              جميع النصوص، والتصاميم، والأكواد البرمجية، والمحتوى الإرشادي المتوفر على المنصة هي حقوق محفوظة لمنصة «Qemlo». يُسمح بالاستخدام الشخصي للأدوات ومشاركة الروابط، ويُحظر نسخ أو استنساخ الموقع أو إعادة هندسته برمجياً لأغراض تجارية دون إذن خطي مسبق.
            </p>
          </section>

          <section className="terms-sec" id="changes" aria-labelledby="t4">
            <h2 className="terms-h2" id="t4">
              <span className="terms-n" aria-hidden="true">4</span>
              <span>التعديلات والتحديثات</span>
            </h2>
            <p className="terms-p">
              نحتفظ بالحق في تعديل أو تحديث هذه الشروط أو آليات عمل الحاسبات في أي وقت دون إشعار مسبق، وذلك لمواكبة التغيرات في القوانين، والضرائب، وأسعار الصرف، والأنظمة العمالية. يعتبر استمرارك في استخدام الموقع بعد إجراء أي تعديلات قبولاً صريحاً بها.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}