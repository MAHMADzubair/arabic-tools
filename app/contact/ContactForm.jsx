"use client";

import { useState } from "react";

const fieldCls =
  "w-full rounded-xl border-2 border-[var(--text-3)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--text)] placeholder:text-[var(--text-3)] transition-colors focus:border-[var(--text)] focus:outline-none";
const labelCls = "mb-1.5 block text-sm font-bold text-[var(--text)]";
const reqCls = "text-[var(--error)]";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "استفسار عام",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10">
      {submitted ? (
        <div className="space-y-4 py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--success)] text-3xl font-black text-[var(--success)]">
            ✓
          </div>
          <h2 className="text-2xl font-black text-[var(--text)]">شكراً لتواصلك معنا!</h2>
          <p className="mx-auto max-w-md text-sm leading-8 text-[var(--text-2)]">
            تم استلام رسالتك بنجاح وسيقوم فريق العمل بمراجعتها والرد عليك عبر بريدك الإلكتروني في أقرب وقت ممكن.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: "", email: "", subject: "استفسار عام", message: "" });
            }}
            className="mt-4 rounded-xl border-2 border-[var(--text)] px-6 py-2.5 text-sm font-black text-[var(--text)] transition-colors hover:bg-[var(--text)] hover:text-[var(--bg)]"
          >
            إرسال رسالة أخرى
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="cf-name" className={labelCls}>
                الاسم الكامل <span className={reqCls}>*</span>
              </label>
              <input
                id="cf-name"
                type="text"
                required
                placeholder="مثال: أحمد محمد"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={fieldCls}
              />
            </div>

            <div>
              <label htmlFor="cf-email" className={labelCls}>
                البريد الإلكتروني <span className={reqCls}>*</span>
              </label>
              <input
                id="cf-email"
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`${fieldCls} text-left`}
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cf-subject" className={labelCls}>
              موضوع الرسالة
            </label>
            <select
              id="cf-subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={fieldCls}
            >
              <option value="استفسار عام">استفسار عام</option>
              <option value="اقتراح أداة جديدة">اقتراح أداة أو ميزة جديدة</option>
              <option value="إبلاغ عن خطأ حسابي">إبلاغ عن خطأ أو تعديل في القوانين</option>
              <option value="شراكات وإعلانات">شراكات وإعلانات</option>
            </select>
          </div>

          <div>
            <label htmlFor="cf-message" className={labelCls}>
              نص الرسالة <span className={reqCls}>*</span>
            </label>
            <textarea
              id="cf-message"
              required
              rows={5}
              placeholder="اكتب تفاصيل رسالتك أو ملاحظاتك هنا..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={`${fieldCls} resize-y`}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--orange)] py-3.5 text-base font-black text-[var(--on-orange)] transition-colors hover:bg-[var(--orange-hover)] active:bg-[var(--orange-press)]"
          >
            إرسال الرسالة
          </button>
        </form>
      )}

      <div className="mt-10 space-y-1 border-t border-dashed border-[var(--border)] pt-6 text-center text-xs text-[var(--text-3)] sm:text-sm">
        <p>أو يمكنك مراسلتنا مباشرة عبر البريد الإلكتروني:</p>
        <p className="font-mono text-sm font-bold text-[var(--text)] sm:text-base" dir="ltr">
          support@arabic-tools.com
        </p>
      </div>
    </div>
  );
}