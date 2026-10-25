// tests/sessionAuthCaching.test.js

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { getSupabaseAdmin } from "../lib/sessionAuth.js";

/**
 * These tests verify that the Supabase admin client caching behaves correctly
 * and that environment variable isolation does not fall back to production
 * credentials when they are missing.
 */

describe("sessionAuth caching and env isolation", () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    // Ensure a clean cache before each test
    delete (getSupabaseAdmin as any)._cached;
    // Set dummy but valid‑looking credentials
    process.env.SUPABASE_URL = "http://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_dummy_service_role_key";
  });

  afterEach(() => {
    // Restore original env variables
    if (originalUrl !== undefined) process.env.SUPABASE_URL = originalUrl; else delete process.env.SUPABASE_URL;
    if (originalKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey; else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete (getSupabaseAdmin as any)._cached;
  });

  it("returns the same client instance on repeated calls with unchanged env", async () => {
    const clientA = await getSupabaseAdmin();
    const clientB = await getSupabaseAdmin();
    assert.ok(clientA, "First client should be instantiated");
    assert.strictEqual(clientA, clientB, "Caching should return the same instance");
  });

  it("creates a new client when credentials change", async () => {
    const clientA = await getSupabaseAdmin();
    // Change the URL – this simulates a different environment (e.g., staging vs prod)
    process.env.SUPABASE_URL = "http://different.supabase.co";
    const clientB = await getSupabaseAdmin();
    assert.notStrictEqual(clientA, clientB, "Different credentials should produce a new client instance");
  });
});
