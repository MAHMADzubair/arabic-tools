// tests/staging-integration.test.js
// Dedicated integration test suite for actual Staging Supabase PostgreSQL database.
// Executes only when isolated staging environment variables are populated.
// If staging credentials are not present, tests skip safely with clear reporting.

import test from "node:test";
import assert from "node:assert/strict";
import { config } from "dotenv";
config({ path: ".env.local" });
import {
  hashToken,
  createSession,
  verifySession,
  revokeSession,
  checkAndRecordLoginAttempt,
} from "../lib/sessionAuth.js";

const STAGING_URL = process.env.SUPABASE_URL;
const STAGING_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STAGING_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const isStagingConfigured = !!(STAGING_URL && STAGING_SERVICE_KEY);

test("Staging Database: Environment & Project Identity Verification", (t) => {
  if (!isStagingConfigured) {
    console.log("ℹ [STAGING INTEGRATION BLOCKED] Real Supabase credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not configured.");
    console.log("ℹ Skipping live database queries. Mocked security tests in sessionAuth.test.js provide baseline coverage.");
    t.skip("Staging database credentials not configured in local environment");
    return;
  }

  // Verify project identity does NOT target production
  const urlObj = new URL(STAGING_URL);
  console.log(`✓ Staging Supabase Hostname: ${urlObj.hostname}`);
  assert.ok(
    !urlObj.hostname.includes("qemlo-production") && !urlObj.hostname.includes("production"),
    "Safety check: Must not point to production Supabase database"
  );
});

test("Staging Database: Anonymous & Authenticated RLS Denial", async (t) => {
  if (!isStagingConfigured) {
    t.skip("Staging RLS integration requires separately configured staging credentials");
    return;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const anonClient = createClient(STAGING_URL, STAGING_ANON_KEY, {
    auth: { persistSession: false },
  });

  // Attempt to read admin_sessions with anon key
  const { data: sessionData, error: sessionErr } = await anonClient
    .from("admin_sessions")
    .select("*");

  // Distinguish RLS denial from authentication failure:
  // - RLS denial: error code PGRST301, or empty array (SELECT returns empty for hidden rows)
  // - Auth failure: error code JWTExpired, InvalidAPIKey, or similar credential error
  // A test that accepts an "Invalid API key" error as "RLS working" is misleading.
  if (sessionErr) {
    const code = sessionErr.code ?? "";
    const msg  = (sessionErr.message ?? "").toLowerCase();
    const isCredentialFailure =
      msg.includes("invalid api key") ||
      msg.includes("jwt")             ||
      msg.includes("invalid_key")     ||
      code === "401"                  ||
      code === "PGRST301" === false && msg.includes("unauthorized");

    assert.equal(
      isCredentialFailure,
      false,
      `RLS test cannot pass on credential failure (error: ${sessionErr.message}). ` +
      "The Supabase project API key may be revoked or the project may be paused. " +
      "Owner action required: regenerate API keys at app.supabase.com."
    );
  }

  // RLS or REVOKE must deny read access (no credential error — genuine access check)
  const isDenied = sessionErr || (Array.isArray(sessionData) && sessionData.length === 0);
  assert.ok(isDenied, "Anonymous client MUST be denied access to admin_sessions");

  // Attempt to read admin_login_attempts with anon key
  const { data: attemptData, error: attemptErr } = await anonClient
    .from("admin_login_attempts")
    .select("*");

  if (attemptErr) {
    const code = attemptErr.code ?? "";
    const msg  = (attemptErr.message ?? "").toLowerCase();
    const isCredentialFailure =
      msg.includes("invalid api key") ||
      msg.includes("jwt")             ||
      msg.includes("invalid_key")     ||
      code === "401"                  ||
      code === "PGRST301" === false && msg.includes("unauthorized");

    assert.equal(
      isCredentialFailure,
      false,
      `RLS test cannot pass on credential failure (error: ${attemptErr.message}). ` +
      "Owner action required: regenerate API keys at app.supabase.com."
    );
  }

  const isAttemptDenied = attemptErr || (Array.isArray(attemptData) && attemptData.length === 0);
  assert.ok(isAttemptDenied, "Anonymous client MUST be denied access to admin_login_attempts");
});

test("Staging Database: Live Session Lifecycle (Create -> Verify -> Revoke -> Replay)", async (t) => {
  if (!isStagingConfigured) {
    t.skip("Staging database credentials not configured");
    return;
  }

  const testIp = "192.0.2.1";
  const testUa = "QemloStagingIntegrationTest/1.0";

  // 1. Create session
  const rawToken = await createSession(testIp, testUa);
  assert.ok(rawToken, "createSession must return a valid rawToken from staging DB");
  assert.equal(rawToken.length, 64, "Raw token must be 64-char hex string");

  // 2. Verify active session
  const isValid = await verifySession(rawToken);
  assert.equal(isValid, true, "verifySession must return true for newly created session");

  // 3. Revoke session (logout)
  const isRevoked = await revokeSession(rawToken);
  assert.equal(isRevoked, true, "revokeSession must return true on successful revocation");

  // 4. Replay attempt: immediately verify revoked session
  const isReplayValid = await verifySession(rawToken);
  assert.equal(isReplayValid, false, "verifySession must return false for revoked session");
});

test("Staging Database: Concurrent Atomic Rate Limiting", async (t) => {
  if (!isStagingConfigured) {
    t.skip("Staging database credentials not configured");
    return;
  }

  // Generate unique test IP for this run
  const uniqueIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;

  // Launch 10 simultaneous login attempt checks for the same IP
  const attempts = Array.from({ length: 10 }, () => checkAndRecordLoginAttempt(uniqueIp));
  const results = await Promise.all(attempts);

  const allowed = results.filter((r) => r.allowed);
  const blocked = results.filter((r) => !r.allowed);

  assert.equal(allowed.length, 5, "Database-side rate limiter must permit exactly 5 attempts in 15m window");
  assert.equal(blocked.length, 5, "Database-side rate limiter must block all concurrent attempts beyond 5");
});

test("Staging Database: Cleanup Function Execution Permissions", async (t) => {
  if (!isStagingConfigured) {
    t.skip("Staging database credentials not configured");
    return;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const adminClient = createClient(STAGING_URL, STAGING_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const { error } = await adminClient.rpc("cleanup_expired_admin_data");
  assert.equal(error, null, "service_role must have permission to execute cleanup_expired_admin_data");
});
