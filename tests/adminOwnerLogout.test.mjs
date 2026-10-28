import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST as adminAuthPost } from "../app/api/admin/auth/route.js";
import {
  COOKIE_NAME,
  getSupabaseAdmin,
  hashToken,
  verifySession,
} from "../lib/sessionAuth.js";

// Public RFC 6238 fixture; NOT a real QEMLO secret.
const SEED = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
const TEST_URL = "https://fake-staging.invalid";
const TEST_KEY = "test-only-fake-service-key";
const envKeys = [
  "VERCEL_ENV", "ADMIN_LOGIN_EMAIL", "ADMIN_SECRET", "ADMIN_TOTP_SECRET",
  "ADMIN_MFA_ENABLED", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY",
];

test("Admin logout revokes the actual session, clears the cookie, and rejects replay", async () => {
  const saved = Object.fromEntries(envKeys.map(k => [k, process.env[k]]));
  const prevCached = getSupabaseAdmin._cached;
  const prevPromise = getSupabaseAdmin._initPromise;
  const validToken = "a".repeat(64);
  const unknownToken = "b".repeat(64);
  const row = {
    token_hash: hashToken(validToken),
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    revoked_at: null,
  };
  let updates = 0;

  const fakeDb = {
    from(table) {
      assert.equal(table, "admin_sessions");
      return {
        select(columns) {
          assert.equal(columns, "expires_at, revoked_at");
          return {
            eq(field, value) {
              assert.equal(field, "token_hash");
              return {
                is(field2, value2) {
                  assert.equal(field2, "revoked_at");
                  assert.equal(value2, null);
                  return {
                    gt(field3) {
                      assert.equal(field3, "expires_at");
                      return {
                        async maybeSingle() {
                          return {
                            error: null,
                            data: row.token_hash === value && !row.revoked_at &&
                              new Date(row.expires_at) > new Date()
                              ? { expires_at: row.expires_at, revoked_at: null }
                              : null,
                          };
                        },
                      };
                    },
                  };
                },
              };
            },
          };
        },
        update(values) {
          assert.ok(values.revoked_at);
          return {
            eq(field, value) {
              assert.equal(field, "token_hash");
              return {
                is(field2, value2) {
                  assert.equal(field2, "revoked_at");
                  assert.equal(value2, null);
                  return {
                    async select(columns) {
                      assert.equal(columns, "token_hash");
                      if (value !== row.token_hash || row.revoked_at) {
                        return { data: [], error: null };
                      }
                      row.revoked_at = values.revoked_at;
                      updates += 1;
                      return { data: [{ token_hash: row.token_hash }], error: null };
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  };

  function logoutRequest(token) {
    return new NextRequest("https://qemlo-preview.example/api/admin/auth", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "host": "qemlo-preview.example",
        "origin": "https://qemlo-preview.example",
        ...(token ? { cookie: `${COOKIE_NAME}=${token}` } : {}),
      },
      body: JSON.stringify({ action: "logout" }),
    });
  }

  try {
    Object.assign(process.env, {
      VERCEL_ENV: "preview",
      ADMIN_LOGIN_EMAIL: "owner@example.com",
      ADMIN_SECRET: "TEST-only-long-owner-password-2026!",
      ADMIN_TOTP_SECRET: SEED,
      ADMIN_MFA_ENABLED: "true",
      SUPABASE_URL: TEST_URL,
      SUPABASE_SERVICE_ROLE_KEY: TEST_KEY,
    });
    getSupabaseAdmin._cached = { url: TEST_URL, key: TEST_KEY, client: fakeDb };
    delete getSupabaseAdmin._initPromise;

    assert.equal(await verifySession(validToken), true, "session starts active");
    const response = await adminAuthPost(logoutRequest(validToken));
    assert.equal(response.status, 200, "real DB row revocation is required for success");
    assert.equal((await response.json()).success, true);
    assert.equal(updates, 1);
    const cookie = response.headers.get("set-cookie") || "";
    assert.match(cookie, /Max-Age=0/i);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Strict/i);
    assert.equal(await verifySession(validToken), false, "revoked session cannot be replayed");

    const unknownResponse = await adminAuthPost(logoutRequest(unknownToken));
    assert.equal(unknownResponse.status, 503, "zero affected rows cannot be called successful logout");
    assert.equal((await unknownResponse.json()).error, "logout_unavailable");
    assert.match(unknownResponse.headers.get("set-cookie") || "", /Max-Age=0/i);
    assert.equal(updates, 1, "unknown token must not revoke a different session");

    const alreadySignedOut = await adminAuthPost(logoutRequest(null));
    assert.equal(alreadySignedOut.status, 200, "logout remains idempotent with no cookie");
  } finally {
    for (const key of envKeys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
    if (prevCached === undefined) delete getSupabaseAdmin._cached;
    else getSupabaseAdmin._cached = prevCached;
    if (prevPromise === undefined) delete getSupabaseAdmin._initPromise;
    else getSupabaseAdmin._initPromise = prevPromise;
  }
});
