"use client";

import { useState, useMemo, useEffect } from "react";

function toNum(v) {
  const n = parseFloat(String(v));
  return isNaN(n) || n < 0 ? 0 : n;
}

function fmt(n) {
  return n.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Article77Calculator() {
  // Inputs
  const [contractType, setContractType] = useState("indefinite"); // "indefinite" | "fixed"
  const [terminatingParty, setTerminatingParty] = useState("employer"); // "employer" (worker compensated) | "employee" (employer compensated)
  const [hasAgreedClause, setHasAgreedClause] = useState("no"); // "no" | "yes"
  const [agreedAmount, setAgreedAmount] = useState("0");

  const [basicSalary, setBasicSalary] = useState("8000");
  const [housingAllowance, setHousingAllowance] = useState("2000");
  const [transportAllowance, setTransportAllowance] = useState("1000");
  const [otherAllowances, setOtherAllowances] = useState("0");

  // For Indefinite: Years & Months of service
  const [serviceYears, setServiceYears] = useState("4");
  const [serviceMonths, setServiceMonths] = useState("6");

  // For Fixed-term: Remaining contract duration (months)
  const [remainingMonths, setRemainingMonths] = useState("5");

  const [copied, setCopied] = useState(false);

  // Calculation
  const calc = useMemo(() => {
    const basic = toNum(basicSalary);
    const housing = toNum(housingAllowance);
    const transport = toNum(transportAllowance);
    const others = toNum(otherAllowances);
    const totalWage = basic + housing + transport + others;
    const dailyWage = totalWage / 30;

    let statutoryRaw = 0;
    let calculationFormulaDesc = "";

    if (contractType === "indefinite") {
      const yrs = toNum(serviceYears) + toNum(serviceMonths) / 12;
      // Article 77 item 1: 15 days wage per year of service = 0.5 month wage per year
      statutoryRaw = 0.5 * totalWage * yrs;
      calculationFormulaDesc = `أجر 15 يوماً (نصف شهر = ${fmt(totalWage / 2)} ر.س) × ${yrs.toFixed(2)} سنة خدمة`;
    } else {
      const rem = toNum(remainingMonths);
      // Article 77 item 2: wage for the remaining period
      statutoryRaw = totalWage * rem;
      calculationFormulaDesc = `أجر كامل المدة المتبقية (${rem} شهر) × ${fmt(totalWage)} ر.س`;
    }

    // Article 77 item 3: Floor of at least 2 months' wage
    const statutoryFloor = 2 * totalWage;
    const floorApplied = statutoryRaw < statutoryFloor;
    const finalStatutory = Math.max(statutoryRaw, statutoryFloor);

    // Final compensation considering custom agreed clause
    let finalCompensation = finalStatutory;
    let ruleApplied = "";

    if (hasAgreedClause === "yes" && toNum(agreedAmount) > 0) {
      finalCompensation = toNum(agreedAmount);
      ruleApplied = "التعويض الاتفاقي المنصوص عليه صراحة في عقد العمل (أولوية تعاقدية)";
    } else {
      ruleApplied = floorApplied
        ? "تطبيق الحد الأدنى النظامي الإلزامي (أجر شهرين) لأن الناتج الحسابي أقل من الحد الأدنى"
        : contractType === "indefinite"
        ? "حساب الفقرة (1) من المادة 77: 15 يوماً عن كل سنة خدمة"
        : "حساب الفقرة (2) من المادة 77: أجر كامل المدة المتبقية في العقد";
    }

    return {
      totalWage,
      basic,
      dailyWage,
      statutoryRaw,
      statutoryFloor,
      floorApplied,
      finalCompensation,
      calculationFormulaDesc,
      ruleApplied,
    };
  }, [
    contractType,
    hasAgreedClause,
    agreedAmount,
    basicSalary,
    housingAllowance,
    transportAllowance,
    otherAllowances,
    serviceYears,
    serviceMonths,
    remainingMonths,
  ]);

  // Track events
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
      window.trackEvent("calculator_used", {
        tool: "article-77",
        contract_type: contractType,
        terminating_party: terminatingParty,
      });
      window.trackEvent("result_generated", {
        tool: "article-77",
        compensation: Math.round(calc.finalCompensation),
      });
    }
  }, [calc.finalCompensation, contractType, terminatingParty]);

  // Share text
  const shareText = useMemo(() => {
    const beneficiaryText =
      terminatingParty === "employer" ? "مستحق للعامل (تعويض)" : "مستحق لصاحب العمل";
    return `📊 نتيجة حساب تعويض المادة 77 (الفصل لسبب غير مشروع):
• نوع العقد: ${contractType === "indefinite" ? "غير محدد المدة" : "محدد المدة"}
• الأجر الفعلي الشهري: ${fmt(calc.totalWage)} ر.س
• الطرف المنهي للعقد: ${terminatingParty === "employer" ? "صاحب العمل" : "العامل"}
• قيمة التعويض المستحق: ${fmt(calc.finalCompensation)} ر.س (${beneficiaryText})
• السند: المادة (77) من نظام العمل السعودي

احسب تعويضك الآن مجاناً عبر:
https://arabic-tools-xi.vercel.app/ar/sa/article-77-calculator`;
  }, [contractType, terminatingParty, calc]);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
        window.trackEvent("share_clicked", { tool: "article-77", method: "clipboard" });
      }
    }
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
    if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
      window.trackEvent("share_clicked", { tool: "article-77", method: "whatsapp" });
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Main Calculator Card ── */}
      <div className="rounded-2xl border-2 border-brand/20 bg-white p-5 sm:p-7 shadow-card">
        {/* Header */}
        <div className="border-b border-brand-border pb-4 mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 mb-2">
            <span>⚖️</span>
            <span>نظام العمل السعودي — المرسوم الملكي م/51</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-ink">
            حاسبة التعويض عن إنهاء العقد غير المشروع (المادة 77)
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            احسب بدقة التعويض المالي الملزم قانوناً عند فسخ عقد العمل دون سبب مشروع مع تطبيق الحد الأدنى النظامي (أجر شهرين).
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Right: Inputs */}
          <div className="space-y-5">
            {/* 1. Contract Type */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                نوع عقد العمل:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setContractType("indefinite")}
                  className={`rounded-xl border p-3 text-right transition-all ${
                    contractType === "indefinite"
                      ? "border-brand bg-brand-light text-brand-dark font-black shadow-2xs"
                      : "border-brand-border bg-white text-ink-secondary hover:border-brand-200"
                  }`}
                >
                  <span className="block text-xs font-extrabold">غير محدد المدة</span>
                  <span className="block text-[11px] text-ink-muted mt-0.5">15 يوماً عن كل سنة خدمة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContractType("fixed")}
                  className={`rounded-xl border p-3 text-right transition-all ${
                    contractType === "fixed"
                      ? "border-brand bg-brand-light text-brand-dark font-black shadow-2xs"
                      : "border-brand-border bg-white text-ink-secondary hover:border-brand-200"
                  }`}
                >
                  <span className="block text-xs font-extrabold">محدد المدة</span>
                  <span className="block text-[11px] text-ink-muted mt-0.5">أجر المدة الباقية كاملة</span>
                </button>
              </div>
            </div>

            {/* 2. Terminating Party */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                الطرف المنهي للعقد (المتسبب بالإنهاء غير المشروع):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTerminatingParty("employer")}
                  className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${
                    terminatingParty === "employer"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-black"
                      : "border-brand-border bg-white text-ink-secondary hover:border-brand-200"
                  }`}
                >
                  🏢 صاحب العمل (فصل تعسفي)
                </button>
                <button
                  type="button"
                  onClick={() => setTerminatingParty("employee")}
                  className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${
                    terminatingParty === "employee"
                      ? "border-amber-600 bg-amber-50 text-amber-900 font-black"
                      : "border-brand-border bg-white text-ink-secondary hover:border-brand-200"
                  }`}
                >
                  👤 العامل (ترك العمل دون سبب)
                </button>
              </div>
              <p className="mt-1 text-[11px] text-ink-muted">
                {terminatingParty === "employer"
                  ? "✓ التعويض يُدفع للعامل جبراً عن إنهاء خدماته التعسفي."
                  : "⚠️ التعويض يُستحق لصاحب العمل جبراً عن إخلال العامل بمدّة العقد."}
              </p>
            </div>

            {/* 3. Wage Breakdown */}
            <div className="rounded-xl border border-brand-border bg-brand-surface/30 p-3.5 space-y-3">
              <span className="text-xs font-extrabold text-ink block">
                الأجر الفعلي المعتمد (الأساسي + البدلات):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-ink-muted block mb-1">الراتب الأساسي</label>
                  <input
                    type="number"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-bold text-ink"
                    placeholder="8000"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-ink-muted block mb-1">بدل السكن</label>
                  <input
                    type="number"
                    value={housingAllowance}
                    onChange={(e) => setHousingAllowance(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-bold text-ink"
                    placeholder="2000"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-ink-muted block mb-1">بدل النقل</label>
                  <input
                    type="number"
                    value={transportAllowance}
                    onChange={(e) => setTransportAllowance(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-bold text-ink"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-ink-muted block mb-1">بدلات أخرى ثابتة</label>
                  <input
                    type="number"
                    value={otherAllowances}
                    onChange={(e) => setOtherAllowances(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-bold text-ink"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-brand-border/60 text-xs font-bold text-ink">
                <span>إجمالي الأجر الفعلي الشهري:</span>
                <span className="text-brand font-black">{fmt(calc.totalWage)} ر.س</span>
              </div>
            </div>

            {/* 4. Duration Inputs depending on Contract Type */}
            {contractType === "indefinite" ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-ink">مدة الخدمة في المنشأة:</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-ink-muted block mb-1">سنوات الخدمة</span>
                    <input
                      type="number"
                      value={serviceYears}
                      onChange={(e) => setServiceYears(e.target.value)}
                      className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-xs font-bold text-ink"
                      placeholder="4"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-muted block mb-1">أشهر إضافية</span>
                    <input
                      type="number"
                      max="11"
                      value={serviceMonths}
                      onChange={(e) => setServiceMonths(e.target.value)}
                      className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-xs font-bold text-ink"
                      placeholder="6"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-ink">
                  المدة المتبقية حتى نهاية العقد (بالأشهر):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={remainingMonths}
                  onChange={(e) => setRemainingMonths(e.target.value)}
                  className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-xs font-bold text-ink"
                  placeholder="5"
                />
                <p className="text-[11px] text-ink-muted">
                  احسب عدد الشهور والأيام المتبقية حتى تاريخ نهاية العقد المبرم بين الطرفين.
                </p>
              </div>
            )}

            {/* 5. Custom Agreed Clause */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-ink">
                  هل ينص العقد على تعويض محدد متفق عليه؟
                </label>
                <select
                  value={hasAgreedClause}
                  onChange={(e) => setHasAgreedClause(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-ink"
                >
                  <option value="no">لا (التعويض النظامي)</option>
                  <option value="yes">نعم (شرط اتفاقي)</option>
                </select>
              </div>
              {hasAgreedClause === "yes" && (
                <div className="pt-2">
                  <label className="text-[11px] text-ink-muted block mb-1">
                    قيمة التعويض المنصوص عليها في العقد (ر.س)
                  </label>
                  <input
                    type="number"
                    value={agreedAmount}
                    onChange={(e) => setAgreedAmount(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-bold text-ink"
                    placeholder="مثال: 30000"
                  />
                  <p className="text-[10px] text-ink-muted mt-1">
                    صدارة المادة (77): "ما لم يتضمن العقد تعويضاً محدداً..." يُقدَّم الشرط الجزائي المتفق عليه إن وُجد.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Left: Results Card */}
          <div className="flex flex-col justify-between rounded-2xl border-2 border-brand bg-gradient-to-b from-brand-surface to-white p-5 sm:p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-brand-border/60 pb-3">
                <span className="text-xs font-extrabold text-ink-secondary">
                  مستحق التعويض:
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                    terminatingParty === "employer"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {terminatingParty === "employer" ? "حق للموظف (+)" : "مستحق لصاحب العمل (-)"}
                </span>
              </div>

              {/* Big Result Box */}
              <div className="rounded-xl bg-white border border-brand-border p-4 text-center shadow-xs">
                <span className="text-xs font-bold text-ink-muted block mb-1">
                  صافي قيمة التعويض المستحق بموجب المادة 77
                </span>
                <div className="text-3xl sm:text-4xl font-black text-brand tracking-tight">
                  {fmt(calc.finalCompensation)} <span className="text-lg font-bold">ر.س</span>
                </div>
                <p className="text-[11px] text-ink-muted mt-2">
                  {terminatingParty === "employer"
                    ? "يُصرف للعامل بالإضافة إلى مكافأة نهاية الخدمة وبدل الإجازات."
                    : "يحق لصاحب العمل خصمه من مستحقات العامل أو المطالبة به."}
                </p>
              </div>

              {/* Calculation Breakdown Table */}
              <div className="rounded-xl border border-brand-border/70 bg-white p-3.5 space-y-2 text-xs">
                <h4 className="font-extrabold text-ink border-b border-slate-100 pb-1.5">
                  تفصيل السند الحسابي والنظامي:
                </h4>
                <div className="flex justify-between text-ink-secondary">
                  <span>الأجر الفعلي الشهري:</span>
                  <span className="font-bold">{fmt(calc.totalWage)} ر.س</span>
                </div>
                <div className="flex justify-between text-ink-secondary">
                  <span>معادلة الحساب:</span>
                  <span className="font-medium text-[11px] text-right">{calc.calculationFormulaDesc}</span>
                </div>
                <div className="flex justify-between text-ink-secondary">
                  <span>الناتج الحسابي الأولي:</span>
                  <span className="font-bold">{fmt(calc.statutoryRaw)} ر.س</span>
                </div>
                <div className="flex justify-between text-ink-secondary">
                  <span>الحد الأدنى الإلزامي (شهرين):</span>
                  <span className="font-bold">{fmt(calc.statutoryFloor)} ر.س</span>
                </div>
                {calc.floorApplied && hasAgreedClause !== "yes" && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-[11px] text-amber-900 leading-relaxed">
                    ⚖️ <strong>تنبيه:</strong> الناتج الحسابي ({fmt(calc.statutoryRaw)} ر.س) كان أقل من أجر شهرين، فتم رفع التعويض وجوباً إلى الحد الأدنى القانوني ({fmt(calc.statutoryFloor)} ر.س) وفق الفقرة (3) من المادة (77).
                  </div>
                )}
                <div className="border-t border-slate-100 pt-1.5 text-[11px] text-ink-muted leading-relaxed">
                  <strong>القاعدة المطبقة:</strong> {calc.ruleApplied}
                </div>
              </div>
            </div>

            {/* Share / Copy Toolbar */}
            <div className="mt-5 pt-4 border-t border-brand-border space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-bold transition shadow-xs"
                >
                  <span>📲</span>
                  <span>واتساب</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-border bg-white hover:bg-brand-surface text-ink px-3 py-2 text-xs font-bold transition shadow-xs"
                >
                  <span>{copied ? "✓" : "📋"}</span>
                  <span>{copied ? "تم النسخ!" : "نسخ النتيجة"}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-brand-border/80 bg-white hover:bg-slate-50 text-ink-secondary px-3 py-1.5 text-xs font-semibold transition"
              >
                <span>🖨️</span>
                <span>طباعة تقرير التعويض</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
