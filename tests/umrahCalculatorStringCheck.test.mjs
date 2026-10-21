import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../components/UmrahCalculator.jsx", import.meta.url),
  "utf8"
);

const expectedArabicStrings = [
  "تكلفة العمرة المتوقعة",
  "أداة حساب تكلفة العمرة",
  "باكستان",
  "مصر",
  "المملكة العربية السعودية",
  "الإمارات العربية المتحدة",
  "عدد البالغين",
  "عدد الأطفال",
  "عدد الأيام",
  "رمضان",
  "الفنادق",
  "خيارات إضافية",
  "خطة الوجبات",
  "بدون وجبات",
  "نصف إقامة",
  "إقامة كاملة",
  "تكلفة الطيران",
  "تكلفة التأشيرة",
  "تكلفة الفندق",
  "تكلفة الطعام",
  "تكلفة النقل",
  "تكلفة التسوق",
  "إجمالي تكلفة التأشيرات لجميع المسافرين",
  "النتيجة الإجمالية",
  "السعر للفرد",
  "تفصيل التكلفة",
  "ملاحظة",
];

test("Umrah Calculator displays expected Arabic UI strings", () => {
  const missing = expectedArabicStrings.filter((s) => !source.includes(s));
  assert.deepEqual(missing, [], `Missing Arabic strings: ${missing.join(", ")}`);
});

test("Umrah Calculator has no corrupted question-mark placeholders", () => {
  assert.equal(source.includes("???"), false, "Corrupted question-mark placeholders detected");
});

test("Umrah Calculator keeps RTL and React className attributes", () => {
  assert.match(source, /dir=["']rtl["']/);
  assert.equal(source.includes("class="), false, "React JSX class= attribute detected");
});

test("Umrah Calculator keeps currency symbols and avoids invalid hotel multiplier references", () => {
  for (const symbol of ["₨", "ر.س", "د.إ", "৳"]) {
    assert.ok(source.includes(symbol), `Missing currency symbol: ${symbol}`);
  }
  assert.ok(!source.includes("hotel.hotelMult"), "Unexpected undefined hotel multiplier reference");
});

test("Visa cost description correctly identifies total cost", () => {
  assert.ok(source.includes("{fmt((country?.visa || 0) * travelers, sym)} إجمالي تكلفة التأشيرات لجميع المسافرين"));
});
