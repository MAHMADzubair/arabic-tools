import test from "node:test";
import assert from "node:assert/strict";
import { config } from "dotenv";
config({ path: ".env.local" });

import { POST, GET } from "../app/api/admin/auth/route.js";
import { GET as getHealth } from "../app/api/admin/health/route.js";
import { COOKIE_NAME, safeCompare } from "../lib/sessionAuth.js";

// ── 1. HTTP Method Restrictions ──────────────────────────────────────────────

test("Admin Auth API: GET method returns 405 Method Not Allowed", async () => {
  const response = await GET();
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "POST");
});

// ── 2. Missing ADMIN_SECRET Handling ─────────────────────────────────────────

test("Admin Auth API: Returns 503 if ADMIN_SECRET is not configured", async () => {
  const origSecret = process.env.ADMIN_SECRET;
  delete process.env.ADMIN_SECRET;

  try {
    const req = new Request("http://localhost:3000/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "any-password" }),
    });

    const response = await POST(req);
    assert.equal(response.status, 503);
    const data = await response.json();
    assert.ok(data.error.includes("ADMIN_SECRET"));
  } finally {
    if (origSecret) process.env.ADMIN_SECRET = origSecret;
  }
});

// ── 3. CSRF Origin Verification ──────────────────────────────────────────────

test("Admin Auth API: Rejects cross-origin requests", async () => {
  process.env.ADMIN_SECRET = "test-secret-key-12345";

  const req = new Request("http://localhost:3000/api/admin/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://malicious-site.com",
      Host: "localhost:3000",
    },
    body: JSON.stringify({ password: "test-secret-key-12345" }),
  });

  const response = await POST(req);
  assert.equal(response.status, 403);
  const data = await response.json();
  assert.equal(data.error, "cross_origin_forbidden");
});

// ── 4. Invalid Password Handling ─────────────────────────────────────────────

test("Admin Auth API: Rejects invalid password when staging rate-limit service is available; otherwise fails closed", async () => {
  const previousSecret = process.env.ADMIN_SECRET;
  process.env.ADMIN_SECRET = "correct-admin-secret-2026";

  try {
    const req = new Request("http://localhost:3000/api/admin/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Host: "localhost:3000",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({ password: "wrong-password" }),
    });

    const response = await POST(req);
    const data = await response.json();
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      assert.equal(response.status, 401, "Invalid password must be rejected when the rate limiter is available");
      assert.ok(data.error.includes("Invalid administrative credentials"));
    } else {
      assert.equal(response.status, 503, "Missing database must deny authentication (fail-closed)");
      assert.ok(data.error, "Fail-closed response must explain the unavailability");
    }
  } finally {
    if (previousSecret === undefined) delete process.env.ADMIN_SECRET;
    else process.env.ADMIN_SECRET = previousSecret;
  }
});

// ── 5. Timing Attack Safe Comparison ─────────────────────────────────────────

test("Security: safeCompare prevents timing side-channels", () => {
  const secret = "a-long-and-complex-passphrase-2026!";
  assert.equal(safeCompare(secret, secret), true);
  assert.equal(safeCompare(secret, secret.slice(0, -1)), false);
  assert.equal(safeCompare(secret, "short"), false);
  assert.equal(safeCompare(secret, ""), false);
  assert.equal(safeCompare("", ""), true);
  assert.equal(safeCompare(null, secret), false);
  assert.equal(safeCompare(undefined, secret), false);
});

// ── 6. Health API Authorization ──────────────────────────────────────────────

test("Admin Health API: Rejects unauthenticated requests with 401", async () => {
  const req = new Request("http://localhost:3000/api/admin/health", {
    method: "GET",
  });

  const response = await getHealth(req);
  assert.equal(response.status, 401);
  const data = await response.json();
  assert.equal(data.error, "unauthorized");
});
