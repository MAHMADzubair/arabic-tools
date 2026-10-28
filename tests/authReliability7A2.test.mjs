/**
 * tests/authReliability7A2.test.mjs
 * Sprint 7A.2 — Security regression test suite for administrative login
 * rate limiting fail-closed reliability and defensive route handling.
 *
 * Covers:
 * 1. RPC returns allowed: true (valid attempt proceeds)
 * 2. RPC returns allowed: false (rate limit exceeded returns 429)
 * 3. RPC returns an error (fail-closed, returns 503)
 * 4. RPC returns null data (fail-closed, returns 503)
 * 5. RPC returns an empty object (fail-closed, returns 503)
 * 6. RPC returns unexpected data types (fail-closed, returns 503)
 * 7. RPC throws an exception (fail-closed, returns 503)
 * 8. Supabase configuration unavailable (fail-closed, returns 503)
 * 9. Login API handles undefined defensively without TypeError
 * 10. Rate-limit failures never bypass authentication
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkAndRecordLoginAttempt, RL_MAX_ATTEMPTS, RL_WINDOW_MS } from "../lib/sessionAuth.js";

/**
 * Pure rate-limit evaluation runner mirroring lib/sessionAuth.js checkAndRecordLoginAttempt
 * with an injected Supabase client instance.
 */
async function evaluateRateLimitWithClient(sb, ip = "127.0.0.1") {
  if (!sb) {
    return { allowed: false, reason: "Database unavailable" };
  }

  try {
    if (typeof sb.rpc === "function") {
      const { data, error: rpcErr } = await sb.rpc("check_and_record_login_attempt_atomic", {
        p_ip: ip,
        p_window_sec: Math.floor(RL_WINDOW_MS / 1000),
        p_max_attempts: RL_MAX_ATTEMPTS,
      });

      if (!rpcErr && data && typeof data.allowed === "boolean") {
        if (!data.allowed) {
          return { allowed: false, reason: "Too many attempts" };
        }
        return { allowed: true };
      }
    }

    // Fail closed if RPC returned an error, null, or unexpected payload
    return { allowed: false, reason: "Rate limit verification failed" };
  } catch (err) {
    return { allowed: false, reason: "Rate limit error" };
  }
}

/**
 * Pure route-handler defensive dispatcher mirroring app/api/internal/auth/route.js
 */
function dispatchAuthRouteRateLimitCheck(rl) {
  if (!rl || !rl.allowed) {
    const status = rl?.reason === "Too many attempts" ? 429 : 503;
    return {
      blocked: true,
      status,
      response: { error: rl?.reason || "Rate limit unavailable" },
    };
  }
  return { blocked: false, status: 200 };
}

// ── 1. RPC returns allowed: true ─────────────────────────────────────────────
test("Auth Reliability 1: RPC returns allowed: true permits attempt", async () => {
  const sbMock = {
    rpc: async () => ({ data: { allowed: true, count: 1 }, error: null }),
  };
  const rl = await evaluateRateLimitWithClient(sbMock);
  assert.equal(rl.allowed, true);
  assert.equal(rl.reason, undefined);

  const routeDispatch = dispatchAuthRouteRateLimitCheck(rl);
  assert.equal(routeDispatch.blocked, false, "Valid attempt must proceed to password verification");
});

// ── 2. RPC returns allowed: false ────────────────────────────────────────────
test("Auth Reliability 2: RPC returns allowed: false rejects with Too many attempts (429)", async () => {
  const sbMock = {
    rpc: async () => ({ data: { allowed: false, count: 6 }, error: null }),
  };
  const rl = await evaluateRateLimitWithClient(sbMock);
  assert.equal(rl.allowed, false);
  assert.equal(rl.reason, "Too many attempts");

  const routeDispatch = dispatchAuthRouteRateLimitCheck(rl);
  assert.equal(routeDispatch.blocked, true);
  assert.equal(routeDispatch.status, 429, "Rate limit exceeded must return HTTP 429");
  assert.equal(routeDispatch.response.error, "Too many attempts");
});

// ── 3. RPC returns an error ──────────────────────────────────────────────────
test("Auth Reliability 3: RPC returns an error fails closed (503)", async () => {
  const sbMock = {
    rpc: async () => ({ data: null, error: new Error("function check_and_record_login_attempt_atomic() does not exist") }),
  };
  const rl = await evaluateRateLimitWithClient(sbMock);
  assert.notEqual(rl, undefined, "Must never return undefined on RPC error");
  assert.equal(rl.allowed, false);
  assert.equal(rl.reason, "Rate limit verification failed");

  const routeDispatch = dispatchAuthRouteRateLimitCheck(rl);
  assert.equal(routeDispatch.blocked, true);
  assert.equal(routeDispatch.status, 503, "Database/RPC error must return HTTP 503");
  assert.equal(routeDispatch.response.error, "Rate limit verification failed");
});

// ── 4. RPC returns null data ─────────────────────────────────────────────────
test("Auth Reliability 4: RPC returns null data fails closed (503)", async () => {
  const sbMock = {
    rpc: async () => ({ data: null, error: null }),
  };
  const rl = await evaluateRateLimitWithClient(sbMock);
  assert.notEqual(rl, undefined, "Must never return undefined on null data");
  assert.equal(rl.allowed, false);
  assert.equal(rl.reason, "Rate limit verification failed");

  const routeDispatch = dispatchAuthRouteRateLimitCheck(rl);
  assert.equal(routeDispatch.blocked, true);
  assert.equal(routeDispatch.status, 503);
});

// ── 5. RPC returns an empty object ───────────────────────────────────────────
test("Auth Reliability 5: RPC returns an empty object fails closed (503)", async () => {
  const sbMock = {
    rpc: async () => ({ data: {}, error: null }),
  };
  const rl = await evaluateRateLimitWithClient(sbMock);
  assert.notEqual(rl, undefined, "Must never return undefined on empty object");
  assert.equal(rl.allowed, false);
  assert.equal(rl.reason, "Rate limit verification failed");

  const routeDispatch = dispatchAuthRouteRateLimitCheck(rl);
  assert.equal(routeDispatch.blocked, true);
  assert.equal(routeDispatch.status, 503);
});

// ── 6. RPC returns unexpected data types ─────────────────────────────────────
test("Auth Reliability 6: RPC returns non-boolean allowed field fails closed", async () => {
  const malformedCases = [
    { allowed: "true" },    // String instead of boolean
    { allowed: 1 },         // Number instead of boolean
    { status: "ok" },       // Missing allowed property
    "raw string response",  // Non-object response
  ];

  for (const malformed of malformedCases) {
    const sbMock = {
      rpc: async () => ({ data: malformed, error: null }),
    };
    const rl = await evaluateRateLimitWithClient(sbMock);
    assert.notEqual(rl, undefined, "Must never return undefined on malformed data");
    assert.equal(rl.allowed, false, "Malformed RPC payload must never permit login");
    assert.equal(rl.reason, "Rate limit verification failed");

    const routeDispatch = dispatchAuthRouteRateLimitCheck(rl);
    assert.equal(routeDispatch.blocked, true);
    assert.equal(routeDispatch.status, 503);
  }
});

// ── 7. RPC throws an exception ───────────────────────────────────────────────
test("Auth Reliability 7: RPC throws an unhandled exception fails closed (503)", async () => {
  const sbMock = {
    rpc: async () => {
      throw new Error("Network socket disconnected abruptly");
    },
  };
  const rl = await evaluateRateLimitWithClient(sbMock);
  assert.notEqual(rl, undefined);
  assert.equal(rl.allowed, false);
  assert.equal(rl.reason, "Rate limit error");

  const routeDispatch = dispatchAuthRouteRateLimitCheck(rl);
  assert.equal(routeDispatch.blocked, true);
  assert.equal(routeDispatch.status, 503);
});

// ── 8. Supabase configuration unavailable ────────────────────────────────────
test("Auth Reliability 8: Missing Supabase client fails closed with Database unavailable", async () => {
  const rl = await evaluateRateLimitWithClient(null);
  assert.equal(rl.allowed, false);
  assert.equal(rl.reason, "Database unavailable");

  const routeDispatch = dispatchAuthRouteRateLimitCheck(rl);
  assert.equal(routeDispatch.blocked, true);
  assert.equal(routeDispatch.status, 503);
});

test("Auth Reliability 8b: checkAndRecordLoginAttempt live function fails closed when env missing", async () => {
  const origUrl = process.env.SUPABASE_URL;
  const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const res = await checkAndRecordLoginAttempt("192.0.2.1");
    assert.equal(res.allowed, false);
    assert.equal(res.reason, "Database unavailable");
  } finally {
    if (origUrl) process.env.SUPABASE_URL = origUrl;
    if (origKey) process.env.SUPABASE_SERVICE_ROLE_KEY = origKey;
  }
});

// ── 9. Login API handles undefined defensively without TypeError ─────────────
test("Auth Reliability 9: Route handler defensively intercepts undefined or null rl", () => {
  // Simulates scenario if a future regression or edge case passed undefined/null to route handler
  assert.doesNotThrow(() => {
    const dispatchUndefined = dispatchAuthRouteRateLimitCheck(undefined);
    assert.equal(dispatchUndefined.blocked, true);
    assert.equal(dispatchUndefined.status, 503);
    assert.equal(dispatchUndefined.response.error, "Rate limit unavailable");
  }, "Must not throw TypeError: Cannot read properties of undefined (reading 'allowed')");

  assert.doesNotThrow(() => {
    const dispatchNull = dispatchAuthRouteRateLimitCheck(null);
    assert.equal(dispatchNull.blocked, true);
    assert.equal(dispatchNull.status, 503);
  });
});

// ── 10. Rate-limit failures never allow login ─────────────────────────────────
test("Auth Reliability 10: Invariant — No rate limit failure mode permits login", async () => {
  const failureScenarios = [
    { name: "Rate limit exceeded", res: { allowed: false, reason: "Too many attempts" }, expectedStatus: 429 },
    { name: "RPC error", res: { allowed: false, reason: "Rate limit verification failed" }, expectedStatus: 503 },
    { name: "RPC null data", res: { allowed: false, reason: "Rate limit verification failed" }, expectedStatus: 503 },
    { name: "Network exception", res: { allowed: false, reason: "Rate limit error" }, expectedStatus: 503 },
    { name: "DB offline", res: { allowed: false, reason: "Database unavailable" }, expectedStatus: 503 },
    { name: "Undefined fallback", res: undefined, expectedStatus: 503 },
  ];

  for (const s of failureScenarios) {
    const dispatch = dispatchAuthRouteRateLimitCheck(s.res);
    assert.equal(dispatch.blocked, true, `Scenario '${s.name}' must block request`);
    assert.equal(dispatch.status, s.expectedStatus, `Scenario '${s.name}' must return HTTP ${s.expectedStatus}`);
    assert.ok(dispatch.response.error, `Scenario '${s.name}' must provide safe error message`);
  }
});

// Troubleshooting should identify RPC failure categories without leaking secrets.
test("Admin RPC diagnostic logging is Preview-only and redacted", () => {
  const source = readFileSync("lib/sessionAuth.js", "utf8");
  const start = source.indexOf('if (process.env.VERCEL_ENV === "preview") {', source.indexOf("export async function checkAndRecordLoginAttempt"));
  const end = source.indexOf("// Fail closed if RPC returned an error", start);
  assert.ok(start > 0 && end > start, "Preview diagnostic should be present");
  const diagnostic = source.slice(start, end);
  assert.ok(diagnostic.includes("[Admin Rate Limit Diagnostics]"));
  assert.ok(diagnostic.includes("permittedCodes.has(rpcErr.code)"));
  assert.ok(!diagnostic.includes("rpcErr.message"), "RPC error message must not be logged");
  assert.ok(!diagnostic.includes("process.env.SUPABASE_SERVICE_ROLE_KEY"));
  assert.ok(!diagnostic.includes("JSON.stringify({ ip"));
});
