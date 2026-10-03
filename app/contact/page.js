import ContactForm from "./ContactForm";

export const metadata = {
  title: "تواصل معنا",
  description:
    "تواصل مع فريق أدوات عربية لإرسال استفساراتك، اقتراحاتك، أو الإبلاغ عن أي خطأ حسابي في الأدوات والحاسبات.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
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

        <ContactForm />
      </div>
    </div>
  );
}
