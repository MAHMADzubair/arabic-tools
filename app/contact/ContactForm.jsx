"use client";

import { useState } from "react";

const CONTACT_EMAIL = "support@arabic-tools.com";
const fieldCls =
  "w-full rounded-xl border-2 border-[var(--text-3)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--text)] placeholder:text-[var(--text-3)] transition-colors focus:border-[var(--text)] focus:outline-none";
const labelCls = "mb-1.5 block text-sm font-bold text-[var(--text)]";
const reqCls = "text-[var(--error)]";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "استفسار عام",
    message: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const body = [
      `الاسم: ${formData.name}`,
      `البريد الإلكتروني: ${formData.email}`,
      `الموضوع: ${formData.subject}`,
      "",
      "الرسالة:",
      formData.message,
    ].join("\n");

    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `[Qemlo] ${formData.subject}`
    )}&body=${encodeURIComponent(body)}`;

    // Hand the prepared message to the visitor's configured email application.
    // The visitor reviews it and presses Send; the website never claims it was sent.
    window.location.href = mailtoUrl;
  };

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10">
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
              autoComplete="name"
              placeholder="مثال: أحمد محمد"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
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
              autoComplete="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
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
            onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
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
            onChange={(event) => setFormData({ ...formData, message: event.target.value })}
            className={`${fieldCls} resize-y`}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[var(--orange)] py-3.5 text-base font-bold text-[var(--on-orange)] transition-colors hover:bg-[var(--orange-hover)] active:bg-[var(--orange-press)]"
        >
          متابعة عبر البريد الإلكتروني
        </button>
        <p className="text-center text-xs leading-7 text-[var(--text-2)]" role="note">
          سيتم فتح تطبيق البريد الإلكتروني مع تجهيز رسالتك. راجع التفاصيل ثم اضغط إرسال؛ لن تُرسل الرسالة تلقائياً من الموقع.
        </p>
      </form>

      <div className="mt-10 space-y-2 border-t border-dashed border-[var(--border)] pt-6 text-center text-xs text-[var(--text-3)] sm:text-sm">
        <p>أو راسلنا مباشرة عبر البريد الإلكتروني:</p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="font-mono text-sm font-bold text-[var(--text)] underline underline-offset-4 sm:text-base"
          dir="ltr"
        >
          {CONTACT_EMAIL}
        </a>
      </div>
    </div>
  );
}
