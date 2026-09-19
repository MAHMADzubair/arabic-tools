import "./globals.css";

export const metadata = {
  title: "أدوات مالية مجانية | حاسبات ومحولات",
  description:
    "حاسبات ومحولات مالية مجانية باللغة العربية: حاسبة الزكاة، حاسبة القروض، محول العملات وأكثر.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body suppressHydrationWarning={true}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:py-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hero-gradient shadow-sm group-hover:shadow-result">
            <span className="text-white text-sm font-black">م</span>
          </div>
          <span className="text-base font-extrabold text-brand-800 sm:text-lg">
            أدوات مالية
          </span>
        </a>

        {/* Nav */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink href="/zakat-calculator" label="الزكاة" shortLabel="زكاة" />
          <NavLink href="/zakat-al-fitr" label="زكاة الفطر" shortLabel="فطر" />
          <NavLink href="/kaffara-calculator" label="الكفارات" shortLabel="كفارة" />
          <NavLink href="/vat-calculator" label="الضريبة" shortLabel="ضريبة" />
          <NavLink href="/inheritance-calculator" label="الميراث" shortLabel="ميراث" />
          <NavLink href="/loan-calculator" label="القروض" shortLabel="قروض" />
          <NavLink href="/currency-converter" label="العملات" shortLabel="عملات" />
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, label, shortLabel }) {
  return (
    <a
      href={href}
      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-secondary transition hover:bg-brand-light hover:text-brand sm:px-3 sm:text-sm"
    >
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{shortLabel}</span>
    </a>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-border bg-white py-8">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-hero-gradient">
              <span className="text-white text-xs font-black">م</span>
            </div>
            <span className="text-sm font-bold text-ink-secondary">أدوات مالية</span>
          </div>
          <p className="text-xs text-ink-muted">
            جميع الأدوات مجانية. النتائج تقديرية وليست استشارة مالية أو شرعية رسمية.
          </p>
          <div className="flex gap-3 sm:gap-4 text-xs text-ink-muted flex-wrap justify-center">
            <a href="/zakat-calculator" className="hover:text-brand">حاسبة الزكاة</a>
            <a href="/zakat-al-fitr" className="hover:text-brand">زكاة الفطر</a>
            <a href="/kaffara-calculator" className="hover:text-brand">الكفارات والفدية</a>
            <a href="/vat-calculator" className="hover:text-brand">حاسبة الضريبة</a>
            <a href="/inheritance-calculator" className="hover:text-brand">حاسبة الميراث</a>
            <a href="/loan-calculator" className="hover:text-brand">حاسبة القروض</a>
            <a href="/currency-converter" className="hover:text-brand">محول العملات</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
