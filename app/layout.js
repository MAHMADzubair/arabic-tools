import "./globals.css";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import Header from "../components/Header";
import { CATEGORIES, getToolsByCategory, getToolCount } from "@/lib/registry";
import Script from "next/script";
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
  --foot-bg:#FFFFFF; --foot-text:var(--text); --foot-muted:var(--text-2); --foot-line:var(--border); --foot-hover:var(--orange-press);
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#0D0D0D; --surface:#161616; --border:#2A2A2A;
    --text:#F5F5F2; --text-2:#B5B5B0; --text-3:#8E8E89;
    --card:#CFCFCA; --card-text:#0D0D0D; --card-muted:#4A4A47;
    --card-border:#A9A9A4; --card-field:#E6E6E1; --card-field-text:#0D0D0D;
    --tab-hover:rgba(13,13,13,.10);
    --success:#4ADE80; --warning:#FBBF24; --error:#FF7A6B;
    --foot-bg:#0D0D0D; --foot-hover:var(--orange-hover);
  }
}
:root[data-theme="dark"]{
  --bg:#0D0D0D; --surface:#161616; --border:#2A2A2A;
  --text:#F5F5F2; --text-2:#B5B5B0; --text-3:#8E8E89;
  --card:#CFCFCA; --card-text:#0D0D0D; --card-muted:#4A4A47;
  --card-border:#A9A9A4; --card-field:#E6E6E1; --card-field-text:#0D0D0D;
  --tab-hover:rgba(13,13,13,.10);
  --success:#4ADE80; --warning:#FBBF24; --error:#FF7A6B;
  --foot-bg:#0D0D0D; --foot-hover:var(--orange-hover);
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

        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--orange)] focus:px-4 focus:py-2 focus:font-bold focus:text-[var(--on-orange)]">انتقل إلى المحتوى</a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <script dangerouslySetInnerHTML={{ __html: FOOTER_SCRIPT }} />
      </body>
    </html>
  );
}

// Mobile/tablet: collapsible group (<details>). Desktop (>=1024px): always open.
// Server render is open (no flash on desktop, links always in the DOM); FOOTER_SCRIPT collapses it on small screens.
function FooterGroup({ title, children, className = "" }) {
  return (
    <details suppressHydrationWarning open data-fg className={`group border-b border-[var(--foot-line)] lg:border-0 ${className}`}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 text-base font-bold marker:hidden [&::-webkit-details-marker]:hidden lg:min-h-0 lg:cursor-default lg:border-b lg:border-dotted lg:border-[var(--foot-muted)] lg:pb-2 lg:pt-0">
        <span>{title}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-[var(--foot-muted)] transition-transform group-open:rotate-180 lg:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 5 5 5-5" /></svg>
      </summary>
      <div className="pb-4 lg:pb-0 lg:pt-3">{children}</div>
    </details>
  );
}

const FOOTER_SCRIPT = `(function(){var m=window.matchMedia("(min-width:1024px)");function s(){document.querySelectorAll("details[data-fg]").forEach(function(d){d.open=m.matches})}s();m.addEventListener("change",function(e){if(e.matches)s()});document.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest("details[data-fg] > summary");if(t&&m.matches)e.preventDefault()})})();`;

const NUM_LOCALE = "ar-EG"; // change to "en" for Western digits (35)

const linkCls =
  "inline-block rounded py-1.5 text-[15px] leading-6 text-[var(--foot-muted)] underline-offset-4 transition-colors hover:text-[var(--foot-hover)] hover:underline hover:decoration-2 focus-visible:text-[var(--foot-hover)]";

const LEGAL = [
  ["/about", "عن الموقع والرسالة"],
  ["/privacy", "سياسة الخصوصية"],
  ["/terms", "شروط الاستخدام"],
  ["/disclaimer", "إخلاء المسؤولية"],
  ["/contact", "تواصل معنا"],
];

function Footer() {
  const totalTools = getToolCount();
  const active = CATEGORIES.map((c) => ({ ...c, tools: getToolsByCategory(c.id) })).filter((c) => c.tools.length > 0);
  const upcoming = CATEGORIES.filter((c) => getToolsByCategory(c.id).length === 0);

  return (
    <footer className="mt-16 border-t border-[var(--foot-line)] bg-[var(--foot-bg)] text-[var(--foot-text)] sm:mt-20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        {/* Brand strip */}
        <div className="flex flex-col gap-5 pb-8 lg:flex-row lg:items-center lg:justify-between lg:pb-10">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--orange)] text-xl font-black text-[var(--on-orange)]">ع</div>
            <div>
              <span className="block text-lg font-extrabold leading-7">أدوات عربية</span>
              <span className="block text-sm text-[var(--foot-muted)]">{totalTools.toLocaleString(NUM_LOCALE)} أداة وحاسبة متخصصة</span>
            </div>
          </div>
          <p className="max-w-xl text-[15px] leading-7 text-[var(--foot-muted)]">
            الأدوات الأساسية مجانية 100% وبدون تسجيل، مع خدمات متقدمة قادمة للأعمال.
          </p>
        </div>

        {/* Link groups: accordion < lg, columns >= lg */}
        <div className="grid items-start border-t border-[var(--foot-line)] md:grid-cols-2 md:gap-x-10 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-10 lg:pt-10">
          {active.map((cat) => {
            const wide = cat.tools.length > 8;
            return (
              <FooterGroup key={cat.id} title={cat.nameAr} className={wide ? "lg:col-span-2" : ""}>
                <ul className={wide ? "lg:columns-2 lg:gap-x-8" : ""}>
                  {cat.tools.map((t) => (
                    <li key={t.id} className="break-inside-avoid">
                      <a href={t.href} className={linkCls}>{t.nameAr}</a>
                    </li>
                  ))}
                </ul>
              </FooterGroup>
            );
          })}

          {upcoming.length > 0 && (
            <FooterGroup title="قريباً في المنصة">
              <ul>
                {upcoming.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center gap-2 py-1.5 text-[15px] leading-6 text-[var(--foot-muted)]">
                    <span>{c.nameAr}</span>
                    <span className="rounded border border-[var(--foot-muted)] px-1.5 text-xs font-bold">قريباً</span>
                  </li>
                ))}
              </ul>
            </FooterGroup>
          )}

          <FooterGroup title="معلومات وقانونية">
            <ul>
              {LEGAL.map(([href, label]) => (
                <li key={href}><a href={href} className={linkCls}>{label}</a></li>
              ))}
            </ul>
          </FooterGroup>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col gap-3 border-t border-[var(--foot-line)] pt-6 text-sm text-[var(--foot-muted)] sm:flex-row sm:items-center sm:justify-between lg:mt-10">
          <span>© {new Date().getFullYear()} أدوات عربية — جميع الحقوق محفوظة</span>
          <a href="#main" className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg border border-[var(--foot-muted)] px-4 font-bold text-[var(--foot-text)] hover:border-[var(--foot-hover)] hover:text-[var(--foot-hover)] sm:self-auto">
            العودة للأعلى
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5-5 5 5" /></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}