export const metadata = {
  title: "من نحن | أدوات عربية مجانية",
  description:
    "تعرف على منصة الأدوات العربية المجانية، رسالتنا، معايير الدقة الحسابية والشرعية، وفريق العمل الملتزم بتقديم أفضل تجربة رقمية للمستخدم العربي.",
};

export default function AboutPage() {
  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-brand-light px-4 py-1 text-xs font-bold text-brand-dark mb-3">
            عن المنصة
          </span>
          <h1 className="text-3xl font-black text-ink sm:text-4xl">
            من نحن ورسالتنا
          </h1>
          <p className="mt-3 text-base text-ink-secondary max-w-2xl mx-auto">
            منصة متخصصة في تقديم حاسبات مالية، شرعية، وتجارية دقيقة ومبسطة مصممة خصيصاً للمستخدم العربي.
          </p>
        </div>

        {/* Content Box */}
        <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-card sm:p-10 space-y-8">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>رؤيتنا وهدفنا</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              انطلقت منصة «أدوات عربية» بهدف سد الفجوة في المحتوى الرقمي العربي المتخصص في الأدوات التفاعلية والحاسبات المالية الدقيقة. نؤمن بأن الحسابات اليومية المعقدة — سواء كانت حساب زكاة المال، توزيع التركات الشرعية، حساب فوائد القروض والرهن العقاري، أو مكافأة نهاية الخدمة — يجب أن تكون متاحة للجميع بضغطة زر وبأقصى درجات الشفافية والدقة والسرعة.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span>قيمنا ومبادئنا</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-brand-border/70 bg-brand-surface/40 p-4">
                <h3 className="font-bold text-brand text-base mb-1">الدقة والاعتمادية</h3>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  نعتمد على القوانين الرسمية وأنظمة العمل المحدثة لكل دولة عربية، بالإضافة إلى القواعد الفقهية المعتمدة لدى دور الإفتاء الموثوقة.
                </p>
              </div>
              <div className="rounded-2xl border border-brand-border/70 bg-brand-surface/40 p-4">
                <h3 className="font-bold text-brand text-base mb-1">الخصوصية التامة</h3>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  تتم جميع العمليات الحسابية داخل متصفحك مباشرة دون حفظ أو مشاركة مدخلاتك المالية أو الشخصية على أي خوادم خارجية.
                </p>
              </div>
              <div className="rounded-2xl border border-brand-border/70 bg-brand-surface/40 p-4">
                <h3 className="font-bold text-brand text-base mb-1">مجاني للجميع</h3>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  نلتزم بتقديم كافة أدواتنا وحاسباتنا بشكل مجاني كامل دون اشتراكات خفية أو قيود على عدد مرات الاستخدام.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <span className="text-2xl">⚖️</span>
              <span>إخلاء المسؤولية الاسترشادية</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              جميع الحاسبات والأدوات المتوفرة على الموقع هي أدوات مساعدة واسترشادية تهدف لتسهيل التقديرات الحسابية. في المسائل المالية المعقدة أو العقود الرسمية أو القضايا الشرعية المتنازع عليها، نوصي دائماً بالرجوع إلى مستشار مالي معتمد، أو جهة إفتاء رسمية، أو محامٍ مختص.
            </p>
          </section>

          <div className="pt-6 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-right">
              <p className="font-bold text-ink">لديك اقتراح أو استفسار؟</p>
              <p className="text-xs text-ink-muted">يسعدنا دائماً الاستماع إلى آرائكم وملاحظاتكم لتطوير المنصة.</p>
            </div>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-hero-gradient px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-95 transition"
            >
              تواصل معنا
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
