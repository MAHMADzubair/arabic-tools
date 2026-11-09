import PublicFooterGate from "@/components/admin/PublicFooterGate";
import ToolTrustBar from "@/components/ToolTrustBar";
import "./globals.css";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import HomeHeader from "../components/home/HomeHeader";
import { SITE_URL, SITE_NAME, SITE_ORG_ID, SITE_WEBSITE_ID, DEFAULT_OG_IMAGE } from "@/lib/siteConfig";
import { getToolCount } from "@/lib/registry";
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
  --success:#137A47; --warning:#8A5A00; --error:#C8321F; --accent-text:#C2410C;
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
    --success:#4ADE80; --warning:#FBBF24; --error:#FF7A6B; --accent-text:#FF8B52;
    --foot-bg:#0D0D0D; --foot-hover:var(--orange-hover);
  }
}
:root[data-theme="dark"]{
  --bg:#0D0D0D; --surface:#161616; --border:#2A2A2A;
  --text:#F5F5F2; --text-2:#B5B5B0; --text-3:#8E8E89;
  --card:#CFCFCA; --card-text:#0D0D0D; --card-muted:#4A4A47;
  --card-border:#A9A9A4; --card-field:#E6E6E1; --card-field-text:#0D0D0D;
  --tab-hover:rgba(13,13,13,.10);
  --success:#4ADE80; --warning:#FBBF24; --error:#FF7A6B; --accent-text:#FF8B52;
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
  email: "contact@qemlo.com",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "contact@qemlo.com",
    availableLanguage: ["ar", "en"],
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
            strategy="lazyOnload"
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

                // Flush public engagement events queued before the afterInteractive GA4 script ran.
                const pendingQemloEvents = window.__qemloPendingEvents || [];
                pendingQemloEvents.forEach(([eventName, params]) => {
                  window.trackEvent(eventName, params);
                });
                window.__qemloPendingEvents = [];
              `}
            </Script>
          </>
        )}

        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--orange)] focus:px-4 focus:py-2 focus:font-bold focus:text-[var(--on-orange)]">انتقل إلى المحتوى</a>
        <HomeHeader />
        <main id="main" className="flex-1"><ToolTrustBar />{children}</main>
        <PublicFooterGate><Footer /></PublicFooterGate>
        <script dangerouslySetInnerHTML={{ __html: FOOTER_SCRIPT }} />
        <Analytics />
      </body>
    </html>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
//
// Design: Premium full-width footer — 10/10 quality, fully mobile responsive.
//
//  Desktop (≥ 1024px):
//    Hero strip:   Logo + tagline + stats row
//    Link grid:    4 columns (Brand col, Tools, Countries, Company)
//    Bottom bar:   copyright | legal pills | "made with love" + scroll-top
//
//  Tablet (768–1023px): 2×2 grid
//  Mobile (<640px):     Stacked, countries 2×3 grid, tools 2-col list
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
  { href: "/vat-calculator",         label: "حاسبة ضريبة القيمة المضافة", icon: "%" },
  { href: "/salary-calculator",      label: "حاسبة الراتب الصافي",         icon: "﷼" },
  { href: "/gratuity-calculator",    label: "حاسبة مكافأة نهاية الخدمة",   icon: "🎁" },
  { href: "/loan-calculator",        label: "حاسبة القروض والتمويل",        icon: "🏦" },
  { href: "/zakat-calculator",       label: "حاسبة الزكاة",                 icon: "☪" },
  { href: "/inheritance-calculator", label: "حاسبة الميراث الشرعية",        icon: "⚖" },
  { href: "/currency-converter",     label: "محول العملات الفوري",           icon: "↔" },
  { href: "/bmi-calculator",         label: "حاسبة مؤشر كتلة الجسم",        icon: "♥" },
  { href: "/mortgage-calculator",    label: "حاسبة التمويل العقاري",         icon: "🏠" },
  { href: "/compound-interest",      label: "حاسبة الفائدة المركبة",         icon: "📈" },
];

// Company / legal links
const FOOTER_COMPANY = [
  { href: "/about",       label: "عن Qemlo" },
  { href: "/contact",     label: "تواصل معنا" },
  { href: "/changelog",   label: "سجل التحديثات" },
  { href: "/privacy",     label: "سياسة الخصوصية" },
  { href: "/terms",       label: "الشروط والأحكام" },
  { href: "/disclaimer",  label: "إخلاء المسؤولية" },
];

// Inline CSS — Premium 10/10 footer
const FOOT_CSS = `
/* ══ Footer Design Tokens ══════════════════════════════════════════════════ */
:root {
  --ft-bg:          #120A04;
  --ft-bg-hero:     #0D0702;
  --ft-bg-bottom:   #0A0602;
  --ft-text:        #F0EDE8;
  --ft-muted:       rgba(240,237,232,.50);
  --ft-muted-hover: rgba(240,237,232,.85);
  --ft-border:      rgba(240,237,232,.08);
  --ft-border-md:   rgba(240,237,232,.12);
  --ft-border-str:  rgba(240,237,232,.18);
  --ft-card-hover:  rgba(255,91,4,.07);
  --ft-orange:      #FF5B04;
  --ft-orange-lt:   #FF7A33;
  --ft-orange-glow: rgba(255,91,4,.20);
  --ft-radius:      10px;
}

/* ══ Footer Shell — 100% Edge-to-Edge, No Rounded Corners ══════════════════ */
.ft-root {
  width: 100%;
  margin: 0;
  background: var(--ft-bg);
  color: var(--ft-text);
  font-family: var(--font-arabic, sans-serif);
  position: relative;
  overflow: hidden;
}

/* Subtle radial orange ambient glow at footer center-bottom */
.ft-root::before {
  content: '';
  position: absolute;
  bottom: 0; left: 50%;
  transform: translateX(-50%);
  width: 700px; height: 300px;
  background: radial-gradient(ellipse at center bottom, rgba(255,91,4,.12) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* ══ Top orange accent bar ══════════════════════════════════════════════════ */
.ft-topbar {
  height: 3px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--ft-orange) 20%,
    #FF8A3D 50%,
    var(--ft-orange) 80%,
    transparent 100%);
  position: relative;
  z-index: 1;
}

/* ══ Inner max-width container ══════════════════════════════════════════════ */
.ft-inner {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}
@media(min-width:640px)  { .ft-inner { padding: 0 32px; } }
@media(min-width:1024px) { .ft-inner { padding: 0 48px; } }

/* ══ HERO STRIP ═════════════════════════════════════════════════════════════ */
.ft-hero {
  background: var(--ft-bg-hero);
  border-bottom: 1px solid var(--ft-border-md);
  padding: 36px 0 28px;
  position: relative;
  z-index: 1;
}
.ft-hero-inner {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
}
@media(min-width:768px) {
  .ft-hero-inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

/* Logo lockup */
.ft-logo-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  flex-shrink: 0;
}
.ft-logo-link:hover .ft-logo-img { transform: scale(1.06) rotate(-3deg); }
.ft-logo-img {
  width: 48px; height: 48px;
  object-fit: contain;
  transition: transform .3s cubic-bezier(.34,1.56,.64,1);
  flex-shrink: 0;
}
.ft-logo-wordmark {
  font-size: 26px;
  font-weight: 800;
  color: var(--ft-text);
  letter-spacing: -.02em;
  line-height: 1;
}
.ft-logo-wordmark em {
  font-style: normal;
  color: var(--ft-orange);
}

/* Hero right block — tagline + badge */
.ft-hero-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}
@media(min-width:768px) { .ft-hero-right { align-items: flex-end; } }

.ft-tagline {
  font-size: 13px;
  font-weight: 500;
  color: var(--ft-muted);
  line-height: 1.6;
  max-width: 340px;
}
@media(min-width:768px) { .ft-tagline { text-align: left; } }

/* Pulsing free badge */
.ft-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(255,91,4,.10);
  border: 1px solid rgba(255,91,4,.28);
  border-radius: 24px;
  padding: 5px 14px 5px 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ft-orange);
  letter-spacing: .01em;
  white-space: nowrap;
}
.ft-badge-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--ft-orange);
  box-shadow: 0 0 0 0 var(--ft-orange-glow);
  animation: ft-ping 2s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes ft-ping {
  0%   { box-shadow: 0 0 0 0 var(--ft-orange-glow); opacity: 1; }
  70%  { box-shadow: 0 0 0 6px transparent; opacity: .6; }
  100% { box-shadow: 0 0 0 0 transparent; opacity: 1; }
}

/* Stats row */
.ft-stats {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: wrap;
  margin-top: 4px;
}
.ft-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ft-muted);
  padding: 0 14px;
  border-inline-end: 1px solid var(--ft-border-str);
  white-space: nowrap;
}
.ft-stat:first-child { padding-inline-start: 0; }
.ft-stat:last-child { border-inline-end: none; }
.ft-stat-num {
  color: var(--ft-text);
  font-weight: 800;
  font-size: 14px;
}

/* ══ LINK GRID ══════════════════════════════════════════════════════════════ */
.ft-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  padding: 0;
}
@media(min-width:640px) {
  .ft-grid { grid-template-columns: 1fr 1fr; }
}
@media(min-width:1024px) {
  .ft-grid { grid-template-columns: 1.5fr 1.2fr 1fr 1fr; }
}

/* Grid columns */
.ft-gc {
  padding: 32px 20px;
  border-bottom: 1px solid var(--ft-border);
}
@media(min-width:640px) {
  .ft-gc {
    padding: 36px 24px;
    border-bottom: none;
    border-inline-end: 1px solid var(--ft-border);
  }
  .ft-gc:nth-child(2n) { border-inline-end: none; }
  .ft-gc:nth-child(1),
  .ft-gc:nth-child(2) { border-bottom: 1px solid var(--ft-border); }
}
@media(min-width:1024px) {
  .ft-gc {
    padding: 44px 32px;
    border-bottom: none !important;
    border-inline-end: 1px solid var(--ft-border) !important;
  }
  .ft-gc:last-child { border-inline-end: none !important; }
  .ft-gc:nth-child(n) { border-bottom: none !important; }
}

/* Column section title */
.ft-sec-title {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--ft-orange);
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ft-sec-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(255,91,4,.3), transparent);
  min-width: 20px;
}

/* ── Brand column extras ── */
.ft-brand-desc {
  font-size: 13px;
  line-height: 1.75;
  color: var(--ft-muted);
  margin-bottom: 20px;
  max-width: 260px;
}
.ft-top-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(240,237,232,.06);
  border: 1px solid var(--ft-border-str);
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ft-muted);
  text-decoration: none;
  transition: background .18s, color .18s, transform .18s;
  cursor: pointer;
}
.ft-top-btn:hover, .ft-top-btn:focus-visible {
  background: rgba(255,91,4,.12);
  color: var(--ft-orange);
  border-color: rgba(255,91,4,.3);
  transform: translateY(-2px);
}
.ft-top-btn svg { width: 14px; height: 14px; }

/* ── Tool links — 2-column grid on mobile ── */
.ft-tools-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 8px;
}
@media(min-width:1024px) {
  .ft-tools-grid { grid-template-columns: 1fr; }
}
.ft-tool-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ft-muted);
  text-decoration: none;
  padding: 6px 6px 6px 0;
  border-radius: 6px;
  transition: color .15s, background .15s, padding-inline-start .15s;
  line-height: 1.35;
  word-break: break-word;
}
.ft-tool-link:hover, .ft-tool-link:focus-visible {
  color: var(--ft-text);
  padding-inline-start: 6px;
  background: var(--ft-card-hover);
  border-radius: 6px;
}
.ft-tool-icon {
  font-size: 13px;
  opacity: .5;
  flex-shrink: 0;
  transition: opacity .15s;
  width: 16px;
  text-align: center;
}
.ft-tool-link:hover .ft-tool-icon { opacity: .9; }

/* ── Country links — 2×3 grid ── */
.ft-countries-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.ft-country-card {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  padding: 9px 10px;
  border-radius: var(--ft-radius);
  border: 1px solid var(--ft-border);
  transition: border-color .18s, background .18s, transform .18s;
}
.ft-country-card:hover, .ft-country-card:focus-visible {
  border-color: rgba(255,91,4,.35);
  background: var(--ft-card-hover);
  transform: translateY(-1px);
}
.ft-country-flag {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}
.ft-country-name {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--ft-text);
  line-height: 1.2;
}
.ft-country-code {
  display: block;
  font-size: 10px;
  color: var(--ft-muted);
  font-weight: 500;
  margin-top: 1px;
}

/* ── Company links ── */
.ft-company-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ft-muted);
  text-decoration: none;
  padding: 8px 6px;
  border-radius: 8px;
  transition: color .15s, background .15s, padding-inline-start .15s;
}
.ft-company-link:hover, .ft-company-link:focus-visible {
  color: var(--ft-text);
  background: var(--ft-card-hover);
  padding-inline-start: 12px;
}
.ft-company-link::before {
  content: '';
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--ft-orange);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity .15s;
}
.ft-company-link:hover::before, .ft-company-link:focus-visible::before {
  opacity: 1;
}

/* ══ BOTTOM BAR ═════════════════════════════════════════════════════════════ */
.ft-bottom-wrap {
  background: var(--ft-bg-bottom);
  border-top: 1px solid var(--ft-border-md);
  position: relative;
  z-index: 1;
}
.ft-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 20px 0;
  text-align: center;
}
@media(min-width:768px) {
  .ft-bottom {
    flex-direction: row;
    justify-content: space-between;
    text-align: start;
    gap: 0;
  }
}

/* Copyright text */
.ft-copy {
  font-size: 12px;
  color: var(--ft-muted);
  order: 3;
  line-height: 1.5;
}
@media(min-width:768px) { .ft-copy { order: 1; } }

/* Legal pill links */
.ft-legal {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  order: 2;
}
.ft-legal-link {
  font-size: 11px;
  font-weight: 500;
  color: var(--ft-muted);
  text-decoration: none;
  background: rgba(240,237,232,.05);
  border: 1px solid var(--ft-border);
  border-radius: 20px;
  padding: 3px 10px;
  transition: color .15s, border-color .15s, background .15s;
  white-space: nowrap;
}
.ft-legal-link:hover, .ft-legal-link:focus-visible {
  color: var(--ft-orange);
  border-color: rgba(255,91,4,.3);
  background: rgba(255,91,4,.06);
}

/* Made with love + scroll-to-top */
.ft-made-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  order: 1;
}
@media(min-width:768px) { .ft-made-wrap { order: 3; } }

.ft-made-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--ft-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}
.ft-made-heart {
  font-size: 14px;
  animation: ft-heartbeat 1.6s ease-in-out infinite;
}
@keyframes ft-heartbeat {
  0%, 100% { transform: scale(1); }
  14%       { transform: scale(1.2); }
  28%       { transform: scale(1); }
  42%       { transform: scale(1.15); }
  56%       { transform: scale(1); }
}

/* Scroll-to-top circle button */
.ft-scroll-top {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px; height: 34px;
  border-radius: 50%;
  background: var(--ft-orange);
  color: #fff;
  text-decoration: none;
  flex-shrink: 0;
  transition: background .18s, transform .2s;
  box-shadow: 0 2px 12px rgba(255,91,4,.35);
}
.ft-scroll-top:hover, .ft-scroll-top:focus-visible {
  background: var(--ft-orange-lt);
  transform: translateY(-3px);
}
.ft-scroll-top svg { width: 16px; height: 16px; }

/* ══ Focus rings ════════════════════════════════════════════════════════════ */
.ft-root a:focus-visible,
.ft-root button:focus-visible {
  outline: 2px solid var(--ft-orange);
  outline-offset: 2px;
  border-radius: 4px;
}
`;

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer aria-label="تذييل الصفحة" className="ft-root">
      <style dangerouslySetInnerHTML={{ __html: FOOT_CSS }} />

      {/* ══ TOP ORANGE BAR ═══════════════════════════════════════════ */}
      <div className="ft-topbar" aria-hidden="true" />

      {/* ══ HERO STRIP — Logo + Tagline + Stats ══════════════════════ */}
      <div className="ft-hero">
        <div className="ft-inner">
          <div className="ft-hero-inner">

            {/* Logo */}
            <a href="/" className="ft-logo-link" aria-label="Qemlo — الصفحة الرئيسية">
              <img
                src="/brand/qemlo-mark.svg"
                alt=""
                width="48"
                height="48"
                className="ft-logo-img"
                aria-hidden="true"
              />
              <span className="ft-logo-wordmark">
                Qem<em>lo</em>
              </span>
            </a>

            {/* Tagline + badge */}
            <div className="ft-hero-right">
              <p className="ft-tagline">
                المنصة الأولى للحاسبات والأدوات العربية المجانية
              </p>
              <span className="ft-badge">
                <span className="ft-badge-dot" aria-hidden="true" />
                مجاني 100% · بلا تسجيل
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="ft-stats" role="list" aria-label="إحصائيات المنصة">
            <div className="ft-stat" role="listitem">
              <span className="ft-stat-num">{new Intl.NumberFormat("ar-SA").format(getToolCount())}</span>
              <span>أداة مجانية</span>
            </div>
            <div className="ft-stat" role="listitem">
              <span className="ft-stat-num">٦</span>
              <span>دول خليجية</span>
            </div>
            <div className="ft-stat" role="listitem">
              <span className="ft-stat-num">٠</span>
              <span>تسجيل مطلوب</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ LINK GRID ════════════════════════════════════════════════ */}
      <div className="ft-inner">
        <div className="ft-grid">

          {/* ─── Col 1: Brand info ─────────────────────────────────── */}
          <div className="ft-gc">
            <p className="ft-brand-desc">
              حاسبات مالية وإسلامية وحلول خليجية في مكان واحد — بدون تسجيل وبأعلى معايير الخصوصية.
            </p>

            <a href="#main" className="ft-top-btn" aria-label="العودة إلى أعلى الصفحة">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l5-5 5 5" />
              </svg>
              العودة للأعلى
            </a>
          </div>

          {/* ─── Col 2: Popular Tools ──────────────────────────────── */}
          <div className="ft-gc">
            <p className="ft-sec-title">الأدوات الشائعة</p>
            <nav aria-label="أشهر الأدوات">
              <div className="ft-tools-grid">
                {FOOTER_TOOLS.map((t) => (
                  <a key={t.href} href={t.href} className="ft-tool-link">
                    <span className="ft-tool-icon" aria-hidden="true">{t.icon}</span>
                    {t.label}
                  </a>
                ))}
              </div>
            </nav>
          </div>

          {/* ─── Col 3: Country Hubs ───────────────────────────────── */}
          <div className="ft-gc">
            <p className="ft-sec-title">دول الخليج</p>
            <nav aria-label="أدوات حسب الدولة">
              <div className="ft-countries-grid">
                {FOOTER_COUNTRIES.map((c) => (
                  <a key={c.code} href={c.href} className="ft-country-card">
                    <span className="ft-country-flag" aria-hidden="true">{c.flag}</span>
                    <span>
                      <span className="ft-country-name">{c.name}</span>
                      <span className="ft-country-code">{c.code}</span>
                    </span>
                  </a>
                ))}
              </div>
            </nav>
          </div>

          {/* ─── Col 4: Company ───────────────────────────────────── */}
          <div className="ft-gc">
            <p className="ft-sec-title">الشركة</p>
            <nav aria-label="روابط الشركة والقانونية">
              {FOOTER_COMPANY.map((item) => (
                <a key={item.href} href={item.href} className="ft-company-link">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

        </div>{/* /ft-grid */}
      </div>{/* /ft-inner */}

      {/* ══ BOTTOM BAR ═══════════════════════════════════════════════ */}
      <div className="ft-bottom-wrap">
        <div className="ft-inner">
          <div className="ft-bottom">

            {/* Copyright */}
            <span className="ft-copy">
              © {year} Qemlo. جميع الحقوق محفوظة.
            </span>

            {/* Legal pill links */}
            <nav className="ft-legal" aria-label="روابط قانونية">
              <a href="/privacy"    className="ft-legal-link">الخصوصية</a>
              <a href="/terms"      className="ft-legal-link">الشروط</a>
              <a href="/disclaimer" className="ft-legal-link">إخلاء المسؤولية</a>
            </nav>

            {/* Made with love + scroll top */}
            <div className="ft-made-wrap">
              <span className="ft-made-text">
                صُنع بـ
                <span className="ft-made-heart" aria-hidden="true">❤️</span>
                للعالم العربي
              </span>
              <a href="#main" className="ft-scroll-top" aria-label="العودة لأعلى الصفحة">
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l5-5 5 5" />
                </svg>
              </a>
            </div>

          </div>
        </div>
      </div>

    </footer>
  );
}