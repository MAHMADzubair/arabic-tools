import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { POST as login } from "../app/api/admin/auth/route.js";
import { getSupabaseAdmin } from "../lib/sessionAuth.js";

const SEED = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"; // Public RFC 6238 example seed, never use for an actual account.
const TEST_DB = "https://staging-test.invalid";
const TEST_KEY = "test-only-no-privileges";

function otpAt(timestampSeconds) {
  const key = Buffer.from("12345678901234567890");
  const c = Buffer.alloc(8);
  c.writeBigUInt64BE(BigInt(Math.floor(timestampSeconds / 30)));
  const mac = createHmac("sha1", key).update(c).digest();
  const value = (mac.readUInt32BE(mac[19] & 0x0f) & 0x7fffffff) % 1000000;
  return String(value).padStart(6, "0");
}

test("Owner login: password + email + authenticator code must all succeed before session cookie", async () => {
  const vars = [
    "VERCEL_ENV", "ADMIN_LOGIN_EMAIL", "ADMIN_SECRET", "ADMIN_TOTP_SECRET",
    "ADMIN_MFA_ENABLED", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const originalEnv = Object.fromEntries(vars.map((key) => [key, process.env[key]]));
  const originalCached = getSupabaseAdmin._cached;
  const originalPromise = getSupabaseAdmin._initPromise;
  const realNow = Date.now;
  let inserted = 0;
  let rateLimitCalls = 0;

  const fakeDb = {
    rpc: async () => {
      rateLimitCalls += 1;
      return { data: { allowed: true }, error: null };
    },
    from: (name) => {
      assert.equal(name, "admin_sessions");
      return { insert: async (record) => {
        assert.equal(record.token_hash.length, 64);
        assert.ok(record.expires_at);
        inserted += 1;
        return { error: null };
      }};
    },
  };

  try {
    process.env.VERCEL_ENV = "production";
    process.env.ADMIN_LOGIN_EMAIL = "owner@example.com";
    process.env.ADMIN_SECRET = "test-password-do-not-use-for-real-admin";
    process.env.ADMIN_TOTP_SECRET = SEED;
    process.env.ADMIN_MFA_ENABLED = "true";
    process.env.SUPABASE_URL = TEST_DB;
    process.env.SUPABASE_SERVICE_ROLE_KEY = TEST_KEY;
    getSupabaseAdmin._cached = { url: TEST_DB, key: TEST_KEY, client: fakeDb };
    delete getSupabaseAdmin._initPromise;

    // RFC 6238 example timestamp: 59s, with a known valid six-digit code.
    Date.now = () => 59000;

    async function request(email, password, totp) {
      return login(new Request("http://localhost:3000/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Host: "localhost:3000",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({ email, password, totp }),
      }));
    }

    const validCode = otpAt(59);
    let res = await request("someone@example.com", process.env.ADMIN_SECRET, validCode);
    assert.equal(res.status, 401);
    res = await request(process.env.ADMIN_LOGIN_EMAIL, "wrong-password", validCode);
    assert.equal(res.status, 401);
    res = await request(process.env.ADMIN_LOGIN_EMAIL, process.env.ADMIN_SECRET, "000000");
    assert.equal(res.status, 401);
    assert.equal(inserted, 0, "Invalid factors must never create an admin session");

    res = await request("owner@example.com", process.env.ADMIN_SECRET, validCode);
    assert.equal(res.status, 200);
    assert.equal(inserted, 1);
    const cookie = res.headers.get("set-cookie") || "";
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Strict/i);
    assert.equal(rateLimitCalls, 4, "Rate limiting must run on every attempt");
  } finally {
    Date.now = realNow;
    for (const key of vars) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
    if (originalCached === undefined) delete getSupabaseAdmin._cached;
    else getSupabaseAdmin._cached = originalCached;
    if (originalPromise === undefined) delete getSupabaseAdmin._initPromise;
    else getSupabaseAdmin._initPromise = originalPromise;
  }
});
