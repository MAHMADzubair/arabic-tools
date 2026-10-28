import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("Owner security settings list the six actual configured MFA requirements", () => {
  const settings = read("app/admin/(dashboard)/settings/page.jsx");
  const mfa = read("lib/adminMfa.js");
  const security = read("app/admin/(dashboard)/security/page.jsx");
  for (const name of [
    "ADMIN_LOGIN_EMAIL", "ADMIN_SECRET", "ADMIN_TOTP_SECRET",
    "ADMIN_MFA_ENABLED", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY",
  ]) {
    assert.ok(mfa.includes(name), `MFA gate needs ${name}`);
    assert.ok(settings.includes(`name: "${name}"`), `Settings must show ${name}`);
  }
  assert.ok(!settings.includes("MFA_ENCRYPTION_KEY"), "obsolete MFA key must not block release");
  assert.ok(!settings.includes("no MFA implementation yet"), "remove stale MFA status");
  assert.ok(settings.includes("getAdminAuthConfigStatus"), "validate required keys instead of presence only");
  assert.ok(settings.includes("Missing / Invalid"), "do not report invalid values as configured");
  assert.ok(settings.includes("login, logout and release QA"), "readiness is not a verified live flow");
  assert.ok(!settings.includes('label="Enforced in Prod"'), "do not claim production activation");
  assert.ok(security.includes("Config Ready · QA Pending"), "MFA must not claim deployment-wide verification");
  assert.ok(security.includes("Policy Configured · QA Pending"), "rate limiter must not claim verified live enforcement");
});

test("Owner sign-out requires a proven DB update, preserves fail-closed API and clears cookie", () => {
  const sessions = read("lib/sessionAuth.js");
  const api = read("app/api/admin/auth/route.js");
  const header = read("components/admin/AdminHeader.jsx");
  assert.ok(sessions.includes('.is("revoked_at", null)'));
  assert.ok(sessions.includes('.select("token_hash")'));
  assert.ok(sessions.includes("Array.isArray(data) && data.length === 1"));
  assert.ok(api.includes("revoked ? 200 : 503"));
  assert.ok(api.includes("maxAge: 0"));
  assert.ok(api.includes('getSessionCookieOptions()'));
  assert.ok(header.includes('router.replace("/owner-access")'));
  assert.ok(header.includes('if (!response.ok) throw'));
});

test("Owner protected routes still require server-side session verification", () => {
  const layout = read("app/admin/(dashboard)/layout.jsx");
  const health = read("app/api/admin/health/route.js");
  assert.ok(layout.includes("isAdminAuthConfigured()"));
  assert.ok(layout.includes("verifySession(token)"));
  assert.ok(layout.includes('redirect("/owner-access")'));
  assert.ok(health.includes("verifySession("));
});
