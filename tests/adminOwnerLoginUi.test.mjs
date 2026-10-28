import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = (path) => fs.readFileSync(path, "utf8");

test("owner sign in uses a standalone, unadvertised owner-access URL", () => {
  const header = source("components/home/HomeHeader.jsx");
  assert.ok(!header.includes('href="/admin/login"'));
  assert.ok(!header.includes('href="/owner-access"'));
  assert.ok(!header.includes("Admin Sign In"));
  const privatePage = source("app/owner-access/page.jsx");
  const legacy = source("app/admin/login/page.jsx");
  assert.ok(privatePage.includes("isAdminAuthConfigured()"));
  assert.ok(privatePage.includes('robots: { index: false'));
  assert.ok(legacy.includes('redirect("/owner-access")'));
  const dashboard = source("app/admin/(dashboard)/layout.jsx");
  assert.ok(dashboard.includes('redirect("/owner-access")'));
  const globalHeader = source("components/Header.jsx");
  assert.ok(globalHeader.includes('pathname === "/owner-access"'));
  const footer = source("components/admin/PublicFooterGate.jsx");
  assert.ok(footer.includes('path === "/owner-access"'));
});

test("owner sign in has identity, password and authenticator inputs", () => {
  const page = source("app/owner-access/page.jsx");
  const form = source("app/admin/login/AdminLoginForm.jsx");
  assert.ok(page.includes("isAdminAuthConfigured()"));
  assert.ok(page.includes("Private sign-in is temporarily unavailable") || page.includes("temporarily unavailable"));
  assert.ok(form.includes('name="email"'));
  assert.ok(form.includes('name="password"'));
  assert.ok(form.includes('name="one-time-code"'));
  assert.ok(form.includes("JSON.stringify({ email: email.trim(), password, totp })"));
});

test("privileged admin pages and API remain gated on MFA configuration", () => {
  for (const file of [
    "app/admin/(dashboard)/layout.jsx",
    "app/api/admin/auth/route.js",
    "app/api/admin/health/route.js",
  ]) {
    const code = source(file);
    assert.ok(code.includes("isAdminAuthConfigured()"), file);
    assert.ok(code.includes('process.env.VERCEL_ENV === "production"'), file);
  }
  const auth = source("app/api/admin/auth/route.js");
  assert.ok(auth.includes("verifyAdminTotp(totp)"));
  assert.ok(auth.includes("checkAndRecordLoginAttempt(ip)"));
  assert.ok(auth.indexOf("verifyAdminTotp(totp)") < auth.indexOf("createSession(ip, userAgent)"));
  assert.ok(auth.includes("getSessionCookieOptions()"));
});
