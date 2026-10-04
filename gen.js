const fs = require("fs");
const s = `
function AedInput({ id, label, hint, value, onChange, optional = false }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-ink-secondary mb-1">
        {label}{optional && <span className="mr-1 text-ink-muted font-normal">(اختياري)</span>}
      </label>
      <div className="relative">
        <input id={id} type="number" inputMode="decimal" min="0" value={value}
          onChange={(e) => onChange(e.target.value)} placeholder="0"
          className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none" />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">د.إ</span>
      </div>
      {hint && <p className="mt-1 text-[11px] text-ink-muted leading-relaxed">{hint}</p>}
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
  const [taxpayerType, setTaxpayerType] = useState(TAXPAYER_TYPE.STANDARD);
  const [annualRevenue,  setAnnualRevenue]  = useState("0");
  const [taxableIncome,  setTaxableIncome]  = useState("0");
  const [estimateMode,   setEstimateMode]   = useState(false);
  const [estRevenue,     setEstRevenue]     = useState("0");
  const [estExpenses,    setEstExpenses]    = useState("0");
  const [estAdjustments, setEstAdjustments] = useState("0");
  const [estTaxLosses,   setEstTaxLosses]   = useState("0");
  const [npTurnover,     setNpTurnover]     = useState("0");
  const [isQFZP,              setIsQFZP]              = useState(null);
  const [qualifyingIncome,    setQualifyingIncome]    = useState("0");
  const [nonQualifyingIncome, setNonQualifyingIncome] = useState("0");
  const [showSBR,           setShowSBR]           = useState(false);
  const [sbrIsResident,     setSbrIsResident]     = useState(null);
  const [sbrCurrentRevenue, setSbrCurrentRevenue] = useState("0");
  const [sbrPriorRevenue,   setSbrPriorRevenue]   = useState("0");
  const [sbrIsQFZP,         setSbrIsQFZP]         = useState(null);
  const [sbrIsMNE,          setSbrIsMNE]          = useState(null);
  const [showCalcDetails, setShowCalcDetails] = useState(false);
  const [showPrint,       setShowPrint]       = useState(false);

  const estimatedTaxableIncome = useMemo(() => {
    if (!estimateMode) return null;
    return Math.max(0, sanitizeNumber(estRevenue) - sanitizeNumber(estExpenses) + sanitizeNumber(estAdjustments) - sanitizeNumber(estTaxLosses));
  }, [estimateMode, estRevenue, estExpenses, estAdjustments, estTaxLosses]);

  const effectiveTaxableIncome = useMemo(() => {
    if (estimateMode && estimatedTaxableIncome !== null) return estimatedTaxableIncome;
    return sanitizeNumber(taxableIncome);
  }, [estimateMode, estimatedTaxableIncome, taxableIncome]);

  const standardResult = useMemo(() => calcStandardCT(effectiveTaxableIncome), [effectiveTaxableIncome]);
  const qfzpResult     = useMemo(() => calcQfzpCT(qualifyingIncome, nonQualifyingIncome), [qualifyingIncome, nonQualifyingIncome]);
  const sbrResult      = useMemo(() => checkSBREligibility({ isResident: sbrIsResident, currentRevenue: sbrCurrentRevenue, priorMaxRevenue: sbrPriorRevenue, isQFZP: sbrIsQFZP, isMNEAboveThreshold: sbrIsMNE }), [sbrIsResident, sbrCurrentRevenue, sbrPriorRevenue, sbrIsQFZP, sbrIsMNE]);

  const npTurnoverNum  = sanitizeNumber(npTurnover);
  const npInScope      = npTurnoverNum > NATURAL_PERSON_TURNOVER_LIMIT;
  const isFreeZoneQFZP = taxpayerType === TAXPAYER_TYPE.FREE_ZONE && isQFZP === true;
  const today = new Date().toLocaleDateString("ar-AE", { year: "numeric", month: "long", day: "numeric" });

  const handleReset = useCallback(() => {
    setTaxpayerType(TAXPAYER_TYPE.STANDARD);
    setAnnualRevenue("0"); setTaxableIncome("0");
    setEstimateMode(false); setEstRevenue("0"); setEstExpenses("0"); setEstAdjustments("0"); setEstTaxLosses("0");
    setNpTurnover("0"); setIsQFZP(null); setQualifyingIncome("0"); setNonQualifyingIncome("0");
    setShowSBR(false); setSbrIsResident(null); setSbrCurrentRevenue("0"); setSbrPriorRevenue("0"); setSbrIsQFZP(null); setSbrIsMNE(null);
    setShowCalcDetails(false); setShowPrint(false);
  }, []);

  const loadPreset = (id) => {
    handleReset();
    if (id === "ex1") { setTimeout(()=>{ setTaxableIncome("300000"); }, 0); }
    else if (id === "ex2") { setTimeout(()=>{ setTaxableIncome("1000000"); setAnnualRevenue("1200000"); }, 0); }
    else if (id === "ex3") { setTimeout(()=>{ setAnnualRevenue("2400000"); setTaxableIncome("500000"); setShowSBR(true); setSbrIsResident(true); setSbrCurrentRevenue("2400000"); setSbrPriorRevenue("0"); setSbrIsQFZP(false); setSbrIsMNE(false); }, 0); }
    else if (id === "ex4") { setTimeout(()=>{ setTaxpayerType(TAXPAYER_TYPE.NATURAL_PERSON); setNpTurnover("800000"); }, 0); }
    else if (id === "ex5") { setTimeout(()=>{ setTaxpayerType(TAXPAYER_TYPE.FREE_ZONE); setIsQFZP(true); setQualifyingIncome("2000000"); setNonQualifyingIncome("200000"); }, 0); }
  };
`;
fs.appendFileSync("components/UaeCorporateTaxCalculator.jsx", s, "utf8");
console.log("section2 ok", s.length);
