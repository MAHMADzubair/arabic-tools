"use client";

import { useRef, useState } from "react";

const CONTACT_EMAIL = "contact@qemlo.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const CONTACT_TOPICS = [
  "خطأ في نتيجة حاسبة",
  "نسبة أو موعد تغيّر رسمياً",
  "أداة تحتاجها ولا تجدها",
  "شراكة أو إعلان",
  "شيء آخر",
];

const fieldCls =
  "w-full rounded-none border-0 border-b-2 border-[var(--text-3)] bg-transparent px-0 py-2.5 text-lg text-[var(--text)] placeholder:text-[var(--text-3)] transition-colors focus:border-[var(--orange)] focus:outline-none focus-visible:outline-none";
const labelCls = "block text-sm font-semibold text-[var(--text)]";

export default function ContactForm() {
  const emailRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: CONTACT_TOPICS[0],
    toolUrl: "",
    message: "",
  });
  const [emailError, setEmailError] = useState(false);
  const [opened, setOpened] = useState(false);

  const set = (key) => (event) => {
    setFormData({ ...formData, [key]: event.target.value });
    if (key === "email" && emailError) setEmailError(!EMAIL_RE.test(event.target.value.trim()));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!EMAIL_RE.test(formData.email.trim())) {
      setEmailError(true);
      emailRef.current?.focus();
      return;
    }

    const body = [
      `الاسم: ${formData.name}`,
      `البريد الإلكتروني: ${formData.email}`,
      `الموضوع: ${formData.subject}`,
      formData.toolUrl ? `رابط الأداة: ${formData.toolUrl}` : null,
      "",
      "الرسالة:",
      formData.message,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `[Qemlo] ${formData.subject}`
    )}&body=${encodeURIComponent(body)}`;

    // Hand the prepared message to the visitor's configured email application.
    // The visitor reviews it and presses Send; the website never claims it was sent.
    window.location.href = mailtoUrl;
    setOpened(true);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-7">
      <div className="grid gap-7 sm:grid-cols-2 sm:gap-x-8">
        <div>
          <label htmlFor="cf-name" className={labelCls}>اسمك</label>
          <input
            id="cf-name"
            type="text"
            required
            autoComplete="name"
            value={formData.name}
            onChange={set("name")}
            className={fieldCls}
          />
        </div>
        <div>
          <label htmlFor="cf-email" className={labelCls}>بريدك للرد</label>
          <input
            id="cf-email"
            ref={emailRef}
            type="email"
            required
            dir="ltr"
            autoComplete="email"
            aria-invalid={emailError ? "true" : "false"}
            aria-describedby={emailError ? "cf-email-error" : undefined}
            value={formData.email}
            onChange={set("email")}
            className={`${fieldCls} text-left ${emailError ? "!border-[var(--error)]" : ""}`}
          />
          {emailError && (
            <p id="cf-email-error" role="alert" className="mt-1.5 text-[13px] leading-7 text-[var(--error)]">
              اكتب بريداً صحيحاً حتى نستطيع الرد عليك، مثل name@example.com
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-7 sm:grid-cols-2 sm:gap-x-8">
        <div>
          <label htmlFor="cf-subject" className={labelCls}>الموضوع</label>
          <select id="cf-subject" value={formData.subject} onChange={set("subject")} className={fieldCls}>
            {CONTACT_TOPICS.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cf-tool" className={labelCls}>
            رابط الأداة <span className="font-normal text-[var(--text-2)]">(إن وُجد)</span>
          </label>
          <input
            id="cf-tool"
            type="url"
            dir="ltr"
            placeholder="qemlo.com/…"
            value={formData.toolUrl}
            onChange={set("toolUrl")}
            className={`${fieldCls} text-left`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="cf-message" className={labelCls}>رسالتك</label>
        <textarea
          id="cf-message"
          required
          rows={5}
          value={formData.message}
          onChange={set("message")}
          className={`${fieldCls} resize-y leading-8`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <button
          type="submit"
          className="inline-flex min-h-[54px] items-center justify-center gap-2.5 rounded-xl bg-[var(--orange)] px-8 text-[17px] font-bold text-[var(--on-orange)] transition-colors hover:bg-[var(--orange-hover)] active:bg-[var(--orange-press)]"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="-scale-x-100">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4 20-7z" />
          </svg>
          أرسل الرسالة
        </button>
        <p className="min-w-[240px] flex-1 text-sm leading-7 text-[var(--text-2)]" role="note">
          سيُفتح تطبيق البريد ورسالتك جاهزة. راجعها ثم اضغط إرسال؛ لن تُرسل الرسالة تلقائياً من الموقع.
        </p>
      </div>

      {opened && (
        <p role="status" className="border-t-[3px] border-[var(--success)] bg-[var(--surface)] p-5 text-[15px] leading-8 text-[var(--text)]">
          جهّزنا رسالتك في تطبيق البريد. اضغط «إرسال» هناك لتصلنا، ونرد خلال 24 ساعة في أيام العمل. إن لم يُفتح التطبيق، انسخ البريد من أعلى الصفحة وراسلنا مباشرة.
        </p>
      )}
    </form>
  );
}
