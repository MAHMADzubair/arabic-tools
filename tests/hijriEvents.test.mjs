import test from "node:test";
import assert from "node:assert/strict";
import { ramadanSeason, daysUntil, toHijri } from "../lib/hijriEvents.js";

const iso = (d) => d.toISOString().slice(0, 10);

test("Ramadan 1448 matches the Umm al-Qura calendar", () => {
  const s = ramadanSeason(new Date("2026-11-11T08:00:00Z"));
  assert.equal(s.hijriYear, 1448);
  assert.equal(iso(s.ramadanStart), "2027-02-08");
  assert.equal(iso(s.laylat27), "2027-03-06");
  assert.equal(iso(s.eidFitr), "2027-03-09");
  assert.equal(iso(s.arafah), "2027-05-15");
  assert.equal(iso(s.eidAdha), "2027-05-16");
});

test("days until Ramadan from 11 Nov 2026 is 89", () => {
  const now = new Date("2026-11-11T08:00:00Z");
  assert.equal(daysUntil(ramadanSeason(now).ramadanStart, now), 89);
});

test("during Ramadan the season stays on the current year", () => {
  const s = ramadanSeason(new Date("2027-02-20T08:00:00Z"));
  assert.equal(s.hijriYear, 1448);
});

test("a week after Eid the season rolls to next year", () => {
  const s = ramadanSeason(new Date("2027-04-01T08:00:00Z"));
  assert.equal(s.hijriYear, 1449);
  assert.deepEqual(toHijri(s.ramadanStart), { y: 1449, m: 9, d: 1 });
});
