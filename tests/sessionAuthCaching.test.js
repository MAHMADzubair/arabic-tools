// tests/sessionAuthCaching.test.js

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { getSupabaseAdmin } from "../lib/sessionAuth.js";

/**
 * Verify Supabase admin client caching and environment isolation.
 */

describe("sessionAuth caching and env isolation", () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    // Clear any cached client before each test
    delete (getSupabaseAdmin)._cached;
    delete (getSupabaseAdmin)._initPromise;
    // Set dummy valid credentials
    process.env.SUPABASE_URL = "http://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_dummy_service_role_key";
  });

  afterEach(() => {
    // Restore original env
    if (originalUrl !== undefined) process.env.SUPABASE_URL = originalUrl; else delete process.env.SUPABASE_URL;
    if (originalKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey; else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete (getSupabaseAdmin)._cached;
    delete (getSupabaseAdmin)._initPromise;
  });

  it("reuses the same client when credentials unchanged", async () => {
    const clientA = await getSupabaseAdmin();
    const clientB = await getSupabaseAdmin();
    assert.ok(clientA, "client should be created");
    assert.strictEqual(clientA, clientB, "cached client should be returned");
  });

  it("normalizes accidental quotes and whitespace before passing Supabase credentials", async () => {
    const url = "https://staging-example.supabase.co";
    const key = "sb_secret_TEST_ONLY_NOT_A_REAL_KEY";
    process.env.SUPABASE_URL = '  "' + url + '"  ';
    process.env.SUPABASE_SERVICE_ROLE_KEY = "  '" + key + "'\r\n";

    const client = await getSupabaseAdmin();
    assert.ok(client, "a server-side client should be initialized");
    assert.equal(getSupabaseAdmin._cached.url, url);
    assert.equal(getSupabaseAdmin._cached.key, key);

    // Equivalent cleaned values must reuse the same client instance.
    process.env.SUPABASE_URL = url;
    process.env.SUPABASE_SERVICE_ROLE_KEY = key;
    assert.strictEqual(await getSupabaseAdmin(), client);
  });

  it("creates a new client when credentials change", async () => {
    const clientA = await getSupabaseAdmin();
    process.env.SUPABASE_URL = "http://different.supabase.co";
    const clientB = await getSupabaseAdmin();
    assert.notStrictEqual(clientA, clientB, "different credentials should produce new client");
  });

  it("returns null when credentials are missing, even after cache", async () => {
    const clientA = await getSupabaseAdmin();
    assert.ok(clientA);
    delete process.env.SUPABASE_URL;
    const clientB = await getSupabaseAdmin();
    assert.strictEqual(clientB, null, "missing credentials should return null");
    // Restore and ensure a new client can be created again
    process.env.SUPABASE_URL = "http://example.supabase.co";
    const clientC = await getSupabaseAdmin();
    assert.ok(clientC);
    assert.notStrictEqual(clientA, clientC, "should create new client after missing credentials");
  });

  it("concurrent calls share the same in‑flight initialization", async () => {
    // Clear any existing state
    delete (getSupabaseAdmin)._cached;
    delete (getSupabaseAdmin)._initPromise;
    const [c1, c2] = await Promise.all([getSupabaseAdmin(), getSupabaseAdmin()]);
    assert.ok(c1);
    assert.strictEqual(c1, c2, "concurrent calls should resolve to same client instance");
  });
});
