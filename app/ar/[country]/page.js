import { notFound } from "next/navigation";
import {
  COUNTRY_CODES,
  CATEGORIES,
  getCountryById,
  getToolsByCategory,
} from "@/lib/registry";

export function generateStaticParams() {
  return COUNTRY_CODES.map((code) => ({ country: code }));
}

export function generateMetadata({ params }) {
  const country = getCountryById(params.country);
  if (!country) return {};
  return {
    title: `ادوات ${country.nameAr} المالية | الادوات العربية`,
    description: country.metaDesc,
    alternates: { canonical: `/ar/${country.code}/` },
  };
}

export default function CountryPage({ params }) {
  const country = getCountryById(params.country);
  if (!country) notFound();

  return (
    <div>
      <section className="relative overflow-hidden bg-hero-gradient px-4 py-14 sm:py-20">
        <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center text-white">
          <div className="mb-5 inline-flex items-center gap-3 rounded-full bg-white/15 px-5 py-2 text-base font-semibold backdrop-blur-sm">
            <span className="text-2xl">{country.flag}</span>
            <span>{country.nameAr}</span>
            <span className="opacity-60">|</span>
            <span className="text-sm opacity-80">{country.nameEn}</span>
          </div>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            ادوات مالية لـ
            <br />
            <span className="text-accent">{country.nameAr}</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            {country.metaDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <InfoPill label="العملة" value={country.currency} />
            <InfoPill label="ضريبة القيمة المضافة" value={country.vatRate} />
            <InfoPill label="قانون العمل" value={country.laborLaw} />
          </div>
        </div>
      </section>

      <nav className="sticky top-0 z-20 border-b border-brand-border bg-white/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto pb-1">
          {COUNTRY_CODES.map((code) => {
            const c = getCountryById(code);
            const isActive = code === params.country;
            return (
              <a
                key={code}
                href={`/ar/${code}/`}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all ${
                  isActive
                    ? "border-brand bg-brand text-white"
                    : "border-brand-border bg-white text-ink-secondary hover:border-brand-300 hover:bg-brand-light hover:text-brand"
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.nameAr}</span>
              </a>
            );
          })}
          <a
            href="/"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-ink-secondary shadow-sm transition-all hover:border-brand-300 hover:bg-brand-light hover:text-brand"
          >
            <span>🌐</span>
            <span>كل الادوات</span>
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl space-y-14 px-4 py-12 sm:py-16">
        {CATEGORIES.map((cat) => {
          const tools = getToolsByCategory(cat.id);
          if (tools.length === 0) return null;
          return (
            <section key={cat.id} id={cat.id} className="scroll-mt-20">
              <div className="mb-6 flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-xl shadow-md`}>
                  {cat.icon}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-ink sm:text-2xl">{cat.nameAr}</h2>
                  <span className="rounded-full border border-brand-border px-2 py-0.5 text-xs font-semibold text-ink-muted">{cat.nameEn}</span>
                  <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand">{tools.length} ادوات</span>
                </div>
                <div className={`h-px flex-1 bg-gradient-to-l ${cat.color} opacity-20`} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} country={country} />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs backdrop-blur-sm">
      <span className="font-semibold text-white/60">{label}:</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}

function ToolCard({ tool, country }) {
  const hasCountryPage = tool.countries.includes(country.code);
  const href = hasCountryPage ? `${tool.href}/${country.code}` : tool.href;
  return (
    <a
      href={href}
      className="group relative flex flex-col rounded-2xl border border-brand-border bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover cursor-pointer"
    >
      {hasCountryPage && (
        <span className="absolute left-4 top-4 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
          {country.flag} {country.nameAr}
        </span>
      )}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-2xl shadow-sm group-hover:bg-brand-100">
        {tool.icon}
      </div>
      <h3 className="mb-2 text-lg font-bold text-ink group-hover:text-brand">{tool.nameAr}</h3>
      <p className="flex-1 text-sm leading-relaxed text-ink-secondary">{tool.descAr}</p>
      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand sm:opacity-0 transition-opacity group-hover:opacity-100">
        <span>ابدا الان</span>
        <span>←</span>
      </div>
    </a>
  );
}