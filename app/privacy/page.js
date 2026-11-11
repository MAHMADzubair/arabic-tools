export const metadata = {
  title: "سياسة الخصوصية",
  description:
    "تعرف على سياسة الخصوصية لمنصة Qemlo، وكيفية تعاملنا مع البيانات، واستخدام ملفات تعريف الارتباط (Cookies)، والتزامنا بأمان معلوماتك.",
  alternates: { canonical: "/privacy" },
};

// Edit by hand whenever the policy actually changes (a render-time date always claims "just updated").
const LAST_UPDATED = "نوفمبر 2026";

const A = "text-brand font-bold underline";
const BOX = "rounded-2xl border border-brand-border/60 bg-brand-surface/30 p-4 text-xs sm:text-sm text-ink-secondary space-y-2";
const P = "text-sm sm:text-base leading-relaxed text-ink-secondary";
const H2 = "text-lg font-bold text-ink flex items-center gap-2";

export default function PrivacyPage() {
  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-brand-light px-4 py-1 text-xs font-bold text-brand-dark mb-3">
            حماية بياناتك
          </span>
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">
            سياسة الخصوصية
          </h1>
          <p className="mt-2 text-xs text-ink-muted">
            آخر تحديث: {LAST_UPDATED}
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

          <section id="help-requests" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>📨</span>
              <span>بيانات طلبات المساعدة (الفوترة الإلكترونية)</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              الاستثناء الوحيد من المعالجة المحلية هو نموذج «تحتاج من يساعدك في الربط؟» في أداة التحقق من الموجة 25. حين ترسله نحفظ ما كتبته فيه فقط: اسمك، واسم المنشأة، ورقم الجوال، والبريد إن كتبته، ونوع نظام الفوترة، وسنوات الإيرادات التي ظهرت في نتيجتك. لا نحفظ أرقام إيراداتك ولا رقمك الضريبي.
            </p>
            <div className="rounded-2xl border border-brand-border/60 bg-brand-surface/30 p-4 text-xs sm:text-sm text-ink-secondary space-y-2">
              <p>• نستخدم البيانات للتواصل معك بخصوص طلبك فقط، بموافقتك الصريحة.</p>
              <p>• لا نشارك بياناتك مع أي طرف آخر إلا إذا وافقت على ذلك في خانة منفصلة، وحينها نشاركها مع مزوّد حلول معتمد أو مستشار واحد لغرض طلبك فقط.</p>
              <p>• لا نبيع بياناتك ولا نستخدمها في رسائل تسويقية. لطلب حذفها راسلنا على contact@qemlo.com.</p>
              <p>• إفصاح: قد نحصل على عمولة إحالة من المزوّد إذا اشتركت لاحقاً في حل عن طريقنا. هذه العمولة مقابل اشتراك تختاره أنت، وليست مقابل بياناتك، ولا تُضاف إلى سعرك. Qemlo منصة مستقلة وليست تابعة لهيئة الزكاة والضريبة والجمارك.</p>
            </div>
          </section>

          <section id="cookies-ads" className="space-y-3 scroll-mt-24">
            <h2 className={H2}>
              <span>🍪</span>
              <span>2. ملفات تعريف الارتباط (Cookies) والإعلانات</span>
            </h2>
            <p className={P}>
              نعرض إعلانات من Google AdSense لتغطية تكاليف تشغيل الموقع وإبقاء الأدوات مجانية. تستخدم Google وشركاؤها من الموردين
              الخارجيين ملفات تعريف الارتباط لعرض الإعلانات بناءً على زياراتك السابقة لهذا الموقع أو لمواقع أخرى على الإنترنت.
            </p>
            <div className={BOX}>
              <p>• تتيح ملفات تعريف الارتباط الإعلانية لـ Google وشركائها عرض إعلانات لك استناداً إلى زياراتك لهذا الموقع و/أو لمواقع أخرى.</p>
              <p>
                • يمكنك إيقاف الإعلانات المخصّصة من{" "}
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className={A}>إعدادات الإعلانات في Google</a>،
                أو إيقاف ملفات تعريف الارتباط لدى موردين آخرين من{" "}
                <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className={A}>www.aboutads.info</a>.
              </p>
              <p>
                • لمعرفة كيف تستخدم Google البيانات عند استخدامك لمواقع شركائها راجع{" "}
                <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className={A}>صفحة Google عن مواقع الشركاء</a>.
              </p>
              <p>• يمكنك أيضاً حذف ملفات تعريف الارتباط أو حظرها من إعدادات متصفحك في أي وقت؛ ستعمل الحاسبات كلها دونها.</p>
            </div>
          </section>

          <section id="consent" className="space-y-3 scroll-mt-24">
            <h2 className={H2}>
              <span>✅</span>
              <span>3. الموافقة للزوار من أوروبا والمملكة المتحدة</span>
            </h2>
            <p className={P}>
              إذا كنت تزورنا من المنطقة الاقتصادية الأوروبية أو المملكة المتحدة أو سويسرا، تعرض لك Google رسالة موافقة معتمدة قبل
              استخدام ملفات تعريف الارتباط الإعلانية، ويمكنك القبول أو الرفض أو تغيير اختيارك لاحقاً. إذا رفضت قد تظهر لك إعلانات غير مخصّصة.
            </p>
          </section>

          <section id="analytics" className="space-y-3 scroll-mt-24">
            <h2 className={H2}>
              <span>📈</span>
              <span>4. التحليلات والاستضافة</span>
            </h2>
            <div className={BOX}>
              <p>
                • نستخدم Google Analytics 4 لمعرفة الصفحات الأكثر زيارة ومصادر الزوار بشكل إجمالي. لا نرسل إليه المبالغ أو الأرقام التي تكتبها في الحاسبات، بل أحداثاً عامة فقط مثل استخدام أداة ونوع النتيجة.
                لإيقافه يمكنك استخدام{" "}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className={A}>إضافة إيقاف Google Analytics</a>.
              </p>
              <p>• يُستضاف الموقع على Vercel التي تسجل بيانات تقنية قياسية (عنوان IP، نوع المتصفح، الصفحة المطلوبة) لأغراض الأمان والتشغيل.</p>
              <p>• بيانات نموذج المساعدة في الموجة 25 ونموذج التسجيل في البرنامج التجريبي لمساعد المبيعات (الاسم والبريد ورقم واتساب واسم المتجر) تُحفظ في قاعدة بيانات Supabase مشفّرة ولا يطّلع عليها إلا فريق Qemlo، وتُستخدم للتواصل بخصوص طلبك فقط.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>📊</span>
              <span>5. بيانات السجلات (Log Data)</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              عند زيارة الموقع، قد نقوم تلقائياً بجمع معلومات قياسية مجهولة الهوية يرسلها متصفحك، مثل: نوع المتصفح، نظام التشغيل، الصفحات التي قمت بزيارتها، وقت وتاريخ الزيارة. نستخدم هذه المعلومات حصراً لأغراض إحصائية وتحسين أداء الموقع وسرعة استجابته.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>🔗</span>
              <span>6. الروابط الخارجية</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              قد يحتوي موقعنا على روابط لمواقع خارجية لأغراض المراجع أو الإسناد القانوني والشرعي. نحن لسنا مسؤولين عن ممارسات الخصوصية أو محتوى تلك المواقع الخارجية، وننصح دائماً بمراجعة سياسات الخصوصية الخاصة بها.
            </p>
          </section>

          <section id="children-retention" className="space-y-3 scroll-mt-24">
            <h2 className={H2}>
              <span>👨‍👩‍👧</span>
              <span>7. الأطفال ومدة الاحتفاظ بالبيانات</span>
            </h2>
            <div className={BOX}>
              <p>• الموقع غير موجّه للأطفال دون 13 عاماً، ولا نجمع عن قصد أي بيانات شخصية منهم.</p>
              <p>• نحتفظ ببيانات النماذج حتى انتهاء الغرض منها أو 12 شهراً كحد أقصى، ثم نحذفها. ويمكنك طلب حذفها قبل ذلك في أي وقت.</p>
              <p>• إذا غيّرنا هذه السياسة تغييراً جوهرياً نحدّث تاريخ «آخر تحديث» أعلى الصفحة ونسجّل التغيير في <a href="/changelog" className={A}>سجل التحديثات</a>.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>🛡️</span>
              <span>8. حقوق المستخدم والتواصل</span>
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

