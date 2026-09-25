import "./globals.css";
import Header from "../components/Header";
import { CATEGORIES, getToolsByCategory, getToolCount } from "@/lib/registry";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://arabic-tools-xi.vercel.app";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "./",
  },
  title: {
    default: "أدوات عربية مجانية | حاسبات ومحولات وأدوات PDF وصور ومال",
    template: "%s | أدوات عربية",
  },
  description:
    "المنصة الشاملة للأدوات والحاسبات العربية المجانية: حاسبات مالية، أدوات الخليج، حاسبات إسلامية، ومحولات يومية دقيقة وسريعة 100% بدون تسجيل وبأعلى معايير الخصوصية.",
  openGraph: {
    title: "أدوات عربية مجانية | حاسبات ومحولات وأدوات PDF وصور ومال",
    description:
      "المنصة الشاملة للأدوات والحاسبات العربية المجانية: حاسبات مالية، أدوات الخليج، حاسبات إسلامية، ومحولات يومية دقيقة وسريعة 100% بدون تسجيل.",
    url: BASE_URL,
    siteName: "أدوات عربية",
    locale: "ar_AR",
    type: "website",
  },
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
  const totalTools = getToolCount();

  const activeCategories = CATEGORIES.map((cat) => ({
    ...cat,
    tools: getToolsByCategory(cat.id),
  })).filter((cat) => cat.tools.length > 0);

  const upcomingCategories = CATEGORIES.filter(
    (cat) => getToolsByCategory(cat.id).length === 0
  );

  return (
    <footer className="mt-20 border-t border-brand-border bg-white py-10">
      <div className="mx-auto max-w-5xl px-4">
        {/* Top Branding Strip */}
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-hero-gradient">
              <span className="text-white text-xs font-black">ع</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-ink block">أدوات عربية</span>
              <span className="text-[11px] text-ink-muted">
                {totalTools.toLocaleString("ar-EG")} أداة وحاسبة متخصصة
              </span>
            </div>
          </div>
          <p className="text-xs text-ink-muted max-w-md text-center sm:text-left">
            جميع الأدوات مجانية 100% وبدون تسجيل. النتائج فورية واسترشادية مبنية على أحدث المعايير والقوانين المعتمدة.
          </p>
        </div>

        {/* Categorized Footer Links Matching Registry */}
        <div className="mt-8 pt-6 border-t border-brand-border/60 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6 text-xs">
          {activeCategories.map((cat) => (
            <div key={cat.id} className="space-y-2">
              <p className="font-bold text-brand-dark">
                {cat.icon} {cat.nameAr}
              </p>
              <ul className="space-y-1.5 text-ink-secondary">
                {cat.tools.map((tool) => (
                  <li key={tool.id}>
                    <a href={tool.href} className="hover:text-brand transition-colors">
                      {tool.nameAr}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Upcoming Categories */}
          {upcomingCategories.length > 0 && (
            <div className="space-y-2">
              <p className="font-bold text-brand-dark">🚀 قريباً في المنصة</p>
              <ul className="space-y-1.5 text-ink-muted">
                {upcomingCategories.map((cat) => (
                  <li key={cat.id} className="flex items-center gap-1.5">
                    <span>{cat.icon}</span>
                    <span>{cat.nameAr}</span>
                    <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-bold text-slate-500">
                      قريباً
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal and Info */}
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <p className="font-bold text-brand-dark">⚖️ معلومات وقانونية</p>
            <ul className="space-y-1.5 text-ink-secondary">
              <li><a href="/about" className="hover:text-brand transition-colors">عن الموقع والرسالة</a></li>
              <li><a href="/privacy" className="hover:text-brand transition-colors">سياسة الخصوصية</a></li>
              <li><a href="/terms" className="hover:text-brand transition-colors">شروط الاستخدام</a></li>
              <li><a href="/disclaimer" className="hover:text-brand transition-colors">إخلاء المسؤولية</a></li>
              <li><a href="/contact" className="hover:text-brand transition-colors">تواصل معنا</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mt-8 pt-4 border-t border-brand-border/40 flex flex-col items-center gap-3 sm:flex-row sm:justify-between text-[11px] text-ink-muted">
          <span>© {new Date().getFullYear()} أدوات عربية — جميع الحقوق محفوظة</span>
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1" aria-label="روابط قانونية">
            <a href="/about" className="hover:text-brand transition-colors">عن الموقع</a>
            <span aria-hidden="true">·</span>
            <a href="/privacy" className="hover:text-brand transition-colors">سياسة الخصوصية</a>
            <span aria-hidden="true">·</span>
            <a href="/terms" className="hover:text-brand transition-colors">شروط الاستخدام</a>
            <span aria-hidden="true">·</span>
            <a href="/disclaimer" className="hover:text-brand transition-colors">إخلاء المسؤولية</a>
            <span aria-hidden="true">·</span>
            <a href="/contact" className="hover:text-brand transition-colors">تواصل معنا</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

