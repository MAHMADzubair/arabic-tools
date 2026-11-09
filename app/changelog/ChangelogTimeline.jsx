"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CHANGELOG, CHANGE_TYPES, COUNTRY_LABELS, formatArabicMonth } from "@/lib/changelog";

const plural = (n, one, two, few, many) => (n === 1 ? one : n === 2 ? two : n <= 10 ? `${n} ${few}` : `${n} ${many}`);
const updatesLabel = (n) => plural(n, "تحديث واحد", "تحديثان", "تحديثات", "تحديثاً");
const resultsLabel = (n) => plural(n, "نتيجة واحدة", "نتيجتان", "نتائج", "نتيجة");

const toneColor = (type) => (CHANGE_TYPES[type].tone === "danger" ? "var(--error)" : "var(--accent-text)");

function BeforeAfter({ before, after, type }) {
  if (!before || !after) return null;
  return (
    <div className="mt-4 flex flex-wrap rounded border border-[var(--border)] bg-[var(--surface)]">
      <div className="min-w-0 flex-1 basis-[240px] border-[var(--border)] px-[18px] py-3.5 [border-inline-end-width:1px]">
        <p className="m-0 text-xs font-bold text-[var(--text-2)]">قبل</p>
        <p className="mt-1 text-[15px] leading-[1.8] text-[var(--text-2)] line-through decoration-[var(--text-3)]">{before}</p>
      </div>
      <div className="min-w-0 flex-1 basis-[240px] px-[18px] py-3.5">
        <p className="m-0 text-xs font-bold" style={{ color: toneColor(type) }}>بعد</p>
        <p className="mt-1 text-[15px] font-semibold leading-[1.8]">{after}</p>
      </div>
    </div>
  );
}

function Entry({ e, anchor }) {
  const color = toneColor(e.type);
  return (
    <li id={anchor ? e.id : undefined} className="relative scroll-mt-24 pb-11 pe-0 ps-0 [padding-inline-start:32px]">
      <span
        aria-hidden="true"
        className="absolute top-1.5 h-[11px] w-[11px] rounded-full border-2 bg-[var(--bg)] [inset-inline-start:-6px]"
        style={{ borderColor: color }}
      />
      <p className="m-0 flex flex-wrap gap-x-3.5 gap-y-1 text-[13px] text-[var(--text-2)]">
        <time dateTime={e.date} className="q-mono">{e.date}</time>
        <span>{COUNTRY_LABELS[e.country]}</span>
        <span className="font-bold" style={{ color }}>{CHANGE_TYPES[e.type].label}</span>
      </p>
      <h3 className="mt-2 text-[20px] font-bold leading-[1.6] sm:text-[22px]">{e.title}</h3>
      <p className="mt-2 max-w-[720px] text-base leading-[2] text-[var(--text-2)] [text-wrap:pretty]">{e.summary}</p>
      <BeforeAfter before={e.before} after={e.after} type={e.type} />
      <p className="mt-3.5 text-sm leading-[1.9]">
        <strong>من يتأثر:</strong> <span className="text-[var(--text-2)]">{e.who}</span>
      </p>
      <p className="mt-0.5 text-sm leading-[1.9] text-[var(--text-2)]">
        المصدر: {e.source} ·{" "}
        <Link href={e.href} className="font-semibold text-[var(--accent-text)]">افتح الأداة</Link>
      </p>
    </li>
  );
}

const tabCls = (active) =>
  `-mb-px border-b-2 py-2.5 no-underline ${active ? "border-[var(--orange)] font-bold text-[var(--text)]" : "border-transparent text-[var(--text-2)] hover:text-[var(--text)]"}`;

export default function ChangelogTimeline({ skipId }) {
  const [country, setCountry] = useState("all");
  const [type, setType] = useState("all");

  const counts = useMemo(() => {
    const c = {};
    for (const e of CHANGELOG) c[e.country] = (c[e.country] || 0) + 1;
    return c;
  }, []);

  const monthTotals = useMemo(() => {
    const t = {};
    for (const e of CHANGELOG) t[e.date.slice(0, 7)] = (t[e.date.slice(0, 7)] || 0) + 1;
    return t;
  }, []);

  const filtering = country !== "all" || type !== "all";
  const groups = useMemo(() => {
    const list = CHANGELOG.filter(
      (e) =>
        (filtering || e.id !== skipId) &&
        (country === "all" || e.country === country) &&
        (type === "all" || e.type === type)
    );
    const out = [];
    for (const e of list) {
      const key = e.date.slice(0, 7);
      let g = out.find((x) => x.key === key);
      if (!g) out.push((g = { key, entries: [] }));
      g.entries.push(e);
    }
    return out;
  }, [country, type, filtering, skipId]);

  return (
    <>
      <div className="mt-[72px] flex flex-wrap items-end justify-between gap-x-10 gap-y-3 border-b border-[var(--border)]">
        <div role="group" aria-label="تصفية حسب الدولة" className="flex flex-wrap gap-x-[22px] gap-y-1.5 text-[15px]">
          <button type="button" aria-pressed={country === "all"} onClick={() => setCountry("all")} className={tabCls(country === "all")}>
            كل الدول
          </button>
          {Object.entries(COUNTRY_LABELS).map(([code, label]) =>
            counts[code] ? (
              <button key={code} type="button" aria-pressed={country === code} onClick={() => setCountry(code)} className={tabCls(country === code)}>
                {label} <span className="q-mono text-xs">{counts[code]}</span>
              </button>
            ) : null
          )}
        </div>
        <div role="group" aria-label="تصفية حسب النوع" className="flex flex-wrap gap-x-[18px] gap-y-1.5 pb-2.5 text-sm">
          {Object.entries(CHANGE_TYPES).map(([key, t]) => (
            <button
              key={key}
              type="button"
              aria-pressed={type === key}
              onClick={() => setType(type === key ? "all" : key)}
              className={`inline-flex items-center gap-1.5 ${type === key ? "font-bold text-[var(--text)]" : "text-[var(--text-2)]"}`}
            >
              <span aria-hidden="true" className="h-[9px] w-[9px] rounded-full border-2" style={{ borderColor: toneColor(key) }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && (
        <p className="mt-12 text-base text-[var(--text-2)]">لا توجد تحديثات بهذا التصنيف حتى الآن.</p>
      )}

      {groups.map((g, i) => (
        <section
          key={g.key}
          aria-labelledby={`m-${g.key}`}
          className={`${i === 0 ? "mt-16" : "mt-10"} flex flex-col gap-5 md:flex-row md:gap-14`}
        >
          <h2 id={`m-${g.key}`} className="q-serif m-0 min-w-0 text-[30px] font-bold leading-[1.5] md:w-[24%] md:flex-none">
            {formatArabicMonth(g.key)}
            <span className="block font-[family-name:var(--font-arabic)] text-sm font-medium text-[var(--text-2)]">
              {filtering ? resultsLabel(g.entries.length) : updatesLabel(monthTotals[g.key])}
            </span>
          </h2>
          <ol className="m-0 min-w-0 flex-1 list-none border-[var(--border)] p-0 pt-1 [border-inline-start-width:1px]">
            {g.entries.map((e) => (
              <Entry key={e.id} e={e} anchor={e.id !== skipId} />
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}
