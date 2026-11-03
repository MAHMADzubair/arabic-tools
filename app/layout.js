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
// Design: Full-featured 4-section footer inside a dark warm pill.
//
//  Desktop (≥ 1024px) — 4 column grid inside pill:
//    Col 1 (Brand):        Logo + tagline + description + back-to-top
//    Col 2 (Tools):        Popular calculator links
//    Col 3 (Countries):    GCC country hubs + flag emojis
//    Col 4 (Company):      Legal / info links
//    Bottom bar:           copyright | social | "made in Arab world" badge
//
//  Tablet (768–1023px) — 2x2 grid + bottom bar
//
//  Mobile (<768px) — stacked single column card
//
// ─────────────────────────────────────────────────────────────────────────────

const FOOTER_SCRIPT = ``;

// GCC Country hubs
const FOOTER_COUNTRIES = [
  { code: "SA", name: "السعودية",  flag: "🇸🇦", href: "/ar/sa" },
  { code: "AE", name: "الإمارات",  flag: "🇦🇪", href: "/ar/ae" },
  { code: "QA", name: "قطر",       flag: "🇶🇦", href: "/ar/qa" },
  { code: "KW", name: "الكويت",    flag: "🇰🇼", href: "/ar/kw" },
  { code: "OM", name: "عُمان",     flag: "🇴🇲", href: "/ar/om" },
  { code: "BH", name: "البحرين",   flag: "🇧🇭", href: "/ar/bh" },
];

// Popular tools shown in footer
const FOOTER_TOOLS = [
  { href: "/vat-calculator",         label: "حاسبة ضريبة القيمة المضافة" },
  { href: "/salary-calculator",      label: "حاسبة الراتب الصافي" },
  { href: "/gratuity-calculator",    label: "حاسبة مكافأة نهاية الخدمة" },
  { href: "/loan-calculator",        label: "حاسبة القروض والتمويل" },
  { href: "/zakat-calculator",       label: "حاسبة الزكاة" },
  { href: "/inheritance-calculator", label: "حاسبة الميراث الشرعية" },
  { href: "/currency-converter",     label: "محول العملات الفوري" },
  { href: "/bmi-calculator",         label: "حاسبة مؤشر كتلة الجسم" },
  { href: "/mortgage-calculator",    label: "حاسبة التمويل العقاري" },
  { href: "/compound-interest",      label: "حاسبة الفائدة المركبة" },
];

// Company / legal links
const FOOTER_COMPANY = [
  { href: "/about",       label: "عن Qemlo" },
  { href: "/contact",     label: "تواصل معنا" },
  { href: "/privacy",     label: "سياسة الخصوصية" },
  { href: "/terms",       label: "الشروط والأحكام" },
  { href: "/disclaimer",  label: "إخلاء المسؤولية" },
];

// Inline CSS for the full footer
const FOOT_CSS = `
/* ── Footer Design Tokens ── */
:root {
  --ft-bg: #1A0F07;
  --ft-text: #F5F5F2;
  --ft-muted: rgba(245,245,242,.55);
  --ft-muted-hover: rgba(245,245,242,.85);
  --ft-border: rgba(245,245,242,.10);
  --ft-border-strong: rgba(245,245,242,.18);
  --ft-badge: rgba(245,245,242,.08);
  --ft-badge-hover: rgba(245,245,242,.16);
  --ft-orange: #FF5B04;
  --ft-orange-hover: #FF7A33;
  --ft-orange-glow: rgba(255,91,4,.25);
}

/* ── Full-Width Footer Shell (100% Edge-to-Edge) ── */
.ft-footer {
  width: 100%;
  margin-top: 56px;
  background: var(--ft-bg);
  color: var(--ft-text);
  border-top: 1px solid var(--ft-border-strong);
  box-shadow: 0 -4px 24px -4px rgba(0,0,0,.35);
  font-family: var(--font-arabic, sans-serif);
  position: relative;
  border-radius: 0;
  overflow: hidden;
}
@media(min-width:640px)  { .ft-footer { margin-top: 72px; } }
@media(min-width:1024px) { .ft-footer { margin-top: 88px; } }

/* ── Gradient top accent line (Full Width) ── */
.ft-accent-line {
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--ft-orange) 30%,
    #FF8A3D 60%,
    transparent 100%);
  opacity: 0.85;
}

/* ── Inner container (centered content on large screens) ── */
.ft-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 16px;
}
@media(min-width:640px)  { .ft-container { padding: 0 24px; } }
@media(min-width:1024px) { .ft-container { padding: 0 36px; } }

/* ── Main body (4-col grid on desktop) ── */
.ft-body {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}
@media(min-width:768px) {
  .ft-body {
    grid-template-columns: 1fr 1fr;
  }
}
@media(min-width:1024px) {
  .ft-body {
    grid-template-columns: 1.6fr 1fr 1fr 1fr;
  }
}

/* ── Column base ── */
.ft-col {
  padding: 28px 16px;
  border-bottom: 1px solid var(--ft-border);
}
@media(min-width:768px) {
  .ft-col {
    padding: 36px 24px;
    border-bottom: none;
    border-inline-end: 1px solid var(--ft-border);
  }
  .ft-col:nth-child(even) {
    border-inline-end: none;
  }
  .ft-col:nth-child(1), .ft-col:nth-child(2) {
    border-bottom: 1px solid var(--ft-border);
  }
}
@media(min-width:1024px) {
  .ft-col {
    padding: 44px 28px;
    border-bottom: none !important;
    border-inline-end: 1px solid var(--ft-border) !important;
  }
  .ft-col:last-child {
    border-inline-end: none !important;
  }
  .ft-col:first-child {
    padding-inline-start: 12px;
  }
}

/* ── Brand column ── */
.ft-brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  margin-bottom: 14px;
}
.ft-brand-logo:hover .ft-mark-wrap { transform: scale(1.06); }
.ft-mark-wrap {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: transform .25s;
}
.ft-mark-wrap img { width: 100%; height: 100%; object-fit: contain; }
.ft-brand-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--ft-text);
  letter-spacing: -.01em;
}
.ft-brand-name span {
  color: var(--ft-orange);
}
.ft-brand-desc {
  font-size: 13px;
  line-height: 1.7;
  color: var(--ft-muted);
  margin-bottom: 20px;
  max-width: 280px;
}
/* Free badge */
.ft-free-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,91,4,.12);
  border: 1px solid rgba(255,91,4,.25);
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ft-orange);
  margin-bottom: 20px;
}
.ft-free-badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--ft-orange);
  animation: ft-pulse 2s ease-in-out infinite;
}
@keyframes ft-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: .5; transform: scale(.75); }
}
/* Back-to-top */
.ft-top-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--ft-badge);
  border: 1px solid var(--ft-border-strong);
  border-radius: 12px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ft-muted);
  text-decoration: none;
  cursor: pointer;
  transition: background .15s, color .15s, transform .15s;
}
.ft-top-btn:hover, .ft-top-btn:focus-visible {
  background: var(--ft-badge-hover);
  color: var(--ft-text);
  transform: translateY(-1px);
}
.ft-top-btn svg { width: 14px; height: 14px; flex-shrink: 0; }

/* ── Column heading ── */
.ft-col-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--ft-orange);
  margin-bottom: 16px;
}

/* ── Tool links ── */
.ft-tool-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ft-muted);
  text-decoration: none;
  padding: 5px 0;
  border-radius: 6px;
  transition: color .15s, padding-inline-start .15s;
  line-height: 1.4;
}
.ft-tool-link::before {
  content: '';
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--ft-orange);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity .15s;
}
.ft-tool-link:hover, .ft-tool-link:focus-visible {
  color: var(--ft-text);
  padding-inline-start: 4px;
}
.ft-tool-link:hover::before, .ft-tool-link:focus-visible::before {
  opacity: 1;
}

/* ── Country links ── */
.ft-country-item {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  padding: 7px 10px;
  border-radius: 10px;
  transition: background .15s;
  margin-bottom: 2px;
}
.ft-country-item:hover, .ft-country-item:focus-visible {
  background: var(--ft-badge-hover);
}
.ft-country-flag {
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
}
.ft-country-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--ft-text);
  line-height: 1.2;
}
.ft-country-code {
  font-size: 11px;
  color: var(--ft-muted);
  font-weight: 500;
}

/* ── Company / legal links ── */
.ft-company-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ft-muted);
  text-decoration: none;
  padding: 7px 0;
  border-radius: 6px;
  transition: color .15s, padding-inline-start .15s;
}
.ft-company-link::before {
  content: '';
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--ft-orange);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity .15s;
}
.ft-company-link:hover, .ft-company-link:focus-visible {
  color: var(--ft-text);
  padding-inline-start: 4px;
}
.ft-company-link:hover::before, .ft-company-link:focus-visible::before {
  opacity: 1;
}

/* ── Bottom bar ── */
.ft-bottom-wrap {
  width: 100%;
  border-top: 1px solid var(--ft-border);
}
.ft-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 18px 0;
  text-align: center;
}
@media(min-width:768px) {
  .ft-bottom {
    flex-direction: row;
    justify-content: space-between;
    text-align: start;
  }
}
.ft-bottom-copy {
  font-size: 12px;
  color: var(--ft-muted);
  order: 2;
}
@media(min-width:768px) { .ft-bottom-copy { order: 1; } }
.ft-bottom-made {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ft-muted);
  order: 1;
}
@media(min-width:768px) { .ft-bottom-made { order: 2; } }
.ft-bottom-made span {
  font-size: 15px;
}

/* ── Focus rings ── */
.ft-footer a:focus-visible, .ft-footer button:focus-visible {
  outline: 2px solid var(--ft-orange);
  outline-offset: 2px;
}
`;

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer aria-label="تذييل الصفحة" className="ft-footer">
      <style dangerouslySetInnerHTML={{ __html: FOOT_CSS }} />

      {/* ── Orange accent top line ── */}
      <div className="ft-accent-line" aria-hidden="true" />

      {/* ══ MAIN BODY CONTAINER ══════════════════════════════════════ */}
      <div className="ft-container">
        <div className="ft-body">

          {/* ─── Col 1: Brand ─────────────────────────────────────────── */}
          <div className="ft-col">
            <a href="/" className="ft-brand-logo" aria-label="Qemlo — الصفحة الرئيسية">
              <span className="ft-mark-wrap" aria-hidden="true">
                <img src="/brand/qemlo-mark.svg" alt="" width="44" height="44" />
              </span>
              <span className="ft-brand-name">
                Qem<span>lo</span>
              </span>
            </a>

            <p className="ft-brand-desc">
              المنصة الأولى للحاسبات والأدوات العربية المجانية — حاسبات مالية وإسلامية وحلول الخليج في مكان واحد، بدون تسجيل وبأعلى معايير الخصوصية.
            </p>

            <div className="ft-free-badge">
              <span className="ft-free-badge-dot" aria-hidden="true" />
              مجاني 100% · بلا تسجيل
            </div>

            <br />

            <a href="#main" className="ft-top-btn" aria-label="العودة إلى أعلى الصفحة">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l5-5 5 5" />
              </svg>
              العودة للأعلى
            </a>
          </div>

          {/* ─── Col 2: Popular Tools ──────────────────────────────────── */}
          <div className="ft-col">
            <p className="ft-col-title">الأدوات الشائعة</p>
            <nav aria-label="أشهر الأدوات">
              {FOOTER_TOOLS.map((t) => (
                <a key={t.href} href={t.href} className="ft-tool-link">
                  {t.label}
                </a>
              ))}
            </nav>
          </div>

          {/* ─── Col 3: Country Hubs ───────────────────────────────────── */}
          <div className="ft-col">
            <p className="ft-col-title">دول الخليج</p>
            <nav aria-label="أدوات حسب الدولة">
              {FOOTER_COUNTRIES.map((c) => (
                <a key={c.code} href={c.href} className="ft-country-item">
                  <span className="ft-country-flag" aria-hidden="true">{c.flag}</span>
                  <span className="ft-country-info">
                    <span className="ft-country-name">{c.name}</span>
                    <span className="ft-country-code">{c.code}</span>
                  </span>
                </a>
              ))}
            </nav>
          </div>

          {/* ─── Col 4: Company ───────────────────────────────────────── */}
          <div className="ft-col">
            <p className="ft-col-title">الشركة</p>
            <nav aria-label="روابط الشركة والقانونية">
              {FOOTER_COMPANY.map((item) => (
                <a key={item.href} href={item.href} className="ft-company-link">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

        </div>{/* /ft-body */}
      </div>{/* /ft-container */}

      {/* ══ BOTTOM BAR ═══════════════════════════════════════════════ */}
      <div className="ft-bottom-wrap">
        <div className="ft-container">
          <div className="ft-bottom">
            <span className="ft-bottom-copy">
              © {year} Qemlo. جميع الحقوق محفوظة.
            </span>
            <span className="ft-bottom-made" aria-label="صُنع بالعالم العربي">
              صُنع بـ <span aria-hidden="true">❤️</span> للعالم العربي
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}