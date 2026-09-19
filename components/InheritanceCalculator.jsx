"use client";

import { useState, useMemo } from "react";

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
  return `${amount.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export default function InheritanceCalculator() {
  // Estate state
  const [totalEstate, setTotalEstate] = useState("1000000");
  const [debts, setDebts] = useState("0");
  const [wasiyyah, setWasiyyah] = useState("0");
  const [currency, setCurrency] = useState("SAR");

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

  // Calculation logic
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
          color: "bg-rose-500",
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
          color: "bg-blue-500",
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
        color: "bg-emerald-500",
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
        color: "bg-teal-500",
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
          color: "bg-amber-500",
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
          color: "bg-amber-500",
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
          color: "bg-amber-500",
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
          color: "bg-amber-600",
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
          color: "bg-amber-600",
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
          color: "bg-amber-600",
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
        color: "bg-pink-500",
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
          color: "bg-indigo-500",
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
            color: "bg-indigo-500",
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
            color: "bg-indigo-500",
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
          color: "bg-violet-600",
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
          color: "bg-violet-600",
        });
      }
    }

    // Calculation of Amounts, Awl, and Radd
    // Sum of fixed shares (أصحاب الفروض)
    const fixedSharesSum = heirs
      .filter((h) => !h.isAsaba || h.fatherDualMode)
      .reduce((sum, h) => sum + h.shareFraction, 0);

    const hasAnyAsaba = heirs.some((h) => h.isAsaba);

    let statusType = "normal"; // 'normal' | 'awl' | 'radd' | 'asaba_full'
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
          "مسألة فيها رد: زادت التركة عن فروض الورثة ولا يوجد عصبة، فرُدَّ الباقي على ذوي الفروض عدا الزوجين حسب الراجح فقهياً.";
        
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
    let summary = `📋 تقرير قسمة الميراث الشرعي\n`;
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

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 text-center sm:mb-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark">
          <span>⚖️</span>
          <span>علم الفرائض والمواريث الإسلامية</span>
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-ink sm:text-5xl">
          حاسبة الميراث الشرعية
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
          احسب توزيع التركة بين الورثة بدقة وفقاً لأحكام القرآن الكريم والسنة النبوية،
          مع مراعاة الفروض والعصبات والعول والرد وحجب الحرمان.
        </p>

        {/* Quick Presets */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-bold text-ink-muted">نماذج جاهزة سريعة:</span>
          <button
            onClick={() => applyPreset("family_standard")}
            className="rounded-lg border border-brand-border bg-white px-3 py-1 text-xs font-semibold text-ink-secondary transition hover:border-brand hover:text-brand"
          >
            زوجة وأبناء وبنات وأبوان
          </button>
          <button
            onClick={() => applyPreset("female_with_daughters")}
            className="rounded-lg border border-brand-border bg-white px-3 py-1 text-xs font-semibold text-ink-secondary transition hover:border-brand hover:text-brand"
          >
            متوفاة (زوج وبنات وأم)
          </button>
          <button
            onClick={() => applyPreset("only_daughters")}
            className="rounded-lg border border-brand-border bg-white px-3 py-1 text-xs font-semibold text-ink-secondary transition hover:border-brand hover:text-brand"
          >
            بنات فقط مع والدين
          </button>
          <button
            onClick={() => applyPreset("no_children")}
            className="rounded-lg border border-brand-border bg-white px-3 py-1 text-xs font-semibold text-ink-secondary transition hover:border-brand hover:text-brand"
          >
            زوجة ووالدان (دون أبناء)
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left / Top form controls (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Card 1: Estate & Currency */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand text-sm">
                💰
              </span>
              <span>قيمة التركة والوصية</span>
            </h2>

            <div className="space-y-4">
              {/* Currency selector */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink-secondary">
                  العملة
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  {currencyOptions.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Total Estate */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink-secondary">
                  إجمالي قيمة التركة (أموال، عقارات، أصول)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={totalEstate}
                    onChange={(e) => setTotalEstate(e.target.value)}
                    placeholder="مثال: 500000"
                    className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-base font-bold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  <span className="absolute left-3 top-3 text-xs font-bold text-ink-muted">
                    {currency}
                  </span>
                </div>
              </div>

              {/* Debts */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink-secondary">
                  الديون وتكاليف الجنازة (تُخصم أولاً شرعاً)
                </label>
                <input
                  type="number"
                  min="0"
                  value={debts}
                  onChange={(e) => setDebts(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              {/* Wasiyyah */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-bold text-ink-secondary">
                    الوصية لغير وارث (الحد الأقصى الثلث)
                  </label>
                  {calculation.wasiyyahCapped && (
                    <span className="text-[11px] font-semibold text-amber-600">
                      قُيّدت بالثلث شرعاً
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="0"
                  value={wasiyyah}
                  onChange={(e) => setWasiyyah(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              {/* Net estate badge */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-center">
                <p className="text-xs font-bold text-emerald-800">صافي التركة الموزعة</p>
                <p className="text-xl font-extrabold text-emerald-700 sm:text-2xl">
                  {formatCurrency(calculation.netEstate, currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Deceased Info & Primary Relatives */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand text-sm">
                👤
              </span>
              <span>بيانات المتوفى والورثة الأساسيين</span>
            </h2>

            <div className="space-y-5">
              {/* Gender selector */}
              <div>
                <label className="mb-2 block text-xs font-bold text-ink-secondary">
                  المتوفى هو:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeceasedGender("male")}
                    className={`rounded-xl border p-2.5 text-center font-bold text-sm transition ${
                      deceasedGender === "male"
                        ? "border-brand bg-brand text-white shadow-sm"
                        : "border-brand-border bg-white text-ink hover:bg-brand-surface"
                    }`}
                  >
                    ذكر (رجل)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeceasedGender("female")}
                    className={`rounded-xl border p-2.5 text-center font-bold text-sm transition ${
                      deceasedGender === "female"
                        ? "border-brand bg-brand text-white shadow-sm"
                        : "border-brand-border bg-white text-ink hover:bg-brand-surface"
                    }`}
                  >
                    أنثى (امرأة)
                  </button>
                </div>
              </div>

              {/* Spouse input */}
              {deceasedGender === "male" ? (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink-secondary">
                    عدد الزوجات على قيد الحياة
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[0, 1, 2, 3, 4].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setWivesCount(count)}
                        className={`rounded-lg border py-2 text-xs font-bold transition ${
                          wivesCount === count
                            ? "border-brand bg-brand-light text-brand-dark ring-2 ring-brand/30"
                            : "border-brand-border bg-white text-ink hover:bg-brand-surface"
                        }`}
                      >
                        {count === 0 ? "لا توجد" : count}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink-secondary">
                    هل الزوج على قيد الحياة؟
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHusbandAlive(true)}
                      className={`rounded-lg border py-2 text-xs font-bold transition ${
                        husbandAlive
                          ? "border-brand bg-brand-light text-brand-dark ring-2 ring-brand/30"
                          : "border-brand-border bg-white text-ink hover:bg-brand-surface"
                      }`}
                    >
                      نعم (حي)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHusbandAlive(false)}
                      className={`rounded-lg border py-2 text-xs font-bold transition ${
                        !husbandAlive
                          ? "border-brand bg-brand-light text-brand-dark ring-2 ring-brand/30"
                          : "border-brand-border bg-white text-ink hover:bg-brand-surface"
                      }`}
                    >
                      متوفى
                    </button>
                  </div>
                </div>
              )}

              {/* Parents */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-brand-border p-3">
                  <span className="text-xs font-bold text-ink">الأب</span>
                  <div className="mt-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setFatherAlive(true)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                        fatherAlive
                          ? "bg-brand text-white"
                          : "bg-brand-surface text-ink-secondary hover:bg-brand-border"
                      }`}
                    >
                      حي
                    </button>
                    <button
                      type="button"
                      onClick={() => setFatherAlive(false)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                        !fatherAlive
                          ? "bg-ink-secondary text-white"
                          : "bg-brand-surface text-ink-secondary hover:bg-brand-border"
                      }`}
                    >
                      متوفى
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border p-3">
                  <span className="text-xs font-bold text-ink">الأم</span>
                  <div className="mt-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setMotherAlive(true)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                        motherAlive
                          ? "bg-brand text-white"
                          : "bg-brand-surface text-ink-secondary hover:bg-brand-border"
                      }`}
                    >
                      حية
                    </button>
                    <button
                      type="button"
                      onClick={() => setMotherAlive(false)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                        !motherAlive
                          ? "bg-ink-secondary text-white"
                          : "bg-brand-surface text-ink-secondary hover:bg-brand-border"
                      }`}
                    >
                      متوفاة
                    </button>
                  </div>
                </div>
              </div>

              {/* Children (Sons and Daughters) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink-secondary">
                    عدد الأبناء (الذكور)
                  </label>
                  <div className="flex items-center rounded-xl border border-brand-border bg-brand-surface">
                    <button
                      type="button"
                      onClick={() => setSonsCount((s) => Math.max(0, s - 1))}
                      className="px-3 py-2 text-base font-bold text-ink hover:text-brand"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={sonsCount}
                      onChange={(e) => setSonsCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-center text-sm font-bold text-ink focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSonsCount((s) => s + 1)}
                      className="px-3 py-2 text-base font-bold text-ink hover:text-brand"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink-secondary">
                    عدد البنات (الإناث)
                  </label>
                  <div className="flex items-center rounded-xl border border-brand-border bg-brand-surface">
                    <button
                      type="button"
                      onClick={() => setDaughtersCount((d) => Math.max(0, d - 1))}
                      className="px-3 py-2 text-base font-bold text-ink hover:text-brand"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={daughtersCount}
                      onChange={(e) => setDaughtersCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-center text-sm font-bold text-ink focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setDaughtersCount((d) => d + 1)}
                      className="px-3 py-2 text-base font-bold text-ink hover:text-brand"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Extended Relatives Accordion Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowExtended(!showExtended)}
                  className="flex w-full items-center justify-between rounded-xl border border-dashed border-brand-border p-3 text-xs font-bold text-ink hover:bg-brand-surface"
                >
                  <span className="flex items-center gap-2">
                    <span>➕</span>
                    <span>أقارب آخرون (أجداد، إخوة وأخوات)</span>
                  </span>
                  <span>{showExtended ? "▲ إخفاء" : "▼ إظهار"}</span>
                </button>

                {showExtended && (
                  <div className="mt-3 space-y-4 rounded-xl border border-brand-border bg-brand-surface/40 p-4">
                    <p className="text-[11px] text-ink-muted leading-relaxed">
                      ملاحظة شرعية: يُحجب الإخوة والأخوات بوجود الأب أو الابن الذكر، ويُحجب الأجداد بوجود الآباء.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 text-xs font-semibold text-ink">
                        <input
                          type="checkbox"
                          checked={grandfatherAlive}
                          onChange={(e) => setGrandfatherAlive(e.target.checked)}
                          className="h-4 w-4 rounded text-brand focus:ring-brand"
                        />
                        <span>الجد لأب حي</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-semibold text-ink">
                        <input
                          type="checkbox"
                          checked={grandmotherAlive}
                          onChange={(e) => setGrandmotherAlive(e.target.checked)}
                          className="h-4 w-4 rounded text-brand focus:ring-brand"
                        />
                        <span>الجدة حية</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-ink-secondary">
                          الإخوة الأشقاء (ذكور)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={fullBrothersCount}
                          onChange={(e) => setFullBrothersCount(parseInt(e.target.value) || 0)}
                          className="w-full rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-xs text-ink focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-ink-secondary">
                          الأخوات الشقيقات (إناث)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={fullSistersCount}
                          onChange={(e) => setFullSistersCount(parseInt(e.target.value) || 0)}
                          className="w-full rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-xs text-ink focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right / Bottom results display (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Main Results Card */}
          <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-card sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-block rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand-dark">
                  نتيجة القسمة الشرعية
                </span>
                <h2 className="mt-1 text-2xl font-black text-ink">
                  جدول توزيع الأنصبة
                </h2>
              </div>

              <button
                onClick={copySummary}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-bold text-brand transition hover:bg-brand-100"
              >
                <span>{copied ? "✓ تم النسخ بنجاح!" : "📋 نسخ التقرير"}</span>
              </button>
            </div>

            {/* Status Banner */}
            <div
              className={`mb-6 rounded-2xl border p-4 text-xs font-semibold leading-relaxed sm:text-sm ${
                calculation.statusType === "awl"
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : calculation.statusType === "radd"
                  ? "border-teal-200 bg-teal-50 text-teal-900"
                  : "border-brand-border bg-brand-surface text-ink"
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                <span>{calculation.statusType === "awl" ? "⚠️" : calculation.statusType === "radd" ? "🔄" : "✨"}</span>
                <span>
                  {calculation.statusType === "awl"
                    ? "مسألة عائلة (العول)"
                    : calculation.statusType === "radd"
                    ? "مسألة فيها رد"
                    : "حالة المسألة: مطابقة للشريعة"}
                </span>
              </div>
              <p>{calculation.statusNote}</p>
            </div>

            {/* Visual distribution bar */}
            {calculation.heirs.length > 0 && (
              <div className="mb-8">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-ink-secondary">
                  <span>التوزيع النسبي للتركة</span>
                  <span>100%</span>
                </div>
                <div className="flex h-5 w-full overflow-hidden rounded-full bg-gray-100 p-0.5 shadow-inner">
                  {calculation.heirs.map((h, i) => (
                    <div
                      key={i}
                      style={{ width: `${Math.max(2, h.percentage)}%` }}
                      className={`h-full ${h.color} transition-all duration-300 first:rounded-r-full last:rounded-l-full relative group cursor-pointer`}
                      title={`${h.title}: ${h.percentage.toFixed(1)}%`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Heirs Cards list */}
            {calculation.heirs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-brand-border py-12 text-center text-ink-muted">
                <span className="text-4xl">⚖️</span>
                <p className="mt-2 text-sm font-bold">يرجى تحديد ورثة على قيد الحياة لإظهار الأنصبة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {calculation.heirs.map((h, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 shadow-sm transition hover:border-brand hover:shadow-md sm:p-5"
                  >
                    {/* Colored side stripe */}
                    <div className={`absolute top-0 right-0 h-full w-1.5 ${h.color}`} />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {/* Heir title and reason */}
                      <div className="pr-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-ink sm:text-lg">
                            {h.title}
                          </h3>
                          <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand-dark">
                            {h.shareLabel}
                          </span>
                          <span className="text-xs font-bold text-ink-muted">
                            ({h.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-ink-secondary">
                          {h.reason}
                        </p>
                        {h.subBreakdown && (
                          <p className="mt-1.5 inline-block rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                            {h.subBreakdown}
                          </p>
                        )}
                      </div>

                      {/* Amounts */}
                      <div className="text-left sm:shrink-0">
                        <p className="text-lg font-black text-brand-dark sm:text-xl">
                          {formatCurrency(h.amount, currency)}
                        </p>
                        {h.count > 1 && h.perPerson && !h.subBreakdown && (
                          <p className="text-xs font-semibold text-ink-muted">
                            لكل فرد: {formatCurrency(h.perPerson, currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Blocked Heirs note if any */}
            {calculation.blockedHeirs.length > 0 && (
              <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <span>🚫</span>
                  <span>المحجوبون من الميراث شرعاً (حجب حرمان):</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {calculation.blockedHeirs.map((b, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 shadow-sm"
                    >
                      <span className="font-bold">{b.title}:</span>
                      <span className="text-[11px] text-rose-600">{b.reason}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Summary metrics footer */}
            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-brand-border pt-6 sm:grid-cols-3">
              <div className="rounded-xl bg-brand-surface p-3 text-center">
                <p className="text-[11px] font-bold text-ink-muted">إجمالي التركة</p>
                <p className="text-sm font-extrabold text-ink">
                  {formatCurrency(calculation.gross, currency)}
                </p>
              </div>
              <div className="rounded-xl bg-brand-surface p-3 text-center">
                <p className="text-[11px] font-bold text-ink-muted">إجمالي الموزع</p>
                <p className="text-sm font-extrabold text-brand">
                  {formatCurrency(calculation.totalDistributed, currency)}
                </p>
              </div>
              <div className="col-span-2 rounded-xl bg-brand-surface p-3 text-center sm:col-span-1">
                <p className="text-[11px] font-bold text-ink-muted">عدد الأصناف الوارثة</p>
                <p className="text-sm font-extrabold text-ink">
                  {calculation.heirs.length} فئات مستحقة
                </p>
              </div>
            </div>
          </div>

          {/* Shariah Guide & Disclaimer Box */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 text-ink-secondary shadow-sm">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-900">
              <span>📜</span>
              <span>تنبيه وإرشاد شرعي هام:</span>
            </h4>
            <p className="text-xs leading-relaxed text-amber-800">
              تم بناء هذه الحاسبة وفق القواعد المعتمدة في الفقه الإسلامي ومذهب جمهور العلماء في علم الفرائض والمواريث، بما في ذلك أحكام الفروض المقدرة (النصف، الربع، الثمن، الثلثان، الثلث، السدس) والتعصيب، والعول، والرد.
              <br className="my-1" />
              هذه الأداة مخصصة للحساب والتعليم وتيسير فهم الأنصبة. في حالات التركات ذات النزاعات أو الإشكالات القضائية والوصايا المعقدة، يُرجى الرجوع إلى المحاكم الشرعية أو الهيئات الإفتائية المعتمدة في بلدك.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
