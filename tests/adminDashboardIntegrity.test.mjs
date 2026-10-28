import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const get = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("Admin integrity: all 11 sidebar routes exist in the app router", () => {
  const routes = [
    "", "live", "visitors", "tools", "seo", "revenue",
    "journeys", "performance", "security", "system", "settings",
  ];
  const sidebar = get("components/admin/AdminSidebar.jsx");
  for (const part of routes) {
    const href = part ? `/admin/${part}` : "/admin";
    assert.ok(sidebar.includes(`href: "${href}"`), `Missing nav link ${href}`);
    const file = `app/admin/(dashboard)/${part ? part + "/" : ""}page.jsx`;
    assert.ok(fs.existsSync(path.join(root, file)), `Missing route ${file}`);
  }
  assert.equal((sidebar.match(/href: "\/admin(?:\/[a-z-]+)?"/g) || []).length, 11);
  assert.ok(sidebar.includes('aria-current={isActive ? "page" : undefined}'));
});

test("Admin integrity: server components never pass render callbacks into client DataTable", () => {
  for (const file of [
    "app/admin/(dashboard)/security/page.jsx",
    "app/admin/(dashboard)/tools/page.jsx",
    "app/admin/(dashboard)/live/page.jsx",
  ]) {
    const src = get(file);
    assert.ok(!/render:\s*\(/.test(src), `Client callback leaked through ${file}`);
  }
  const client = get("components/admin/ToolsRegistryTable.jsx");
  assert.ok(client.startsWith('"use client";'));
  assert.ok(client.includes("render:"));
  assert.ok(get("app/admin/(dashboard)/tools/page.jsx").includes("<ToolsRegistryTable"));
});

test("Admin integrity: operational metrics fail visibly unavailable, not fabricated zero", () => {
  const src = get("lib/adminOperationalSnapshot.js");
  assert.ok(src.includes('.is("revoked_at", null).gt("expires_at"'));
  assert.ok(src.includes('.gte("attempt_time", yesterday.toISOString())'));
  assert.ok(src.includes("activeSessions: null"));
  assert.ok(src.includes("loginAttempts24h: null"));
  for (const file of [
    "app/admin/(dashboard)/page.jsx",
    "app/admin/(dashboard)/security/page.jsx",
    "app/admin/(dashboard)/system/page.jsx",
  ]) {
    assert.ok(get(file).includes("getAdminOperationalSnapshot"), file);
  }
});

test("Admin integrity: disconnected integrations never claim active traffic or revenue", () => {
  const live = get("app/admin/(dashboard)/live/page.jsx");
  assert.ok(live.includes("Ingestion Not Enabled"));
  assert.ok(!live.includes('value="0"'));
  const seo = get("app/admin/(dashboard)/seo/page.jsx");
  assert.ok(seo.includes("API Unverified"));
  assert.ok(!seo.includes("Authorized GSC reporting active"));
  const revenue = get("app/admin/(dashboard)/revenue/page.jsx");
  assert.ok(revenue.includes("API Unverified"));
  assert.ok(!revenue.includes("Authorized AdSense revenue reporting active"));
  const settings = get("app/admin/(dashboard)/settings/page.jsx");
  assert.ok(settings.includes("ownerMfaReady"));
  assert.ok(!settings.includes('label="Enforced in Prod"'));
});

test("Admin integrity: public footer is isolated without disturbing public metadata", () => {
  const rootLayout = get("app/layout.js");
  const gate = get("components/admin/PublicFooterGate.jsx");
  assert.ok(rootLayout.includes("<PublicFooterGate><Footer /></PublicFooterGate>"));
  assert.ok(gate.startsWith('"use client";'));
  assert.ok(gate.includes('path?.startsWith("/admin/")'));
  assert.ok(rootLayout.includes("JSON.stringify(organizationJsonLd)"));
  assert.ok(rootLayout.includes("JSON.stringify(websiteJsonLd)"));
});

test("Admin integrity: production stays fail-closed until separately verified MFA", () => {
  const files = [
    "app/admin/(dashboard)/layout.jsx",
    "app/api/admin/auth/route.js",
    "app/api/admin/health/route.js",
  ];
  for (const file of files) {
    assert.ok(get(file).includes('process.env.VERCEL_ENV === "production"'), file);
  }
  const header = get("components/admin/AdminHeader.jsx");
  assert.ok(header.includes('if (!response.ok) throw'));
  assert.ok(header.includes('router.replace("/owner-access")'));
});
