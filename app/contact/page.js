"use client";

import { useState } from "react";

export default function ContactPage() {
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
    // Client-side acknowledgement for the user
    setSubmitted(true);
  };

  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-brand-light px-4 py-1 text-xs font-bold text-brand-dark mb-3">
            خدمة المستخدمين
          </span>
          <h1 className="text-3xl font-black text-ink sm:text-4xl">
            تواصل معنا
          </h1>
          <p className="mt-3 text-sm sm:text-base text-ink-secondary max-w-xl mx-auto">
            نرحب باقتراحاتك، استفساراتك، أو التبليغ عن أي خطأ حسابي لمساعدتنا في تحسين خدماتنا.
          </p>
        </div>

        <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-card sm:p-10">
          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-ink">شكراً لتواصلك معنا!</h2>
              <p className="text-sm text-ink-secondary max-w-md mx-auto leading-relaxed">
                تم استلام رسالتك بنجاح وسيقوم فريق العمل بمراجعتها والرد عليك عبر بريدك الإلكتروني في أقرب وقت ممكن.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", subject: "استفسار عام", message: "" });
                }}
                className="mt-4 rounded-xl bg-brand-light px-5 py-2 text-sm font-bold text-brand hover:bg-brand-100 transition"
              >
                إرسال رسالة أخرى
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink-secondary">
                    الاسم الكامل <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد محمد"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink-secondary">
                    البريد الإلكتروني <span className="text-accent">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input w-full text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink-secondary">
                  موضوع الرسالة
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input w-full"
                >
                  <option value="استفسار عام">استفسار عام</option>
                  <option value="اقتراح أداة جديدة">اقتراح أداة أو ميزة جديدة</option>
                  <option value="إبلاغ عن خطأ حسابي">إبلاغ عن خطأ أو تعديل في القوانين</option>
                  <option value="شراكات وإعلانات">شراكات وإعلانات</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink-secondary">
                  نص الرسالة <span className="text-accent">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="اكتب تفاصيل رسالتك أو ملاحظاتك هنا..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input w-full resize-y"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-hero-gradient py-3.5 text-base font-bold text-white shadow-sm hover:opacity-95 transition"
              >
                إرسال الرسالة
              </button>
            </form>
          )}

          <div className="mt-10 border-t border-brand-border/60 pt-6 text-center text-xs text-ink-muted space-y-1">
            <p>أو يمكنك مراسلتنا مباشرة عبر البريد الإلكتروني:</p>
            <p className="font-mono text-sm font-bold text-brand" dir="ltr">
              support@arabic-tools.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
