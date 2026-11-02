import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("homepage no longer promotes unfinished Coming Soon categories", () => {
  const home = read("app/page.js");
  assert.doesNotMatch(home, /قريباً في Qemlo|قيد التطوير|Compact Coming Soon Section/);
});

test("homepage explains the curated 15-tool entry point and the full 36-tool library", () => {
  const home = read("app/page.js");
  const browse = read("components/home/CategoryBrowseShowcase.jsx");
  const hero = read("components/home/HomeHero.jsx");
  const header = read("components/Header.jsx");

  assert.match(home, /15 أداة عربية مجانية مختارة من مكتبة Qemlo التي تضم 36 أداة/);
  assert.match(browse, /getToolCount\(\)/);
  assert.match(browse, /تضم المكتبة \{totalTools\.toLocaleString\("ar-EG"\)\} أداة/);
  assert.match(hero, /أداة مختارة/);
  assert.match(header, /أداة مختارة/);
});

test("contact form prepares an email and does not claim a message was received", () => {
  const form = read("app/contact/ContactForm.jsx");
  assert.match(form, /mailto:\$\{CONTACT_EMAIL\}/);
  assert.match(form, /window\.location\.href = mailtoUrl/);
  assert.doesNotMatch(form, /NEXT_PUBLIC_ENABLE_CONTACT/);
  assert.doesNotMatch(form, /تم استلام رسالتك بنجاح/);
  assert.match(form, /لن تُرسل الرسالة تلقائياً من الموقع/);
});

test("About and Contact pages use the same published support address", () => {
  const about = read("app/about/page.js");
  const contact = read("app/contact/ContactForm.jsx");
  assert.match(about, /CONTACT_EMAIL = "support@arabic-tools\.com"/);
  assert.match(contact, /CONTACT_EMAIL = "support@arabic-tools\.com"/);
});
