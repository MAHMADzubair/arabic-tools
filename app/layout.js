import "./globals.css";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import Script from "next/script";
import { SITE_URL, SITE_NAME, SITE_ORG_ID, SITE_WEBSITE_ID, DEFAULT_OG_IMAGE } from "@/lib/siteConfig";
import { Analytics } from "@vercel/analytics/next";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Font setup
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
  preload: true,
});

// Tokens CSS (unchanged)
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
  --font-arabic: var(--font-ibm-plex-arabic), "IBM Plex Sans Arabic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --fw-light: 300; --fw-regular: 400; --fw-medium: 500; --fw-semibold: 600; --fw-bold: 700;
  --lh-tight: 1.25; --lh-snug: 1.35; --lh-normal: 1.6; --lh-relaxed: 1.75; --lh-loose: 1.9;
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
:root[data-theme="dark"]{...}
html,body{font-family:var(--font-arabic); background:var(--bg); color:var(--text);}
`;

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F5F2" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0D0D" },
  ],
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon.png", type: "image/png" }], shortcut: "/icon.svg", apple: "/apple-icon.png" },
  title: { default: "أدوات عربية مجانية | حاسبات ومحولات وأدوات PDF وصور ومال", template: "%s | Qemlo" },
  description: "المنصة الشاملة للأدوات والحاسبات العربية المجانية...",
  openGraph: { title: "أدوات عربية مجانية | ...", description: "...", url: SITE_URL, siteName: "Qemlo", locale: "ar_AR", type: "website", images: [DEFAULT_OG_IMAGE] },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE.url] },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "" },
  other: { "google-adsense-account": "ca-pub-4706954030329423" },
};

export default function RootLayout({ children }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
  const ADSENSE_PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: TOKENS_CSS }} />
        {ADSENSE_PUB_ID && (
          <Script id="google-adsense" async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`} strategy="beforeInteractive" crossOrigin="anonymous" />
        )}
      </head>
      <body suppressHydrationWarning className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
        {/* Structured data and analytics (same as before) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ /* organizationJsonLd */ }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ /* websiteJsonLd */ }) }} />
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { page_path: window.location.pathname });
            `}</Script>
          </>
        )}
        {/* Public layout renders Header/Footer conditionally – see app/(public)/layout.jsx */}
        {(() => {
  const { headers } = require('next/headers');
  const path = headers().get('x-nextjs-pathname') || '';
  const isAdmin = path.startsWith('/admin');
  return isAdmin ? (
    <>{children}</>
  ) : (
    <>
      <Header />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
    </>
  );
})()}
        <Analytics />
      </body>
    </html>
  );
}