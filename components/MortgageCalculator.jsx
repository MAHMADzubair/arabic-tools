"use client";

import { useState, useMemo } from "react";

/* ─── Country presets ────────────────────────────────────────────────────── */
const COUNTRIES = [
  { id: "sa", name: "🇸🇦 السعودية",  currency: "SAR", symbol: "ر.س", rate: 4.5,  years: 25, downPct: 10, stamp: 0,   insurance: 0.5, note: "لا توجد رسوم تسجيل عقاري للمسكن الأول" },
  { id: "ae", name: "🇦🇪 الإمارات",  currency: "AED", symbol: "د.إ", rate: 4.75, years: 25, downPct: 20, stamp: 4,   insurance: 0.4, note: "رسوم DLD 4٪ على قيمة العقار" },
  { id: "eg", name: "🇪🇬 مصر",        currency: "EGP", symbol: "ج.م", rate: 27.5, years: 20, downPct: 20, stamp: 3,   insurance: 0.5, note: "معدلات متغيرة — راجع البنك" },
  { id: "pk", name: "🇵🇰 باكستان",   currency: "PKR", symbol: "₨",  rate: 19.5, years: 20, downPct: 30, stamp: 3,   insurance: 0.5, note: "معدلات البنك الحكومي الحالية" },
  { id: "gb", name: "🇬🇧 المملكة المتحدة", currency: "GBP", symbol: "£",  rate: 4.2,  years: 25, downPct: 10, stamp: 5,   insurance: 0.3, note: "SDLT تنطبق فوق £250,000" },
  { id: "us", name: "🇺🇸 الولايات المتحدة", currency: "USD", symbol: "$",  rate: 6.8,  years: 30, downPct: 20, stamp: 1.5, insurance: 0.8, note: "PMI يُلغى عند 20٪ دفعة أولى" },
];

const RATE_TYPES = [
  { id: "fixed",    name: "ثابت", desc: "قسط ثابت طوال المدة" },
  { id: "variable", name: "متغير (5 ثابت + متغير)", desc: "ثابت 5 سنوات ثم يتغير" },
];

/* ─── Amortisation schedule ──────────────────────────────────────────────── */
function buildSchedule(principal, annualRate, years) {
  const n = years * 12;
  const r = annualRate / 100 / 12;
  if (r === 0) {
    const pmt = principal / n;
    return Array.from({ length: n }, (_, i) => ({
      month: i + 1, payment: pmt, principal: pmt, interest: 0, balance: principal - pmt * (i + 1),
    }));
  }
  const pmt = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  let balance = principal;
  return Array.from({ length: n }, (_, i) => {
    const interest = balance * r;
    const princ = pmt - interest;
    balance -= princ;
    return { month: i + 1, payment: pmt, principal: princ, interest, balance: Math.max(0, balance) };
  });
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function MortgageCalculator() {
  const [countryId,   setCountryId]   = useState("sa");
  const [propPrice,   setPropPrice]   = useState(800000);
  const [downPct,     setDownPct]     = useState(10);
  const [interestRate,setInterestRate]= useState(4.5);
  const [loanYears,   setLoanYears]   = useState(25);
  const [rateType,    setRateType]    = useState("fixed");
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [includeStamp,     setIncludeStamp]     = useState(true);
  const [showSchedule,     setShowSchedule]     = useState(false);
  const [scheduleView,     setScheduleView]     = useState("yearly"); // yearly | monthly

  const country = COUNTRIES.find((c) => c.id === countryId);

  const handleCountryChange = (id) => {
    const c = COUNTRIES.find((x) => x.id === id);
    if (!c) return;
    setCountryId(id);
    setDownPct(c.downPct);
    setInterestRate(c.rate);
    setLoanYears(c.years);
  };

  const result = useMemo(() => {
    if (!country || !propPrice) return null;
    const price   = Number(propPrice);
    const down    = price * (Number(downPct) / 100);
    const principal = price - down;
    if (principal <= 0) return null;

    const schedule = buildSchedule(principal, Number(interestRate), Number(loanYears));
    const pmt = schedule[0]?.payment || 0;
    const totalPaid = pmt * schedule.length;
    const totalInterest = totalPaid - principal;
    const stampFee   = includeStamp    ? price * (country.stamp / 100)   : 0;
    const insuranceFee = includeInsurance ? principal * (country.insurance / 100) : 0;
    const totalCost  = totalPaid + down + stampFee + insuranceFee;

    // Yearly summary
    const yearly = [];
    for (let y = 1; y <= Number(loanYears); y++) {
      const rows = schedule.filter((r) => r.month > (y - 1) * 12 && r.month <= y * 12);
      yearly.push({
        year: y,
        totalPayment: rows.reduce((s, r) => s + r.payment, 0),
        totalPrincipal: rows.reduce((s, r) => s + r.principal, 0),
        totalInterest: rows.reduce((s, r) => s + r.interest, 0),
        closingBalance: rows[rows.length - 1]?.balance || 0,
      });
    }

    return { principal, down, pmt, totalPaid, totalInterest, stampFee, insuranceFee, totalCost, schedule, yearly };
  }, [country, propPrice, downPct, interestRate, loanYears, includeInsurance, includeStamp]);

  const sym = country?.symbol || "";
  function fmt(n) { return `${sym} ${Math.round(n).toLocaleString("ar-EG")}`; }
  function fmtN(n) { return Math.round(n).toLocaleString("ar-EG"); }

  const interestPct = result ? ((result.totalInterest / result.totalPaid) * 100).toFixed(1) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12" dir="rtl">
      {/* Header */}
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark">
          <span>🏠</span><span>حاسبة التمويل العقاري</span>
        </div>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">حاسبة الرهن والتمويل العقاري</h1>
        <p className="mx-auto max-w-xl text-sm text-ink-secondary sm:text-base">
          احسب قسطك الشهري، إجمالي الفوائد، والتكلفة الكاملة لشراء العقار مع جدول سداد تفصيلي.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ─── Inputs ─── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Country */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">🌍</span>
              الدولة
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {COUNTRIES.map((c) => (
                <button key={c.id} type="button" onClick={() => handleCountryChange(c.id)}
                  className={`rounded-xl border p-2.5 text-xs font-semibold text-right transition-all ${
                    countryId === c.id
                      ? "border-brand bg-brand-light text-brand-dark shadow-sm"
                      : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:border-brand-200 hover:bg-white"
                  }`}>
                  {c.name}
                </button>
              ))}
            </div>
            {country?.note && (
              <p className="text-xs text-brand-700 bg-brand-light/60 rounded-xl p-2.5">ℹ️ {country.note}</p>
            )}
          </div>

          {/* Property price + Down payment */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">🏡</span>
              تفاصيل العقار والتمويل
            </h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-secondary">قيمة العقار ({sym})</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                  <input type="number" min="0" value={propPrice} onChange={(e) => setPropPrice(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-8 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-ink-secondary">نسبة الدفعة الأولى</span>
                  <span className="text-brand font-bold">{downPct}٪ = {fmt(Number(propPrice) * downPct / 100)}</span>
                </div>
                <input type="range" min="5" max="80" step="5" value={downPct}
                  onChange={(e) => setDownPct(e.target.value)}
                  className="w-full accent-brand cursor-pointer" />
                <div className="flex justify-between text-[10px] text-ink-muted">
                  <span>5٪ (أدنى)</span><span>20٪ (معياري)</span><span>80٪ (أعلى)</span>
                </div>
              </div>
              {result && (
                <div className="flex justify-between rounded-xl bg-brand-light/60 px-4 py-2.5 text-xs font-semibold">
                  <span className="text-ink-secondary">مبلغ القرض العقاري</span>
                  <span className="text-brand-dark text-sm font-extrabold">{fmt(result.principal)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rate + Term */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">📊</span>
              معدل الفائدة ومدة القرض
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-ink-secondary">معدل الفائدة السنوي</label>
                  <span className="text-xs font-bold text-brand">{interestRate}٪</span>
                </div>
                <input type="range" min="1" max="35" step="0.25" value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full accent-brand cursor-pointer" />
                <div className="flex justify-between text-[10px] text-ink-muted"><span>1٪</span><span>35٪</span></div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-ink-secondary">مدة القرض</label>
                  <span className="text-xs font-bold text-brand">{loanYears} سنة</span>
                </div>
                <input type="range" min="5" max="35" step="5" value={loanYears}
                  onChange={(e) => setLoanYears(e.target.value)}
                  className="w-full accent-brand cursor-pointer" />
                <div className="flex justify-between text-[10px] text-ink-muted"><span>5 سنوات</span><span>35 سنة</span></div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {RATE_TYPES.map((rt) => (
                <button key={rt.id} type="button" onClick={() => setRateType(rt.id)}
                  className={`rounded-xl border p-3 text-xs font-semibold text-right transition-all ${
                    rateType === rt.id ? "border-brand bg-brand-light text-brand-dark" : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:bg-white"
                  }`}>
                  <span className="font-bold">{rt.name}</span>
                  <span className="block text-[10px] font-normal opacity-70 mt-0.5">{rt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fees toggles */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">📋</span>
              الرسوم والتأمين
            </h2>
            {[
              {
                label: `رسوم التسجيل / الطوابع (${country?.stamp}٪)`,
                hint: result ? fmt(result.stampFee) : "—",
                value: includeStamp, setter: setIncludeStamp,
              },
              {
                label: `تأمين الممتلكات السنوي (${country?.insurance}٪)`,
                hint: result ? fmt((result.insuranceFee / Number(loanYears))) + " / سنة" : "—",
                value: includeInsurance, setter: setIncludeInsurance,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{item.label}</p>
                  <p className="text-xs text-ink-muted">{item.hint}</p>
                </div>
                <button type="button" onClick={() => item.setter(!item.value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.value ? "bg-brand" : "bg-gray-200"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${item.value ? "-translate-x-6" : "-translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Results ─── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">

            {/* Monthly payment hero */}
            <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-lg space-y-3">
              <p className="text-sm font-medium opacity-80">القسط الشهري</p>
              <p className="text-4xl font-extrabold tracking-tight">{result ? fmt(result.pmt) : "—"}</p>
              {result && (
                <>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                      <p className="text-[10px] opacity-80">إجمالي الفوائد</p>
                      <p className="text-sm font-bold">{fmt(result.totalInterest)}</p>
                    </div>
                    <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                      <p className="text-[10px] opacity-80">التكلفة الكاملة</p>
                      <p className="text-sm font-bold">{fmt(result.totalCost)}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs opacity-80">
                      <span>أصل القرض</span>
                      <span>فائدة {interestPct}٪</span>
                    </div>
                    <div className="h-2.5 flex rounded-full overflow-hidden bg-white/20">
                      <div className="bg-white/90 transition-all" style={{ width: `${100 - interestPct}%` }} />
                      <div className="bg-accent transition-all" style={{ width: `${interestPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] opacity-70">
                      <span>{fmt(result.principal)}</span>
                      <span>{fmt(result.totalInterest)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Summary cards */}
            {result && (
              <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
                <h3 className="text-sm font-bold text-ink">ملخص التمويل</h3>
                {[
                  { label: "قيمة العقار", value: fmt(Number(propPrice)), color: "text-ink" },
                  { label: "الدفعة الأولى", value: fmt(result.down), color: "text-green-700" },
                  { label: "مبلغ القرض", value: fmt(result.principal), color: "text-brand" },
                  { label: "إجمالي الأقساط", value: fmt(result.totalPaid), color: "text-ink" },
                  { label: "إجمالي الفوائد", value: fmt(result.totalInterest), color: "text-red-600" },
                  result.stampFee > 0 && { label: "رسوم التسجيل", value: fmt(result.stampFee), color: "text-orange-600" },
                  result.insuranceFee > 0 && { label: "تأمين الممتلكات (كامل)", value: fmt(result.insuranceFee), color: "text-orange-600" },
                  { label: "التكلفة الإجمالية للتملك", value: fmt(result.totalCost), color: "text-ink font-extrabold" },
                ].filter(Boolean).map((item) => (
                  <div key={item.label} className="flex justify-between text-xs py-1 border-b border-brand-border/30 last:border-0">
                    <span className="text-ink-secondary">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick comparison */}
            {result && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 space-y-1.5">
                <p className="font-bold">💡 لو زدت الدفعة الأولى</p>
                {[25, 30, 40].map((pct) => {
                  if (pct <= Number(downPct)) return null;
                  const newPrincipal = Number(propPrice) * (1 - pct / 100);
                  const r = Number(interestRate) / 100 / 12;
                  const n = Number(loanYears) * 12;
                  const newPmt = r > 0 ? (newPrincipal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : newPrincipal / n;
                  return (
                    <div key={pct} className="flex justify-between">
                      <span>عند {pct}٪ دفعة أولى:</span>
                      <span className="font-bold">{sym} {Math.round(newPmt).toLocaleString("ar-EG")} / شهر</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Amortization Schedule */}
      {result && (
        <div className="mt-10 rounded-2xl border border-brand-border bg-white p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold text-ink">📅 جدول السداد التفصيلي</h3>
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-brand-border overflow-hidden text-xs font-semibold">
                <button type="button" onClick={() => setScheduleView("yearly")}
                  className={`px-3 py-1.5 transition-colors ${scheduleView === "yearly" ? "bg-brand text-white" : "bg-white text-ink-secondary hover:bg-brand-light"}`}>
                  سنوي
                </button>
                <button type="button" onClick={() => setScheduleView("monthly")}
                  className={`px-3 py-1.5 transition-colors ${scheduleView === "monthly" ? "bg-brand text-white" : "bg-white text-ink-secondary hover:bg-brand-light"}`}>
                  شهري
                </button>
              </div>
              <button type="button" onClick={() => setShowSchedule(!showSchedule)}
                className="rounded-xl border border-brand-border bg-brand-surface/40 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-white transition-colors">
                {showSchedule ? "إخفاء" : "عرض الجدول"}
              </button>
            </div>
          </div>

          {showSchedule && (
            <div className="overflow-x-auto rounded-xl border border-brand-border">
              <table className="w-full text-xs">
                <thead className="bg-brand-surface/60">
                  <tr>
                    <th className="p-3 text-right font-bold text-ink-secondary">
                      {scheduleView === "yearly" ? "السنة" : "الشهر"}
                    </th>
                    <th className="p-3 text-right font-bold text-ink-secondary">القسط</th>
                    <th className="p-3 text-right font-bold text-ink-secondary">الأصل</th>
                    <th className="p-3 text-right font-bold text-ink-secondary">الفائدة</th>
                    <th className="p-3 text-right font-bold text-ink-secondary">الرصيد المتبقي</th>
                  </tr>
                </thead>
                <tbody>
                  {(scheduleView === "yearly" ? result.yearly : result.schedule).map((row, idx) => (
                    <tr key={idx} className={`border-t border-brand-border/40 ${idx % 2 === 0 ? "bg-white" : "bg-brand-surface/20"}`}>
                      <td className="p-3 font-bold text-ink">{scheduleView === "yearly" ? `${row.year}` : row.month}</td>
                      <td className="p-3">{fmtN(scheduleView === "yearly" ? row.totalPayment : row.payment)}</td>
                      <td className="p-3 text-green-700 font-semibold">{fmtN(scheduleView === "yearly" ? row.totalPrincipal : row.principal)}</td>
                      <td className="p-3 text-red-600 font-semibold">{fmtN(scheduleView === "yearly" ? row.totalInterest : row.interest)}</td>
                      <td className="p-3 font-bold text-ink">{fmtN(scheduleView === "yearly" ? row.closingBalance : row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-ink-muted">
        ⚠️ الأرقام تقديرية للأغراض التخطيطية. لا تشمل رسوم الوساطة ورسوم التقييم العقاري وعمولات المصرف. استشر مستشاراً مالياً معتمداً قبل اتخاذ قرار الشراء.
      </p>
    </div>
  );
}