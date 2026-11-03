import PublicFooterGate from "@/components/admin/PublicFooterGate";
import "./globals.css";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import HomeHeader from "../components/home/HomeHeader";
import { SITE_URL, SITE_NAME, SITE_ORG_ID, SITE_WEBSITE_ID, DEFAULT_OG_IMAGE } from "@/lib/siteConfig";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

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

  /* ── Typography & Hierarchy Tokens (Sprint 5A) ── */
  --font-arabic: var(--font-ibm-plex-arabic), "IBM Plex Sans Arabic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --fw-light: 300;
  --fw-regular: 400;
  --fw-medium: 500;
  --fw-semibold: 600;
  --fw-bold: 700;
  --lh-tight: 1.25;
  --lh-snug: 1.35;
  --lh-normal: 1.6;
  --lh-relaxed: 1.75;
  --lh-loose: 1.9;
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
html,body{
  font-family:var(--font-arabic);
  font-synthesis:none;
  text-rendering:optimizeLegibility;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  background:var(--bg);
  color:var(--text);
}
[dir="rtl"]{letter-spacing:normal}
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
.foot-logo-light{display:block}
.foot-logo-dark{display:none}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]) .foot-logo-light{display:none}
  :root:not([data-theme="light"]) .foot-logo-dark{display:block}
}
:root[data-theme="dark"] .foot-logo-light{display:none}
:root[data-theme="dark"] .foot-logo-dark{display:block}
`;

// ─── Root Structured Data (Organization + WebSite) ────────────────────────────

/** Authoritative Qemlo Organization entity — ONE place, referenced everywhere else */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": SITE_ORG_ID,
  name: SITE_NAME,
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/brand/qemlo-logo.svg`,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": SITE_WEBSITE_ID,
  name: SITE_NAME,
  url: BASE_URL,
  description: "المنصة الشاملة للأدوات والحاسبات العربية المجانية: حاسبات مالية، أدوات الخليج، حاسبات إسلامية، ومحولات يومية.",
  inLanguage: "ar",
  publisher: { "@id": SITE_ORG_ID },
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


  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: "/apple-icon.png",
  },
  title: {
    default: "أدوات عربية مجانية | حاسبات ومحولات وأدوات PDF وصور ومال",
    template: "%s | Qemlo",
  },
  description:
    "المنصة الشاملة للأدوات والحاسبات العربية المجانية: حاسبات مالية، أدوات الخليج، حاسبات إسلامية، ومحولات يومية مبنية على المصادر الرسمية وبدون تسجيل وبأعلى معايير الخصوصية.",
  openGraph: {
    title: "أدوات عربية مجانية | حاسبات ومحولات وأدوات PDF وصور ومال",
    description:
      "المنصة الشاملة للأدوات والحاسبات العربية المجانية: حاسبات مالية، أدوات الخليج، حاسبات إسلامية، ومحولات يومية مبنية على المصادر الرسمية وبدون تسجيل.",
    url: BASE_URL,
    siteName: "Qemlo",
    locale: "ar_AR",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_OG_IMAGE.url],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  other: { "google-adsense-account": "ca-pub-4706954030329423" },
};

export default function RootLayout({ children }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
  const ADSENSE_PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: TOKENS_CSS }} />
        {/* Google AdSense — Site Ownership Verification (Sprint 9B) */}
        {ADSENSE_PUB_ID && (
          <Script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`}
            strategy="beforeInteractive"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body suppressHydrationWarning={true} className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
        {/* Organization Structured Data — authoritative Qemlo entity */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />

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
        <HomeHeader />
        <main id="main" className="flex-1">{children}</main>
        <PublicFooterGate><Footer /></PublicFooterGate>
        <script dangerouslySetInnerHTML={{ __html: FOOTER_SCRIPT }} />
        <Analytics />
      </body>
    </html>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
//
// Design: compact pill footer (matches PDF mockup).
//
//  Desktop  — two-row pill inside a padded wrapper:
//    Row 1 (nav bar):  Qemlo mark + tagline  |  category links  |  "جميع الأدوات ←"
//    Row 2 (meta bar): scroll-up button + country badges  |  copyright  |  legal links
//
//  Mobile   — rounded card:
//    mark + tagline + scroll-up button  →  country badges  →  divider  →
//    2-col category links  →  divider  →  legal links  →  copyright
//
// The pill uses the dark warm-brown background from the PDF (--foot-pill-bg),
// with light text on top, matching both dark and light host themes.
// ─────────────────────────────────────────────────────────────────────────────

const FOOTER_SCRIPT = ``;  // no accordion needed for new design

// Country hubs shown in the footer
const FOOTER_COUNTRIES = [
  { code: "SA", href: "/ar/sa" },
  { code: "AE", href: "/ar/ae" },
  { code: "QA", href: "/ar/qa" },
  { code: "KW", href: "/ar/kw" },
  { code: "OM", href: "/ar/om" },
  { code: "BH", href: "/ar/bh" },
];

const LEGAL_LINKS = [
  ["/about",      "عن Qemlo"],
  ["/contact",    "تواصل معنا"],
  ["/privacy",    "سياسة الخصوصية"],
  ["/terms",      "الشروط والأحكام"],
  ["/disclaimer", "إخلاء المسؤولية"],
];

// Category nav items shown in the footer nav bar
const FOOT_NAV_CATS = [
  { id: "gulf",     label: "الرواتب والعمل" },
  { id: "finance",  label: "المال والاستثمار" },
  { id: "islamic",  label: "الأدوات الإسلامية" },
  { id: "everyday", label: "الحياة اليومية" },
  { id: "business", label: "الأعمال" },
];

// Inline CSS for the pill footer
const FOOT_CSS = `
/* ── pill footer tokens ── */
:root{
  --fp-bg:#2B1A0F;
  --fp-text:#F5F5F2;
  --fp-muted:rgba(245,245,242,.55);
  --fp-border:rgba(245,245,242,.12);
  --fp-badge:rgba(245,245,242,.14);
  --fp-badge-hover:rgba(245,245,242,.22);
  --fp-link-hover:#FF7A33;
}
/* outer wrapper — keeps original page bg visible around the pill */
.fp-wrap{
  width:100%;
  padding:0 12px 20px;
  margin-top:40px;
}
@media(min-width:640px){.fp-wrap{padding:0 20px 28px;margin-top:56px}}
@media(min-width:1024px){.fp-wrap{padding:0 24px 32px;margin-top:72px}}

/* the pill shell */
.fp-pill{
  max-width:1200px;
  margin:0 auto;
  background:var(--fp-bg);
  border-radius:24px;
  overflow:hidden;
  color:var(--fp-text);
}
@media(min-width:768px){.fp-pill{border-radius:28px}}

/* ── DESKTOP layout (≥ 768 px) ── */
/* nav row */
.fp-nav-row{
  display:none;
}
@media(min-width:768px){
  .fp-nav-row{
    display:flex;
    align-items:center;
    gap:4px;
    padding:14px 24px;
    border-bottom:1px solid var(--fp-border);
  }
}
.fp-logo-link{
  display:flex;
  align-items:center;
  gap:10px;
  text-decoration:none;
  color:var(--fp-text);
  flex:none;
  margin-inline-end:16px;
}
.fp-logo-link:hover .fp-mark{transform:scale(1.07)}
.fp-mark{
  width:38px;height:38px;
  display:flex;align-items:center;justify-content:center;
  transition:transform .2s;
  flex-shrink:0;
}
.fp-mark img{width:100%;height:100%;object-fit:contain}
.fp-tagline{
  font-size:13px;font-weight:600;line-height:1.35;
  white-space:nowrap;
  color:var(--fp-text);
}
/* category nav links */
.fp-cat-link{
  flex:none;
  font-size:13px;font-weight:600;
  color:var(--fp-muted);
  text-decoration:none;
  padding:7px 11px;
  border-radius:10px;
  white-space:nowrap;
  transition:background .15s,color .15s;
}
.fp-cat-link:hover,.fp-cat-link:focus-visible{
  background:var(--fp-badge-hover);
  color:var(--fp-text);
}
/* "جميع الأدوات" CTA */
.fp-all-link{
  flex:none;
  display:inline-flex;align-items:center;gap:6px;
  font-size:13px;font-weight:700;
  color:var(--fp-text);
  text-decoration:none;
  padding:7px 14px;
  border-radius:10px;
  border:1px solid var(--fp-border);
  transition:background .15s,border-color .15s;
  margin-inline-start:auto;
}
.fp-all-link:hover,.fp-all-link:focus-visible{
  background:var(--fp-badge-hover);
  border-color:var(--fp-badge-hover);
}

/* meta row (bottom bar) */
.fp-meta-row{
  display:none;
}
@media(min-width:768px){
  .fp-meta-row{
    display:flex;
    align-items:center;
    gap:10px;
    padding:12px 24px;
    flex-wrap:wrap;
  }
}
/* scroll-up button */
.fp-up-btn{
  display:inline-flex;align-items:center;justify-content:center;
  width:36px;height:36px;
  border-radius:50%;
  background:#FF5B04;
  color:#0D0D0D;
  border:none;cursor:pointer;
  flex-shrink:0;
  transition:background .15s,transform .15s;
  text-decoration:none;
}
.fp-up-btn:hover,.fp-up-btn:focus-visible{background:#FF7A33;transform:translateY(-2px)}
.fp-up-btn svg{width:16px;height:16px}
/* country badges */
.fp-country{
  display:inline-flex;align-items:center;justify-content:center;
  min-width:36px;height:36px;padding:0 8px;
  border-radius:50%;
  background:var(--fp-badge);
  color:var(--fp-text);
  font-size:11px;font-weight:800;letter-spacing:.5px;
  text-decoration:none;
  transition:background .15s;
  flex-shrink:0;
}
.fp-country:hover,.fp-country:focus-visible{background:var(--fp-badge-hover)}
/* copyright */
.fp-copy{
  font-size:12px;font-weight:400;
  color:var(--fp-muted);
  margin-inline-start:4px;
  margin-inline-end:auto;
}
/* legal links (desktop) */
.fp-legal-link{
  font-size:12px;font-weight:500;
  color:var(--fp-muted);
  text-decoration:none;
  white-space:nowrap;
  padding:4px 6px;
  border-radius:6px;
  transition:color .15s;
}
.fp-legal-link:hover,.fp-legal-link:focus-visible{color:var(--fp-link-hover)}

/* ── MOBILE layout (< 768 px) ── */
.fp-mobile{
  display:flex;
  flex-direction:column;
  gap:0;
  padding:20px 20px 24px;
}
@media(min-width:768px){.fp-mobile{display:none}}

/* mobile top: mark + tagline + scroll-up */
.fp-mob-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-bottom:20px;
}
.fp-mob-brand{display:flex;align-items:center;gap:10px;}
.fp-mob-tagline{
  font-size:15px;font-weight:700;line-height:1.35;
  color:var(--fp-text);
}
/* mobile country row */
.fp-mob-countries{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:20px;
}
.fp-mob-divider{
  height:1px;
  background:var(--fp-border);
  margin-bottom:20px;
}
/* mobile category grid */
.fp-mob-cats{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:4px 12px;
  margin-bottom:20px;
}
.fp-mob-cat-link{
  font-size:14px;font-weight:600;
  color:var(--fp-muted);
  text-decoration:none;
  padding:8px 2px;
  border-radius:8px;
  transition:color .15s;
  white-space:nowrap;
}
.fp-mob-cat-link:hover,.fp-mob-cat-link:focus-visible{color:var(--fp-text)}
/* "جميع الأدوات" full-width on mobile */
.fp-mob-all{
  grid-column:1/-1;
  display:inline-flex;align-items:center;gap:6px;
  font-size:14px;font-weight:700;
  color:var(--fp-text);
  text-decoration:none;
  padding:10px 14px;
  border-radius:12px;
  border:1px solid var(--fp-border);
  transition:background .15s;
  margin-top:4px;
}
.fp-mob-all:hover,.fp-mob-all:focus-visible{background:var(--fp-badge-hover)}
/* mobile legal links */
.fp-mob-legal{
  display:flex;flex-wrap:wrap;gap:4px 0;
  margin-bottom:16px;
}
.fp-mob-legal-link{
  font-size:13px;font-weight:500;
  color:var(--fp-muted);
  text-decoration:none;
  padding:6px 8px;
  border-radius:6px;
  transition:color .15s;
}
.fp-mob-legal-link:hover,.fp-mob-legal-link:focus-visible{color:var(--fp-link-hover)}
/* mobile copyright */
.fp-mob-copy{
  font-size:12px;
  color:var(--fp-muted);
  text-align:center;
}

/* focus rings */
.fp-pill a:focus-visible,.fp-pill button:focus-visible{
  outline:2px solid #FF5B04;outline-offset:2px;
}
`;

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer aria-label="تذييل الصفحة">
      <style dangerouslySetInnerHTML={{ __html: FOOT_CSS }} />
      <div className="fp-wrap">
        <div className="fp-pill">

          {/* ══ DESKTOP ══════════════════════════════════════════════════════ */}

          {/* Row 1 — nav bar */}
          <nav className="fp-nav-row" aria-label="روابط التنقل الرئيسية">
            {/* Logo + tagline */}
            <a href="/" className="fp-logo-link" aria-label="Qemlo — الصفحة الرئيسية">
              <span className="fp-mark" aria-hidden="true">
                <img src="/brand/qemlo-mark.svg" alt="" width="38" height="38" />
              </span>
              <span className="fp-tagline">حاسبات وأدوات عربية مجانية للخليج</span>
            </a>

            {/* Category links */}
            {FOOT_NAV_CATS.map((c) => (
              <a key={c.id} href={`/#${c.id}`} className="fp-cat-link">{c.label}</a>
            ))}

            {/* All tools CTA */}
            <a href="/" className="fp-all-link">
              جميع الأدوات
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}>
                <path d="M13 5l-6 5 6 5" />
              </svg>
            </a>
          </nav>

          {/* Row 2 — meta bar */}
          <div className="fp-meta-row" aria-label="معلومات الموقع">
            {/* Back to top */}
            <a href="#main" className="fp-up-btn" aria-label="العودة إلى أعلى الصفحة">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5-5 5 5" />
              </svg>
            </a>

            {/* Country badges */}
            {FOOTER_COUNTRIES.map((c) => (
              <a key={c.code} href={c.href} className="fp-country" aria-label={`أدوات ${c.code}`}>{c.code}</a>
            ))}

            {/* Copyright */}
            <span className="fp-copy">© {year} Qemlo. جميع الحقوق محفوظة.</span>

            {/* Legal links */}
            {LEGAL_LINKS.map(([href, label]) => (
              <a key={href} href={href} className="fp-legal-link">{label}</a>
            ))}
          </div>

          {/* ══ MOBILE ═══════════════════════════════════════════════════════ */}
          <div className="fp-mobile">

            {/* Top: brand + scroll-up */}
            <div className="fp-mob-top">
              <div className="fp-mob-brand">
                <span style={{width:44,height:44,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}} aria-hidden="true">
                  <img src="/brand/qemlo-mark.svg" alt="" width="44" height="44" style={{width:"100%",height:"100%",objectFit:"contain"}} />
                </span>
                <span className="fp-mob-tagline">حاسبات وأدوات عربية<br />مجانية للخليج</span>
              </div>
              <a href="#main" className="fp-up-btn" aria-label="العودة إلى أعلى الصفحة">
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5-5 5 5" />
                </svg>
              </a>
            </div>

            {/* Country badges */}
            <div className="fp-mob-countries" role="list" aria-label="دول الخليج">
              {FOOTER_COUNTRIES.map((c) => (
                <a key={c.code} href={c.href} className="fp-country" role="listitem" aria-label={`أدوات ${c.code}`}>{c.code}</a>
              ))}
            </div>

            <div className="fp-mob-divider" aria-hidden="true" />

            {/* Category grid */}
            <nav className="fp-mob-cats" aria-label="أقسام الأدوات">
              {FOOT_NAV_CATS.map((c) => (
                <a key={c.id} href={`/#${c.id}`} className="fp-mob-cat-link">{c.label}</a>
              ))}
              <a href="/" className="fp-mob-all">
                جميع الأدوات
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}>
                  <path d="M13 5l-6 5 6 5" />
                </svg>
              </a>
            </nav>

            <div className="fp-mob-divider" aria-hidden="true" />

            {/* Legal links */}
            <nav className="fp-mob-legal" aria-label="روابط قانونية">
              {LEGAL_LINKS.map(([href, label]) => (
                <a key={href} href={href} className="fp-mob-legal-link">{label}</a>
              ))}
            </nav>

            {/* Copyright */}
            <p className="fp-mob-copy">© {year} Qemlo. جميع الحقوق محفوظة.</p>
          </div>

        </div>
      </div>
    </footer>
  );
}