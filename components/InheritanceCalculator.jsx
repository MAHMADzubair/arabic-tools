"use client";

/**
 * components/InheritanceCalculator.jsx
 * Qemlo tool style: glossy orange + ink, SVG icons, 26px cards, 16px controls,
 * light/dark, mobile-first. The inheritance calculation (useMemo block),
 * presets and copy-report text are unchanged except for ONE fix: full brothers
 * were silently dropped when daughters existed (no father/grandfather/son).
 * They are now asaba (section 5: `else if (!hasChildren || fullBrothers > 0)`).
 * The extended-relatives hint now states the Hanafi position on the grandfather.
 */

import { useState, useMemo, useId, useRef } from "react";

const currencyOptions = [
  { code: "SAR", label: "ريال سعودي" },
  { code: "AED", label: "درهم إماراتي" },
  { code: "USD", label: "دولار أمريكي" },
  { code: "KWD", label: "دينار كويتي" },
  { code: "QAR", label: "ريال قطري" },
  { code: "EGP", label: "جنيه مصري" },
];

function toNumber(val) {
  const n = parseFloat(val);
  return isNaN(n) || n < 0 ? 0 : n;
}

function formatCurrency(amount, currency) {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

// ─── Icons (SVG) ───────────────────────────────────────────────────────────────
const ICONS = {
  scale: (
    <>
      <path d="M12 3v18M6 21h12M5 7h14" />
      <path d="m5 7-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h12v4" />
      <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2z" />
      <circle cx="16.5" cy="14" r="1" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.4c1.8.8 3 2.7 3 5.6" />
    </>
  ),
  pie: (
    <>
      <path d="M12 3v9h9" />
      <path d="M20.5 15A9 9 0 1 1 9 3.5" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5v.01" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2.5 20h19z" />
      <path d="M12 10v4.5M12 17.5v.01" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  arrow: <path d="M12 5v14m0 0 5-5m-5 5-5-5" />,
  xcircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}

// ─── Small UI pieces ───────────────────────────────────────────────────────────
function Num({ label, value, onChange, suffix, placeholder }) {
  const id = useId();
  return (
    <div>
      <label className="inh-label" htmlFor={id}>{label}</label>
      <div className="inh-suffix-wrap">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="inh-input"
        />
        {suffix && <span className="inh-suffix" aria-hidden="true">{suffix}</span>}
      </div>
    </div>
  );
}

function Stepper({ label, value, onChange }) {
  const id = useId();
  return (
    <div>
      <label className="inh-label" htmlFor={id}>{label}</label>
      <div className="inh-stepper">
        <button
          type="button"
          className="inh-sbtn"
          aria-label={`إنقاص: ${label}`}
          disabled={value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          <Icon name="minus" size={18} />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min="0"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="inh-input inh-center"
        />
        <button
          type="button"
          className="inh-sbtn"
          aria-label={`زيادة: ${label}`}
          onClick={() => onChange(value + 1)}
        >
          <Icon name="plus" size={18} />
        </button>
      </div>
    </div>
  );
}

function Seg({ legend, options, value, onChange, hideLegend }) {
  return (
    <fieldset className="inh-fieldset">
      <legend className={hideLegend ? "inh-sr" : "inh-label"}>{legend}</legend>
      <div className="inh-seg" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            className="inh-segbtn"
            aria-pressed={value === o.v}
            onClick={() => onChange(o.v)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function CheckCard({ checked, onChange, label }) {
  return (
    <label className={`inh-check${checked ? " is-on" : ""}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="inh-check-box" aria-hidden="true">
        {checked && <Icon name="check" size={14} />}
      </span>
      <span>{label}</span>
    </label>
  );
}

function Section({ icon, title, id, children }) {
  return (
    <section className="inh-box" aria-labelledby={id}>
      <h2 className="inh-h2" id={id}>
        <span className="inh-tile" aria-hidden="true">
          <Icon name={icon} />
        </span>
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function InheritanceCalculator() {
  const uid = useId();

  // Estate state
  const [totalEstate, setTotalEstate] = useState("1000000");
  const [debts, setDebts] = useState("0");
  const [wasiyyah, setWasiyyah] = useState("0");
  const [currency, setCurrency] = useState("SAR");
  const currencyId = useId();

  // Deceased info
  const [deceasedGender, setDeceasedGender] = useState("male"); // 'male' | 'female'

  // Spouses
  const [wivesCount, setWivesCount] = useState(1);
  const [husbandAlive, setHusbandAlive] = useState(true);

  // Parents
  const [fatherAlive, setFatherAlive] = useState(true);
  const [motherAlive, setMotherAlive] = useState(true);

  // Children
  const [sonsCount, setSonsCount] = useState(2);
  const [daughtersCount, setDaughtersCount] = useState(2);

  // Advanced / Extended Relatives
  const [showExtended, setShowExtended] = useState(false);
  const [grandfatherAlive, setGrandfatherAlive] = useState(false);
  const [grandmotherAlive, setGrandmotherAlive] = useState(false);
  const [fullBrothersCount, setFullBrothersCount] = useState(0);
  const [fullSistersCount, setFullSistersCount] = useState(0);

  // Copy notification
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  // Quick Preset Scenarios
  const applyPreset = (presetKey) => {
    if (presetKey === "family_standard") {
      setDeceasedGender("male");
      setWivesCount(1);
      setFatherAlive(true);
      setMotherAlive(true);
      setSonsCount(2);
      setDaughtersCount(2);
      setShowExtended(false);
      setGrandfatherAlive(false);
      setGrandmotherAlive(false);
      setFullBrothersCount(0);
      setFullSistersCount(0);
    } else if (presetKey === "female_with_daughters") {
      setDeceasedGender("female");
      setHusbandAlive(true);
      setFatherAlive(false);
      setMotherAlive(true);
      setSonsCount(0);
      setDaughtersCount(2);
      setShowExtended(false);
      setFullBrothersCount(1);
      setFullSistersCount(0);
    } else if (presetKey === "no_children") {
      setDeceasedGender("male");
      setWivesCount(1);
      setFatherAlive(true);
      setMotherAlive(true);
      setSonsCount(0);
      setDaughtersCount(0);
      setShowExtended(false);
      setFullBrothersCount(0);
      setFullSistersCount(0);
    } else if (presetKey === "only_daughters") {
      setDeceasedGender("male");
      setWivesCount(1);
      setFatherAlive(true);
      setMotherAlive(true);
      setSonsCount(0);
      setDaughtersCount(3);
      setShowExtended(false);
      setFullBrothersCount(0);
      setFullSistersCount(0);
    }
  };

  // Calculation logic (unchanged except the section-5 fix noted above)
  const calculation = useMemo(() => {
    const gross = toNumber(totalEstate);
    const debtVal = toNumber(debts);
    const estateAfterDebts = Math.max(0, gross - debtVal);

    // Wasiyyah cannot exceed 1/3 of estate after debts in Shariah
    const maxAllowedWasiyyah = estateAfterDebts / 3;
    const requestedWasiyyah = toNumber(wasiyyah);
    const actualWasiyyah = Math.min(requestedWasiyyah, maxAllowedWasiyyah);
    const wasiyyahCapped = requestedWasiyyah > maxAllowedWasiyyah;

    const netEstate = Math.max(0, estateAfterDebts - actualWasiyyah);

    // Heirs flags
    const sons = sonsCount > 0 ? sonsCount : 0;
    const daughters = daughtersCount > 0 ? daughtersCount : 0;
    const hasChildren = sons > 0 || daughters > 0;
    const hasMaleDescendant = sons > 0;
    const fullBrothers = fullBrothersCount > 0 ? fullBrothersCount : 0;
    const fullSisters = fullSistersCount > 0 ? fullSistersCount : 0;
    const totalSiblings = fullBrothers + fullSisters;

    const heirs = [];
    const blockedHeirs = [];

    // 1. الزوج أو الزوجات
    if (deceasedGender === "male") {
      if (wivesCount > 0) {
        const share = hasChildren ? 1 / 8 : 1 / 4;
        const shareText = hasChildren ? "1/8 (الثمن)" : "1/4 (الربع)";
        const reason = hasChildren
          ? "فرضاً لوجود الفرع الوارث (يُقسم بالتساوي بين الزوجات)"
          : "فرضاً لعدم وجود الفرع الوارث (يُقسم بالتساوي بين الزوجات)";
        heirs.push({
          id: "wives",
          title: wivesCount === 1 ? "الزوجة" : `الزوجات (${wivesCount})`,
          count: wivesCount,
          shareFraction: share,
          shareLabel: shareText,
          isAsaba: false,
          reason,
        });
      }
    } else {
      if (husbandAlive) {
        const share = hasChildren ? 1 / 4 : 1 / 2;
        const shareText = hasChildren ? "1/4 (الربع)" : "1/2 (النصف)";
        const reason = hasChildren
          ? "فرضاً لوجود الفرع الوارث"
          : "فرضاً لعدم وجود الفرع الوارث";
        heirs.push({
          id: "husband",
          title: "الزوج",
          count: 1,
          shareFraction: share,
          shareLabel: shareText,
          isAsaba: false,
          reason,
        });
      }
    }

    // 2. الأم أو الجدة
    if (motherAlive) {
      // الغراوين (العمريتان): زوج/زوجة + أب + أم (ولا أولاد ولا جمع إخوة)
      const isUmariyyatan =
        fatherAlive &&
        !hasChildren &&
        totalSiblings < 2 &&
        ((deceasedGender === "male" && wivesCount > 0) ||
          (deceasedGender === "female" && husbandAlive));

      let share = 1 / 6;
      let shareText = "1/6 (السدس)";
      let reason = "فرضاً لوجود الفرع الوارث أو جمع من الإخوة";

      if (isUmariyyatan) {
        // ثلث الباقي بعد نصيب أحد الزوجين
        const spouseShare = deceasedGender === "male" ? 1 / 4 : 1 / 2;
        share = (1 - spouseShare) / 3;
        shareText = "ثلث الباقي";
        reason = "مسألة الغراوين (ثلث الباقي بعد نصيب الزوج/الزوجة والأب يأخذ الباقي تعصيباً)";
      } else if (!hasChildren && totalSiblings < 2) {
        share = 1 / 3;
        shareText = "1/3 (الثلث)";
        reason = "فرضاً لعدم وجود الفرع الوارث ولعدم تعدد الإخوة";
      }

      heirs.push({
        id: "mother",
        title: "الأم",
        count: 1,
        shareFraction: share,
        shareLabel: shareText,
        isAsaba: false,
        reason,
      });

      if (grandmotherAlive) {
        blockedHeirs.push({ title: "الجدة", reason: "محجوبة بوجود الأم" });
      }
    } else if (grandmotherAlive) {
      // الجدة عند غياب الأم
      heirs.push({
        id: "grandmother",
        title: "الجدة",
        count: 1,
        shareFraction: 1 / 6,
        shareLabel: "1/6 (السدس)",
        isAsaba: false,
        reason: "فرضاً لانعدام الأم والفرع الأقرب منها",
      });
    }

    // 3. الأب أو الجد
    if (fatherAlive) {
      if (hasMaleDescendant) {
        // أب مع ابن: السدس فرضاً فقط
        heirs.push({
          id: "father",
          title: "الأب",
          count: 1,
          shareFraction: 1 / 6,
          shareLabel: "1/6 (السدس)",
          isAsaba: false,
          reason: "فرضاً لوجود الفرع الوارث المذكر (الابن)",
        });
      } else if (daughters > 0) {
        // أب مع بنات دون بنين: السدس فرضاً + الباقي تعصيباً
        heirs.push({
          id: "father",
          title: "الأب",
          count: 1,
          shareFraction: 1 / 6,
          shareLabel: "1/6 + الباقي عصبة",
          isAsaba: true,
          fatherDualMode: true,
          reason: "السدس فرضاً لوجود فرع وارث مؤنث + الباقي تعصيباً إن وجد",
        });
      } else {
        // لا أولاد: الأب عصبة بالنفس يأخذ كل ما تبقى
        heirs.push({
          id: "father",
          title: "الأب",
          count: 1,
          shareFraction: 0,
          shareLabel: "الباقي (عصبة)",
          isAsaba: true,
          reason: "عصبة بالنفس لانعدام الفرع الوارث",
        });
      }

      if (grandfatherAlive) {
        blockedHeirs.push({ title: "الجد", reason: "محجوب بوجود الأب" });
      }
    } else if (grandfatherAlive) {
      // الجد عند غياب الأب
      if (hasMaleDescendant) {
        heirs.push({
          id: "grandfather",
          title: "الجد لأب",
          count: 1,
          shareFraction: 1 / 6,
          shareLabel: "1/6 (السدس)",
          isAsaba: false,
          reason: "فرضاً لقيامه مقام الأب مع وجود الفرع الوارث المذكر",
        });
      } else if (daughters > 0) {
        heirs.push({
          id: "grandfather",
          title: "الجد لأب",
          count: 1,
          shareFraction: 1 / 6,
          shareLabel: "1/6 + الباقي عصبة",
          isAsaba: true,
          fatherDualMode: true,
          reason: "السدس فرضاً + الباقي تعصيباً لقيامه مقام الأب",
        });
      } else {
        heirs.push({
          id: "grandfather",
          title: "الجد لأب",
          count: 1,
          shareFraction: 0,
          shareLabel: "الباقي (عصبة)",
          isAsaba: true,
          reason: "عصبة بالنفس لقيامه مقام الأب لعدم وجود فرع وارث",
        });
      }
    }

    // 4. البنات فقط (إذا لم يكن هناك أبناء ذكور)
    if (!hasMaleDescendant && daughters > 0) {
      const share = daughters === 1 ? 1 / 2 : 2 / 3;
      const shareText = daughters === 1 ? "1/2 (النصف)" : "2/3 (الثلثان)";
      const reason =
        daughters === 1
          ? "فرضاً لانفرادها وعدم وجود معصّب (النصف)"
          : "فرضاً لتعددهن وعدم وجود معصّب (الثلثان بالتساوي)";
      heirs.push({
        id: "daughters_fard",
        title: daughters === 1 ? "البنت" : `البنات (${daughters})`,
        count: daughters,
        shareFraction: share,
        shareLabel: shareText,
        isAsaba: false,
        reason,
      });
    }

    // 5. الإخوة والأخوات (حجبهم أو توريثهم)
    const siblingsBlocked = fatherAlive || grandfatherAlive || hasMaleDescendant;
    if (siblingsBlocked) {
      if (fullBrothers > 0) {
        blockedHeirs.push({
          title: `الإخوة الأشقاء (${fullBrothers})`,
          reason: hasMaleDescendant
            ? "محجوبون بوجود الفرع الوارث المذكر (الابن)"
            : "محجوبون بوجود الأب/الجد",
        });
      }
      if (fullSisters > 0) {
        blockedHeirs.push({
          title: `الأخوات الشقيقات (${fullSisters})`,
          reason: hasMaleDescendant
            ? "محجوبات بوجود الفرع الوارث المذكر (الابن)"
            : "محجوبات بوجود الأب/الجد",
        });
      }
    } else {
      // الإخوة غير محجوبين
      if (daughters > 0 && fullBrothers === 0 && fullSisters > 0) {
        // الأخوات مع البنات عصبة مع الغير
        heirs.push({
          id: "sisters_asaba",
          title: fullSisters === 1 ? "الأخت الشقيقة" : `الأخوات الشقيقات (${fullSisters})`,
          count: fullSisters,
          shareFraction: 0,
          shareLabel: "الباقي (عصبة مع الغير)",
          isAsaba: true,
          reason: "عصبة مع الغير لوجودهن مع البنات (اجعلوا الأخوات مع البنات عصبة)",
        });
      } else if (!hasChildren || fullBrothers > 0) {
        // FIX: الإخوة الأشقاء عصبة حتى مع وجود البنات (بعد فرض البنات)
        if (fullBrothers > 0) {
          heirs.push({
            id: "brothers_asaba",
            title:
              fullSisters > 0
                ? `الإخوة والأخوات الأشقاء (${fullBrothers} ذكور + ${fullSisters} إناث)`
                : `الإخوة الأشقاء (${fullBrothers})`,
            count: fullBrothers + fullSisters,
            shareFraction: 0,
            shareLabel: "الباقي (عصبة بالغير)",
            isAsaba: true,
            isSiblingsAsaba: true,
            reason: hasChildren
              ? "عصبة لباقي التركة بعد فرض البنات (للذكر مثل حظ الأنثيين)"
              : "عصبة بالغير للذكر مثل حظ الأنثيين لعدم وجود فرع وارث ولا أب",
          });
        } else if (fullSisters > 0) {
          const share = fullSisters === 1 ? 1 / 2 : 2 / 3;
          heirs.push({
            id: "sisters_fard",
            title: fullSisters === 1 ? "الأخت الشقيقة" : `الأخوات الشقيقات (${fullSisters})`,
            count: fullSisters,
            shareFraction: share,
            shareLabel: fullSisters === 1 ? "1/2 (النصف)" : "2/3 (الثلثان)",
            isAsaba: false,
            reason:
              fullSisters === 1
                ? "فرضاً لانفرادها لعدم وجود الفرع الوارث ولا الأب ولا المعصب"
                : "فرضاً لتعددهن لعدم وجود الفرع الوارث ولا الأب ولا المعصب",
          });
        }
      }
    }

    // 6. الأبناء والبنات معاً (عصبة بالغير) أو الأبناء فقط (عصبة بالنفس)
    if (hasMaleDescendant) {
      if (daughters > 0) {
        heirs.push({
          id: "children_asaba",
          title: `الأولاد (${sons} ذكور + ${daughters} إناث)`,
          count: sons + daughters,
          shareFraction: 0,
          shareLabel: "الباقي (عصبة بالغير)",
          isAsaba: true,
          isChildrenAsaba: true,
          reason: "عصبة بالغير: للذكر مثل حظ الأنثيين بعد أصحاب الفروض",
        });
      } else {
        heirs.push({
          id: "sons_asaba",
          title: sons === 1 ? "الابن" : `الأبناء الذكور (${sons})`,
          count: sons,
          shareFraction: 0,
          shareLabel: "الباقي (عصبة بالنفس)",
          isAsaba: true,
          isSonsOnlyAsaba: true,
          reason: "عصبة بالنفس: يأخذون جميع ما تبقى بعد أصحاب الفروض بالتساوي",
        });
      }
    }

    // Calculation of Amounts, Awl, and Radd
    // Sum of fixed shares (أصحاب الفروض)
    const fixedSharesSum = heirs
      .filter((h) => !h.isAsaba || h.fatherDualMode)
      .reduce((sum, h) => sum + h.shareFraction, 0);

    const hasAnyAsaba = heirs.some((h) => h.isAsaba);

    let statusType = "normal"; // 'normal' | 'awl' | 'radd' | 'asaba'
    let statusNote = "";

    let finalDistribution = [];

    if (fixedSharesSum > 1) {
      // مسألة عائلة (العول)
      statusType = "awl";
      statusNote =
        "عالت المسألة: زادت مجموع السهام الشرعية عن أصل التركة، فتُقسّم التركة بالمحاصة الشرعية بنسبة وتناسب عادلة.";

      finalDistribution = heirs.map((h) => {
        const adjustedFraction = h.shareFraction / fixedSharesSum;
        const amount = adjustedFraction * netEstate;
        return {
          ...h,
          calculatedFraction: adjustedFraction,
          percentage: adjustedFraction * 100,
          amount,
          perPerson: h.count > 0 ? amount / h.count : amount,
        };
      });
    } else if (hasAnyAsaba) {
      // يوجد عصبة يأخذون الباقي
      const remainderFraction = Math.max(0, 1 - fixedSharesSum);
      statusType = "asaba";
      statusNote = "توزيع شرعي يجمع بين أصحاب الفروض والعصبة المستحقين للباقي.";

      finalDistribution = heirs.map((h) => {
        if (!h.isAsaba) {
          const amount = h.shareFraction * netEstate;
          return {
            ...h,
            calculatedFraction: h.shareFraction,
            percentage: h.shareFraction * 100,
            amount,
            perPerson: h.count > 0 ? amount / h.count : amount,
          };
        } else if (h.fatherDualMode) {
          // الأب أو الجد: السدس + الباقي
          const fardAmount = h.shareFraction * netEstate;
          const asabaAmount = remainderFraction * netEstate;
          const totalAmount = fardAmount + asabaAmount;
          const totalFrac = h.shareFraction + remainderFraction;
          return {
            ...h,
            calculatedFraction: totalFrac,
            percentage: totalFrac * 100,
            amount: totalAmount,
            perPerson: totalAmount,
            subBreakdown: `السدس فرضاً: ${formatCurrency(fardAmount, currency)} + الباقي عصبة: ${formatCurrency(asabaAmount, currency)}`,
          };
        } else if (h.isChildrenAsaba) {
          // أولاد ذكور وإناث
          const totalUnits = sons * 2 + daughters * 1;
          const totalAmount = remainderFraction * netEstate;
          const unitValue = totalUnits > 0 ? totalAmount / totalUnits : 0;
          return {
            ...h,
            calculatedFraction: remainderFraction,
            percentage: remainderFraction * 100,
            amount: totalAmount,
            perPerson: null,
            subBreakdown: `نصيب كل ابن (${formatCurrency(unitValue * 2, currency)}) | نصيب كل بنت (${formatCurrency(unitValue, currency)})`,
          };
        } else if (h.isSonsOnlyAsaba) {
          const totalAmount = remainderFraction * netEstate;
          return {
            ...h,
            calculatedFraction: remainderFraction,
            percentage: remainderFraction * 100,
            amount: totalAmount,
            perPerson: sons > 0 ? totalAmount / sons : totalAmount,
          };
        } else if (h.isSiblingsAsaba) {
          const totalUnits = fullBrothers * 2 + fullSisters * 1;
          const totalAmount = remainderFraction * netEstate;
          const unitValue = totalUnits > 0 ? totalAmount / totalUnits : 0;
          return {
            ...h,
            calculatedFraction: remainderFraction,
            percentage: remainderFraction * 100,
            amount: totalAmount,
            perPerson: null,
            subBreakdown:
              fullSisters > 0
                ? `نصيب كل أخ شقيق (${formatCurrency(unitValue * 2, currency)}) | نصيب كل أخت شقيقة (${formatCurrency(unitValue, currency)})`
                : `نصيب كل أخ: ${formatCurrency(fullBrothers > 0 ? totalAmount / fullBrothers : 0, currency)}`,
          };
        } else {
          // عصبة أخرى (الأب عصبة مطلقة أو الأخت عصبة مع الغير)
          const totalAmount = remainderFraction * netEstate;
          return {
            ...h,
            calculatedFraction: remainderFraction,
            percentage: remainderFraction * 100,
            amount: totalAmount,
            perPerson: h.count > 0 ? totalAmount / h.count : totalAmount,
          };
        }
      });
    } else if (fixedSharesSum < 1) {
      // مسألة فيها رد (الرد على أصحاب الفروض عدا الزوجين على الراجح)
      const spouseHeir = heirs.find((h) => h.id === "wives" || h.id === "husband");
      const nonSpouseHeirs = heirs.filter(
        (h) => h.id !== "wives" && h.id !== "husband"
      );

      if (nonSpouseHeirs.length > 0) {
        statusType = "radd";
        statusNote =
          "مسألة فيها رد: زادت التركة عن فروض الورثة ولا يوجد عصبة، فرُدَّ الباقي على ذوي الفروض عدا الزوجين حسب الراجح فقهياً.";

        const spouseFraction = spouseHeir ? spouseHeir.shareFraction : 0;
        const spouseAmount = spouseFraction * netEstate;
        const remainingForRadd = netEstate - spouseAmount;

        const nonSpouseSharesSum = nonSpouseHeirs.reduce(
          (sum, h) => sum + h.shareFraction,
          0
        );

        finalDistribution = heirs.map((h) => {
          if (h.id === "wives" || h.id === "husband") {
            return {
              ...h,
              calculatedFraction: h.shareFraction,
              percentage: h.shareFraction * 100,
              amount: spouseAmount,
              perPerson: h.count > 0 ? spouseAmount / h.count : spouseAmount,
            };
          } else {
            const raddShare =
              nonSpouseSharesSum > 0
                ? (h.shareFraction / nonSpouseSharesSum) * (1 - spouseFraction)
                : h.shareFraction;
            const amount =
              nonSpouseSharesSum > 0
                ? (h.shareFraction / nonSpouseSharesSum) * remainingForRadd
                : 0;
            return {
              ...h,
              calculatedFraction: raddShare,
              percentage: raddShare * 100,
              amount,
              perPerson: h.count > 0 ? amount / h.count : amount,
              subBreakdown: "فرضه الأصلي + حصته من الرد",
            };
          }
        });
      } else {
        // Only spouse exists (رد على الزوج في قول، أو لبيت المال)
        statusType = "normal";
        finalDistribution = heirs.map((h) => {
          const amount = h.shareFraction * netEstate;
          return {
            ...h,
            calculatedFraction: h.shareFraction,
            percentage: h.shareFraction * 100,
            amount,
            perPerson: h.count > 0 ? amount / h.count : amount,
          };
        });
      }
    } else {
      // Exactly 1 (عادلة)
      statusType = "normal";
      statusNote = "مسألة عادلة: تساوت الفروض تماماً مع أصل التركة بنسبة 100%.";
      finalDistribution = heirs.map((h) => {
        const amount = h.shareFraction * netEstate;
        return {
          ...h,
          calculatedFraction: h.shareFraction,
          percentage: h.shareFraction * 100,
          amount,
          perPerson: h.count > 0 ? amount / h.count : amount,
        };
      });
    }

    const totalDistributed = finalDistribution.reduce((s, h) => s + h.amount, 0);

    return {
      gross,
      debtVal,
      estateAfterDebts,
      actualWasiyyah,
      wasiyyahCapped,
      maxAllowedWasiyyah,
      netEstate,
      statusType,
      statusNote,
      heirs: finalDistribution,
      blockedHeirs,
      totalDistributed,
    };
  }, [
    totalEstate,
    debts,
    wasiyyah,
    deceasedGender,
    wivesCount,
    husbandAlive,
    fatherAlive,
    motherAlive,
    sonsCount,
    daughtersCount,
    grandfatherAlive,
    grandmotherAlive,
    fullBrothersCount,
    fullSistersCount,
    currency,
  ]);

  // Copy summary text
  const copySummary = async () => {
    let summary = `تقرير قسمة الميراث الشرعي\n`;
    summary += `---------------------------------\n`;
    summary += `قيمة التركة الإجمالية: ${formatCurrency(calculation.gross, currency)}\n`;
    if (calculation.debtVal > 0) {
      summary += `الديون ومؤن التجهيز: ${formatCurrency(calculation.debtVal, currency)}\n`;
    }
    if (calculation.actualWasiyyah > 0) {
      summary += `الوصية الشرعية: ${formatCurrency(calculation.actualWasiyyah, currency)}\n`;
    }
    summary += `صافي التركة القابلة للقسمة: ${formatCurrency(calculation.netEstate, currency)}\n`;
    summary += `حالة المسألة: ${calculation.statusNote}\n\n`;
    summary += `توزيع أنصبة الورثة:\n`;

    calculation.heirs.forEach((h, idx) => {
      summary += `${idx + 1}. ${h.title}: ${formatCurrency(h.amount, currency)} (${h.shareLabel} - ${h.percentage.toFixed(1)}%)\n`;
      if (h.subBreakdown) {
        summary += `   تفصيل: ${h.subBreakdown}\n`;
      } else if (h.count > 1 && h.perPerson) {
        summary += `   نصيب الفرد: ${formatCurrency(h.perPerson, currency)}\n`;
      }
      summary += `   السبب: ${h.reason}\n`;
    });

    if (calculation.blockedHeirs.length > 0) {
      summary += `\nالمحجوبون من الإرث:\n`;
      calculation.blockedHeirs.forEach((b) => {
        summary += `- ${b.title}: ${b.reason}\n`;
      });
    }

    summary += `\n* تم الحساب وفق أحكام الشريعة الإسلامية. للمسائل القضائية يرجى مراجعة المحاكم الشرعية.`;

    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = summary;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        return;
      }
    }
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 3000);
  };

  const statusTitle =
    calculation.statusType === "awl"
      ? "مسألة عائلة (العول)"
      : calculation.statusType === "radd"
        ? "مسألة فيها رد"
        : "حالة المسألة";

  const statusIcon =
    calculation.statusType === "awl" ? "alert" : calculation.statusType === "radd" ? "info" : "check";

  const presets = [
    { k: "family_standard", label: "زوجة وأبناء وبنات وأبوان" },
    { k: "female_with_daughters", label: "متوفاة (زوج وبنات وأم)" },
    { k: "only_daughters", label: "بنات فقط مع والدين" },
    { k: "no_children", label: "زوجة ووالدان (دون أبناء)" },
  ];

  const resultsId = `${uid}-results`;

  return (
    <div className="inh" dir="rtl">
      <style>{css}</style>

      {/* Header */}
      <header className="inh-head">
        <div className="inh-badge">
          <span className="inh-badge-ico" aria-hidden="true">
            <Icon name="scale" size={14} />
          </span>
          <span>علم الفرائض والمواريث الإسلامية</span>
        </div>
        <h1 className="inh-h1">حاسبة الميراث الشرعية</h1>
        <p className="inh-lead">
          احسب توزيع التركة بين الورثة وفق أحكام القرآن الكريم والسنة النبوية،
          مع مراعاة الفروض والعصبات والعول والرد وحجب الحرمان.
        </p>
      </header>

      <section className="inh-presets inh-noprint" aria-label="نماذج جاهزة سريعة">
        <p className="inh-presets-label">
          <Icon name="bolt" size={14} />
          <span>نماذج جاهزة</span>
        </p>
        <div className="inh-chips">
          {presets.map((p) => (
            <button key={p.k} type="button" className="inh-chip-btn" onClick={() => applyPreset(p.k)}>
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <div className="inh-grid">
        {/* ── Inputs ─────────────────────────────────────────────────────────── */}
        <div className="inh-col inh-noprint">
          <Section icon="wallet" title="قيمة التركة والوصية" id={`${uid}-s1`}>
            <div className="inh-stack">
              <div>
                <label className="inh-label" htmlFor={currencyId}>العملة</label>
                <div className="inh-select-wrap">
                  <select
                    id={currencyId}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="inh-input inh-select"
                  >
                    {currencyOptions.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label} ({c.code})
                      </option>
                    ))}
                  </select>
                  <span className="inh-chev" aria-hidden="true">
                    <Icon name="chevron" size={18} />
                  </span>
                </div>
              </div>

              <Num
                label="إجمالي قيمة التركة (أموال، عقارات، أصول)"
                value={totalEstate}
                onChange={setTotalEstate}
                suffix={currency}
                placeholder="500000"
              />

              <Num
                label="الديون وتكاليف الجنازة (تُخصم أولاً شرعاً)"
                value={debts}
                onChange={setDebts}
                suffix={currency}
                placeholder="0"
              />

              <div>
                <Num
                  label="الوصية لغير وارث (الحد الأقصى الثلث)"
                  value={wasiyyah}
                  onChange={setWasiyyah}
                  suffix={currency}
                  placeholder="0"
                />
                {calculation.wasiyyahCapped && (
                  <p className="inh-note" role="status">
                    <Icon name="alert" size={16} />
                    <span>
                      تنبيه: قُيّدت الوصية بالثلث شرعاً (<bdi>{formatCurrency(calculation.maxAllowedWasiyyah, currency)}</bdi>).
                    </span>
                  </p>
                )}
              </div>
            </div>
          </Section>

          <Section icon="users" title="بيانات المتوفى والورثة الأساسيين" id={`${uid}-s2`}>
            <div className="inh-stack inh-stack-lg">
              <Seg
                legend="المتوفى هو:"
                value={deceasedGender}
                onChange={setDeceasedGender}
                options={[
                  { v: "male", label: "ذكر (رجل)" },
                  { v: "female", label: "أنثى (امرأة)" },
                ]}
              />

              {deceasedGender === "male" ? (
                <Seg
                  legend="عدد الزوجات على قيد الحياة"
                  value={wivesCount}
                  onChange={setWivesCount}
                  options={[0, 1, 2, 3, 4].map((c) => ({ v: c, label: c === 0 ? "لا توجد" : String(c) }))}
                />
              ) : (
                <Seg
                  legend="هل الزوج على قيد الحياة؟"
                  value={husbandAlive}
                  onChange={setHusbandAlive}
                  options={[
                    { v: true, label: "نعم (حي)" },
                    { v: false, label: "متوفى" },
                  ]}
                />
              )}

              <div className="inh-two">
                <Seg
                  legend="الأب"
                  value={fatherAlive}
                  onChange={setFatherAlive}
                  options={[
                    { v: true, label: "حي" },
                    { v: false, label: "متوفى" },
                  ]}
                />
                <Seg
                  legend="الأم"
                  value={motherAlive}
                  onChange={setMotherAlive}
                  options={[
                    { v: true, label: "حية" },
                    { v: false, label: "متوفاة" },
                  ]}
                />
              </div>

              <div className="inh-two">
                <Stepper label="عدد الأبناء (الذكور)" value={sonsCount} onChange={setSonsCount} />
                <Stepper label="عدد البنات (الإناث)" value={daughtersCount} onChange={setDaughtersCount} />
              </div>

              <div>
                <button
                  type="button"
                  className="inh-toggle"
                  aria-expanded={showExtended}
                  aria-controls={`${uid}-extended`}
                  onClick={() => setShowExtended(!showExtended)}
                >
                  <span>أقارب آخرون (أجداد، إخوة وأخوات)</span>
                  <span className="inh-toggle-state">
                    <span>{showExtended ? "إخفاء" : "إظهار"}</span>
                    <span className={`inh-toggle-ico${showExtended ? " is-open" : ""}`}>
                      <Icon name="chevron" size={18} />
                    </span>
                  </span>
                </button>

                {showExtended && (
                  <div id={`${uid}-extended`} className="inh-extended">
                    <p className="inh-hint">
                      <Icon name="info" size={16} />
                      <span>ملاحظة شرعية: يُحجب الإخوة والأخوات بوجود الأب أو الابن، وتأخذ الحاسبة حجبهم بالجد أيضاً وفق قول الحنفية. ويُحجب الجد بالأب والجدة بالأم.</span>
                    </p>

                    <div className="inh-two">
                      <CheckCard checked={grandfatherAlive} onChange={setGrandfatherAlive} label="الجد لأب حي" />
                      <CheckCard checked={grandmotherAlive} onChange={setGrandmotherAlive} label="الجدة حية" />
                    </div>

                    <div className="inh-two">
                      <Stepper label="الإخوة الأشقاء (ذكور)" value={fullBrothersCount} onChange={setFullBrothersCount} />
                      <Stepper label="الأخوات الشقيقات (إناث)" value={fullSistersCount} onChange={setFullSistersCount} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* Mobile summary bar */}
          <div className="inh-mini" role="status">
            <div className="inh-mini-l">
              <span className="inh-mini-k">صافي التركة · {calculation.heirs.length} فئات وارثة</span>
              <span className="inh-mini-v"><bdi>{formatCurrency(calculation.netEstate, currency)}</bdi></span>
            </div>
            <a className="inh-mini-a" href={`#${resultsId}`}>
              <span>الأنصبة</span>
              <Icon name="arrow" size={16} />
            </a>
          </div>
        </div>

        {/* ── Results ────────────────────────────────────────────────────────── */}
        <div className="inh-col">
          <section className="inh-result" id={resultsId} aria-labelledby={`${uid}-net`} aria-live="polite">
            <p className="inh-result-label" id={`${uid}-net`}>صافي التركة القابلة للقسمة</p>
            <p className="inh-result-big"><bdi>{formatCurrency(calculation.netEstate, currency)}</bdi></p>
            <dl className="inh-result-rows">
              <div><dt>إجمالي التركة</dt><dd><bdi>{formatCurrency(calculation.gross, currency)}</bdi></dd></div>
              <div><dt>الديون ومؤن التجهيز</dt><dd><bdi>{formatCurrency(calculation.debtVal, currency)}</bdi></dd></div>
              <div><dt>الوصية المنفذة</dt><dd><bdi>{formatCurrency(calculation.actualWasiyyah, currency)}</bdi></dd></div>
            </dl>
          </section>

          <section className="inh-box" aria-labelledby={`${uid}-s3`}>
            <div className="inh-res-head">
              <h2 className="inh-h2 inh-h2-flush" id={`${uid}-s3`}>
                <span className="inh-tile" aria-hidden="true">
                  <Icon name="pie" />
                </span>
                <span>جدول توزيع الأنصبة</span>
              </h2>
              <button type="button" className="inh-copy inh-noprint" onClick={copySummary}>
                <Icon name={copied ? "check" : "copy"} size={16} />
                <span>{copied ? "تم النسخ" : "نسخ التقرير"}</span>
              </button>
            </div>
            <p className="inh-sr" role="status">{copied ? "تم نسخ التقرير" : ""}</p>

            <div className="inh-status" data-k={calculation.statusType}>
              <span className="inh-status-ico" aria-hidden="true">
                <Icon name={statusIcon} size={18} />
              </span>
              <div>
                <p className="inh-status-title">{statusTitle}</p>
                <p className="inh-status-note">{calculation.statusNote}</p>
              </div>
            </div>

            {calculation.heirs.length > 0 && (
              <div className="inh-bar-wrap">
                <p className="inh-small inh-bold">التوزيع النسبي للتركة</p>
                <div
                  className="inh-bar"
                  role="img"
                  aria-label={calculation.heirs
                    .map((h) => `${h.title}: ${h.percentage.toFixed(1)}%`)
                    .join("، ")}
                >
                  {calculation.heirs.map((h, i) => (
                    <div
                      key={i}
                      className="inh-bar-seg"
                      data-t={i % 3}
                      style={{ flex: `${Math.max(2, h.percentage)} 1 0` }}
                    >
                      {h.percentage >= 6 ? i + 1 : ""}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {calculation.heirs.length === 0 ? (
              <div className="inh-empty">
                <p>حدّد ورثة على قيد الحياة لإظهار الأنصبة.</p>
              </div>
            ) : (
              <ol className="inh-list">
                {calculation.heirs.map((h, idx) => (
                  <li key={idx} className="inh-heir">
                    <div className="inh-heir-main">
                      <span className="inh-chip" data-t={idx % 3} aria-hidden="true">{idx + 1}</span>
                      <div className="inh-heir-text">
                        <div className="inh-heir-title">
                          <h3>{h.title}</h3>
                          <span className="inh-tag">{h.shareLabel}</span>
                          <span className="inh-small inh-bold">({h.percentage.toFixed(1)}%)</span>
                        </div>
                        <p className="inh-small">{h.reason}</p>
                        {h.subBreakdown && <p className="inh-sub">{h.subBreakdown}</p>}
                      </div>
                    </div>

                    <div className="inh-amount">
                      <p className="inh-amount-main"><bdi>{formatCurrency(h.amount, currency)}</bdi></p>
                      {h.count > 1 && h.perPerson && !h.subBreakdown && (
                        <p className="inh-small inh-bold">
                          لكل فرد: <bdi>{formatCurrency(h.perPerson, currency)}</bdi>
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {calculation.blockedHeirs.length > 0 && (
              <div className="inh-blocked">
                <h3 className="inh-blocked-title">
                  <Icon name="xcircle" size={18} />
                  <span>المحجوبون من الميراث شرعاً (حجب حرمان)</span>
                </h3>
                <ul>
                  {calculation.blockedHeirs.map((b, i) => (
                    <li key={i}>
                      <span className="inh-tag">محجوب</span>
                      <span><strong>{b.title}:</strong> {b.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="inh-metrics">
              <div>
                <p className="inh-small inh-bold">إجمالي التركة</p>
                <p className="inh-metric"><bdi>{formatCurrency(calculation.gross, currency)}</bdi></p>
              </div>
              <div>
                <p className="inh-small inh-bold">إجمالي الموزع</p>
                <p className="inh-metric"><bdi>{formatCurrency(calculation.totalDistributed, currency)}</bdi></p>
              </div>
              <div>
                <p className="inh-small inh-bold">عدد الفئات الوارثة</p>
                <p className="inh-metric">{calculation.heirs.length}</p>
              </div>
            </div>
          </section>

          <aside className="inh-disclaimer" aria-labelledby={`${uid}-d`}>
            <h3 id={`${uid}-d`} className="inh-disclaimer-title">
              <span className="inh-tile inh-tile-sm" aria-hidden="true">
                <Icon name="shield" size={16} />
              </span>
              <span>تنبيه وإرشاد شرعي</span>
            </h3>
            <p>
              بُنيت هذه الحاسبة على القواعد المعتمدة عند جمهور العلماء في علم الفرائض: الفروض المقدرة
              (النصف، الربع، الثمن، الثلثان، الثلث، السدس) والتعصيب والعول والرد.
            </p>
            <p>
              الأداة للحساب والتعليم وتيسير فهم الأنصبة. في التركات المتنازع عليها أو ذات الوصايا المعقدة،
              راجع المحكمة الشرعية أو جهة الإفتاء المعتمدة في بلدك.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Styles: Qemlo (glossy orange + ink) ───────────────────────────────────────
// Reads the site's tokens when present (--bg/--surface/--orange, or the older
// --c-* set), with the palette as fallback. Orange is a background; text on it is black.
const css = `
.inh{
  --i-surface:var(--surface,#FFFFFF);
  --i-surface-2:var(--surface-2,var(--c-soft,#ECECE7));
  --i-border:var(--border,#D4D4CE);
  --i-text:var(--text,var(--c-ink,#0D0D0D));
  --i-text-2:var(--text-2,var(--c-mute,#55554F));
  --i-muted:var(--muted,#6B6B66);
  --i-ink:#0D0D0D;
  --i-ink-text:#F5F5F2;
  --i-orange:var(--orange,var(--c-accent,#FF5B04));
  --i-on-orange:#0D0D0D;
  --i-warning:#8A5A00;
  --i-gloss:linear-gradient(180deg,#FF8A3D 0%,#FF5B04 52%,#E64F00 100%);
  --i-gloss-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 0 rgba(0,0,0,.12),0 10px 22px -10px rgba(255,91,4,.65);
  --i-ring:color-mix(in srgb,var(--i-orange) 22%,transparent);
  color:var(--i-text);
  max-width:1120px;margin:0 auto;line-height:1.6;
  padding:clamp(16px,4vw,40px) clamp(14px,4vw,24px) 48px;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .inh{
    --i-surface:var(--surface,#161616);
    --i-surface-2:var(--surface-2,var(--c-soft,#1D1D1D));
    --i-border:var(--border,#2A2A2A);
    --i-text:var(--text,var(--c-ink,#F5F5F2));
    --i-text-2:var(--text-2,var(--c-mute,#B5B5B0));
    --i-muted:var(--muted,#8E8E89);
    --i-warning:#FBBF24;
  }
}
:root[data-theme="dark"] .inh{
  --i-surface:var(--surface,#161616);
  --i-surface-2:var(--surface-2,var(--c-soft,#1D1D1D));
  --i-border:var(--border,#2A2A2A);
  --i-text:var(--text,var(--c-ink,#F5F5F2));
  --i-text-2:var(--text-2,var(--c-mute,#B5B5B0));
  --i-muted:var(--muted,#8E8E89);
  --i-warning:#FBBF24;
}
.inh *,.inh *::before,.inh *::after{box-sizing:border-box}
.inh h1,.inh h2,.inh h3,.inh p,.inh dl,.inh dd,.inh ol,.inh ul{margin:0;padding:0}
.inh ol,.inh ul{list-style:none}
.inh button,.inh input,.inh select{font:inherit;color:inherit}
.inh :focus-visible{outline:2px solid var(--i-orange);outline-offset:3px}
.inh bdi{unicode-bidi:isolate;font-variant-numeric:tabular-nums}

/* Header */
.inh-head{display:grid;justify-items:center;gap:12px;text-align:center;margin-bottom:24px}
.inh-badge{
  display:inline-flex;align-items:center;gap:8px;padding-block:5px;padding-inline:6px 14px;border-radius:999px;
  background:var(--i-gloss);color:var(--i-on-orange);font-size:.8125rem;font-weight:800;box-shadow:var(--i-gloss-shadow);
}
.inh-badge-ico{width:26px;height:26px;border-radius:999px;flex:none;display:grid;place-items:center;background:var(--i-ink);color:var(--i-orange)}
.inh-h1{font-size:clamp(1.75rem,5.5vw,2.75rem);font-weight:800;line-height:1.25;text-wrap:balance}
.inh-lead{max-width:40rem;color:var(--i-text-2);font-size:clamp(.875rem,2.4vw,1rem);line-height:1.8;text-wrap:balance}

/* Presets */
.inh-presets{margin-bottom:16px;padding:14px;border-radius:22px;background:var(--i-surface-2);border:1px solid var(--i-border)}
.inh-presets-label{display:flex;align-items:center;gap:6px;margin-bottom:10px;font-size:.8125rem;font-weight:700;color:var(--i-muted)}
.inh-chips{display:flex;flex-wrap:wrap;gap:8px}
.inh-chip-btn{
  min-height:40px;padding:0 14px;border-radius:14px;cursor:pointer;border:1px solid var(--i-border);
  background:var(--i-surface);font-size:.8125rem;font-weight:600;transition:border-color .2s,transform .2s;
}
.inh-chip-btn:active{transform:scale(.97)}
@media (hover:hover){.inh-chip-btn:hover{border-color:var(--i-orange)}}

/* Layout */
.inh-grid{display:grid;gap:16px;grid-template-columns:minmax(0,1fr)}
.inh-col{display:grid;gap:16px;min-width:0;align-content:start}
@media (min-width:1024px){
  .inh-grid{grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:20px;align-items:start}
}

/* Cards */
.inh-box{
  background:var(--i-surface);border:1px solid var(--i-border);border-radius:26px;
  padding:clamp(16px,3.5vw,24px);min-width:0;transition:border-color .2s,box-shadow .2s;
}
@media (hover:hover){
  .inh-box:hover{border-color:color-mix(in srgb,var(--i-orange) 55%,var(--i-border));box-shadow:0 0 0 4px var(--i-ring)}
}
.inh-h2{display:flex;align-items:center;gap:10px;margin-bottom:16px;font-size:1rem;line-height:1.5;font-weight:800}
.inh-h2-flush{margin-bottom:0}
.inh-tile{
  width:36px;height:36px;border-radius:12px;flex:none;display:grid;place-items:center;
  background:var(--i-gloss);color:var(--i-on-orange);box-shadow:var(--i-gloss-shadow);
}
.inh-tile-sm{width:30px;height:30px;border-radius:10px}
.inh-stack{display:grid;gap:16px}
.inh-stack-lg{gap:20px}
.inh-two{display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr))}
@media (max-width:359px){.inh-two{grid-template-columns:minmax(0,1fr)}}

/* Fields */
.inh-label{display:block;margin-bottom:6px;padding:0;font-size:.8125rem;font-weight:700;color:var(--i-text-2)}
.inh-fieldset{border:0;margin:0;padding:0;min-width:0}
.inh-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.inh-input{
  width:100%;min-height:52px;padding:0 16px;border-radius:16px;border:1px solid var(--i-border);
  background:var(--i-surface-2);color:var(--i-text);font-size:1rem;font-weight:700;font-variant-numeric:tabular-nums;
  transition:border-color .2s,background .2s,box-shadow .2s;
}
.inh-input:focus{outline:none;background:var(--i-surface);border-color:var(--i-orange);box-shadow:0 0 0 4px var(--i-ring)}
.inh-center{text-align:center;padding:0 8px}
.inh-suffix-wrap{position:relative}
.inh-suffix-wrap .inh-input{padding-inline-end:64px;text-align:start}
.inh-suffix{position:absolute;inset-inline-end:14px;top:50%;transform:translateY(-50%);pointer-events:none;font-size:.75rem;font-weight:800;color:var(--i-muted)}
.inh-select-wrap{position:relative}
.inh-select{appearance:none;-webkit-appearance:none;padding-inline-start:44px;text-overflow:ellipsis;cursor:pointer}
.inh-select option{background:var(--i-surface);color:var(--i-text)}
.inh-chev{position:absolute;inset-inline-start:14px;top:50%;transform:translateY(-50%);pointer-events:none;display:grid;color:var(--i-muted)}
.inh input[type="number"]{-moz-appearance:textfield;appearance:textfield}
.inh input[type="number"]::-webkit-outer-spin-button,.inh input[type="number"]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}

/* Segmented */
.inh-seg{display:grid;gap:6px}
.inh-segbtn{
  min-height:48px;padding:0 8px;border-radius:16px;cursor:pointer;border:1px solid var(--i-border);
  background:var(--i-surface-2);font-size:.8125rem;font-weight:700;transition:border-color .2s,transform .2s;
}
.inh-segbtn:active{transform:scale(.97)}
@media (hover:hover){.inh-segbtn[aria-pressed="false"]:hover{border-color:var(--i-orange)}}
.inh-segbtn[aria-pressed="true"]{background:var(--i-gloss);border-color:transparent;color:var(--i-on-orange);box-shadow:var(--i-gloss-shadow)}

/* Stepper */
.inh-stepper{display:grid;grid-template-columns:48px minmax(0,1fr) 48px;gap:6px}
.inh-sbtn{
  height:52px;border-radius:16px;display:grid;place-items:center;cursor:pointer;
  border:1px solid var(--i-border);background:var(--i-surface-2);color:var(--i-text);transition:border-color .2s,transform .2s,opacity .2s;
}
.inh-sbtn:active{transform:scale(.93)}
.inh-sbtn:disabled{opacity:.4;cursor:not-allowed}
@media (hover:hover){.inh-sbtn:not(:disabled):hover{border-color:var(--i-orange)}}

/* Check card */
.inh-check{
  position:relative;display:flex;align-items:center;gap:10px;min-height:52px;padding:0 14px;border-radius:16px;cursor:pointer;
  border:1px solid var(--i-border);background:var(--i-surface-2);font-size:.8125rem;font-weight:700;transition:border-color .2s,background .2s;
}
.inh-check input{position:absolute;opacity:0;inset:0;width:100%;height:100%;margin:0;cursor:pointer}
.inh-check:focus-within{outline:2px solid var(--i-orange);outline-offset:3px}
.inh-check-box{width:22px;height:22px;border-radius:8px;flex:none;display:grid;place-items:center;border:1.5px solid var(--i-border);background:var(--i-surface);color:var(--i-on-orange)}
.inh-check.is-on{border-color:transparent;background:var(--i-gloss);color:var(--i-on-orange);box-shadow:var(--i-gloss-shadow)}
.inh-check.is-on .inh-check-box{background:var(--i-ink);border-color:var(--i-ink);color:var(--i-orange)}

/* Extended toggle */
.inh-toggle{
  display:flex;width:100%;align-items:center;justify-content:space-between;gap:12px;min-height:52px;padding:0 16px;
  border-radius:16px;cursor:pointer;text-align:start;border:1px dashed var(--i-border);background:transparent;
  font-size:.875rem;font-weight:700;transition:border-color .2s;
}
@media (hover:hover){.inh-toggle:hover{border-color:var(--i-orange)}}
.inh-toggle-state{display:inline-flex;align-items:center;gap:6px;font-size:.75rem;color:var(--i-muted);flex:none}
.inh-toggle-ico{display:grid;transition:transform .25s}
.inh-toggle-ico.is-open{transform:rotate(180deg)}
.inh-extended{display:grid;gap:16px;margin-top:12px;padding:16px;border-radius:20px;background:var(--i-surface-2);border:1px solid var(--i-border)}
.inh-hint,.inh-note{
  display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:16px;font-size:.8125rem;line-height:1.7;
  background:color-mix(in srgb,var(--i-orange) 10%,var(--i-surface));
  border:1px solid color-mix(in srgb,var(--i-orange) 35%,var(--i-border));
}
.inh-hint svg,.inh-note svg{flex:none;margin-top:3px;color:var(--i-orange)}
.inh-note{margin-top:10px;font-weight:700}

.inh-small{font-size:.78rem;color:var(--i-text-2);line-height:1.7}
.inh-bold{font-weight:700}

/* Mobile summary bar */
.inh-mini{
  position:sticky;bottom:12px;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:10px 12px 10px 14px;border-radius:20px;background:var(--i-ink);color:var(--i-ink-text);
  border:1px solid #2A2A2A;box-shadow:0 14px 30px -12px rgba(0,0,0,.55);
}
.inh-mini-l{min-width:0}
.inh-mini-k{display:block;font-size:.6875rem;opacity:.7}
.inh-mini-v{display:block;font-size:1.0625rem;font-weight:800;color:var(--i-orange);overflow-wrap:anywhere}
.inh-mini-a{
  flex:none;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border-radius:14px;
  background:var(--i-gloss);color:var(--i-on-orange);font-size:.8125rem;font-weight:800;text-decoration:none;
}
@media (min-width:1024px){.inh-mini{display:none}}

/* Result */
.inh-result{
  position:relative;overflow:hidden;border-radius:26px;padding:clamp(18px,4vw,28px);scroll-margin-top:16px;
  background:var(--i-gloss);color:var(--i-on-orange);
  box-shadow:0 18px 40px -18px rgba(255,91,4,.6),inset 0 1px 0 rgba(255,255,255,.5);
}
.inh-result::before{content:"";position:absolute;inset:0 0 55% 0;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.3),rgba(255,255,255,0))}
.inh-result::after{content:"";position:absolute;inset-inline-end:-54px;top:-54px;width:170px;height:170px;border:30px solid rgba(13,13,13,.07);border-radius:999px;pointer-events:none}
.inh-result > *{position:relative;z-index:1}
.inh-result-label{font-size:.8125rem;font-weight:800}
.inh-result-big{font-size:clamp(1.75rem,7vw,3rem);font-weight:800;line-height:1.15;letter-spacing:-.01em;margin:4px 0 16px;overflow-wrap:anywhere}
.inh-result-rows{border-top:1.5px solid rgba(13,13,13,.35)}
.inh-result-rows>div{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid rgba(13,13,13,.25);font-size:.875rem}
.inh-result-rows>div:last-child{border-bottom:0;padding-bottom:0}
.inh-result-rows dt{font-weight:600}
.inh-result-rows dd{font-weight:800;text-align:end;overflow-wrap:anywhere}

.inh-res-head{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;margin-bottom:16px}
.inh-copy{
  display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px;border-radius:16px;border:0;cursor:pointer;
  background:var(--i-ink);color:var(--i-ink-text);font-size:.8125rem;font-weight:800;transition:transform .2s;
}
.inh-copy:active{transform:scale(.97)}
[data-theme="dark"] .inh-copy,:root:not([data-theme="light"]) .inh-copy{border:1px solid var(--i-border)}

/* Status */
.inh-status{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:18px;margin-bottom:20px;font-size:.875rem;background:var(--i-surface-2);border:1px solid var(--i-border)}
.inh-status-ico{width:30px;height:30px;border-radius:10px;flex:none;display:grid;place-items:center;background:var(--i-ink);color:var(--i-ink-text)}
.inh-status[data-k="awl"]{background:color-mix(in srgb,var(--i-warning) 9%,var(--i-surface));border-color:color-mix(in srgb,var(--i-warning) 40%,var(--i-border))}
.inh-status[data-k="awl"] .inh-status-ico{background:var(--i-warning);color:var(--i-surface)}
.inh-status[data-k="radd"]{background:color-mix(in srgb,var(--i-orange) 10%,var(--i-surface));border-color:color-mix(in srgb,var(--i-orange) 40%,var(--i-border))}
.inh-status[data-k="radd"] .inh-status-ico{background:var(--i-gloss);color:var(--i-on-orange)}
.inh-status-title{font-weight:800;margin-bottom:2px}
.inh-status-note{color:var(--i-text-2);line-height:1.7}

/* Bar */
.inh-bar-wrap{margin-bottom:24px}
.inh-bar{display:flex;height:40px;margin-top:8px;border-radius:14px;overflow:hidden;background:var(--i-ink);padding:3px;gap:3px;border:1px solid var(--i-border)}
.inh-bar-seg{display:flex;align-items:center;justify-content:center;min-width:0;border-radius:10px;font-size:.75rem;font-weight:800}
[data-t="0"].inh-bar-seg,[data-t="0"].inh-chip{background:var(--i-gloss);color:var(--i-on-orange)}
[data-t="1"].inh-bar-seg,[data-t="1"].inh-chip{background:var(--i-text);color:var(--i-surface)}
[data-t="2"].inh-bar-seg,[data-t="2"].inh-chip{background:var(--i-surface-2);color:var(--i-text);box-shadow:inset 0 0 0 1px var(--i-border)}

/* Heirs */
.inh-empty{padding:40px 16px;text-align:center;font-weight:700;border-radius:20px;border:1px dashed var(--i-border);color:var(--i-text-2)}
.inh-list{display:grid;gap:12px}
.inh-heir{display:grid;gap:12px;padding:16px;border-radius:20px;background:var(--i-surface-2);border:1px solid var(--i-border);transition:border-color .2s}
@media (hover:hover){.inh-heir:hover{border-color:var(--i-orange)}}
@media (min-width:640px){.inh-heir{grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:20px}}
.inh-heir-main{display:flex;gap:12px;align-items:flex-start;min-width:0}
.inh-heir-text{min-width:0}
.inh-chip{display:inline-flex;flex:none;width:32px;height:32px;align-items:center;justify-content:center;border-radius:11px;font-size:.8125rem;font-weight:800}
.inh-heir-title{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:2px}
.inh-heir-title h3{font-size:1rem;font-weight:800;overflow-wrap:anywhere}
.inh-tag{display:inline-block;padding:1px 10px;border-radius:999px;font-size:.75rem;font-weight:800;line-height:1.7;white-space:nowrap;background:var(--i-ink);color:var(--i-ink-text)}
.inh-sub{display:inline-block;margin-top:8px;padding:6px 12px;border-radius:12px;font-size:.75rem;font-weight:700;line-height:1.7;background:var(--i-surface);border:1px solid var(--i-border);border-inline-start:4px solid var(--i-orange)}
.inh-amount{padding-top:12px;border-top:1px dashed var(--i-border);text-align:start}
@media (min-width:640px){.inh-amount{padding-top:0;border-top:0;text-align:end}}
.inh-amount-main{font-size:1.25rem;font-weight:800;overflow-wrap:anywhere}

/* Blocked */
.inh-blocked{margin-top:20px;padding:16px;border-radius:20px;border:1px dashed var(--i-border)}
.inh-blocked-title{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:.9rem;font-weight:800}
.inh-blocked ul{display:grid;gap:10px}
.inh-blocked li{display:flex;flex-wrap:wrap;gap:8px;align-items:baseline;font-size:.85rem;line-height:1.7}

/* Metrics */
.inh-metrics{display:grid;gap:10px;margin-top:24px;padding-top:20px;border-top:1px solid var(--i-border);grid-template-columns:repeat(2,minmax(0,1fr))}
@media (min-width:640px){.inh-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}}
.inh-metrics>div{padding:12px;border-radius:18px;text-align:center;background:var(--i-surface-2);border:1px solid var(--i-border);min-width:0}
.inh-metrics>div:last-child{grid-column:span 2}
@media (min-width:640px){.inh-metrics>div:last-child{grid-column:auto}}
.inh-metric{margin-top:2px;font-size:.95rem;font-weight:800;overflow-wrap:anywhere}

/* Disclaimer */
.inh-disclaimer{
  display:grid;gap:8px;padding:clamp(16px,3.5vw,22px);border-radius:26px;font-size:.85rem;line-height:1.8;color:var(--i-text-2);
  background:var(--i-surface);border:1px solid var(--i-border);border-inline-start:6px solid var(--i-orange);
}
.inh-disclaimer-title{display:flex;align-items:center;gap:10px;font-size:.95rem;font-weight:800;color:var(--i-text)}

@media (prefers-reduced-motion:reduce){
  .inh *,.inh *::before,.inh *::after{transition:none!important;animation:none!important}
}
@media print{
  .inh{padding:0;max-width:none}
  .inh-noprint{display:none!important}
  .inh-grid{display:block}
  .inh-result{background:#fff!important;color:#000!important;border:1.5px solid #000;box-shadow:none!important;margin-bottom:12px}
  .inh-result::before,.inh-result::after{display:none}
  .inh-result-rows,.inh-result-rows>div{border-color:#000!important}
  .inh-box,.inh-heir,.inh-disclaimer{break-inside:avoid;box-shadow:none!important}
  .inh-tag,.inh-chip,.inh-bar-seg{background:#000!important;color:#fff!important;box-shadow:none!important}
  .inh-bar{background:#fff!important}
}
`;