import "./globals.css";
import Header from "../components/Header";

export const metadata = {
  title: "أدوات مالية ومحولات مجانية | حاسبات إسلامية ومالية وتجارية",
  description:
    "مجموعة متكاملة من 18 أداة وحاسبة مجانية باللغة العربية: حاسبة الزكاة، الميراث، القروض، الراتب، نهاية الخدمة، مؤشر كتلة الجسم، محول العملات، تحويل التاريخ ومحول الوحدات.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body suppressHydrationWarning={true} className="bg-slate-50 text-ink min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-border bg-white py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-hero-gradient">
              <span className="text-white text-xs font-black">م</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-ink block">أدوات عربية مجانية</span>
              <span className="text-[11px] text-ink-muted">١٨ أداة وحاسبة متخصصة</span>
            </div>
          </div>
          <p className="text-xs text-ink-muted max-w-md text-center sm:text-left">
            جميع الأدوات مجانية 100% وبدون تسجيل. النتائج استرشادية مبنية على أحدث المعايير والقوانين المعتمدة.
          </p>
        </div>

        {/* Categorized Footer Links */}
        <div className="mt-8 pt-6 border-t border-brand-border/60 grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
          <div className="space-y-2">
            <p className="font-bold text-brand-dark">💰 أدوات مالية وتجارية</p>
            <ul className="space-y-1 text-ink-secondary">
              <li><a href="/salary-calculator" className="hover:text-brand">حاسبة الراتب الصافي</a></li>
              <li><a href="/gratuity-calculator" className="hover:text-brand">مكافأة نهاية الخدمة</a></li>
              <li><a href="/loan-calculator" className="hover:text-brand">حاسبة القروض والتمويل</a></li>
              <li><a href="/mortgage-calculator" className="hover:text-brand">التمويل العقاري</a></li>
              <li><a href="/profit-margin-calculator" className="hover:text-brand">هامش الربح والتسعير</a></li>
              <li><a href="/roi-calculator" className="hover:text-brand">العائد على الاستثمار ROI</a></li>
              <li><a href="/compound-interest" className="hover:text-brand">الفائدة المركبة</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-brand-dark">🕌 أدوات إسلامية وشرعية</p>
            <ul className="space-y-1 text-ink-secondary">
              <li><a href="/zakat-calculator" className="hover:text-brand">حاسبة الزكاة الشرعية</a></li>
              <li><a href="/zakat-al-fitr" className="hover:text-brand">حاسبة زكاة الفطر</a></li>
              <li><a href="/kaffara-calculator" className="hover:text-brand">الكفارات والفدية</a></li>
              <li><a href="/umrah-calculator" className="hover:text-brand">حاسبة تكلفة العمرة</a></li>
              <li><a href="/inheritance-calculator" className="hover:text-brand">حاسبة الميراث والتركات</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-brand-dark">📅 التاريخ والتقويم</p>
            <ul className="space-y-1 text-ink-secondary">
              <li><a href="/hijri-age-calculator" className="hover:text-brand">حاسبة العمر بالهجري</a></li>
              <li><a href="/date-converter" className="hover:text-brand">تحويل التاريخ هجري/ميلادي</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-brand-dark">📐 محولات وصحة يومية</p>
            <ul className="space-y-1 text-ink-secondary">
              <li><a href="/bmi-calculator" className="hover:text-brand">كتلة الجسم (BMI)</a></li>
              <li><a href="/currency-converter" className="hover:text-brand">محول العملات الفوري</a></li>
              <li><a href="/unit-converter" className="hover:text-brand">محول الوحدات الشامل</a></li>
              <li><a href="/vat-calculator" className="hover:text-brand">حاسبة الضريبة المضافة</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-brand-border/40 text-center text-[11px] text-ink-muted">
          © {new Date().getFullYear()} أدوات مالية — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
