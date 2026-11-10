import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const calculator = fs.readFileSync("components/UaeNoticePeriodCalculator.jsx", "utf8");
const page = fs.readFileSync("app/ar/ae/notice-period-calculator/page.js", "utf8");
const layout = fs.readFileSync("app/layout.js", "utf8");

test("UAE notice estimates stop for unsupported legal scopes", () => {
  assert.match(calculator, /isPrivateSector !== "yes"/);
  assert.match(calculator, /const \[isPrivateSector, setIsPrivateSector\] = useState\("unsure"\)/);
  assert.match(calculator, /const \[isProbation, setIsProbation\] = useState\("unsure"\)/);
  assert.match(calculator, /if \(isProbation !== "no"\)/);
  assert.match(calculator, /isDifcAdgm !== "no"/);
  assert.match(calculator, /isExcludedCategory !== "no"/);
  assert.match(calculator, /isProbation === "yes"/);
  assert.match(calculator, /noticeValidation\.msg/);
  assert.match(calculator, /const blocked = Boolean\(calculationBlockReason\)/);
});

test("written waiver does not silently turn the allowance into zero", () => {
  assert.doesNotMatch(calculator, /if \(isMutualWaiver\) return 0/);
  assert.match(calculator, /لا يعني ذلك تلقائياً أن بدل الإنذار يساوي صفراً/);
  assert.match(page, /لا يعني الإعفاء تلقائياً سقوط جميع الحقوق/);
});

test("the party who breached notice is separate from the party who initiated termination", () => {
  assert.match(calculator, /terminationInitiator/);
  assert.match(calculator, /nonCompliantParty/);
  assert.match(calculator, /nonCompliantParty === "unsure"/);
  assert.match(calculator, /useState\("unsure"\)/);
  assert.match(calculator, /id: "unsure", label: "غير متأكد"/);
  assert.match(calculator, /return nonCompliantParty === "employer" \? "to_employee" : "to_employer"/);
  assert.match(calculator, /الطرف الذي لم يلتزم بالإنذار/);
});

test("the calculator declares its monthly-wage-only scope and official legal sources", () => {
  assert.match(calculator, /هذه النسخة تدعم الأجر الشهري فقط/);
  assert.match(page, /المادة \(43\/4\)/);
  assert.match(page, /المادة \(67\)/);
  assert.match(page, /https:\/\/www\.mohre\.gov\.ae\/assets\/download/);
  assert.match(page, /https:\/\/uaelegislation\.gov\.ae\/en\/legislations\/1541/);
  assert.match(page, /العمالة المنزلية/);
  assert.match(page, /terminating-employment-contracts/);
});

test("the calculator does not prefill assumed salary, notice length, service days or actual last date", () => {
  assert.match(calculator, /const \[contractNoticePreset, setContractNoticePreset\] = useState\("custom"\)/);
  assert.match(calculator, /const \[customNoticeDays, setCustomNoticeDays\] = useState\("+"\)/);
  assert.match(calculator, /const \[servedDaysInput, setServedDaysInput\] = useState\("+"\)/);
  assert.match(calculator, /const \[lastWage, setLastWage\] = useState\("+"\)/);
  assert.match(calculator, /const \[actualLastWorkingDate, setActualLastWorkingDate\] = useState\("+"\)/);
  assert.doesNotMatch(calculator, /setActualLastWorkingDate\(addDays\(newDate/);
});

test("date calculations use timezone-independent Gregorian day math and require the actual notice date", () => {
  assert.match(calculator, /const \[noticeStartDate, setNoticeStartDate\] = useState\("+"\)/);
  assert.match(calculator, /if \(!noticeStartDate\) return/);
  assert.match(calculator, /Date\.UTC\(year, month - 1, day \+ Number\(days\)\)/);
  assert.match(calculator, /Date\.UTC\(sy, sm - 1, sd\)/);
});

test("Article 35 leave timing and Articles 44–45 no-notice cases are explicitly gated", () => {
  assert.match(calculator, /const \[isTerminationDuringLeave, setIsTerminationDuringLeave\] = useState\("unsure"\)/);
  assert.match(calculator, /if \(isTerminationDuringLeave !== "no"\)/);
  assert.match(calculator, /وفق المادة \(35\)/);
  assert.match(calculator, /const \[isNoNoticeStatutoryCase, setIsNoNoticeStatutoryCase\] = useState\("unsure"\)/);
  assert.match(calculator, /if \(isNoNoticeStatutoryCase !== "no"\)/);
  assert.match(calculator, /المادة \(44\).*المادة \(45\)/);
  assert.match(page, /كيف تؤثر الإجازة على بدء فترة الإنذار/);
  assert.match(page, /هل تشمل الحاسبة حالات الفصل أو ترك العمل دون إنذار/);
});

test("negative and malformed user-entered numbers are rejected before calculation", () => {
  assert.match(calculator, /function isInvalidNumericInput\(value\)/);
  assert.match(calculator, /isInvalidNumericInput\(servedDaysInput\)/);
  assert.match(calculator, /isInvalidNumericInput\(lastWage\)/);
  assert.match(calculator, /لا يمكن أن تكون الأيام المنفذة سالبة/);
});

test("full notice completion does not require a breach-party choice or wage for a zero allowance", () => {
  assert.match(calculator, /remainingNoticeDays > 0 && nonCompliantParty === "unsure"/);
  assert.match(calculator, /remainingNoticeDays > 0 && wage <= 0/);
});

test("the Article 43(5) job-search absence note is shown only for employer termination", () => {
  assert.match(calculator, /\{terminationInitiator === "employer" && \(/);
  assert.doesNotMatch(calculator, /\{terminationInitiator !== "employee" && \(/);
});

test("example presets provide a real local notice date and clear stale date-mode inputs", () => {
  assert.match(calculator, /function currentLocalDateISO\(\)/);
  assert.match(calculator, /setNoticeStartDate\(currentLocalDateISO\(\)\)/);
  assert.match(calculator, /setActualLastWorkingDate\("+"\)/);
});

test("shared footer no longer advertises empty Coming Soon categories", () => {
  assert.doesNotMatch(layout, /قريباً في المنصة|upcoming\.map/);
});
