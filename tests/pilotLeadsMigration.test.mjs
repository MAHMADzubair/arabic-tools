import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("../app/api/pilot/route.js", import.meta.url), "utf8");
const migrations = ["001_pilot_leads.sql", "004_pilot_leads_utm_repair.sql"]
  .map((f) => readFileSync(new URL(`../supabase/migrations/${f}`, import.meta.url), "utf8"))
  .join("\n");
const repair = readFileSync(new URL("../supabase/migrations/004_pilot_leads_utm_repair.sql", import.meta.url), "utf8");

// Column names the API actually inserts: keys of `const lead = { ... }`.
function leadKeys() {
  const start = route.indexOf("const lead = {");
  assert.ok(start > -1, "route must build a `lead` object");
  const end = route.indexOf("\n  };", start);
  const block = route
    .slice(start + "const lead = {".length, end)
    .replace(/\/\/.*$/gm, ""); // strip line comments
  const parts = [];
  let depth = 0, cur = "";
  for (const ch of block) {
    if ("([{".includes(ch)) depth++;
    if (")]}".includes(ch)) depth--;
    if (ch === "," && depth === 0) { parts.push(cur); cur = ""; } else cur += ch;
  }
  parts.push(cur);
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (p.includes(":") ? p.split(":")[0].trim() : p));
}

test("API insert keys are parsed (guard against the parser silently finding nothing)", () => {
  const keys = leadKeys();
  assert.ok(keys.length >= 19, `expected >= 19 keys, got ${keys.length}: ${keys}`);
  for (const k of ["id", "email", "store_name", "utm_source", "utm_term"]) assert.ok(keys.includes(k), k);
});

test("every column /api/pilot inserts exists in the pilot_leads migrations", () => {
  const missing = leadKeys().filter((k) => !new RegExp(`\\b${k}\\b`).test(migrations));
  assert.deepEqual(missing, []);
});

test("004 repair is idempotent and keeps RLS service-role only", () => {
  assert.match(repair, /CREATE TABLE IF NOT EXISTS pilot_leads/);
  for (const c of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    assert.match(repair, new RegExp(`ADD COLUMN IF NOT EXISTS ${c}\\b`));
  }
  assert.match(repair, /DROP POLICY IF EXISTS "service_role_only"/);
  assert.match(repair, /ENABLE ROW LEVEL SECURITY/);
  assert.doesNotMatch(repair, /TO (anon|authenticated|public)/i);
});

test("001 alone is missing the utm columns (documents why 004 exists)", () => {
  const only001 = readFileSync(new URL("../supabase/migrations/001_pilot_leads.sql", import.meta.url), "utf8");
  assert.doesNotMatch(only001, /utm_source/);
});
