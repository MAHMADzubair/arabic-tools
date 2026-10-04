"use client";

import { useState, useMemo, useId } from "react";

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
        <button type="button" className="inh-btn" aria-label={`إنقاص: ${label}`} onClick={() => onChange(Math.max(0, value - 1))}>−</button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min="0"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="inh-input inh-center"
        />
        <button type="button" className="inh-btn" aria-label={`زيادة: ${label}`} onClick={() => onChange(value + 1)}>+</button>
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
            className="inh-btn"
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

// ─── Main component ────────────────────────────────────────────────────────────
export default function InheritanceCalculator() {
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

  // Calculation logic (unchanged)
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
      } else if (!hasChildren) {
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
            reason: "عصبة بالغير للذكر مثل حظ الأنثيين لعدم وجود فرع وارث ولا أب",
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
  const copySummary = () => {
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

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const statusTitle =
    calculation.statusType === "awl"
      ? "مسألة عائلة (العول)"
      : calculation.statusType === "radd"
      ? "مسألة فيها رد"
      : "حالة المسألة";

  const presets = [
    { k: "family_standard", label: "زوجة وأبناء وبنات وأبوان" },
    { k: "female_with_daughters", label: "متوفاة (زوج وبنات وأم)" },
    { k: "only_daughters", label: "بنات فقط مع والدين" },
    { k: "no_children", label: "زوجة ووالدان (دون أبناء)" },
  ];

  return (
    <div className="inh" dir="rtl">
      <style>{css}</style>

      {/* Header */}
      <header className="inh-head">
        <p className="inh-kicker">علم الفرائض والمواريث الإسلامية</p>
        <h1 className="inh-h1">حاسبة الميراث الشرعية</h1>
        <p className="inh-lead">
          احسب توزيع التركة بين الورثة وفق أحكام القرآن الكريم والسنة النبوية،
          مع مراعاة الفروض والعصبات والعول والرد وحجب الحرمان.
        </p>

        <div className="inh-presets" role="group" aria-label="نماذج جاهزة سريعة">
          <span className="inh-presets-label">نماذج جاهزة:</span>
          {presets.map((p) => (
            <button key={p.k} type="button" className="inh-btn" onClick={() => applyPreset(p.k)}>
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <div className="inh-grid">
        {/* ── Inputs ─────────────────────────────────────────────────────────── */}
        <div className="inh-col">
          <section className="inh-box" aria-labelledby="inh-s1">
            <h2 className="inh-h2" id="inh-s1">
              <span className="inh-num">1</span>
              <span>قيمة التركة والوصية</span>
            </h2>

            <div className="inh-stack">
              <div>
                <label className="inh-label" htmlFor={currencyId}>العملة</label>
                <select
                  id={currencyId}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="inh-input"
                >
                  {currencyOptions.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label} ({c.code})
                    </option>
                  ))}
                </select>
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
                placeholder="0"
              />

              <div>
                <Num
                  label="الوصية لغير وارث (الحد الأقصى الثلث)"
                  value={wasiyyah}
                  onChange={setWasiyyah}
                  placeholder="0"
                />
                {calculation.wasiyyahCapped && (
                  <p className="inh-note" role="status">
                    تنبيه: قُيّدت الوصية بالثلث شرعاً ({formatCurrency(calculation.maxAllowedWasiyyah, currency)}).
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="inh-box" aria-labelledby="inh-s2">
            <h2 className="inh-h2" id="inh-s2">
              <span className="inh-num">2</span>
              <span>بيانات المتوفى والورثة الأساسيين</span>
            </h2>

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
                  className="inh-btn inh-toggle"
                  aria-expanded={showExtended}
                  aria-controls="inh-extended"
                  onClick={() => setShowExtended(!showExtended)}
                >
                  <span>أقارب آخرون (أجداد، إخوة وأخوات)</span>
                  <span>{showExtended ? "إخفاء" : "إظهار"}</span>
                </button>

                {showExtended && (
                  <div id="inh-extended" className="inh-extended">
                    <p className="inh-small">
                      ملاحظة شرعية: يُحجب الإخوة والأخوات بوجود الأب أو الابن الذكر، ويُحجب الأجداد بوجود الآباء.
                    </p>

                    <div className="inh-two">
                      <label className="inh-check">
                        <input
                          type="checkbox"
                          checked={grandfatherAlive}
                          onChange={(e) => setGrandfatherAlive(e.target.checked)}
                        />
                        <span>الجد لأب حي</span>
                      </label>
                      <label className="inh-check">
                        <input
                          type="checkbox"
                          checked={grandmotherAlive}
                          onChange={(e) => setGrandmotherAlive(e.target.checked)}
                        />
                        <span>الجدة حية</span>
                      </label>
                    </div>

                    <div className="inh-two">
                      <Stepper label="الإخوة الأشقاء (ذكور)" value={fullBrothersCount} onChange={setFullBrothersCount} />
                      <Stepper label="الأخوات الشقيقات (إناث)" value={fullSistersCount} onChange={setFullSistersCount} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* ── Results ────────────────────────────────────────────────────────── */}
        <div className="inh-col">
          <section className="inh-result" aria-labelledby="inh-net-label" aria-live="polite">
            <p className="inh-result-label" id="inh-net-label">صافي التركة القابلة للقسمة</p>
            <p className="inh-result-big"><bdi>{formatCurrency(calculation.netEstate, currency)}</bdi></p>
            <dl className="inh-result-rows">
              <div><dt>إجمالي التركة</dt><dd><bdi>{formatCurrency(calculation.gross, currency)}</bdi></dd></div>
              <div><dt>الديون ومؤن التجهيز</dt><dd><bdi>{formatCurrency(calculation.debtVal, currency)}</bdi></dd></div>
              <div><dt>الوصية المنفذة</dt><dd><bdi>{formatCurrency(calculation.actualWasiyyah, currency)}</bdi></dd></div>
            </dl>
          </section>

          <section className="inh-box" aria-labelledby="inh-s3">
            <div className="inh-res-head">
              <h2 className="inh-h2 inh-h2-flush" id="inh-s3">جدول توزيع الأنصبة</h2>
              <button type="button" className="inh-btn" onClick={copySummary}>
                {copied ? "تم النسخ" : "نسخ التقرير"}
              </button>
            </div>
            <p className="inh-sr" role="status">{copied ? "تم نسخ التقرير" : ""}</p>

            <div className="inh-status" data-k={calculation.statusType}>
              <p className="inh-status-title">{statusTitle}</p>
              <p>{calculation.statusNote}</p>
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
                      <div>
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
                <h3 className="inh-blocked-title">المحجوبون من الميراث شرعاً (حجب حرمان)</h3>
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

          <aside className="inh-disclaimer" aria-labelledby="inh-d">
            <h3 id="inh-d" className="inh-disclaimer-title">تنبيه وإرشاد شرعي</h3>
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

// ─── Styles: Ink & Signal ──────────────────────────────────────────────────────
// Colors read the site's --c-* tokens when present, with the palette as fallback.
// Orange is only ever a background, always with black text.
const css = `
.inh{
  --i-bg:var(--c-bg,#F5F5F2);
  --i-ink:var(--c-ink,#0D0D0D);
  --i-mute:var(--c-mute,#55554F);
  --i-soft:var(--c-soft,#DEDED8);
  --i-accent:var(--c-accent,#FF6A1A);
  --i-on-accent:#0D0D0D;
  background:var(--i-bg);color:var(--i-ink);
  max-width:72rem;margin:0 auto;padding:2rem 1rem 3rem;line-height:1.6;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .inh{
    --i-bg:var(--c-bg,#0D0D0D);--i-ink:var(--c-ink,#F5F5F2);
    --i-mute:var(--c-mute,#B4B4AD);--i-soft:var(--c-soft,#2A2A27);
  }
}
:root[data-theme="dark"] .inh{
  --i-bg:var(--c-bg,#0D0D0D);--i-ink:var(--c-ink,#F5F5F2);
  --i-mute:var(--c-mute,#B4B4AD);--i-soft:var(--c-soft,#2A2A27);
}
.inh *{box-sizing:border-box}
.inh h1,.inh h2,.inh h3,.inh p,.inh dl,.inh dd,.inh ol,.inh ul{margin:0;padding:0}
.inh ol,.inh ul{list-style:none}
.inh button,.inh input,.inh select{font:inherit;color:inherit}
.inh :focus-visible{outline:3px solid var(--i-ink);outline-offset:2px}
.inh bdi{unicode-bidi:isolate;font-variant-numeric:tabular-nums}

.inh-head{margin-bottom:2rem;max-width:44rem}
.inh-kicker{font-size:.85rem;font-weight:700;color:var(--i-mute);margin-bottom:.35rem}
.inh-h1{font-size:clamp(2rem,5vw,3rem);font-weight:900;line-height:1.15;margin-bottom:.75rem}
.inh-lead{color:var(--i-mute);font-size:1rem;max-width:38rem}
.inh-presets{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-top:1.25rem}
.inh-presets-label{font-size:.8rem;font-weight:700;color:var(--i-mute)}

.inh-grid{display:grid;gap:1.5rem;grid-template-columns:minmax(0,1fr)}
@media (min-width:1024px){.inh-grid{grid-template-columns:minmax(0,5fr) minmax(0,7fr);align-items:start}}
.inh-col{display:grid;gap:1.5rem;min-width:0}

.inh-box{border:2px solid var(--i-ink);border-radius:4px;padding:1.25rem}
.inh-h2{display:flex;align-items:center;gap:.65rem;font-size:1.1rem;font-weight:800;margin-bottom:1rem}
.inh-h2-flush{margin-bottom:0}
.inh-num{display:inline-flex;flex:none;width:1.75rem;height:1.75rem;align-items:center;justify-content:center;background:var(--i-ink);color:var(--i-bg);font-size:.85rem;font-weight:800;border-radius:2px}
.inh-stack{display:grid;gap:1rem}
.inh-stack-lg{gap:1.25rem}
.inh-two{display:grid;gap:.75rem;grid-template-columns:repeat(2,minmax(0,1fr))}

.inh-label{display:block;font-size:.8rem;font-weight:700;margin-bottom:.35rem;padding:0}
.inh-fieldset{border:0;margin:0;padding:0;min-width:0}
.inh-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.inh-input{width:100%;border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);padding:.6rem .75rem;font-size:.95rem;font-weight:600;min-height:2.75rem}
.inh-center{text-align:center}
.inh-suffix-wrap{position:relative}
.inh-suffix-wrap .inh-input{padding-inline-end:3.5rem}
.inh-suffix{position:absolute;inset-inline-end:.75rem;top:50%;transform:translateY(-50%);font-size:.75rem;font-weight:700;color:var(--i-mute);pointer-events:none}

.inh-btn{border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);padding:.45rem .75rem;font-size:.8rem;font-weight:700;cursor:pointer;min-height:2.5rem}
.inh-btn:hover{background:var(--i-soft)}
.inh-btn[aria-pressed="true"]{background:var(--i-ink);color:var(--i-bg)}
.inh-seg{display:grid;gap:.4rem}
.inh-stepper{display:grid;grid-template-columns:2.75rem minmax(0,1fr) 2.75rem;gap:.4rem}
.inh-stepper .inh-btn{padding:0;font-size:1.1rem}
.inh-toggle{display:flex;width:100%;justify-content:space-between;align-items:center;border-style:dashed;text-align:start}
.inh-extended{display:grid;gap:1rem;margin-top:.75rem;border:2px solid var(--i-ink);border-radius:4px;padding:1rem}
.inh-check{display:flex;align-items:center;gap:.5rem;font-size:.85rem;font-weight:700;cursor:pointer}
.inh-check input{width:1.2rem;height:1.2rem;accent-color:var(--i-accent)}
.inh-small{font-size:.78rem;color:var(--i-mute)}
.inh-bold{font-weight:700}
.inh-note{margin-top:.5rem;border:2px dashed var(--i-ink);border-radius:4px;padding:.4rem .6rem;font-size:.8rem;font-weight:700}

.inh-result{background:var(--i-accent);color:var(--i-on-accent);border:2px solid var(--i-ink);border-radius:4px;padding:1.25rem 1.5rem}
.inh-result-label{font-size:.9rem;font-weight:700}
.inh-result-big{font-size:clamp(2rem,6vw,3.25rem);font-weight:900;line-height:1.15;margin:.25rem 0 1rem}
.inh-result-rows{border-top:2px solid var(--i-on-accent)}
.inh-result-rows>div{display:flex;justify-content:space-between;gap:1rem;padding:.5rem 0;border-bottom:1px solid var(--i-on-accent);font-size:.9rem}
.inh-result-rows>div:last-child{border-bottom:0;padding-bottom:0}
.inh-result-rows dt{font-weight:600}
.inh-result-rows dd{font-weight:800}

.inh-res-head{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:space-between;align-items:center;margin-bottom:1rem}
.inh-status{border:2px solid var(--i-ink);border-radius:4px;padding:.9rem 1rem;font-size:.9rem;margin-bottom:1.25rem}
.inh-status[data-k="awl"]{border-style:dashed;border-width:3px}
.inh-status[data-k="radd"]{border-style:double;border-width:5px}
.inh-status-title{font-weight:800;margin-bottom:.2rem}

.inh-bar-wrap{margin-bottom:1.5rem}
.inh-bar{display:flex;height:2.1rem;margin-top:.4rem;border:2px solid var(--i-ink);border-radius:4px;overflow:hidden}
.inh-bar-seg{display:flex;align-items:center;justify-content:center;min-width:0;font-size:.75rem;font-weight:800;border-inline-start:2px solid var(--i-bg)}
.inh-bar-seg:first-child{border-inline-start:0}
[data-t="0"].inh-bar-seg,[data-t="0"].inh-chip{background:var(--i-ink);color:var(--i-bg)}
[data-t="1"].inh-bar-seg,[data-t="1"].inh-chip{background:var(--i-accent);color:var(--i-on-accent)}
[data-t="2"].inh-bar-seg,[data-t="2"].inh-chip{background:var(--i-soft);color:var(--i-ink)}

.inh-empty{border:2px dashed var(--i-ink);border-radius:4px;padding:2.5rem 1rem;text-align:center;font-weight:700}
.inh-list{display:grid;gap:.9rem}
.inh-heir{display:grid;gap:.75rem;border:2px solid var(--i-ink);border-radius:4px;padding:1rem}
@media (min-width:640px){.inh-heir{grid-template-columns:minmax(0,1fr) auto;align-items:center}}
.inh-heir-main{display:flex;gap:.75rem;align-items:flex-start;min-width:0}
.inh-chip{display:inline-flex;flex:none;width:1.9rem;height:1.9rem;align-items:center;justify-content:center;border:2px solid var(--i-ink);border-radius:2px;font-size:.85rem;font-weight:800}
.inh-heir-title{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}
.inh-heir-title h3{font-size:1.05rem;font-weight:800}
.inh-tag{display:inline-block;border:2px solid var(--i-ink);border-radius:2px;padding:0 .45rem;font-size:.75rem;font-weight:700;line-height:1.5;white-space:nowrap}
.inh-sub{display:inline-block;margin-top:.4rem;border-inline-start:4px solid var(--i-ink);background:var(--i-soft);padding:.15rem .6rem;font-size:.75rem;font-weight:700}
.inh-amount{text-align:start}
@media (min-width:640px){.inh-amount{text-align:end}}
.inh-amount-main{font-size:1.25rem;font-weight:900}

.inh-blocked{margin-top:1.5rem;border:2px dashed var(--i-ink);border-radius:4px;padding:1rem}
.inh-blocked-title{font-size:.9rem;font-weight:800;margin-bottom:.6rem}
.inh-blocked ul{display:grid;gap:.5rem}
.inh-blocked li{display:flex;flex-wrap:wrap;gap:.5rem;align-items:baseline;font-size:.85rem}

.inh-metrics{display:grid;gap:.75rem;margin-top:1.75rem;padding-top:1.25rem;border-top:2px solid var(--i-ink);grid-template-columns:repeat(2,minmax(0,1fr))}
@media (min-width:640px){.inh-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}}
.inh-metrics>div{border:2px solid var(--i-ink);border-radius:4px;padding:.7rem;text-align:center}
.inh-metrics>div:last-child{grid-column:span 2}
@media (min-width:640px){.inh-metrics>div:last-child{grid-column:auto}}
.inh-metric{font-size:.95rem;font-weight:800}

.inh-disclaimer{border:2px solid var(--i-ink);border-inline-start-width:8px;border-radius:4px;padding:1rem 1.25rem;display:grid;gap:.5rem;font-size:.85rem}
.inh-disclaimer-title{font-size:.95rem;font-weight:800}
`;