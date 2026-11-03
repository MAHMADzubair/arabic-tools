import { render, screen, fireEvent, within, cleanup } from "@testing-library/react";
import { strict as assert } from "assert";
import { test, afterEach } from "node:test";
import React from "react";
import UaeNoticePeriodCalculator from "../components/UaeNoticePeriodCalculator.jsx";

afterEach(() => cleanup());

const labels = {
  privateSector: "هل تعمل في القطاع الخاص الخاضع لقانون العمل الإماراتي؟",
  excluded: "هل تعمل في العمالة المنزلية أو القوات المسلحة أو الشرطة أو الأمن؟",
  difc: "هل تعمل في DIFC أو ADGM؟",
  probation: "هل الموظف لا يزال في فترة التجربة؟",
  leave: "هل تم تقديم إشعار إنهاء العقد أثناء إجازة العامل؟",
  noNotice: "هل تعتمد الحالة على حق إنهاء دون إنذار وفق المادة (44) أو (45)؟",
  initiator: "من بدأ إنهاء عقد العمل؟",
  breach: "من الطرف الذي لم يلتزم بإكمال فترة الإنذار؟",
  noticeDays: "فترة الإنذار المتفق عليها",
};

function clickInGroup(groupLabel, optionText) {
  const group = screen.getByRole("group", { name: groupLabel });
  fireEvent.click(within(group).getByRole("button", { name: optionText }));
}

function setInput(label, value) {
  fireEvent.change(screen.getByLabelText(label), {
    target: { value: String(value) },
  });
}

function configureScope({ leave = "لا", noNotice = "لا", initiator, breach } = {}) {
  clickInGroup(labels.privateSector, "نعم");
  clickInGroup(labels.excluded, "لا");
  clickInGroup(labels.difc, "لا");
  clickInGroup(labels.probation, "لا");
  clickInGroup(labels.leave, leave);
  clickInGroup(labels.noNotice, noNotice);
  if (initiator) clickInGroup(labels.initiator, initiator);
  if (breach) clickInGroup(labels.breach, breach);
}

function setCalculationInputs({
  noticeDays = "60",
  noticeDate = "2026-11-01",
  servedDays = "40",
  wage = "9000",
} = {}) {
  clickInGroup(labels.noticeDays, `${noticeDays} يوماً`);
  setInput("تاريخ تقديم الإشعار / الاستقالة", noticeDate);
  setInput("عدد الأيام المنفذة", servedDays);
  if (wage !== null) setInput(/آخر أجر شهري إجمالي/, wage);
}

function blockedMessage(container) {
  return container.querySelector('.nc-result [role="status"]')?.textContent ?? "";
}

function resultBanner(container) {
  return container.querySelector(".nc-result .nc-banner");
}

test("negative days served are blocked instead of being silently treated as zero", () => {
  const { container } = render(React.createElement(UaeNoticePeriodCalculator));
  configureScope({ breach: "الموظف" });
  setCalculationInputs({ servedDays: "-5" });

  assert.match(blockedMessage(container), /الأيام المنفذة سالبة/);
  assert.equal(resultBanner(container), null);
});

test("completed notice returns zero without requiring an unknown breach party or salary", () => {
  const { container } = render(React.createElement(UaeNoticePeriodCalculator));
  configureScope(); // Leave the breaching-party selector at its safe default: unsure.
  setCalculationInputs({ servedDays: "60", wage: null });

  const banner = resultBanner(container);
  assert.ok(banner, blockedMessage(container));
  assert.match(banner.textContent, /تم تنفيذ فترة الإنذار كاملة/);
  assert.match(banner.textContent, /لا تعويض مالي مستحق/);
});

test("an unknown breaching party still blocks a positive remaining-notice estimate", () => {
  const { container } = render(React.createElement(UaeNoticePeriodCalculator));
  configureScope();
  setCalculationInputs();

  assert.match(blockedMessage(container), /حدد الطرف الذي لم يلتزم بإكمال فترة الإنذار/);
  assert.equal(resultBanner(container), null);
});

test("notice given during leave is blocked with the Article 35 timing rule", () => {
  const { container } = render(React.createElement(UaeNoticePeriodCalculator));
  configureScope({ leave: "نعم" });

  assert.match(blockedMessage(container), /المادة \(35\)/);
  assert.match(blockedMessage(container), /اليوم التالي لموعد العودة المجدول/);
  assert.equal(resultBanner(container), null);
});

test("a claimed Article 44 or Article 45 no-notice case is not processed as an Article 43 estimate", () => {
  const { container } = render(React.createElement(UaeNoticePeriodCalculator));
  configureScope({ noNotice: "نعم" });

  assert.match(blockedMessage(container), /المادة \(44\).*المادة \(45\)/);
  assert.equal(resultBanner(container), null);
});

test("the Article 43(5) job-search absence note is not shown when the termination initiator is unknown", () => {
  const { container } = render(React.createElement(UaeNoticePeriodCalculator));
  configureScope({ breach: "الموظف" }); // The initiator remains unsure.
  setCalculationInputs();

  assert.ok(resultBanner(container));
  assert.doesNotMatch(container.textContent, /ملاحظة \(المادة 43 - البند 5\)/);
});

test("the Article 43(5) job-search absence note is shown when the employer initiated termination", () => {
  const { container } = render(React.createElement(UaeNoticePeriodCalculator));
  configureScope({ initiator: "صاحب العمل", breach: "صاحب العمل" });
  setCalculationInputs({ noticeDays: "30", servedDays: "10", wage: "12000" });

  assert.ok(resultBanner(container));
  assert.match(container.textContent, /ملاحظة \(المادة 43 - البند 5\)/);
});

test("example preset 1 fills a real notice date and renders its zero-allowance result", () => {
  const { container } = render(React.createElement(UaeNoticePeriodCalculator));
  fireEvent.click(screen.getByRole("button", { name: /مثال 1: استقالة وتنفيذ كامل/ }));

  assert.ok(container.querySelector("#nc-start")?.value);
  const banner = resultBanner(container);
  assert.ok(banner, blockedMessage(container));
  assert.match(banner.textContent, /تم تنفيذ فترة الإنذار كاملة/);
  assert.match(banner.textContent, /لا تعويض مالي مستحق/);
});
