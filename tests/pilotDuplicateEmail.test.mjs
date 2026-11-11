import test from "node:test";
import assert from "node:assert/strict";
import { saveLead, UNIQUE_VIOLATION } from "../lib/pilotLeads.js";

function fakeSb({ insertError = null, updateError = null } = {}) {
  const calls = { insert: [], update: [] };
  return {
    calls,
    from: (table) => ({
      insert: async (row) => { calls.insert.push({ table, row }); return { error: insertError }; },
      update: (row) => ({
        eq: async (col, val) => { calls.update.push({ table, row, col, val }); return { error: updateError }; },
      }),
    }),
  };
}
const lead = { id: "lead_1", created_at: "2026-11-11T00:00:00Z", email: "a@b.co", whatsapp: "966500000000", priority: "high" };

test("new email inserts and returns 201", async () => {
  const sb = fakeSb();
  const r = await saveLead(sb, lead);
  assert.deepEqual(r, { ok: true, status: 201, leadId: "lead_1" });
  assert.equal(sb.calls.update.length, 0);
});

test("duplicate email is success, refreshes the existing row without id/created_at", async () => {
  const sb = fakeSb({ insertError: { code: UNIQUE_VIOLATION, message: "duplicate key" } });
  const r = await saveLead(sb, lead);
  assert.equal(r.ok, true);
  assert.equal(r.status, 200);
  assert.equal(r.duplicate, true);
  const u = sb.calls.update[0];
  assert.equal(u.col, "email");
  assert.equal(u.val, "a@b.co");
  assert.equal("id" in u.row, false);
  assert.equal("created_at" in u.row, false);
  assert.equal(u.row.whatsapp, "966500000000");
});

test("duplicate email stays success even if the refresh fails", async () => {
  const sb = fakeSb({ insertError: { code: UNIQUE_VIOLATION, message: "dup" }, updateError: { message: "rls" } });
  const r = await saveLead(sb, lead);
  assert.equal(r.ok, true);
  assert.equal(r.status, 200);
});

test("other database errors still fail", async () => {
  const sb = fakeSb({ insertError: { code: "42P01", message: "relation missing" } });
  const r = await saveLead(sb, lead);
  assert.equal(r.ok, false);
  assert.equal(r.error.code, "42P01");
});

test("route uses saveLead in both prod and dev paths", async () => {
  const fs = await import("node:fs");
  const src = fs.readFileSync(new URL("../app/api/pilot/route.js", import.meta.url), "utf8");
  assert.equal((src.match(/saveLead\(sb, lead\)/g) || []).length, 2);
  assert.equal(src.includes('.from("pilot_leads").insert'), false);
});
