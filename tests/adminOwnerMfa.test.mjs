import test from "node:test";
import assert from "node:assert/strict";
import { decodeBase32, verifyAdminTotp, isAdminAuthConfigured } from "../lib/adminMfa.js";

const RFC_SECRET_BASE32 = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"; // RFC 6238 20-byte test seed; not an actual credential.

test("Owner MFA: RFC 6238 SHA-1 example validates a six-digit OTP", () => {
  assert.equal(verifyAdminTotp("287082", RFC_SECRET_BASE32, 59000), true);
  assert.equal(verifyAdminTotp("081804", RFC_SECRET_BASE32, 1111111109000), true);
  assert.equal(verifyAdminTotp("287083", RFC_SECRET_BASE32, 59000), false);
});

test("Owner MFA: rejects malformed secrets, non-digit codes and expired OTPs", () => {
  assert.equal(decodeBase32("ABCD"), null);
  assert.equal(decodeBase32("not*base32-seed"), null);
  assert.equal(verifyAdminTotp("287082", "ABCD", 59000), false);
  assert.equal(verifyAdminTotp("28708", RFC_SECRET_BASE32, 59000), false);
  assert.equal(verifyAdminTotp("287082x", RFC_SECRET_BASE32, 59000), false);
  assert.equal(verifyAdminTotp("287082", RFC_SECRET_BASE32, 59000 + 3 * 30000), false);
});

test("Owner MFA: decoded seed is at least 20 bytes", () => {
  const seed = decodeBase32(RFC_SECRET_BASE32);
  assert.ok(seed);
  assert.equal(seed.toString("utf8"), "12345678901234567890");
});

test("Owner MFA: fail-closed readiness requires owner ID, long password, seed, DB and explicit flag", () => {
  const keys = [
    "ADMIN_LOGIN_EMAIL", "ADMIN_SECRET", "ADMIN_TOTP_SECRET",
    "ADMIN_MFA_ENABLED", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    process.env.ADMIN_LOGIN_EMAIL = "owner@example.com";
    process.env.ADMIN_SECRET = "a-unique-private-example-password-2026";
    process.env.ADMIN_TOTP_SECRET = RFC_SECRET_BASE32;
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-placeholder";
    process.env.ADMIN_MFA_ENABLED = "true";
    assert.equal(isAdminAuthConfigured(), true);

    process.env.ADMIN_MFA_ENABLED = "false";
    assert.equal(isAdminAuthConfigured(), false);
    process.env.ADMIN_MFA_ENABLED = "true";
    delete process.env.ADMIN_LOGIN_EMAIL;
    assert.equal(isAdminAuthConfigured(), false);
    process.env.ADMIN_LOGIN_EMAIL = "owner@example.com";
    process.env.ADMIN_SECRET = "short";
    assert.equal(isAdminAuthConfigured(), false);
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});
