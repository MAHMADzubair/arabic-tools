export const metadata = {
  title: "إخلاء المسؤولية | أدوات عربية مجانية",
  description:
    "إخلاء المسؤولية القانونية، المالية، الشرعية، والصحية لحاسبات وأدوات موقع أدوات عربية.",
};

export default function DisclaimerPage() {
  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-brand-light px-4 py-1 text-xs font-bold text-brand-dark mb-3">
            تنبيه قانوني هام
          </span>
          <h1 className="text-3xl font-black text-ink sm:text-4xl">
            إخلاء المسؤولية
          </h1>
          <p className="mt-2 text-xs text-ink-muted">
            آخر تحديث: {new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}
          </p>
        </div>

        {/* Content Box */}
        <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-card sm:p-10 space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>⚠️</span>
              <span>1. طبيعة الأدوات والمعلومات الاسترشادية</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              جميع الحاسبات، والمحولات، والمحتويات، والأمثلة التوضيحية المنشورة على موقع <strong>«أدوات عربية»</strong> مقدمة لأغراض <strong>إعلامية، تثقيفية، واسترشادية عامة فقط</strong>. لا تشكل أي من النتائج الصادرة عن هذه الأدوات استشارة مالية، استثمارية، ضريبية، قانونية، شرعية، أو طبية ملزمة أو مهنية.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>💰</span>
              <span>2. إخلاء المسؤولية المالية والاستثمارية</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              تعتمد حاسبات القروض، التمويل العقاري، الراتب الصافي، مكافأة نهاية الخدمة، الفائدة المركبة، والعائد على الاستثمار (ROI) على معادلات رياضية قياسية وقوانين عمل معلنة. إلا أن الشروط الفعلية للبنوك وشركات التمويل وجهات العمل قد تتضمن رسوماً إضافية، تأمينات، أو لوائح داخلية تختلف عن النماذج الحسابية العامة.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              لا يتحمل الموقع أي مسؤولية عن أي قرارات مالية، استثمارية، أو قروض يتم اتخاذها بناءً على المخرجات التقديرية لهذه الحاسبات.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>🕌</span>
              <span>3. إخلاء المسؤولية الشرعية والفقهية</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              في أدوات الزكاة، الميراث، زكاة الفطر، والكفارات، تم بناء الخوارزميات وفق الراجح والمعتمد لدى كبرى المجامع الفقهية ودور الإفتاء الرسمية. ومع ذلك، فإن بعض المسائل الفقهية الدقيقة (كالديون المشكوك فيها، أو الحالات المركبة في الميراث، أو الخلافات الفقهية بين المذاهب) تتطلب فتوى شرعية خاصة من عالم أو جهة إفتاء معتمدة تناسب خصوصية حالة السائل.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>🏥</span>
              <span>4. إخلاء المسؤولية الصحية (كتلة الجسم BMI)</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              مؤشر كتلة الجسم (BMI) واحتياجات السعرات الحرارية هي مؤشرات إحصائية عامة وفق معايير منظمة الصحة العالمية، ولا تأخذ في الحسبان نسبة الدهون مقابل العضلات للرياضيين، أو الحالات الصحية الخاصة، أو فترات الحمل. لا تغني هذه النتائج بأي حال عن الاستشارة الطبية المباشرة مع طبيب مختص أو أخصائي تغذية معتمد.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>📉</span>
              <span>5. أسعار الفضة والعملات</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              يتم جلب أسعار الفضة وأسعار الصرف عبر واجهات برمجية خارجية (APIs) أو أسعار معيارية دورية. قد يحدث تأخير أو اختلاف طفيف بين الأسعار المعروضة وأسعار السوق الفورية الفعلية في بلدك، لذا يُرجى التحقق من الأسعار المحلية عند إجراء المعاملات الكبرى.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>🛡️</span>
              <span>6. تحديد المسؤولية</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              باستخدامك للموقع، فإنك توافق صراحة على أن استخدامك للأدوات يقع على مسؤوليتك الشخصية الكاملة، وأن الموقع وفريق العمل غير مسؤولين بأي شكل من الأشكال عن أي أضرار مادية، خسائر أرباح، أو التزامات ناتجة عن استخدام أو عدم القدرة على استخدام هذه الخدمات.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
