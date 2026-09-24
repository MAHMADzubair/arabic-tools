export const metadata = {
  title: "سياسة الخصوصية | أدوات عربية مجانية",
  description:
    "تعرف على سياسة الخصوصية لمنصة أدوات عربية، وكيفية تعاملنا مع البيانات، واستخدام ملفات تعريف الارتباط (Cookies)، والتزامنا بأمان معلوماتك.",
};

export default function PrivacyPage() {
  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-brand-light px-4 py-1 text-xs font-bold text-brand-dark mb-3">
            حماية بياناتك
          </span>
          <h1 className="text-3xl font-black text-ink sm:text-4xl">
            سياسة الخصوصية
          </h1>
          <p className="mt-2 text-xs text-ink-muted">
            آخر تحديث: {new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}
          </p>
        </div>

        {/* Content Box */}
        <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-card sm:p-10 space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>🔒</span>
              <span>1. خصوصية العمليات الحسابية والمدخلات</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              نحن نولي خصوصيتك أهمية قصوى. جميع البيانات المالية، الرواتب، الأرقام، المبالغ الزكوية، والبيانات الشخصية التي تقوم بإدخالها في حاسباتنا ومحولاتنا تُعالج <strong>محلياً فقط داخل متصفحك (Client-side)</strong>. لا نقوم بتخزينها، حفظها، أو نقلها إلى أي خوادم خارجية أو قواعد بيانات تابعة لنا.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>🍪</span>
              <span>2. ملفات تعريف الارتباط (Cookies) والشراكات الإعلانية</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              مثل معظم المواقع على الإنترنت، قد يستخدم موقعنا ملفات تعريف الارتباط (Cookies) لتحسين تجربة المستخدم وتحليل حركة الزوار. قد يستخدم شركاؤنا من شبكات الإعلانات (مثل Google AdSense) ملفات تعريف الارتباط لتقديم إعلانات ملائمة بناءً على زيارات المستخدمين السابقة لموقعنا أو مواقع أخرى على الإنترنت.
            </p>
            <div className="rounded-2xl border border-brand-border/60 bg-brand-surface/30 p-4 text-xs sm:text-sm text-ink-secondary space-y-2">
              <p>• تستخدم Google ملف تعريف الارتباط DART لعرض الإعلانات للمستخدمين استناداً إلى زيارتهم للمواقع عبر الإنترنت.</p>
              <p>• يمكن للمستخدمين إلغاء الاشتراك في استخدام ملف تعريف الارتباط DART عبر زيارة <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-brand font-bold underline">إعدادات الإعلانات في Google</a>.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>📊</span>
              <span>3. بيانات السجلات والتحليلات (Log Data)</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              عند زيارة الموقع، قد نقوم تلقائياً بجمع معلومات قياسية مجهولة الهوية يرسلها متصفحك، مثل: نوع المتصفح، نظام التشغيل، الصفحات التي قمت بزيارتها، وقت وتاريخ الزيارة. نستخدم هذه المعلومات حصراً لأغراض إحصائية وتحسين أداء الموقع وسرعة استجابته.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>🔗</span>
              <span>4. الروابط الخارجية</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              قد يحتوي موقعنا على روابط لمواقع خارجية لأغراض المراجع أو الإسناد القانوني والشرعي. نحن لسنا مسؤولين عن ممارسات الخصوصية أو محتوى تلك المواقع الخارجية، وننصح دائماً بمراجعة سياسات الخصوصية الخاصة بها.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>🛡️</span>
              <span>5. حقوق المستخدم والتواصل</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              إذا كان لديك أي أسئلة أو استفسارات بخصوص سياسة الخصوصية هذه أو كيفية التعامل مع بياناتك، يسعدنا تواصلك معنا عبر صفحة <a href="/contact" className="text-brand font-bold underline">اتصل بنا</a> وسنقوم بالرد في أقرب وقت ممكن.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
