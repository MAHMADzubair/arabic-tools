"use client";

import { useMemo, useState } from "react";

const currencyOptions = [
  { code: "SAR", label: "ريال سعودي" },
  { code: "AED", label: "درهم إماراتي" },
  { code: "USD", label: "دولار أمريكي" },
  { code: "PKR", label: "روبية باكستانية" },
  { code: "EGP", label: "جنيه مصري" },
  { code: "KWD", label: "دينار كويتي" },
];

function toNum(v) {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

// Conventional Loan Calculation (Reducing Balance / Amortization)
function calcConventional(p, annualRate, n) {
  if (annualRate === 0) {
    const monthly = p / n;
    return {
      monthlyPayment: monthly,
      totalPayment: p,
      totalProfitOrInterest: 0,
      schedule: Array.from({ length: n }, (_, i) => ({
        month: i + 1,
        payment: monthly,
        principal: monthly,
        profitOrInterest: 0,
        balance: Math.max(p - monthly * (i + 1), 0),
      })),
    };
  }

  const r = annualRate / 100 / 12;
  const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = monthly * n;
  const totalProfitOrInterest = totalPayment - p;

  let balance = p;
  const schedule = [];
  for (let i = 1; i <= n; i++) {
    const interest = balance * r;
    const principalPaid = monthly - interest;
    balance = Math.max(balance - principalPaid, 0);
    schedule.push({
      month: i,
      payment: monthly,
      principal: principalPaid,
      profitOrInterest: interest,
      balance,
    });
  }

  return { monthlyPayment: monthly, totalPayment, totalProfitOrInterest, schedule };
}

// Islamic Murabaha Financing Calculation (Flat Profit Margin)
function calcMurabaha(p, annualProfitRate, n) {
  const years = n / 12;
  const totalProfit = p * (annualProfitRate / 100) * years;
  const totalPayment = p + totalProfit;
  const monthlyPayment = totalPayment / n;

  const monthlyPrincipal = p / n;
  const monthlyProfit = totalProfit / n;

  let balance = totalPayment;
  const schedule = [];
  for (let i = 1; i <= n; i++) {
    balance = Math.max(balance - monthlyPayment, 0);
    schedule.push({
      month: i,
      payment: monthlyPayment,
      principal: monthlyPrincipal,
      profitOrInterest: monthlyProfit,
      balance,
    });
  }

  return {
    monthlyPayment,
    totalPayment,
    totalProfitOrInterest: totalProfit,
    schedule,
  };
}

export default function LoanCalculator() {
  const [financeType, setFinanceType] = useState("murabaha"); // 'murabaha' | 'conventional'
  const [currency, setCurrency] = useState("SAR");
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("4.5");
  const [years, setYears] = useState("5");
  const [months, setMonths] = useState("0");
  const [showSchedule, setShowSchedule] = useState(false);
  const [showEarlyRepay, setShowEarlyRepay] = useState(false);
  const [earlyRepayMonth, setEarlyRepayMonth] = useState("24");

  const totalMonths = toNum(years) * 12 + toNum(months);

  const result = useMemo(() => {
    const p = toNum(principal);
    const r = toNum(rate);
    if (p <= 0 || totalMonths <= 0) return null;

    if (financeType === "murabaha") {
      return calcMurabaha(p, r, totalMonths);
    }
    return calcConventional(p, r, totalMonths);
  }, [financeType, principal, rate, totalMonths]);

  // Early Repayment calculation
  const earlyRepayCalc = useMemo(() => {
    if (!result || !result.schedule || result.schedule.length === 0) return null;
    const targetMonth = Math.min(Math.max(1, parseInt(earlyRepayMonth) || 1), totalMonths);
    const row = result.schedule[targetMonth - 1];
    if (!row) return null;

    const remainingMonths = totalMonths - targetMonth;
    if (remainingMonths <= 0) return null;

    // Remaining principal balance
    let remainingPrincipal = 0;
    if (financeType === "murabaha") {
      const p = toNum(principal);
      remainingPrincipal = p - (p / totalMonths) * targetMonth;
    } else {
      remainingPrincipal = row.balance;
    }

    // Statutory compensation: Max 3 months profit/interest (Central Bank regulations: SAMA/CBUAE)
    const monthlyCost = result.totalProfitOrInterest / totalMonths;
    const bankPenalty = monthlyCost * Math.min(3, remainingMonths);
    const earlySettlementAmount = remainingPrincipal + bankPenalty;
    const savings = Math.max(0, result.totalPayment - (row.payment * targetMonth + earlySettlementAmount));

    return {
      targetMonth,
      remainingMonths,
      remainingPrincipal,
      bankPenalty,
      earlySettlementAmount,
      savings,
    };
  }, [result, earlyRepayMonth, totalMonths, financeType, principal]);

  const fmt = (n) =>
    n.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const hasResult = result !== null && toNum(principal) > 0 && totalMonths > 0;
  const profitPct = hasResult
    ? +((result.totalProfitOrInterest / result.totalPayment) * 100).toFixed(1)
    : 0;
  const principalPct = hasResult
    ? +((toNum(principal) / result.totalPayment) * 100).toFixed(1)
    : 0;

  return (
    <div className="mx-auto max-w-lg">
      {/* Page header */}
      <div className="mb-6 rounded-2xl bg-hero-gradient p-6 text-white shadow-result">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏦</span>
            <h1 className="text-2xl font-extrabold">حاسبة التمويل والقروض</h1>
          </div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
            مرابحة إسلامية وتناقصي
          </span>
        </div>
        <p className="text-sm text-white/80">
          احسب القسط الشهري، هامش الربح، السداد المبكر، وجدول الاستهلاك الكامل
        </p>
      </div>

      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card sm:p-7">
        {/* Finance Type Toggle (Islamic vs Conventional) */}
        <div className="mb-5">
          <label className="mb-2 block text-xs font-bold text-ink-secondary">نوع صيغة التمويل</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFinanceType("murabaha")}
              className={`rounded-xl border p-3 text-right transition-all ${
                financeType === "murabaha"
                  ? "border-brand bg-brand-light font-bold text-brand-dark shadow-sm"
                  : "border-brand-border bg-white text-ink-secondary hover:border-brand-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-extrabold">🕌 تمويل مرابحة إسلامي</span>
              </div>
              <p className="text-[11px] text-ink-secondary leading-tight">
                هامش ربح سنوي ثابت معتمد لدى البنوك الإسلامية (الراجحي، الإنماء، دبي الإسلامي)
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFinanceType("conventional")}
              className={`rounded-xl border p-3 text-right transition-all ${
                financeType === "conventional"
                  ? "border-blue-500 bg-blue-50/70 font-bold text-blue-950 shadow-sm"
                  : "border-brand-border bg-white text-ink-secondary hover:border-brand-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-extrabold">📊 تمويل بفائدة متناقصة</span>
              </div>
              <p className="text-[11px] text-ink-secondary leading-tight">
                نظام الفائدة المتناقصة السنوية (APR / Amortization) المعمول به في البنوك التجارية
              </p>
            </button>
          </div>
        </div>

        {/* Currency */}
        <Field label="العملة">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="input flex-1"
          >
            {currencyOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label} ({c.code})
              </option>
            ))}
          </select>
        </Field>

        {/* Principal */}
        <Field label="مبلغ التمويل أو القرض">
          <div className="relative flex flex-1 items-center">
            <input
              type="number"
              inputMode="decimal"
              placeholder="مثال: 100000"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="input flex-1 text-right pl-12"
            />
            <span className="absolute left-3 text-xs font-semibold text-ink-muted">
              {currency}
            </span>
          </div>
        </Field>

        {/* Rate / Profit Margin */}
        <Field label={financeType === "murabaha" ? "نسبة هامش الربح السنوي" : "معدل الفائدة السنوي"}>
          <div className="relative flex flex-1 items-center">
            <input
              type="number"
              inputMode="decimal"
              step="0.05"
              placeholder={financeType === "murabaha" ? "مثال: 4.25" : "مثال: 5.5"}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="input flex-1 text-right pl-8"
            />
            <span className="absolute left-3 text-xs font-semibold text-ink-muted">%</span>
          </div>
        </Field>
        <p className="mb-4 -mt-1 text-xs text-ink-muted">
          {financeType === "murabaha"
            ? "نسبة الربح الثابتة المتفق عليها سنوياً على أصل التمويل"
            : "معدل النسبة السنوي الفعلي (APR) المتناقص شهرياً"}
        </p>

        {/* Duration */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-ink-secondary">مدة السداد</label>
          <div className="flex gap-3">
            <div className="relative flex flex-1 items-center">
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="input flex-1 text-right pl-12"
              />
              <span className="absolute left-3 text-xs text-ink-muted">سنوات</span>
            </div>
            <div className="relative flex flex-1 items-center">
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                className="input flex-1 text-right pl-10"
              />
              <span className="absolute left-3 text-xs text-ink-muted">أشهر</span>
            </div>
          </div>
        </div>

        {/* Results */}
        {hasResult && (
          <>
            <div className="rounded-xl border border-brand-border bg-brand-light p-4 space-y-2">
              <ResultLine
                label="القسط الشهري"
                value={`${fmt(result.monthlyPayment)} ${currency}`}
                bold
                large
              />
              <ResultLine
                label={financeType === "murabaha" ? "إجمالي أرباح المرابحة" : "إجمالي الفائدة المدفوعة"}
                value={`${fmt(result.totalProfitOrInterest)} ${currency}`}
              />
              <ResultLine
                label="إجمالي المبلغ المسدد بالكامل"
                value={`${fmt(result.totalPayment)} ${currency}`}
                bold
              />
              <ResultLine label="عدد الأقساط الشهرية" value={`${totalMonths} شهر`} />
            </div>

            {/* Visual ratio bar */}
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-ink-secondary">
                <span>أصل التمويل: {principalPct}%</span>
                <span>{financeType === "murabaha" ? "الربح:" : "الفائدة:"} {profitPct}%</span>
              </div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-brand-border">
                <div
                  className="bg-brand transition-all duration-300"
                  style={{ width: `${principalPct}%` }}
                />
                <div
                  className="bg-accent transition-all duration-300"
                  style={{ width: `${profitPct}%` }}
                />
              </div>
            </div>

            {/* Early Repayment Calculator Drawer */}
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>حاسبة السداد المبكر وتوفير الأرباح</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowEarlyRepay(!showEarlyRepay)}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  {showEarlyRepay ? "إخفاء" : "احسب التوفير"}
                </button>
              </div>

              {showEarlyRepay && earlyRepayCalc && (
                <div className="mt-3 pt-3 border-t border-emerald-200/70 space-y-2.5 text-xs text-emerald-950">
                  <div className="flex items-center justify-between">
                    <span>ترغب في السداد المبكر عند الشهر رقم:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalMonths - 1}
                      value={earlyRepayMonth}
                      onChange={(e) => setEarlyRepayMonth(e.target.value)}
                      className="w-20 rounded-lg border border-emerald-300 bg-white p-1 text-center font-bold"
                    />
                  </div>
                  <div className="rounded-lg bg-white p-3 space-y-1.5 font-mono text-xs border border-emerald-100">
                    <div className="flex justify-between font-sans">
                      <span className="text-ink-secondary">أصل التمويل المتبقي:</span>
                      <span className="font-bold">{fmt(earlyRepayCalc.remainingPrincipal)} {currency}</span>
                    </div>
                    <div className="flex justify-between font-sans">
                      <span className="text-ink-secondary">تعويض البنك النظامي (أرباح 3 أشهر كحد أقصى):</span>
                      <span className="font-bold">{fmt(earlyRepayCalc.bankPenalty)} {currency}</span>
                    </div>
                    <div className="flex justify-between font-sans pt-1 border-t border-slate-100">
                      <span className="text-ink-secondary">مبلغ المخالصة النهائية للسداد المبكر:</span>
                      <span className="font-bold text-emerald-700">{fmt(earlyRepayCalc.earlySettlementAmount)} {currency}</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-emerald-100/80 p-2.5 text-center font-bold text-emerald-900">
                    🎉 وفرت بإسقاط أرباح الأشهر المتبقية ما مقداره: {fmt(earlyRepayCalc.savings)} {currency}
                  </div>
                </div>
              )}
            </div>

            {/* Schedule toggle */}
            <button
              type="button"
              onClick={() => setShowSchedule((v) => !v)}
              className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              <span>{showSchedule ? "إخفاء جدول السداد" : "عرض جدول السداد الشهري الكامل"}</span>
              <span>{showSchedule ? "▲" : "▼"}</span>
            </button>

            {/* Schedule table */}
            {showSchedule && (
              <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-brand-border text-xs">
                <table className="w-full text-right">
                  <thead className="sticky top-0 bg-brand-surface text-ink-secondary">
                    <tr>
                      <th className="p-2">الشهر</th>
                      <th className="p-2">القسط</th>
                      <th className="p-2">الأصل</th>
                      <th className="p-2">{financeType === "murabaha" ? "الربح" : "الفائدة"}</th>
                      <th className="p-2">الرصيد المتبقي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40">
                    {result.schedule.map((row) => (
                      <tr key={row.month} className="hover:bg-brand-light/30">
                        <td className="p-2 font-mono font-medium">{row.month}</td>
                        <td className="p-2 font-mono">{fmt(row.payment)}</td>
                        <td className="p-2 font-mono">{fmt(row.principal)}</td>
                        <td className="p-2 font-mono text-accent-dark">
                          {fmt(row.profitOrInterest)}
                        </td>
                        <td className="p-2 font-mono">{fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <p className="mt-5 text-[11px] leading-relaxed text-ink-muted">
          هذه الأداة للمساعدة في التقدير والتخطيط. قد تختلف النسب الفعلية وعروض البنوك وفق شروط التمويل وتاريخ تحويل الراتب والرسوم الإدارية.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <label className="text-sm font-medium text-ink-secondary">{label}</label>
      {children}
    </div>
  );
}

function ResultLine({ label, value, bold, large }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-ink-secondary">{label}</span>
      <span
        className={`${bold ? "font-bold text-ink" : "text-ink"} ${
          large ? "text-xl text-brand-dark" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
