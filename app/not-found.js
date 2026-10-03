import Link from "next/link";

export const metadata = {
  title: "الصفحة غير موجودة — 404 | أدوات عربية",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main
      className="min-h-screen bg-page-bg flex items-center justify-center px-4 py-16"
      dir="rtl"
    >
      <div className="mx-auto max-w-md text-center space-y-6">
        {/* Status indicator */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-light text-4xl">
          🔍
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-ink sm:text-4xl">
            الصفحة غير موجودة
          </h1>
          <p className="text-sm text-ink-secondary leading-relaxed">
            تعذّر العثور على الصفحة التي طلبتها. ربما تم نقلها أو حذفها أو تغيير عنوانها.
          </p>
        </div>

        {/* Navigation links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark transition-colors shadow-sm"
          >
            <span>🏠</span>
            <span>الصفحة الرئيسية</span>
          </Link>
          <Link
            href="/ar/sa"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-5 py-2.5 text-sm font-bold text-ink hover:border-brand hover:text-brand transition-colors"
          >
            <span>🇸🇦</span>
            <span>أدوات السعودية</span>
          </Link>
          <Link
            href="/ar/ae"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-5 py-2.5 text-sm font-bold text-ink hover:border-brand hover:text-brand transition-colors"
          >
            <span>🇦🇪</span>
            <span>أدوات الإمارات</span>
          </Link>
        </div>

        {/* HTTP status note */}
        <p className="text-xs text-ink-muted pt-2">خطأ 404 — هذه الصفحة غير موجودة.</p>
      </div>
    </main>
  );
}
