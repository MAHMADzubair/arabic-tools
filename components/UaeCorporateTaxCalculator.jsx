"use client";
import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  CT_ZERO_RATE_LIMIT, NATURAL_PERSON_TURNOVER_LIMIT, TAXPAYER_TYPE,
  calcStandardCT, calcQfzpCT, checkSBREligibility,
  formatAED, sanitizeNumber, FTA_CT_URL, FTA_SBR_URL, FTA_NATURAL_URL,
} from "@/lib/uaeCorporateTaxConfig";

function AedInput({ id, label, hint, value, onChange, optional = false }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-ink-secondary mb-1">
        {label}{optional && <span className="mr-1 text-ink-muted font-normal">(اختياري)</span>}
      </label>
      <div className="relative">
        <input id={id} type="number" inputMode="decimal" min="0" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0"
          className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none" />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">د.إ</span>
      </div>
      {hint && <p className="mt-1 text-[11px] text-ink-muted leading-relaxed">{hint}</p>}
    </div>
  );
}

function TriToggle({ label, value, onChange }) {
  return (
    <div>
      <p className="text-xs font-bold text-ink-secondary mb-2">{label}</p>
      <div className="grid grid-cols-3 gap-2 max-w-sm">
        {[{l:"نعم",v:true},{l:"لا",v:false},{l:"غير متأكد",v:null}].map(({l,v}) => (
          <button key={l} type="button" onClick={() => onChange(v)}
            className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${value === v ? "border-brand bg-brand-light text-brand-dark shadow-sm" : "border-brand-border bg-white text-ink-secondary hover:border-brand"}`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

const TAXPAYER_OPTIONS = [
  { val: TAXPAYER_TYPE.STANDARD,       label: "🏢 شركة / شخص اعتباري",            desc: "شركة ذات مسؤولية محدودة أو أي كيان قانوني مسجّل" },
  { val: TAXPAYER_TYPE.NATURAL_PERSON, label: "👤 شخص طبيعي يمارس نشاطاً تجارياً", desc: "فرد يمارس أعمالاً تجارية مستقلة أو مهنية في الإمارات" },
  { val: TAXPAYER_TYPE.FREE_ZONE,      label: "🏙️ منشأة في منطقة حرة",             desc: "شركة مسجّلة في منطقة حرة إماراتية معتمدة" },
  { val: TAXPAYER_TYPE.UNSURE,         label: "❓ غير متأكد",                       desc: "أحتاج توجيهاً حول نوع الخاضع للضريبة" },
];

export default function UaeCorporateTaxCalculator() {
  const [taxpayerType,setTaxpayerType]=useState(TAXPAYER_TYPE.STANDARD);
  const [annualRevenue,setAnnualRevenue]=useState("0");
  const [taxableIncome,setTaxableIncome]=useState("0");
  const [estimateMode,setEstimateMode]=useState(false);
  const [estRevenue,setEstRevenue]=useState("0");
  const [estExpenses,setEstExpenses]=useState("0");
  const [estAdjustments,setEstAdjustments]=useState("0");
  const [estTaxLosses,setEstTaxLosses]=useState("0");
  const [npTurnover,setNpTurnover]=useState("0");
  const [isQFZP,setIsQFZP]=useState(null);
  const [qualifyingIncome,setQualifyingIncome]=useState("0");
  const [nonQualifyingIncome,setNonQualifyingIncome]=useState("0");
  const [showSBR,setShowSBR]=useState(false);
  const [sbrIsResident,setSbrIsResident]=useState(null);
  const [sbrCurrentRevenue,setSbrCurrentRevenue]=useState("0");
  const [sbrPriorRevenue,setSbrPriorRevenue]=useState("0");
  const [sbrIsQFZP,setSbrIsQFZP]=useState(null);
  const [sbrIsMNE,setSbrIsMNE]=useState(null);
  const [showCalcDetails,setShowCalcDetails]=useState(false);
  const [showPrint,setShowPrint]=useState(false);

  const estimatedTI=useMemo(()=>{
    if(!estimateMode)return null;
    return Math.max(0,sanitizeNumber(estRevenue)-sanitizeNumber(estExpenses)+sanitizeNumber(estAdjustments)-sanitizeNumber(estTaxLosses));
  },[estimateMode,estRevenue,estExpenses,estAdjustments,estTaxLosses]);

  const effectiveTI=useMemo(()=>{
    if(estimateMode&&estimatedTI!==null)return estimatedTI;
    return sanitizeNumber(taxableIncome);
  },[estimateMode,estimatedTI,taxableIncome]);

  const stdResult =useMemo(()=>calcStandardCT(effectiveTI),[effectiveTI]);
  const qfzpResult=useMemo(()=>calcQfzpCT(qualifyingIncome,nonQualifyingIncome),[qualifyingIncome,nonQualifyingIncome]);
  const sbrResult =useMemo(()=>checkSBREligibility({isResident:sbrIsResident,currentRevenue:sbrCurrentRevenue,priorMaxRevenue:sbrPriorRevenue,isQFZP:sbrIsQFZP,isMNEAboveThreshold:sbrIsMNE}),[sbrIsResident,sbrCurrentRevenue,sbrPriorRevenue,sbrIsQFZP,sbrIsMNE]);

  const npTurnoverNum=sanitizeNumber(npTurnover);
  const npInScope=npTurnoverNum>NATURAL_PERSON_TURNOVER_LIMIT;
  const isFZQFZP=taxpayerType===TAXPAYER_TYPE.FREE_ZONE&&isQFZP===true;
  const activeTI=taxpayerType===TAXPAYER_TYPE.NATURAL_PERSON?(npInScope?sanitizeNumber(taxableIncome):0):effectiveTI;
  const today=new Date().toLocaleDateString("ar-AE",{year:"numeric",month:"long",day:"numeric"});

  const handleReset=useCallback(()=>{
    setTaxpayerType(TAXPAYER_TYPE.STANDARD);setAnnualRevenue("0");setTaxableIncome("0");
    setEstimateMode(false);setEstRevenue("0");setEstExpenses("0");setEstAdjustments("0");setEstTaxLosses("0");
    setNpTurnover("0");setIsQFZP(null);setQualifyingIncome("0");setNonQualifyingIncome("0");
    setShowSBR(false);setSbrIsResident(null);setSbrCurrentRevenue("0");setSbrPriorRevenue("0");setSbrIsQFZP(null);setSbrIsMNE(null);
    setShowCalcDetails(false);setShowPrint(false);
  },[]);

  const loadPreset=(id)=>{
    handleReset();
    if(id==="ex1"){setTimeout(()=>{setTaxableIncome("300000");},0);}
    else if(id==="ex2"){setTimeout(()=>{setTaxableIncome("1000000");setAnnualRevenue("1200000");},0);}
    else if(id==="ex3"){setTimeout(()=>{setAnnualRevenue("2400000");setTaxableIncome("500000");setShowSBR(true);setSbrIsResident(true);setSbrCurrentRevenue("2400000");setSbrPriorRevenue("0");setSbrIsQFZP(false);setSbrIsMNE(false);},0);}
    else if(id==="ex4"){setTimeout(()=>{setTaxpayerType(TAXPAYER_TYPE.NATURAL_PERSON);setNpTurnover("800000");},0);}
    else if(id==="ex5"){setTimeout(()=>{setTaxpayerType(TAXPAYER_TYPE.FREE_ZONE);setIsQFZP(true);setQualifyingIncome("2000000");setNonQualifyingIncome("200000");},0);}
  };

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-result">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏛️</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black leading-tight">حاسبة ضريبة الشركات في الإمارات</h1>
              <p className="mt-1 text-sm text-white/85">تقدير ضريبة الشركات وفق نسبتَي 0% و9% — المرسوم بقانون رقم 47 لسنة 2022</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-bold whitespace-nowrap">محدث 2026 — FTA</span>
        </div>
      </div>

      {/* Presets */}
      <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3"><span>💡</span><span className="text-xs font-extrabold text-ink">نماذج سريعة للتجربة:</span></div>
        <div className="flex flex-wrap gap-2">
          {[
            {id:"ex1",label:"دخل 300 ألف (0%)",cls:"bg-emerald-50 border-emerald-200 text-emerald-800"},
            {id:"ex2",label:"دخل مليون درهم (9%)",cls:"bg-rose-50 border-rose-200 text-rose-800"},
            {id:"ex3",label:"2.4 مليون + فحص SBR",cls:"bg-amber-50 border-amber-200 text-amber-800"},
            {id:"ex4",label:"شخص طبيعي 800 ألف",cls:"bg-blue-50 border-blue-200 text-blue-800"},
            {id:"ex5",label:"QFZP — 2 مليون مؤهل",cls:"bg-purple-50 border-purple-200 text-purple-800"},
          ].map(p=>(<button key={p.id} type="button" onClick={()=>loadPreset(p.id)} className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all ${p.cls}`}>{p.label}</button>))}
        </div>
      </div>

      {/* Step 1: Taxpayer type */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">١</span>
          <h2 className="text-sm sm:text-base font-extrabold text-ink">ما نوع الخاضع للضريبة؟</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TAXPAYER_OPTIONS.map(({val,label,desc})=>(<button key={val} type="button" onClick={()=>setTaxpayerType(val)} className={`rounded-xl border p-3.5 text-right transition-all ${taxpayerType===val?"border-brand bg-brand-light shadow-sm":"border-brand-border bg-white hover:border-brand"}`}><p className={`text-sm font-extrabold ${taxpayerType===val?"text-brand-dark":"text-ink"}`}>{label}</p><p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">{desc}</p></button>))}
        </div>
        {taxpayerType===TAXPAYER_TYPE.UNSURE&&(<div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 leading-relaxed"><strong>توجيه:</strong> إذا كنت شركة مسجّلة فاختر شركة. إذا كنت فرداً بنشاط تجاري فاختر شخص طبيعي. يُنصح بمراجعة مستشار ضريبي مؤهل.</div>)}
      </div>

      {/* Natural Person Block */}
      {taxpayerType===TAXPAYER_TYPE.NATURAL_PERSON&&(
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">٢</span>
            <span className="text-lg">👤</span><h2 className="text-sm sm:text-base font-extrabold text-ink">بيانات الشخص الطبيعي</h2>
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-sky-900 leading-relaxed">يدخل الشخص الطبيعي في نطاق ضريبة الشركات عندما يتجاوز <strong>دوران نشاطه التجاري الإماراتي 1,000,000 درهم</strong> خلال السنة الميلادية. لا يُحتسب: الرواتب، دخل الاستثمار الشخصي، أو دخل الاستثمار العقاري المؤهل.</div>
          <AedInput id="npTurnover" label="إجمالي دوران النشاط التجاري خلال السنة الميلادية *" hint="مجموع إيرادات النشاط التجاري أو المهني فقط — لا تُدرج الراتب أو دخل الاستثمار." value={npTurnover} onChange={setNpTurnover} />
          {npTurnoverNum>0&&(<div className={`rounded-xl border p-4 space-y-1 ${npInScope?"border-rose-200 bg-rose-50/60":"border-emerald-200 bg-emerald-50/60"}`}><p className={`text-sm font-extrabold ${npInScope?"text-rose-800":"text-emerald-800"}`}>{npInScope?"🔴 الدوران يتجاوز 1,000,000 درهم — قد تكون في نطاق ضريبة الشركات":"🟢 الدوران دون 1,000,000 درهم — قد لا تكون مطالباً بالتسجيل"}</p><p className={`text-xs leading-relaxed ${npInScope?"text-rose-700":"text-emerald-700"}`}>{npInScope?"يتجاوز الدوران حد التسجيل. ينبغي دراسة الالتزام بضريبة الشركات لدى FTA.":"قد لا تكون مطالباً بالتسجيل بناءً على هذا الشرط وحده. راجع دورياً."}</p></div>)}
          {npInScope&&(<AedInput id="npTI" label="الدخل الخاضع للضريبة التقديري *" hint="تنطبق نسبتا 0% (أول 375,000 د.إ) و9% (ما يزيد) كالشركات." value={taxableIncome} onChange={setTaxableIncome} />)}
        </div>
      )}

      {/* Free Zone Block */}
      {taxpayerType===TAXPAYER_TYPE.FREE_ZONE&&(
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">٢</span>
            <span className="text-lg">🏙️</span><h2 className="text-sm sm:text-base font-extrabold text-ink">بيانات منشأة المنطقة الحرة</h2>
          </div>
          <TriToggle label="هل أنت Qualifying Free Zone Person (QFZP) وفق الشروط الحالية؟" value={isQFZP} onChange={setIsQFZP} />
          {isQFZP===true&&(<div className="space-y-4"><div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3 text-xs text-purple-900 leading-relaxed"><strong>نظام QFZP:</strong> الدخل المؤهل → 0% | الدخل غير المؤهل → 9% كاملة بدون نطاق إعفاء 375,000 درهم.</div><div className="grid gap-4 sm:grid-cols-2"><AedInput id="qi" label="الدخل المؤهل (Qualifying Income) *" hint="دخل الأنشطة المؤهلة — نسبة 0%." value={qualifyingIncome} onChange={setQualifyingIncome} /><AedInput id="nqti" label="الدخل غير المؤهل (Non-Qualifying Taxable Income) *" hint="دخل الأنشطة المستبعدة — يخضع لنسبة 9% كاملة بدون نطاق الإعفاء." value={nonQualifyingIncome} onChange={setNonQualifyingIncome} /></div><div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-[11px] text-amber-900 leading-relaxed">⚠️ وضع QFZP يستلزم استيفاء شروط متعددة: الأنشطة المؤهلة، الجوهر الاقتصادي، أسعار التحويل، ومتطلبات de minimis. هذه الحاسبة لا تُحقق من وضع QFZP.</div></div>)}
          {isQFZP===false&&(<div className="space-y-4"><div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-ink-secondary">تنطبق القواعد المعيارية: 0% على أول 375,000 درهم، و9% على ما يتجاوزه.</div><AedInput id="fzTI" label="الدخل الخاضع للضريبة *" hint="صافي الدخل الخاضع بعد التعديلات." value={taxableIncome} onChange={setTaxableIncome} /></div>)}
          {isQFZP===null&&(<div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">لتحديد وضع QFZP تحقق من: نوع المنطقة الحرة، طبيعة الأنشطة، الجوهر الاقتصادي. يُنصح بمراجعة مستشار ضريبي.</div>)}
        </div>
      )}

      {/* Standard inputs */}
      {taxpayerType===TAXPAYER_TYPE.STANDARD&&(
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">٢</span>
            <span className="text-lg">📊</span><h2 className="text-sm sm:text-base font-extrabold text-ink">البيانات المالية</h2>
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-sky-900 leading-relaxed"><strong>تنبيه:</strong> الإيرادات ≠ الدخل الخاضع للضريبة. ضريبة الشركات تُحسب على <strong>الدخل الخاضع للضريبة</strong> بعد المصروفات والتعديلات الضريبية المعتمدة.</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AedInput id="rev" label="الإيرادات السنوية" hint="يُستخدم لاختبارات الأهلية كتسهيلات الأعمال الصغيرة." value={annualRevenue} onChange={setAnnualRevenue} optional />
            <AedInput id="ti"  label="الدخل الخاضع للضريبة *" hint="صافي الدخل بعد كل المصروفات والتعديلات الضريبية المعتمدة." value={taxableIncome} onChange={setTaxableIncome} />
          </div>
          <div className="border-t border-brand-border/60 pt-3">
            <button type="button" onClick={()=>setEstimateMode(!estimateMode)} className="text-xs font-bold text-brand hover:underline">{estimateMode?"▲ إخفاء التقدير":"▼ تقدير الدخل الخاضع من الإيرادات والمصروفات"}</button>
            {estimateMode&&(
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-[11px] text-amber-900">تقدير أولي للدخل الخاضع للضريبة — ليس إقراراً ضريبياً دقيقاً.</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <AedInput id="eRev"  label="الإيرادات" value={estRevenue} onChange={setEstRevenue} />
                  <AedInput id="eExp"  label="المصروفات القابلة للخصم" value={estExpenses} onChange={setEstExpenses} />
                  <AedInput id="eAdj"  label="تعديلات أخرى (إضافة)" value={estAdjustments} onChange={setEstAdjustments} optional />
                  <AedInput id="eLoss" label="خسائر ضريبية مستخدمة" value={estTaxLosses} onChange={setEstTaxLosses} optional />
                </div>
                {estimatedTI!==null&&(<div className="rounded-xl border border-brand-border bg-brand-surface p-3"><p className="text-[11px] font-bold text-brand-dark">تقدير أولي للدخل الخاضع للضريبة:</p><p className="text-lg font-black text-brand-dark mt-0.5">{formatAED(estimatedTI)} د.إ</p><p className="text-[10px] text-ink-muted">تقدير استرشادي — ليس إقراراً ضريبياً.</p></div>)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Tax Breakdown */}
      {taxpayerType!==TAXPAYER_TYPE.UNSURE&&(
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
          <h3 className="text-xs sm:text-sm font-extrabold text-ink flex items-center gap-1.5"><span>📊</span><span>توزيع الدخل الخاضع للضريبة:</span></h3>
          {isFZQFZP?(
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center"><p className="font-extrabold text-emerald-800">الدخل المؤهل</p><p className="text-base font-black text-emerald-700 mt-0.5">{formatAED(qfzpResult.qi)} د.إ</p><p className="text-[10px] text-emerald-600">نسبة 0%</p></div>
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-center"><p className="font-extrabold text-rose-800">الدخل غير المؤهل</p><p className="text-base font-black text-rose-700 mt-0.5">{formatAED(qfzpResult.nqti)} د.إ</p><p className="text-[10px] text-rose-600">نسبة 9% كاملة</p></div>
            </div>
          ):(
            <div className="space-y-2">
              <div className="relative h-6 w-full rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                <div className="absolute left-0 top-0 bottom-0 bg-emerald-100" style={{width:"50%"}} />
                <div className="absolute left-[50%] top-0 bottom-0 bg-rose-100 border-l border-rose-200" style={{width:"50%"}} />
                <div className="absolute top-0 bottom-0 bg-brand transition-all duration-500" style={{width:`${Math.min(100,Math.max(3,(activeTI/(CT_ZERO_RATE_LIMIT*2))*100))}%`}} />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-ink-muted px-1">
                <span>٠</span>
                <span className="text-emerald-800">375,000 د.إ<span className="block text-[9px] font-normal text-center">حد 0%</span></span>
                <span className="text-rose-800 text-left">+375,000<span className="block text-[9px] font-normal">9%</span></span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-center"><span className="font-extrabold text-emerald-800 block">أول 375,000 د.إ</span><span className="text-emerald-700 text-[10px]">معفى — نسبة 0%</span></div>
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-center"><span className="font-extrabold text-rose-800 block">ما يتجاوز 375,000 د.إ</span><span className="text-rose-700 text-[10px]">يخضع لنسبة 9%</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Primary Result Card */}
      {taxpayerType!==TAXPAYER_TYPE.UNSURE&&(
        <div className="rounded-2xl border-2 border-brand bg-white shadow-xl overflow-hidden">
          <div className={`p-6 text-white ${isFZQFZP?"bg-gradient-to-r from-purple-800 to-indigo-700":stdResult.ninePercentPortion>0?"bg-gradient-to-r from-rose-700 to-rose-600":taxpayerType===TAXPAYER_TYPE.NATURAL_PERSON&&!npInScope?"bg-gradient-to-r from-emerald-700 to-teal-600":"bg-gradient-to-r from-emerald-700 to-teal-600"}`}>
            <div className="flex items-center gap-3.5">
              <span className="text-4xl">{isFZQFZP?"🏙️":taxpayerType===TAXPAYER_TYPE.NATURAL_PERSON&&!npInScope?"✅":stdResult.ninePercentPortion>0?"💼":"✅"}</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black">
                  {isFZQFZP?"نظام الشخص المؤهل في المنطقة الحرة (QFZP)":taxpayerType===TAXPAYER_TYPE.NATURAL_PERSON&&!npInScope?"قد لا تكون في نطاق ضريبة الشركات":stdResult.tax===0?"الدخل ضمن نطاق الإعفاء (0%)":"ضريبة الشركات التقديرية"}
                </h2>
                <p className="text-xs sm:text-sm text-white/90 mt-1">{isFZQFZP?`ضريبة QFZP التقديرية: ${formatAED(qfzpResult.tax)} د.إ على الدخل غير المؤهل`:taxpayerType===TAXPAYER_TYPE.NATURAL_PERSON&&!npInScope?"الدوران دون 1,000,000 درهم — مراجعة FTA مطلوبة للتأكيد":`الضريبة التقديرية: ${formatAED(stdResult.tax)} د.إ`}</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {isFZQFZP?(
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-brand-border bg-slate-50/70 p-3.5"><p className="text-[11px] font-bold text-ink-muted">الدخل المؤهل (0%)</p><p className="text-base font-black text-emerald-700 mt-0.5">{formatAED(qfzpResult.qi)} د.إ</p></div>
                <div className="rounded-xl border border-brand-border bg-slate-50/70 p-3.5"><p className="text-[11px] font-bold text-ink-muted">الدخل غير المؤهل (9%)</p><p className="text-base font-black text-rose-700 mt-0.5">{formatAED(qfzpResult.nqti)} د.إ</p></div>
                <div className="rounded-xl border-2 border-brand bg-brand-surface p-3.5"><p className="text-[11px] font-extrabold text-brand-dark">ضريبة QFZP التقديرية</p><p className="text-base font-black text-brand-dark mt-0.5">{formatAED(qfzpResult.tax)} د.إ</p><p className="text-[10px] text-ink-muted">معدل فعلي: {(qfzpResult.effectiveRate*100).toFixed(2)}%</p></div>
              </div>
            ):(
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-brand-border bg-slate-50/70 p-3.5"><p className="text-[11px] font-bold text-ink-muted">الدخل الخاضع للضريبة</p><p className="text-base font-black text-ink mt-0.5">{formatAED(isFZQFZP?qfzpResult.totalIncome:activeTI)} د.إ</p></div>
                <div className="rounded-xl border border-brand-border bg-emerald-50 p-3.5"><p className="text-[11px] font-bold text-ink-muted">الجزء الخاضع لـ 0%</p><p className="text-base font-black text-emerald-700 mt-0.5">{formatAED(stdResult.zeroRatePortion)} د.إ</p></div>
                <div className="rounded-xl border border-brand-border bg-rose-50 p-3.5"><p className="text-[11px] font-bold text-ink-muted">الجزء الخاضع لـ 9%</p><p className="text-base font-black text-rose-700 mt-0.5">{formatAED(stdResult.ninePercentPortion)} د.إ</p></div>
                <div className="rounded-xl border-2 border-brand bg-brand-surface p-3.5"><p className="text-[11px] font-extrabold text-brand-dark">ضريبة الشركات التقديرية</p><p className="text-base font-black text-brand-dark mt-0.5">{formatAED(stdResult.tax)} د.إ</p><p className="text-[10px] text-ink-muted">معدل فعلي: {(stdResult.effectiveRate*100).toFixed(2)}%</p></div>
              </div>
            )}
            <div className="border-t border-brand-border/60 pt-3">
              <button type="button" onClick={()=>setShowCalcDetails(!showCalcDetails)} className="text-xs font-extrabold text-brand hover:text-brand-dark flex items-center gap-1.5">
                <span>🔍</span><span>كيف تم الحساب؟</span><span>{showCalcDetails?"▲":"▼"}</span>
              </button>
              {showCalcDetails&&(
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                  {isFZQFZP?(
                    <div className="space-y-1.5">
                      <p className="font-extrabold text-ink">منهجية حساب QFZP:</p>
                      <p className="text-ink-secondary">الدخل المؤهل ({formatAED(qfzpResult.qi)} د.إ) × 0% = 0 د.إ</p>
                      <p className="text-ink-secondary">الدخل غير المؤهل ({formatAED(qfzpResult.nqti)} د.إ) × 9% = <strong>{formatAED(qfzpResult.tax)} د.إ</strong></p>
                      <p className="text-[10px] text-ink-muted">لا ينطبق نطاق إعفاء 375,000 درهم على الدخل غير المؤهل لـ QFZP.</p>
                    </div>
                  ):(
                    <div className="space-y-1.5">
                      <p className="font-extrabold text-ink">منهجية الحساب المعياري:</p>
                      <p className="text-ink-secondary">الدخل الخاضع للضريبة: {formatAED(activeTI)} د.إ</p>
                      <p className="text-ink-secondary">الجزء الخاضع لـ 0%: min({formatAED(activeTI)}, 375,000) = {formatAED(stdResult.zeroRatePortion)} د.إ</p>
                      <p className="text-ink-secondary">الجزء الخاضع لـ 9%: max({formatAED(activeTI)} − 375,000, 0) = {formatAED(stdResult.ninePercentPortion)} د.إ</p>
                      <p className="text-ink-secondary font-bold">{formatAED(stdResult.ninePercentPortion)} × 9% = {formatAED(stdResult.tax)} د.إ ✓</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Small Business Relief */}
      {(taxpayerType===TAXPAYER_TYPE.STANDARD||(taxpayerType===TAXPAYER_TYPE.NATURAL_PERSON&&npInScope))&&(
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">٣</span>
              <span className="text-lg">🏷️</span>
              <h2 className="text-sm sm:text-base font-extrabold text-ink">تسهيلات الأعمال الصغيرة (SBR)</h2>
            </div>
            <button type="button" onClick={()=>setShowSBR(!showSBR)} className="text-[11px] font-bold text-brand hover:underline shrink-0">{showSBR?"إخفاء ▲":"فحص الأهلية ▼"}</button>
          </div>
          {!showSBR&&(<p className="text-xs text-ink-muted">إذا كانت إيراداتك أقل أو تساوي 3,000,000 درهم قد تكون مؤهلاً لتسهيلات الأعمال الصغيرة.</p>)}
          {showSBR&&(
            <div className="space-y-4">
              <TriToggle label="هل المنشأة مقيمة لأغراض ضريبة الشركات؟" value={sbrIsResident} onChange={setSbrIsResident} />
              <div className="grid gap-4 sm:grid-cols-2">
                <AedInput id="sbrRev" label="إجمالي الإيرادات للفترة الضريبية الحالية" hint="يجب ألا تتجاوز 3,000,000 درهم." value={sbrCurrentRevenue} onChange={setSbrCurrentRevenue} />
                <AedInput id="sbrPrior" label="أعلى إيرادات في أي فترة ضريبية سابقة ذات صلة" hint="يجب ألا تكون في أي فترة سابقة تجاوزت 3,000,000 درهم." value={sbrPriorRevenue} onChange={setSbrPriorRevenue} optional />
              </div>
              <TriToggle label="هل أنت شخص مؤهل في منطقة حرة (QFZP)؟" value={sbrIsQFZP} onChange={setSbrIsQFZP} />
              <TriToggle label="هل تنتمي لمجموعة متعددة الجنسيات بإيرادات موحدة تتجاوز 3.15 مليار درهم؟" value={sbrIsMNE} onChange={setSbrIsMNE} />
              <div className={`rounded-xl border p-4 space-y-2 ${sbrResult.eligible?"border-emerald-200 bg-emerald-50/60":"border-rose-200 bg-rose-50/60"}`}>
                <p className={`text-sm font-extrabold ${sbrResult.eligible?"text-emerald-800":"text-rose-800"}`}>
                  {sbrResult.eligible?"🟢 قد تكون مؤهلاً لاختيار تسهيلات الأعمال الصغيرة":"🔴 لا تستوفي شروط تسهيلات الأعمال الصغيرة حالياً"}
                </p>
                {sbrResult.eligible?(
                  <p className="text-xs text-emerald-800 leading-relaxed">قد تكون مؤهلاً لاختيار تسهيلات الأعمال الصغيرة وفق الشروط النظامية. تسهيلات الأعمال الصغيرة هي اختيار (election) وليست إعفاءً تلقائياً — يجب تقديم الاختيار لدى FTA في الموعد المحدد.</p>
                ):(
                  <ul className="space-y-1">{sbrResult.reasons.map((r,i)=>(<li key={i} className="text-xs text-rose-800 flex items-start gap-1.5"><span>•</span><span>{r}</span></li>))}</ul>
                )}
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-[11px] text-amber-900 leading-relaxed">⚠️ تسهيلات الأعمال الصغيرة تخضع لفترات وشروط نظامية محددة. يجب مراجعة أحدث توجيهات FTA قبل الاعتماد على هذه النتيجة. آخر مراجعة: 2026.</div>
            </div>
          )}
        </div>
      )}

      {/* Print Summary */}
      {taxpayerType!==TAXPAYER_TYPE.UNSURE&&(
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-ink flex items-center gap-2"><span>🖨️</span><span>ملخص تقديري قابل للطباعة</span></h3>
            <button type="button" onClick={()=>setShowPrint(!showPrint)} className="text-xs font-bold text-brand hover:underline">{showPrint?"إخفاء":"إنشاء الملخص"}</button>
          </div>
          {showPrint&&(
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4 print:shadow-none">
              <div className="border-b border-slate-300 pb-3">
                <h4 className="text-base font-black text-ink">ملخص تقديري لضريبة الشركات</h4>
                <p className="text-[11px] text-ink-muted mt-0.5">هذا الملخص تقديري استرشادي وليس إقراراً ضريبياً أو وثيقة معتمدة.</p>
              </div>
              <table className="w-full text-xs border-collapse">
                <tbody className="divide-y divide-slate-200">
                  {[
                    ["نوع الخاضع للضريبة", TAXPAYER_OPTIONS.find(o=>o.val===taxpayerType)?.label||"-"],
                    ["الإيرادات السنوية", formatAED(annualRevenue)+" د.إ"],
                    isFZQFZP?["الدخل المؤهل (0%)", formatAED(qfzpResult.qi)+" د.إ"]:["الدخل الخاضع للضريبة", formatAED(activeTI)+" د.إ"],
                    isFZQFZP?["الدخل غير المؤهل (9%)", formatAED(qfzpResult.nqti)+" د.إ"]:["الجزء الخاضع لـ 0%", formatAED(stdResult.zeroRatePortion)+" د.إ"],
                    isFZQFZP?["ضريبة QFZP التقديرية", formatAED(qfzpResult.tax)+" د.إ"]:["الجزء الخاضع لـ 9%", formatAED(stdResult.ninePercentPortion)+" د.إ"],
                    isFZQFZP?["المعدل الفعلي", (qfzpResult.effectiveRate*100).toFixed(2)+"%"]:["ضريبة الشركات التقديرية", formatAED(stdResult.tax)+" د.إ"],
                    !isFZQFZP?["المعدل الفعلي", (stdResult.effectiveRate*100).toFixed(2)+"%"]:null,
                    ["تسهيلات الأعمال الصغيرة", showSBR?(sbrResult.eligible?"قد تكون مؤهلاً (مراجعة مطلوبة)":"غير مؤهل"):"لم يتم الفحص"],
                    ["تاريخ الحساب", today],
                  ].filter(Boolean).map(([k,v],i)=>(<tr key={i}><td className="py-1.5 px-2 font-bold text-ink-secondary">{k}</td><td className="py-1.5 px-2 font-bold text-ink text-left">{v}</td></tr>))}
                </tbody>
              </table>
              <p className="text-[10px] text-ink-muted border-t border-slate-200 pt-3 leading-relaxed">هذا الملخص تقديري استرشادي يعتمد على البيانات المدخلة ولا يمثل إقراراً ضريبياً أو قراراً رسمياً من الهيئة الاتحادية للضرائب.</p>
              <button type="button" onClick={()=>window.print()} className="rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-black px-4 py-2.5 transition">طباعة / حفظ PDF 🖨️</button>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
        <h3 className="text-xs font-extrabold text-ink flex items-center gap-2"><span>⚖️</span><span>إخلاء المسؤولية</span></h3>
        <p className="text-[11px] text-ink-secondary leading-relaxed">هذه الحاسبة تقديرية وتعتمد على البيانات التي يدخلها المستخدم، ولا تمثل إقراراً ضريبياً أو قراراً رسمياً من الهيئة الاتحادية للضرائب.</p>
        <p className="text-[11px] text-ink-secondary leading-relaxed">قد تختلف النتيجة بحسب نوع الشخص، التعديلات الضريبية، الإعفاءات، الخسائر، وضع المنطقة الحرة، المعاملات مع الأطراف المرتبطة، والفترة الضريبية.</p>
        <p className="text-[11px] text-ink-secondary leading-relaxed">يرجى الرجوع إلى <a href={FTA_CT_URL} target="_blank" rel="noopener noreferrer" className="text-brand underline font-bold">الهيئة الاتحادية للضرائب — tax.gov.ae</a> أو مستشار ضريبي مؤهل عند الحاجة إلى تحديد رسمي.</p>
      </div>

      {/* Reset + cross-link */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button type="button" onClick={handleReset} className="rounded-xl border border-brand-border px-4 py-2 text-xs font-bold text-ink-secondary hover:border-brand hover:text-brand transition-all">↺ إعادة تعيين</button>
        <Link href="/ar/ae/vat-registration-checker" className="rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold px-4 py-2 transition-all">هل تحتاج فحص أهلية التسجيل في ضريبة القيمة المضافة؟ ←</Link>
      </div>

      {/* Official source */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-ink-secondary"><span>🏛️</span><span>المصدر: <strong className="text-ink">الهيئة الاتحادية للضرائب — دولة الإمارات العربية المتحدة</strong></span></div>
        <div className="flex gap-3 text-[11px]">
          <a href={FTA_CT_URL} target="_blank" rel="noopener noreferrer" className="text-brand underline font-bold">ضريبة الشركات — FTA ↗</a>
          <a href={FTA_SBR_URL} target="_blank" rel="noopener noreferrer" className="text-brand underline font-bold">تسهيلات الأعمال الصغيرة ↗</a>
        </div>
      </div>
    </div>
  );
}

