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
  assert.match(calculator, /calculationBlockReason \? \(/);
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
  assert.match(calculator, /const \[customNoticeDays, setCustomNoticeDays\] = useState\(" "\)|const \[customNoticeDays, setCustomNoticeDays\] = useState\(" "\)/);
  assert.match(calculator, /const \[servedDaysInput, setServedDaysInput\] = useState\(" "\)|const \[servedDaysInput, setServedDaysInput\] = useState\(" "\)/);
  assert.match(calculator, /const \[lastWage, setLastWage\] = useState\(" "\)|const \[lastWage, setLastWage\] = useState\(" "\)/);
  assert.doesNotMatch(calculator, /setActualLastWorkingDate\(addDays\(newDate/);
});

test("date calculations use UAE-local today and timezone-independent Gregorian day math", () => {
  assert.match(calculator, /timeZone: "Asia\/Dubai"/);
  assert.match(calculator, /Date\.UTC\(year, month - 1, day \+ Number\(days\)\)/);
  assert.match(calculator, /Date\.UTC\(sy, sm - 1, sd\)/);
});

test("shared footer no longer advertises empty Coming Soon categories", () => {
  assert.doesNotMatch(layout, /قريباً في المنصة|upcoming\.map/);
});
