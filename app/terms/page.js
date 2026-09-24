export const metadata = {
  title: "شروط الاستخدام | أدوات عربية مجانية",
  description:
    "شروط وأحكام استخدام موقع أدوات عربية، حدود المسؤولية القانونية والاسترشادية، وحقوق الملكية الفكرية.",
};

export default function TermsPage() {
  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-brand-light px-4 py-1 text-xs font-bold text-brand-dark mb-3">
            الأحكام والشروط
          </span>
          <h1 className="text-3xl font-black text-ink sm:text-4xl">
            شروط الاستخدام
          </h1>
          <p className="mt-2 text-xs text-ink-muted">
            آخر تحديث: {new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}
          </p>
        </div>

        {/* Content Box */}
        <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-card sm:p-10 space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>📜</span>
              <span>1. الموافقة على الشروط</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              باستخدامك لموقع «أدوات عربية» أو أي من الحاسبات والمحولات المتوفرة عليه، فإنك تقر وتوافق على الالتزام بشروط الاستخدام الموضحة هنا. إذا كنت لا توافق على هذه الشروط، يرجى التوقف عن استخدام الموقع.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>⚠️</span>
              <span>2. الطبيعة الاسترشادية وحدود المسؤولية</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              كافة الأدوات والحاسبات المالية، والشرعية، والطبية (مثل مؤشر كتلة الجسم)، وحسابات الرواتب والقروض ونهاية الخدمة مقدمة <strong>لأغراض استرشادية وتثقيفية عامة فقط</strong>.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-ink-secondary leading-relaxed mr-2">
              <li>الموقع لا يقدم استشارات مالية، استثمارية، قانونية، أو طبية ملزمة.</li>
              <li>لا يعتبر استخدام الحاسبات بديلاً عن مراجعة العقود الرسمية الموقعة مع جهات العمل، أو البنوك، أو الجهات الحكومية المختصة.</li>
              <li>لا يتحمل الموقع أو القائمون عليه أي مسؤولية قانونية أو مالية مباشرة أو غير مباشرة ناتجة عن اتخاذ أي قرارات مالية أو تجارية بناءً على نتائج هذه الحاسبات.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>💡</span>
              <span>3. الملكية الفكرية</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              جميع النصوص، والتصاميم، والأكواد البرمجية، والمحتوى الإرشادي المتوفر على المنصة هي حقوق محفوظة لموقع «أدوات عربية». يُسمح بالاستخدام الشخصي للأدوات ومشاركة الروابط، ويُحظر نسخ أو استنساخ الموقع أو إعادة هندسته برمجياً لأغراض تجارية دون إذن خطي مسبق.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>🔄</span>
              <span>4. التعديلات والتحديثات</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              نحتفظ بالحق في تعديل أو تحديث هذه الشروط أو آليات عمل الحاسبات في أي وقت دون إشعار مسبق، وذلك لمواكبة التغيرات في القوانين، والضرائب، وأسعار الصرف، والأنظمة العمالية. يعتبر استمرارك في استخدام الموقع بعد إجراء أي تعديلات قبولاً صريحاً بها.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
