import "./globals.css";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import Header from "../components/Header";
import Script from "next/script";
import { CATEGORIES, getToolsByCategory, getToolCount } from "@/lib/registry";
import { SITE_URL, SITE_NAME } from "@/lib/siteConfig";

// ─── Font: IBM Plex Sans Arabic via next/font (self-hosted, no blocking request) ──
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
  preload: true,
});

const BASE_URL = SITE_URL;

// ─── Ink & Signal tokens (global: every page, header and footer can use var(--...)) ──
const TOKENS_CSS = `
:root{
  --bg:#F5F5F2; --surface:#FFFFFF; --border:#D4D4CE;
  --text:#0D0D0D; --text-2:#555555; --text-3:#6B6B66;
  --card:#0D0D0D; --card-text:#FFFFFF; --card-muted:#B5B5B0;
  --card-border:#2A2A2A; --card-field:#1A1A1A; --card-field-text:#FFFFFF;
  --tab-hover:rgba(255,255,255,.10);
  --orange:#FF5B04; --orange-hover:#FF7A33; --orange-press:#E64F00; --on-orange:#0D0D0D;
  --success:#137A47; --warning:#8A5A00; --error:#C8321F;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#0D0D0D; --surface:#161616; --border:#2A2A2A;
    --text:#F5F5F2; --text-2:#B5B5B0; --text-3:#8E8E89;
    --card:#CFCFCA; --card-text:#0D0D0D; --card-muted:#4A4A47;
    --card-border:#A9A9A4; --card-field:#E6E6E1; --card-field-text:#0D0D0D;
    --tab-hover:rgba(13,13,13,.10);
    --success:#4ADE80; --warning:#FBBF24; --error:#FF7A6B;
  }
}
:root[data-theme="dark"]{
  --bg:#0D0D0D; --surface:#161616; --border:#2A2A2A;
  --text:#F5F5F2; --text-2:#B5B5B0; --text-3:#8E8E89;
  --card:#CFCFCA; --card-text:#0D0D0D; --card-muted:#4A4A47;
  --card-border:#A9A9A4; --card-field:#E6E6E1; --card-field-text:#0D0D0D;
  --tab-hover:rgba(13,13,13,.10);
  --success:#4ADE80; --warning:#FBBF24; --error:#FF7A6B;
}
body{background:var(--bg);color:var(--text)}
.tear{height:12px;background:conic-gradient(from -45deg at bottom,#0000,var(--card) 1deg 90deg,#0000 91deg) 50%/16px 100%}
:focus-visible{outline:2px solid var(--text);outline-offset:3px}
/* Legacy bridge: old pages still use the previous class names.
   Map them to the tokens so text is readable in both light and dark mode.
   Remove each line once that page is redesigned. */
body .text-ink,body .text-brand,body .text-brand-dark{color:var(--text)}
body .text-ink-secondary{color:var(--text-2)}
body .text-ink-muted{color:var(--text-3)}
body .bg-white,body .bg-slate-50{background-color:var(--surface)}
body .bg-brand-light{background-color:var(--bg)}
body .border-brand-border{border-color:var(--border)}
body .bg-hero-gradient{background:var(--orange);color:var(--on-orange)}
html{scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
`;

// ─── Root Structured Data (WebSite + WebApplication) ─────────────────────────
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "أدوات عربية",
  url: BASE_URL,
  description: "المنصة الشاملة للأدوات والحاسبات العربية المجانية: حاسبات مالية، أدوات الخليج، حاسبات إسلامية، ومحولات يومية.",
  inLanguage: "ar",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F5F2" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0D0D" },
  ],
};

export const metadata = {
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "أدوات عربية مجانية | حاسبات ومحولات وأدوات PDF وصور ومال",
    template: "%s | أدوات عربية",
  },
  description:
    "المنصة الشاملة للأدوات والحاسبات العربية المجانية: حاسبات مالية، أدوات الخليج، حاسبات إسلامية، ومحولات يومية مبنية على المصادر الرسمية وبدون تسجيل وبأعلى معايير الخصوصية.",
  openGraph: {
    title: "أدوات عربية مجانية | حاسبات ومحولات وأدوات PDF وصور ومال",
    description:
      "المنصة الشاملة للأدوات والحاسبات العربية المجانية: حاسبات مالية، أدوات الخليج، حاسبات إسلامية، ومحولات يومية مبنية على المصادر الرسمية وبدون تسجيل.",
    url: BASE_URL,
    siteName: "أدوات عربية",
    locale: "ar_AR",
    type: "website",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({ children }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: TOKENS_CSS }} />
      </head>
      <body suppressHydrationWarning={true} className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
        {/* WebSite Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />

        {/* GA4 Analytics */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });

                // Arabic Tools — GA4 Event Helpers
                window.trackEvent = function(eventName, params) {
                  if (typeof gtag !== 'undefined') {
                    gtag('event', eventName, params || {});
                  }
                };
              `}
            </Script>
          </>
        )}

        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

const linkCls =
  "text-[var(--card-muted)] underline-offset-4 transition-colors hover:text-[var(--card-text)] hover:underline";

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
    <footer className="mt-20 border-t border-[var(--card-border)] bg-[var(--card)] py-12 text-[var(--card-text)]">
      <div className="mx-auto max-w-5xl px-4">
        {/* Top Branding Strip */}
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--orange)] text-lg font-black text-[var(--on-orange)]">
              ع
            </div>
            <div className="text-right">
              <span className="block text-base font-extrabold">أدوات عربية</span>
              <span className="text-xs text-[var(--card-muted)]">
                {totalTools.toLocaleString("ar-EG")} أداة وحاسبة متخصصة
              </span>
            </div>
          </div>
          <p className="max-w-md text-center text-sm leading-7 text-[var(--card-muted)] sm:text-start">
            الأدوات الأساسية مجانية 100% وبدون تسجيل، مع خدمات متقدمة قادمة للأعمال.
          </p>
        </div>

        {/* Categorized Footer Links Matching Registry */}
        <div className="mt-10 grid grid-cols-2 gap-8 border-t border-[var(--card-border)] pt-8 text-sm sm:grid-cols-3 md:grid-cols-6">
          {activeCategories.map((cat) => (
            <div key={cat.id}>
              <p className="mb-3 border-b border-dotted border-[var(--card-muted)] pb-2 font-bold">
                {cat.nameAr}
              </p>
              <ul className="space-y-2">
                {cat.tools.map((tool) => (
                  <li key={tool.id}>
                    <a href={tool.href} className={linkCls}>
                      {tool.nameAr}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Upcoming Categories */}
          {upcomingCategories.length > 0 && (
            <div>
              <p className="mb-3 border-b border-dotted border-[var(--card-muted)] pb-2 font-bold">
                قريباً في المنصة
              </p>
              <ul className="space-y-2 text-[var(--card-muted)]">
                {upcomingCategories.map((cat) => (
                  <li key={cat.id} className="flex items-center gap-2">
                    <span>{cat.nameAr}</span>
                    <span className="rounded border border-[var(--card-muted)] px-1.5 text-[10px] font-bold">
                      قريباً
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal and Info */}
          <div className="col-span-2 sm:col-span-1">
            <p className="mb-3 border-b border-dotted border-[var(--card-muted)] pb-2 font-bold">
              معلومات وقانونية
            </p>
            <ul className="space-y-2">
              <li><a href="/about" className={linkCls}>عن الموقع والرسالة</a></li>
              <li><a href="/privacy" className={linkCls}>سياسة الخصوصية</a></li>
              <li><a href="/terms" className={linkCls}>شروط الاستخدام</a></li>
              <li><a href="/disclaimer" className={linkCls}>إخلاء المسؤولية</a></li>
              <li><a href="/contact" className={linkCls}>تواصل معنا</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-[var(--card-border)] pt-5 text-xs text-[var(--card-muted)] sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} أدوات عربية — جميع الحقوق محفوظة</span>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1" aria-label="روابط قانونية">
            <a href="/about" className={linkCls}>عن الموقع</a>
            <a href="/privacy" className={linkCls}>سياسة الخصوصية</a>
            <a href="/terms" className={linkCls}>شروط الاستخدام</a>
            <a href="/disclaimer" className={linkCls}>إخلاء المسؤولية</a>
            <a href="/contact" className={linkCls}>تواصل معنا</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}