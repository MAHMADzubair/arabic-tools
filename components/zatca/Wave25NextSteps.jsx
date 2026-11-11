"use client";

/**
 * Next steps under an eligible Wave 25 result: approved providers (official
 * directory), the e-invoicing subsidy, and a consented "help me integrate"
 * request. Renders inside the checker's .zc-root so it inherits its tokens.
 */
import { useState } from "react";
import { INVOICING_SYSTEMS, SUBSIDY, ZATCA_SOLUTION_PROVIDERS_URL } from "@/lib/wave25NextSteps";

const CONTACT_WHATSAPP = "https://wa.me/923131700400";
const label = "zc-text block text-sm font-semibold";
const input =
  "zc-text mt-1 w-full rounded-none border-0 border-b-2 border-[var(--zc-field-bd)] bg-transparent px-0 py-2.5 text-base outline-none focus:border-[#FF5B04]";

function Step({ n, title, children, wide }) {
  return (
    <article className={`zc-card rounded-2xl p-5 ${wide ? "sm:col-span-2" : ""}`}>
      <p className="m-0 text-xs font-bold" style={{ color: "var(--zc-link)", fontFamily: "var(--font-qmono, ui-monospace)" }}>{n}</p>
      <h3 className="zc-text mt-1.5 text-lg font-bold">{title}</h3>
      {children}
    </article>
  );
}

export default function Wave25NextSteps({ triggerYears = [] }) {
  const [form, setForm] = useState({ name: "", businessName: "", whatsapp: "", email: "", invoicingSystem: "", consentContact: false, consentShare: false, _honey: "" });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle"); // idle | sending | sent | unavailable

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState("sending");
    setErrors({});
    try {
      const res = await fetch("/api/wave25-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, triggerYears: triggerYears.join(",") }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) return setState("sent");
      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        return setState("idle");
      }
      setState("unavailable");
    } catch {
      setState("unavailable");
    }
  };

  const err = (k) => errors[k] && <p role="alert" className="zc-err mt-1 text-xs">{errors[k]}</p>;

  return (
    <section aria-labelledby="w25-next" className="space-y-4">
      <div>
        <p className="m-0 text-xs font-bold" style={{ color: "var(--zc-link)" }}>خطوتك التالية</p>
        <h2 id="w25-next" className="zc-text mt-1 text-xl font-bold">ثلاثة أشياء تفعلها هذا الأسبوع</h2>
        <p className="zc-muted mt-1.5 text-sm leading-relaxed">
          <strong className="zc-text">الخلاصة:</strong> اختر حلاً معتمداً من الهيئة، واطلب دعم الفوترة الإلكترونية (حتى 2,500 ريال) إن كنت مؤهلاً، وابدأ الربط قبل 1 فبراير 2027 بأسابيع لا بأيام.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Step n="01" title="اختر حلاً معتمداً من الهيئة">
          <p className="zc-muted mt-2 text-sm leading-relaxed">
            الربط مع منصة فاتورة لا يتم إلا عبر حل اجتاز تأهيل الهيئة. ابدأ من دليل مزوّدي الحلول الرسمي، وتأكد أن الحل يعمل مع نظام البيع أو المحاسبة لديك.
          </p>
          <a href={ZATCA_SOLUTION_PROVIDERS_URL} target="_blank" rel="noopener noreferrer" className="zc-link mt-3 inline-block text-sm">
            دليل المزوّدين المعتمدين — زاتكا ↗
          </a>
        </Step>

        <Step n="02" title="اطلب دعم الفوترة الإلكترونية">
          <p className="zc-text mt-1 text-3xl font-bold">
            حتى {SUBSIDY.maxSar.toLocaleString("en-US")} <span className="text-base">ريال</span>
          </p>
          <p className="zc-muted text-xs">مرة واحدة، تُسترد من قيمة اشتراكك في حل معتمد</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {SUBSIDY.criteria.map((c) => (
              <li key={c} className="zc-text flex gap-2"><span aria-hidden="true" className="font-bold" style={{ color: "var(--zc-ok-tx)" }}>✓</span>{c}</li>
            ))}
          </ul>
          <p className="zc-muted mt-2 text-xs leading-relaxed">يُقدَّم الطلب في بوابة الهيئة: «طلب دعم الفوترة الإلكترونية». الأهلية النهائية تقررها الهيئة.</p>
        </Step>

        <Step n="03" title="تحتاج من يساعدك في الربط؟" wide>
          {state === "sent" ? (
            <div role="status" className="zc-ok mt-3 rounded-xl p-4 text-sm leading-relaxed">
              <strong>وصل طلبك.</strong> سنتواصل معك على واتساب خلال يومي عمل.
              {form.consentShare ? " وقد نوصلك بمزوّد حلول معتمد أو مستشار واحد يناسب منشأتك." : ""}
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-2 space-y-5">
              <p className="zc-muted text-sm leading-relaxed">
                مجاني وبلا التزام. اترك بياناتك ونوصلك بمزوّد حلول معتمد أو مستشار ضريبي يناسب حجم منشأتك، والقرار في الاختيار لك وحدك.
              </p>
              <input type="text" tabIndex={-1} autoComplete="off" value={form._honey} onChange={set("_honey")} className="hidden" aria-hidden="true" />
              <div className="grid gap-5 sm:grid-cols-2">
                <label className={label}>اسمك<input className={input} value={form.name} onChange={set("name")} autoComplete="name" />{err("name")}</label>
                <label className={label}>اسم المنشأة<input className={input} value={form.businessName} onChange={set("businessName")} autoComplete="organization" />{err("businessName")}</label>
                <label className={label}>رقم الجوال (واتساب)<input className={`${input} text-left`} dir="ltr" inputMode="tel" placeholder="05xxxxxxxx" value={form.whatsapp} onChange={set("whatsapp")} autoComplete="tel" />{err("whatsapp")}</label>
                <label className={label}>البريد الإلكتروني <span className="zc-muted font-normal">(اختياري)</span><input className={`${input} text-left`} dir="ltr" type="email" placeholder="name@company.sa" value={form.email} onChange={set("email")} autoComplete="email" />{err("email")}</label>
              </div>
              <fieldset>
                <legend className={`${label} mb-2`}>ما النظام الذي تصدر به فواتيرك اليوم؟</legend>
                <div className="flex flex-wrap gap-2">
                  {INVOICING_SYSTEMS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={form.invoicingSystem === s.id}
                      onClick={() => setForm({ ...form, invoicingSystem: s.id })}
                      className={`zc-focus min-h-[40px] rounded-full px-3.5 text-sm font-semibold ${form.invoicingSystem === s.id ? "zc-pill-active" : "zc-pill-idle"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {err("invoicingSystem")}
              </fieldset>
              <div className="zc-surface space-y-2.5 rounded-xl p-4 text-sm leading-relaxed">
                <label className="zc-text flex items-start gap-2.5">
                  <input type="checkbox" className="mt-1 h-4 w-4 flex-none accent-[#C2410C]" checked={form.consentContact} onChange={set("consentContact")} />
                  <span>أوافق على أن تتواصل معي Qemlo بخصوص طلبي.</span>
                </label>
                {err("consentContact")}
                <label className="zc-text flex items-start gap-2.5">
                  <input type="checkbox" className="mt-1 h-4 w-4 flex-none accent-[#C2410C]" checked={form.consentShare} onChange={set("consentShare")} />
                  <span>
                    وأوافق على مشاركة بياناتي مع <strong>مزوّد حلول معتمد أو مستشار واحد</strong> لغرض هذا الطلب فقط.{" "}
                    <a href="/privacy#help-requests" className="zc-link">كيف نستخدم بياناتك</a>
                  </span>
                </label>
              </div>
              {state === "unavailable" && (
                <p role="alert" className="zc-info rounded-xl p-3 text-sm leading-relaxed">
                  تعذّر إرسال الطلب الآن. راسلنا مباشرة على{" "}
                  <a href={CONTACT_WHATSAPP} target="_blank" rel="noopener noreferrer" className="zc-link">واتساب</a> وسنساعدك.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="zc-focus min-h-[52px] rounded-xl bg-[#FF5B04] px-7 text-base font-bold text-[#0D0D0D] disabled:opacity-60"
                >
                  {state === "sending" ? "جارٍ الإرسال…" : "اطلب المساعدة"}
                </button>
                <span className="zc-muted min-w-[220px] flex-1 text-xs leading-relaxed">لا نطلب رقمك الضريبي ولا بيانات بنكية. لن نرسل لك رسائل تسويقية.</span>
              </div>
              <p id="w25-disclosure" className="zc-muted m-0 border-t pt-3 text-xs leading-relaxed" style={{ borderColor: "var(--zc-line)" }}>
                <strong className="zc-text">إفصاح:</strong> Qemlo منصة مستقلة وليست تابعة لهيئة الزكاة والضريبة والجمارك. إن اشتركت لاحقاً في حل عن طريق مزوّد عرّفناك به، قد نحصل منه على عمولة إحالة دون أي تكلفة إضافية عليك، ولا يؤثر ذلك على النتيجة التي تعرضها الأداة. يمكنك دائماً اختيار أي مزوّد من{" "}
                <a href={ZATCA_SOLUTION_PROVIDERS_URL} target="_blank" rel="noopener noreferrer" className="zc-link">الدليل الرسمي</a>.
              </p>
            </form>
          )}
        </Step>
      </div>
    </section>
  );
}
