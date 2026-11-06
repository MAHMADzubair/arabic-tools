"use client";
/**
 * WorldClockSection.jsx
 *
 * Live world clocks for Gulf + global cities, styled with the Qemlo design
 * system (glossy ink panel, orange accent, SVG icons, no emoji).
 *
 * Layout: 2 columns on phones, 3 on tablets, 6 on desktop.
 * Panel stays dark in both light and dark site themes (like the hero panel).
 *
 * SEO/AEO/GEO: <section aria-labelledby>, h2, crawlable explanatory text,
 * ItemList + SpeakableSpecification JSON-LD (unchanged).
 *
 * Fixes compared to the previous version:
 *  - one shared 1s timer instead of one interval per card
 *  - no hydration mismatch (placeholder until mounted)
 *  - UTC offsets via Intl (Mumbai now shows UTC+5:30, not a rounded hour)
 *  - Western digits (03:45) and Gregorian dates ("ar-SA" defaults to Hijri)
 *  - flag emoji replaced by country-code badges (flags render as letters on Windows)
 */

import { useState, useEffect, useCallback } from "react";

// ── City data ────────────────────────────────────────────────────────────────
const CITIES = [
  { id: "riyadh", nameAr: "الرياض", countryCode: "SA", tz: "Asia/Riyadh" },
  { id: "dubai", nameAr: "دبي", countryCode: "AE", tz: "Asia/Dubai" },
  { id: "cairo", nameAr: "القاهرة", countryCode: "EG", tz: "Africa/Cairo" },
  { id: "london", nameAr: "لندن", countryCode: "GB", tz: "Europe/London" },
  { id: "mumbai", nameAr: "مومباي", countryCode: "IN", tz: "Asia/Kolkata" },
  { id: "newyork", nameAr: "نيويورك", countryCode: "US", tz: "America/New_York" },
];

// Extra cities for the expanded "كل المدن" view
const EXTRA_CITIES = [
  { id: "kuwait", nameAr: "الكويت", countryCode: "KW", tz: "Asia/Kuwait" },
  { id: "doha", nameAr: "الدوحة", countryCode: "QA", tz: "Asia/Qatar" },
  { id: "manama", nameAr: "المنامة", countryCode: "BH", tz: "Asia/Bahrain" },
  { id: "muscat", nameAr: "مسقط", countryCode: "OM", tz: "Asia/Muscat" },
  { id: "amman", nameAr: "عمّان", countryCode: "JO", tz: "Asia/Amman" },
  { id: "beirut", nameAr: "بيروت", countryCode: "LB", tz: "Asia/Beirut" },
  { id: "istanbul", nameAr: "إسطنبول", countryCode: "TR", tz: "Europe/Istanbul" },
  { id: "paris", nameAr: "باريس", countryCode: "FR", tz: "Europe/Paris" },
  { id: "berlin", nameAr: "برلين", countryCode: "DE", tz: "Europe/Berlin" },
  { id: "toronto", nameAr: "تورنتو", countryCode: "CA", tz: "America/Toronto" },
  { id: "sydney", nameAr: "سيدني", countryCode: "AU", tz: "Australia/Sydney" },
  { id: "tokyo", nameAr: "طوكيو", countryCode: "JP", tz: "Asia/Tokyo" },
];

// ── Intl helpers (formatters are cached: creating them every second is slow) ─
const fmtCache = new Map();
function fmt(key, make) {
  if (!fmtCache.has(key)) fmtCache.set(key, make());
  return fmtCache.get(key);
}

function getTimeParts(tz, now) {
  try {
    const f = fmt(`t:${tz}`, () =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      })
    );
    const [h, m, s] = f.format(now).split(":");
    return { hm: `${h}:${m}`, s, hour: parseInt(h, 10) };
  } catch {
    return { hm: "--:--", s: "--", hour: 12 };
  }
}

function getDate(tz, now) {
  try {
    // ar-EG + latn digits: Gregorian calendar, Western digits.
    return fmt(`d:${tz}`, () =>
      new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
        timeZone: tz,
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    ).format(now);
  } catch {
    return "";
  }
}

function getOffset(tz, now) {
  try {
    const f = fmt(`o:${tz}`, () =>
      new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" })
    );
    const part = f.formatToParts(now).find((p) => p.type === "timeZoneName");
    const v = part ? part.value : "";
    if (v === "GMT") return "UTC+0";
    return v.replace("GMT", "UTC").replace("-", "\u2212");
  } catch {
    return "";
  }
}

// ── Icons (24 grid, stroke 1.8, currentColor) ────────────────────────────────
const ICONS = {
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  arrow: <path d="M19 12H5M11 6l-6 6 6 6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
};

function Icon({ name, size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
}

// ── Clock card (single city) ─────────────────────────────────────────────────
function ClockCard({ city, now }) {
  const ready = now !== null;
  const t = ready ? getTimeParts(city.tz, now) : { hm: "--:--", s: "--", hour: 12 };
  const date = ready ? getDate(city.tz, now) : "";
  const offset = ready ? getOffset(city.tz, now) : "";
  const isDay = t.hour >= 6 && t.hour < 18;

  return (
    <article
      aria-label={`توقيت ${city.nameAr}`}
      className="group flex h-full flex-col items-center gap-1 rounded-2xl bg-gradient-to-b from-white/[0.09] to-white/[0.03] px-3 pb-4 pt-3.5 text-center ring-1 ring-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_26px_rgba(0,0,0,0.35)] transition hover:ring-[#FF5B04]/70 motion-reduce:transition-none sm:px-4"
    >
      {/* Country code + day/night */}
      <div className="flex w-full items-center justify-between" aria-hidden="true">
        <span
          dir="ltr"
          className="flex h-8 min-w-8 items-center justify-center rounded-full bg-white/10 px-1.5 text-[11px] font-bold text-[#F5F5F2] ring-1 ring-white/15"
        >
          {city.countryCode}
        </span>
        <Icon
          name={isDay ? "sun" : "moon"}
          size={18}
          className={isDay ? "text-[#FF8A3D]" : "text-[#BFB8B0]"}
        />
      </div>

      {/* City name */}
      <p className="mt-1.5 text-sm font-bold text-[#F5F5F2] sm:text-base">{city.nameAr}</p>

      {/* Live time: HH:MM large, seconds small */}
      <time
        dateTime={ready ? `${t.hm}:${t.s}` : undefined}
        aria-live="off"
        dir="ltr"
        className="mt-1 flex items-baseline justify-center gap-1 tabular-nums text-[#F5F5F2]"
      >
        <span className="text-[28px] font-extrabold leading-none tracking-tight sm:text-[32px]">
          {t.hm}
        </span>
        <span className="w-[1.4em] text-start text-sm font-bold text-[#FF8A3D] sm:text-base">
          {t.s}
        </span>
      </time>

      {/* Date */}
      <p className="min-h-[1.25rem] text-xs text-[#BFB8B0]">{date}</p>

      {/* UTC offset */}
      <p
        dir="ltr"
        className="mt-auto rounded-full bg-[#FF5B04]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#FF9A5C]"
      >
        {offset || "UTC"}
      </p>
    </article>
  );
}

// ── JSON-LD (ItemList + SpeakableSpecification for AEO/GEO) ──────────────────
const clockJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "الساعة العالمية الآن — توقيت مدن الخليج والعالم",
  description:
    "توقيت مباشر ولحظي لأهم المدن: الرياض، دبي، القاهرة، لندن، مومباي، نيويورك، وأكثر من 12 مدينة عالمية مع فوارق التوقيت UTC.",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["[data-speakable='world-clock']"],
  },
  itemListElement: [
    "الرياض (SA) — UTC+3",
    "دبي (AE) — UTC+4",
    "القاهرة (EG) — UTC+2 أو UTC+3 في الصيف",
    "لندن (GB) — UTC+0 أو UTC+1 في الصيف",
    "مومباي (IN) — UTC+5:30",
    "نيويورك (US) — UTC−5 أو UTC−4 في الصيف",
  ].map((name, i) => ({ "@type": "ListItem", position: i + 1, name })),
};

// ── Main section ─────────────────────────────────────────────────────────────
export default function WorldClockSection() {
  const [showAll, setShowAll] = useState(false);
  const toggle = useCallback(() => setShowAll((v) => !v), []);

  // One shared timer. `null` until mounted, so server and first client render match.
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        @keyframes wc-pop {
          from { opacity: 0; transform: translateY(8px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .wc-extra { animation: wc-pop .22s ease both; }
        @media (prefers-reduced-motion: reduce) { .wc-extra { animation: none; } }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clockJsonLd) }}
      />

      <section
        aria-labelledby="world-clock-title"
        dir="rtl"
        className="w-full px-4 py-8 sm:py-12"
      >
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#241A14_0%,#0D0D0D_65%)] p-5 text-[#F5F5F2] ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_30px_60px_rgba(60,30,10,0.30)] sm:rounded-[36px] sm:p-8">
          {/* soft glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(640px_320px_at_12%_0%,rgba(255,91,4,0.22),transparent_70%),radial-gradient(520px_300px_at_95%_100%,rgba(255,138,61,0.10),transparent_70%)]"
          />

          <div className="relative">
            {/* ── Header ── */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
              <div data-speakable="world-clock" className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#FFB07A] to-[#FF5B04] text-[#0D0D0D] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_18px_rgba(255,91,4,0.25)]"
                >
                  <Icon name="globe" size={26} />
                </span>
                <div>
                  <h2
                    id="world-clock-title"
                    className="text-xl font-bold leading-tight sm:text-3xl"
                  >
                    الساعة العالمية الآن
                  </h2>
                  <p className="mt-1 text-xs text-[#BFB8B0] sm:text-sm">
                    توقيت مباشر وفوارق التوقيت بين الخليج والعالم
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggle}
                aria-expanded={showAll}
                aria-controls="world-clock-list"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-bold text-[#F5F5F2] ring-1 ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-gradient-to-b hover:from-[#FF8A3D] hover:to-[#FF5B04] hover:text-[#0D0D0D] hover:ring-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5B04] motion-reduce:transition-none"
              >
                <span>{showAll ? "المدن الرئيسية" : "كل المدن والفوارق"}</span>
                <Icon name={showAll ? "close" : "arrow"} size={18} />
              </button>
            </div>

            {/* ── Clock grid: 2 columns on phones ── */}
            <ul
              id="world-clock-list"
              aria-label="ساعات المدن"
              className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6"
            >
              {CITIES.map((city) => (
                <li key={city.id}>
                  <ClockCard city={city} now={now} />
                </li>
              ))}

              {showAll &&
                EXTRA_CITIES.map((city, i) => (
                  <li
                    key={city.id}
                    className="wc-extra"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <ClockCard city={city} now={now} />
                  </li>
                ))}
            </ul>

            {/* ── Crawlable explanatory text (AEO) ── */}
            <p className="mt-6 max-w-4xl text-xs leading-loose text-[#BFB8B0] sm:text-sm">
              تُعرض الأوقات بصيغة 24 ساعة وتتحدّث كل ثانية مباشرةً من جهازك دون أي خادم
              خارجي.{" "}
              <strong className="font-bold text-[#F5F5F2]">الرياض (UTC+3) ودبي (UTC+4)</strong>{" "}
              بينهما ساعة واحدة.{" "}
              <strong className="font-bold text-[#F5F5F2]">الرياض والقاهرة</strong> تتفاوتان
              ساعة شتاءً وتتساويان صيفاً.{" "}
              <strong className="font-bold text-[#F5F5F2]">الرياض ولندن</strong> بينهما ثلاث
              ساعات شتاءً وساعتان صيفاً.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}