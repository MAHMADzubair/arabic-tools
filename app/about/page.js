import { CATEGORIES, getToolsByCategory, getToolCount } from "@/lib/registry";

export const metadata = {
  title: "عن Qemlo | حاسبات ومحولات عربية مجانية",
  description:
    "تعرّف على «منصة Qemlo»: موقع مجاني يجمع الحاسبات والمحولات المالية والإسلامية واليومية بواجهة عربية وبدون تسجيل، وما نلتزم به وما لا نقدمه.",
};

// ⚠️ Fill this in. Until you do, the contact section is hidden.
const CONTACT_EMAIL = "";

// Same Ink & Signal tokens as the homepage. Once they live in layout/globals,
// delete this constant and the <style> tag below.
const TOKENS_CSS = `
:root{
  --bg:#F5F5F2; --surface:#FFFFFF; --border:#D4D4CE;
  --text:#0D0D0D; --text-2:#555555; --text-3:#6B6B66;
  --card:#0D0D0D; --card-text:#FFFFFF; --card-muted:#B5B5B0;
  --card-border:#2A2A2A;
  --orange:#FF5B04; --orange-hover:#FF7A33; --orange-press:#E64F00; --on-orange:#0D0D0D;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#0D0D0D; --surface:#161616; --border:#2A2A2A;
    --text:#F5F5F2; --text-2:#B5B5B0; --text-3:#8E8E89;
    --card:#CFCFCA; --card-text:#0D0D0D; --card-muted:#4A4A47;
    --card-border:#A9A9A4;
  }
}
:root[data-theme="dark"]{
  --bg:#0D0D0D; --surface:#161616; --border:#2A2A2A;
  --text:#F5F5F2; --text-2:#B5B5B0; --text-3:#8E8E89;
  --card:#CFCFCA; --card-text:#0D0D0D; --card-muted:#4A4A47;
  --card-border:#A9A9A4;
}
body{background:var(--bg);color:var(--text)}
:focus-visible{outline:2px solid var(--text);outline-offset:3px}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

const PRINCIPLES = [
  {
    title: "مجاني وبلا تسجيل",
    desc: "لا حساب ولا بريد إلكتروني. افتح الأداة واحسب.",
  },
  {
    title: "الحساب داخل متصفحك",
    desc: "تُجرى الحسابات على جهازك، ولا تحتاج إلى رفع أرقامك لتحصل على نتيجة.",
  },
  {
    title: "نوضح كيف حُسب الرقم",
    desc: "نعرض المعادلة أو السند النظامي بجانب النتيجة كلما أمكن، لتتحقق بنفسك.",
  },
  {
    title: "عربي أولاً",
    desc: "واجهة من اليمين إلى اليسار، ومصطلحات تناسب الخليج وبقية الدول العربية.",
  },
];

export default function AboutPage() {
  const totalTools = getToolCount();
  const activeCategories = CATEGORIES.map((cat) => ({
    ...cat,
    tools: getToolsByCategory(cat.id),
  })).filter((cat) => cat.tools.length > 0);

  const n = (v) => v.toLocaleString("en-US"); // Western digits

  return (
    <div className="bg-[var(--bg)] text-[var(--text)]">
      <style dangerouslySetInnerHTML={{ __html: TOKENS_CSS }} />

      {/* ── Hero ── */}
      <section className="border-b border-[var(--border)] px-4 py-14 sm:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <p className="mb-4 inline-block rounded-full border border-[var(--text)] px-3 py-1 text-xs font-bold">
              من نحن
            </p>
            <h1 className="text-4xl font-black leading-[1.3] tracking-tight sm:text-5xl">
              حاسبات عربية
              <br />
              <span className="underline decoration-[var(--orange)] decoration-[6px] underline-offset-[14px]">
                واضحة وبسيطة
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[var(--text-2)] sm:text-lg">
              «منصة Qemlo» موقع مجاني يجمع الحاسبات والمحولات التي يحتاجها المستخدم العربي في المال والعمل والشؤون الإسلامية والحياة اليومية، بواجهة عربية وبدون تسجيل.
            </p>
            <a
              href="/"
              className="mt-8 inline-block rounded-xl bg-[var(--orange)] px-7 py-3.5 text-base font-black text-[var(--on-orange)] transition-colors hover:bg-[var(--orange-hover)] active:bg-[var(--orange-press)]"
            >
              تصفح الأدوات
            </a>
          </div>

          {/* Ledger: live from the registry */}
          <div className="mx-auto w-full max-w-sm" aria-label="ملخص الموقع">
            <div className="bg-[var(--card)] px-6 pt-6 text-[var(--card-text)]">
              <div className="flex items-baseline justify-between border-b border-dashed border-[var(--card-muted)] pb-3">
                <p className="text-lg font-black">الموقع بالأرقام</p>
                <p className="text-xs text-[var(--card-muted)]">Qemlo</p>
              </div>
              <ul className="py-3">
                {activeCategories.map((cat) => (
                  <li key={cat.id} className="flex items-baseline gap-2 py-1.5 text-sm">
                    <span className="shrink-0 font-semibold">{cat.nameAr}</span>
                    <span className="flex-1 border-b border-dotted border-[var(--card-muted)]" aria-hidden="true" />
                    <span className="shrink-0 font-black tabular-nums">{n(cat.tools.length)}</span>
                  </li>
                ))}
                <li className="flex items-baseline gap-2 py-1.5 text-sm">
                  <span className="shrink-0 font-semibold">تسجيل مطلوب</span>
                  <span className="flex-1 border-b border-dotted border-[var(--card-muted)]" aria-hidden="true" />
                  <span className="shrink-0 font-black">0</span>
                </li>
                <li className="flex items-baseline gap-2 py-1.5 text-sm">
                  <span className="shrink-0 font-semibold">رسوم الاستخدام</span>
                  <span className="flex-1 border-b border-dotted border-[var(--card-muted)]" aria-hidden="true" />
                  <span className="shrink-0 font-black">0</span>
                </li>
              </ul>
              <div className="-mx-6 flex items-center justify-between bg-[var(--orange)] px-6 py-4 text-[var(--on-orange)]">
                <span className="font-black">أداة وحاسبة</span>
                <span className="text-3xl font-black tabular-nums">{n(totalTools)}</span>
              </div>
              <p className="py-4 text-center text-xs text-[var(--card-muted)]">
                تُحدَّث الأرقام تلقائياً مع كل أداة جديدة
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-3xl space-y-14 px-4 py-12 sm:py-16">
        {/* ── Why ── */}
        <section aria-labelledby="why">
          <h2 id="why" className="mb-4 border-s-4 border-[var(--text)] ps-3 text-2xl font-black">
            لماذا بنينا هذا الموقع؟
          </h2>
          <p className="text-base leading-9 text-[var(--text-2)]">
            كثير من الأدوات المتاحة بالعربية تُخفي طريقة الحساب، أو تطلب بياناتك قبل أن تعطيك رقماً، أو تُصمَّم أصلاً بلغة أخرى ثم تُترجم. أردنا أداة تعطيك النتيجة والمعادلة التي وراءها في صفحة نظيفة، بالعربية من أول سطر.
          </p>
        </section>

        {/* ── Principles ── */}
        <section aria-labelledby="principles">
          <h2 id="principles" className="mb-6 border-s-4 border-[var(--text)] ps-3 text-2xl font-black">
            ما نلتزم به
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <li
                key={p.title}
                className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--card)] text-sm font-black text-[var(--card-text)]"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-extrabold">{p.title}</h3>
                  <p className="mt-1 text-sm leading-7 text-[var(--text-2)]">{p.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Limits: the important one ── */}
        <section
          aria-labelledby="limits"
          className="rounded-xl border-2 border-[var(--text)] border-s-[10px] border-s-[var(--orange)] p-6"
        >
          <h2 id="limits" className="mb-3 text-2xl font-black">
            حدود ما نقدمه
          </h2>
          <p className="text-base leading-9 text-[var(--text-2)]">
            نتائج الأدوات <strong className="text-[var(--text)]">تقديرية وللاسترشاد فقط</strong>، ولا تغني عن مختص مالي أو قانوني أو شرعي أو طبي. أسعار الصرف وبعض المعدلات والأنظمة تتغير، فتحقق منها من مصدرها الرسمي قبل أي معاملة.
          </p>
          <p className="mt-3 text-sm leading-8 text-[var(--text-2)]">
            للتفاصيل راجع{" "}
            <a href="/disclaimer" className="font-bold text-[var(--text)] underline underline-offset-4">
              إخلاء المسؤولية
            </a>{" "}
            و{" "}
            <a href="/terms" className="font-bold text-[var(--text)] underline underline-offset-4">
              شروط الاستخدام
            </a>
            .
          </p>
        </section>

        {/* ── Contact (hidden until CONTACT_EMAIL is set) ── */}
        {CONTACT_EMAIL && (
          <section aria-labelledby="contact">
            <h2 id="contact" className="mb-4 border-s-4 border-[var(--text)] ps-3 text-2xl font-black">
              وجدت خطأ؟ أخبرنا
            </h2>
            <p className="text-base leading-9 text-[var(--text-2)]">
              إن لاحظت خطأً في حساب أو نظام أو رقم قديم، أو أردت اقتراح أداة جديدة، راسلنا وسنراجعه.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-block rounded-xl border-2 border-[var(--text)] px-6 py-3 text-base font-black transition-colors hover:bg-[var(--text)] hover:text-[var(--bg)]"
              dir="ltr"
            >
              {CONTACT_EMAIL}
            </a>
          </section>
        )}
      </main>
    </div>
  );
}