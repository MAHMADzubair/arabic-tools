import PublicFooterGate from "@/components/admin/PublicFooterGate";
import ToolTrustBar from "@/components/ToolTrustBar";
import "./globals.css";
import "./legacy-dark.css";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import HomeHeader from "../components/home/HomeHeader";
import { SITE_URL, SITE_NAME, SITE_ORG_ID, SITE_WEBSITE_ID, DEFAULT_OG_IMAGE } from "@/lib/siteConfig";
import { getToolCount } from "@/lib/registry";
import QemloMark from "@/components/home/QemloMark";
import { GUIDES } from "@/lib/guides";
import { FOUNDER } from "@/lib/founder";
import { editorialFontClass } from "@/lib/editorialFonts";
import { getChangelogStats, formatArabicDate } from "@/lib/changelog";
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
  --success:#137A47; --warning:#8A5A00; --error:#C8321F; --accent-text:#C2410C; --guide-bg:#FAF6EE; --guide-band:#EFE8D8; --guide-line:#DDD6C6; --guide-green:#1F5C4A;
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
    --success:#4ADE80; --warning:#FBBF24; --error:#FF7A6B; --accent-text:#FF8B52; --guide-bg:#14130F; --guide-band:#18201C; --guide-line:#35332C; --guide-green:#8FD3B8;
    --foot-bg:#0D0D0D; --foot-hover:var(--orange-hover);
  }
}
:root[data-theme="dark"]{
  --bg:#0D0D0D; --surface:#161616; --border:#2A2A2A;
  --text:#F5F5F2; --text-2:#B5B5B0; --text-3:#8E8E89;
  --card:#CFCFCA; --card-text:#0D0D0D; --card-muted:#4A4A47;
  --card-border:#A9A9A4; --card-field:#E6E6E1; --card-field-text:#0D0D0D;
  --tab-hover:rgba(13,13,13,.10);
  --success:#4ADE80; --warning:#FBBF24; --error:#FF7A6B; --accent-text:#FF8B52; --guide-bg:#14130F; --guide-band:#18201C; --guide-line:#35332C; --guide-green:#8FD3B8;
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
// Ink footer: correction CTA band, brand column, Saudi / UAE / Guides / Qemlo
// link columns (accordions on mobile via <details>), authorities line, legal bar.

const FOOTER_SCRIPT = ``;

const FOOTER_SA = [
  { href: "/ar/sa/final-settlement-calculator", label: "حاسبة المخالصة النهائية" },
  { href: "/salary-calculator/saudi", label: "حاسبة الراتب والتأمينات" },
  { href: "/overtime-calculator/saudi", label: "حاسبة العمل الإضافي" },
  { href: "/ar/sa/article-77-calculator", label: "تعويض المادة 77" },
  { href: "/ar/sa/zatca-wave-checker", label: "التحقق من الموجة 25" },
  { href: "/ar/sa/vat-registration-checker", label: "التسجيل في ضريبة القيمة المضافة" },
];

const FOOTER_AE = [
  { href: "/gratuity-calculator/uae", label: "مكافأة نهاية الخدمة" },
  { href: "/ar/ae/notice-period-calculator", label: "مهلة الإنذار" },
  { href: "/ar/ae/corporate-tax-calculator", label: "ضريبة الشركات" },
  { href: "/ar/ae/small-business-relief-checker", label: "إعفاء الأعمال الصغيرة" },
  { href: "/ar/ae/e-invoicing-readiness-checker", label: "جاهزية الفوترة الإلكترونية" },
  { href: "/ar/ae/vat-registration-checker", label: "التسجيل في الضريبة" },
];

const FOOTER_GUIDE_SLUGS = ["zatca-wave-25", "saudi-end-of-service", "uae-einvoicing-2027", "zakat-al-fitr-2027"];

// Company / legal links
const FOOTER_COMPANY = [
  { href: "/about",       label: "عن Qemlo" },
  { href: "/contact",     label: "تواصل معنا" },
  { href: "/guides",      label: "الأدلة" },
  { href: "/changelog",   label: "سجل التحديثات" },
  { href: "/privacy",     label: "سياسة الخصوصية" },
  { href: "/terms",       label: "الشروط والأحكام" },
  { href: "/disclaimer",  label: "إخلاء المسؤولية" },
];

const FOOTER_AUTHORITIES = [
  "الموارد البشرية (السعودية)",
  "التأمينات الاجتماعية",
  "زاتكا",
  "الموارد البشرية والتوطين",
  "الهيئة الاتحادية للضرائب",
];

const FOOT_CSS = `
.ft-root{background:#111110;color:#F4F3EF;--ft-ink2:#A8A69D;--ft-head:#8E8C84;--ft-link:#D9D7CF;--ft-line:#2A2926;--ft-line2:#45443F}
.ft-root a{text-decoration:none}
.ft-wrap{max-width:1180px;margin:0 auto;padding-inline:20px}
.ft-cta{border-bottom:1px solid var(--ft-line)}
.ft-cta .ft-wrap{display:flex;flex-wrap:wrap;gap:18px 40px;align-items:center;justify-content:space-between;padding-block:28px}
.ft-cta-title{margin:0;font-family:var(--font-qnaskh),var(--font-arabic),serif;font-size:22px;line-height:1.55;font-weight:700}
.ft-cta-sub{margin:6px 0 0;font-size:15px;line-height:1.9;color:var(--ft-ink2)}
.ft-btns{display:flex;flex-wrap:wrap;gap:10px}
.ft-btn{display:inline-flex;align-items:center;min-height:50px;padding:0 24px;border-radius:12px;background:var(--orange);color:#111110;font-weight:700;font-size:16px}
.ft-btn:hover{background:var(--orange-hover)}
.ft-btn-ghost{background:transparent;color:#F4F3EF;border:1px solid var(--ft-line2);font-weight:600;font-size:15px;padding:0 20px}
.ft-btn-ghost:hover{background:transparent;border-color:#8E8C84}
.ft-main{display:grid;gap:24px;padding-block:32px}
.ft-brand-logo{display:inline-flex;align-items:center;gap:10px;color:#F4F3EF;font-weight:700;font-size:22px}
.ft-tagline{margin:16px 0 0;max-width:300px;font-family:var(--font-qnaskh),var(--font-arabic),serif;font-size:20px;line-height:1.7;font-weight:600}
.ft-desc{margin:10px 0 0;max-width:300px;font-size:14px;line-height:1.9;color:var(--ft-ink2)}
.ft-contact{margin-top:18px;display:flex;flex-direction:column;gap:8px;font-size:14px;align-items:flex-start}
.ft-contact a{color:var(--ft-ink2)}
.ft-contact a:hover,.ft-col a:hover,.ft-bottom a:hover{color:#FF8B52}
.ft-mail{font-family:var(--font-qmono),ui-monospace,monospace;color:#F4F3EF!important}
.ft-wa{display:inline-flex;align-items:center;gap:8px}
.ft-wa i{width:8px;height:8px;border-radius:50%;background:#25D366}
.ft-switch{margin-top:20px;display:inline-flex;gap:6px;padding:4px;border-radius:999px;border:1px solid var(--ft-line2)}
.ft-switch a{padding:6px 14px;border-radius:999px;color:#F4F3EF;font-size:13px;font-weight:600}
.ft-switch a:hover{background:#2A2926}
.ft-cols{border-top:1px solid var(--ft-line);min-width:0}
.ft-col{border-bottom:1px solid var(--ft-line)}
.ft-open{display:none}
.ft-acc summary{list-style:none;display:flex;align-items:center;justify-content:space-between;min-height:56px;cursor:pointer;font-size:16px;font-weight:700}
.ft-acc summary::-webkit-details-marker{display:none}
.ft-acc summary::after{content:"+";display:inline-flex;width:28px;height:28px;align-items:center;justify-content:center;border-radius:50%;border:1px solid var(--ft-line2);font-size:16px;font-weight:400;color:var(--ft-ink2)}
.ft-acc[open] summary::after{content:"−"}
.ft-acc summary:focus-visible{outline:2px solid var(--orange);outline-offset:2px}
.ft-col ul{margin:0;padding:0 0 8px;list-style:none}
.ft-col li a{display:block;padding:6px 0;color:var(--ft-link);font-size:15px;line-height:1.7}
.ft-col-title{margin:0 0 10px;font-size:13px;font-weight:700;color:var(--ft-head)}
.ft-more{display:inline-block;margin:0 0 16px;font-size:14px;font-weight:700;color:#FF8B52}
.ft-auth{padding-block:18px;border-top:1px solid var(--ft-line);display:flex;flex-wrap:wrap;gap:8px 24px;align-items:baseline;font-size:13px;line-height:1.9;color:var(--ft-ink2)}
.ft-auth strong{color:var(--ft-head)}
.ft-bottom{padding-block:18px 28px;border-top:1px solid var(--ft-line);display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center;justify-content:space-between;font-size:13px;line-height:1.9;color:var(--ft-ink2)}
.ft-bottom p{margin:0;flex:1 1 520px;min-width:0}
.ft-bottom time{font-family:var(--font-qmono),ui-monospace,monospace;color:#F4F3EF}
.ft-top{color:#F4F3EF;font-weight:600}
@media (min-width:900px){
  .ft-wrap{padding-inline:28px}
  .ft-cta .ft-wrap{padding-block:36px}
  .ft-cta-title{font-size:28px}
  .ft-main{grid-template-columns:1.4fr 3.9fr;gap:40px;padding-block:48px 40px}
  .ft-cols{border-top:0;display:grid;grid-template-columns:1fr 1fr 1.1fr .8fr;gap:40px}
  .ft-col{border-bottom:0}
  .ft-acc{display:none}
  .ft-open{display:block}
  .ft-more{margin:0}
}
`;

function FooterColumn({ title, items, more, open }) {
  const links = (
    <>
      <ul>
        {items.map((item) => (
          <li key={item.href}><a href={item.href}>{item.label}</a></li>
        ))}
      </ul>
      {more && <a href={more.href} className="ft-more">{more.label} ←</a>}
    </>
  );
  // Mobile: accordion. Desktop: always-open column. One is hidden per breakpoint.
  return (
    <div className="ft-col">
      <details className="ft-acc" open={open}>
        <summary>{title}</summary>
        {links}
      </details>
      <div className="ft-open">
        <p className="ft-col-title">{title}</p>
        {links}
      </div>
    </div>
  );
}

function Footer() {
  const guides = FOOTER_GUIDE_SLUGS.map((slug) => GUIDES.find((g) => g.slug === slug)).filter(Boolean);
  const lastUpdate = getChangelogStats().lastUpdated;

  return (
    <footer aria-label="تذييل الصفحة" className={`ft-root ${editorialFontClass}`}>
      <style dangerouslySetInnerHTML={{ __html: FOOT_CSS }} />

      <div className="ft-cta">
        <div className="ft-wrap">
          <div style={{ flex: "1 1 460px", minWidth: 0 }}>
            <p className="ft-cta-title">رأيت رقماً لا يطابق المصدر؟</p>
            <p className="ft-cta-sub">نراجعه مقابل النص الرسمي ونرد خلال 24 ساعة في أيام العمل.</p>
          </div>
          <div className="ft-btns">
            <a href="/contact" className="ft-btn">اكتب لنا</a>
            <a href="/changelog" className="ft-btn ft-btn-ghost">سجل التحديثات</a>
          </div>
        </div>
      </div>

      <div className="ft-wrap ft-main">
        <div style={{ minWidth: 0 }}>
          <a href="/" className="ft-brand-logo" aria-label="Qemlo — الصفحة الرئيسية">
            <QemloMark size={44} tailColor="#FFFFFF" dotColor="#FF5B04" />
            <span>Qemlo</span>
          </a>
          <p className="ft-tagline">حاسبات عربية تُريك كيف خرج الرقم.</p>
          <p className="ft-desc">
            {new Intl.NumberFormat("ar-SA").format(getToolCount())} أداة لحقوق العمل والضريبة والزكاة في السعودية والإمارات. مجانية، بلا تسجيل، وكل نتيجة معها مصدرها.
          </p>
          <div className="ft-contact">
            <a href="mailto:contact@qemlo.com" dir="ltr" className="ft-mail">contact@qemlo.com</a>
            <a href="https://wa.me/923131700400" target="_blank" rel="noopener noreferrer" className="ft-wa"><i aria-hidden="true" />واتساب</a>
          </div>
          <div className="ft-switch" role="group" aria-label="أدوات حسب الدولة">
            <a href="/ar/sa">🇸🇦 السعودية</a>
            <a href="/ar/ae">🇦🇪 الإمارات</a>
          </div>
        </div>

        <nav className="ft-cols" aria-label="روابط الموقع">
          <FooterColumn title="أدوات السعودية" items={FOOTER_SA} more={{ href: "/ar/sa", label: "كل أدوات السعودية" }} open />
          <FooterColumn title="أدوات الإمارات" items={FOOTER_AE} more={{ href: "/ar/ae", label: "كل أدوات الإمارات" }} />
          <FooterColumn
            title="الأدلة"
            items={guides.map((g) => ({ href: g.href, label: g.title.split(":")[0] }))}
            more={{ href: "/guides", label: `كل الأدلة (${GUIDES.length})` }}
          />
          <FooterColumn title="Qemlo" items={FOOTER_COMPANY} />
        </nav>
      </div>

      <div className="ft-wrap">
        <div className="ft-auth">
          <strong>نراجع أدواتنا على ما تنشره:</strong>
          <span>{FOOTER_AUTHORITIES.join(" · ")}</span>
        </div>
        <div className="ft-bottom">
          <p>
            © {new Date().getFullYear()} Qemlo · أسّسه {FOUNDER.nameAr} · نتائج الأدوات تقدير للتوعية، وليست استشارة قانونية أو ضريبية أو شرعية. آخر تحديث لأدواتنا:{" "}
            <time dateTime={lastUpdate}>{formatArabicDate(lastUpdate)}</time>
          </p>
          <a href="#main" className="ft-top" aria-label="العودة إلى أعلى الصفحة">إلى أعلى الصفحة ↑</a>
        </div>
      </div>
    </footer>
  );
}
