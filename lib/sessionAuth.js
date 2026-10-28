/**
 * lib/sessionAuth.js
 *
 * Production Server-Side Session Management & Rate Limiting for Qemlo Admin
 * Uses Supabase Service Role client for cross-instance state on Vercel Serverless.
 *
 * Security Invariants:
 *  1. Raw session tokens (256-bit CSPRNG) are given ONLY to the client as HttpOnly cookies.
 *  2. Database stores ONLY SHA-256 hashes of the session tokens. If the DB is compromised,
 *     raw session tokens cannot be derived.
 *  3. Maximum session lifetime is strictly 8 hours (expires_at).
 *  4. Revocation is instantaneous: logout writes `revoked_at = now()`, blocking replay immediately.
 *  5. Fail-Closed: any database outage, query error, or missing configuration denies access (returns false / 401).
 *  6. Service-role credentials are restricted strictly to server-side functions.
 *  7. Cross-instance login rate limiting (max 5 attempts / 15 min per IP) stored in DB.
 */

import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { sanitizeEnvVar } from "./adminMfa.js";

export const COOKIE_NAME         = "pilot_admin_session";
export const SESSION_MAX_AGE_SEC = 8 * 60 * 60; // 8 hours
export const RL_MAX_ATTEMPTS     = 5;
export const RL_WINDOW_MS        = 15 * 60 * 1000; // 15 minutes

/**
 * Returns a server-only Supabase client using the service role key.
 * Never exposes credentials to client-side code.
 */
export async function getSupabaseAdmin() {
  // The MFA readiness gate normalizes accidental UI/CLI quote wrapping and
  // whitespace. Apply the same normalization before Supabase createClient:
  // otherwise the gate can PASS while Supabase rejects the raw API key.
  const url = sanitizeEnvVar(process.env.SUPABASE_URL);
  const key = sanitizeEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY);
  // Fail closed: missing credentials – also clear any cached client/initialization state
  if (!url || !key) {
    // Invalidate cached client to ensure future calls with credentials create a new instance
    delete getSupabaseAdmin._cached;
    delete getSupabaseAdmin._initPromise;
    return null;
  }

  // Return cached client if credentials unchanged
  if (getSupabaseAdmin._cached && getSupabaseAdmin._cached.url === url && getSupabaseAdmin._cached.key === key) {
    return getSupabaseAdmin._cached.client;
  }

  // If initialization already in progress, await it
  if (getSupabaseAdmin._initPromise) {
    return await getSupabaseAdmin._initPromise;
  }

  // Begin initialization
  getSupabaseAdmin._initPromise = (async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    getSupabaseAdmin._cached = { url, key, client };
    return client;
  })();

  try {
    const client = await getSupabaseAdmin._initPromise;
    return client;
  } catch (err) {
    console.error("[AUTH] Failed to initialize Supabase client:", err.message);
    return null;
  } finally {
    getSupabaseAdmin._initPromise = undefined;
  }
}

/**
 * Hashes a raw session token using SHA-256.
 * The raw token is stored on the client; only the hash is stored in PostgreSQL.
 */
export function hashToken(token) {
  if (!token || typeof token !== "string") return "";
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Constant-time comparison to prevent timing attacks when comparing secrets.
 */
export function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const maxLen = Math.max(a.length, b.length);
  const pa = a.padEnd(maxLen, "\0");
  const pb = b.padEnd(maxLen, "\0");
  let diff = 0;
  for (let i = 0; i < maxLen; i++) diff |= pa.charCodeAt(i) ^ pb.charCodeAt(i);
  return diff === 0 && a.length === b.length;
}

/**
 * Classify Supabase/PostgREST errors using fixed labels only.
 * Never expose raw error messages, database URLs, IPs or credentials.
 * Preview-only diagnostics use these labels; auth always fails closed.
 */
export function classifyAdminRateLimitRpcError(error) {
  const code = String(error?.code || "");
  const message = String(error?.message || "").toLowerCase();
  if (code === "PGRST202" || code === "42883" ||
      /could not find the function|function .+ does not exist|schema cache/.test(message)) {
    return "rpc_missing_or_schema_cache";
  }
  if (/invalid api key|unregistered api key|apikey.*invalid|invalid apikey/.test(message)) {
    return "invalid_supabase_api_key";
  }
  if (code === "PGRST301" || code === "28P01" ||
      /jwt|invalid token|unauthorized|signature verification|authorization header/.test(message)) {
    return "supabase_authentication_failure";
  }
  if (code === "42501" ||
      /permission denied|insufficient privilege|not authorized|forbidden/.test(message)) {
    return "supabase_permission_denied";
  }
  if (code === "42P01" || /relation .+ does not exist/.test(message)) {
    return "database_schema_missing";
  }
  if (/timeout|timed out|fetch failed|connection refused|network error|database unavailable/.test(message)) {
    return "supabase_connection_failure";
  }
  return "unclassified_rpc_error";
}

/**
 * Checks and records login attempt for cross-instance rate limiting.
 * Fails closed: if database is unreachable, login is blocked.
 *
 * @param {string} ip
 * @returns {Promise<{ allowed: boolean, reason?: string }>}
 */
export async function checkAndRecordLoginAttempt(ip) {
  const sb = await getSupabaseAdmin();
  if (!sb) {
    // Fail closed: cannot verify rate limit without DB
    return { allowed: false, reason: "Database unavailable" };
  }

  try {
    // 1. Primary: Transaction-safe atomic stored procedure with pg_advisory_xact_lock
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

      // Only on isolated Preview: categorize failures without emitting error
      // messages, user IPs, database URLs, API keys, or submitted credentials.
      // Keep production and public API responses generic and fail closed.
      if (process.env.VERCEL_ENV === "preview") {
        const permittedCodes = new Set([
          "PGRST202", "PGRST301", "PGRST116", "42501",
          "42883", "28P01", "401", "403",
        ]);
        const code = typeof rpcErr?.code === "string" && permittedCodes.has(rpcErr.code)
          ? rpcErr.code : "OTHER";
        const issue = rpcErr ? "rpc_error" :
          data === null || data === undefined ? "empty_response" : "unexpected_response";
        const responseType = data === null || data === undefined ? "null" :
          Array.isArray(data) ? "array" : typeof data;
        const category = rpcErr ? classifyAdminRateLimitRpcError(rpcErr) : "none";
        const rawStatus = Number(rpcErr?.status);
        const httpStatus = Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus <= 599
          ? rawStatus : null;
        console.warn("[Admin Rate Limit Diagnostics]", JSON.stringify({
          issue,
          code: rpcErr ? code : "NONE",
          category,
          httpStatus,
          responseType,
        }));
      }
    } else if (process.env.VERCEL_ENV === "preview") {
      console.warn("[Admin Rate Limit Diagnostics]", JSON.stringify({
        issue: "rpc_client_unavailable",
      }));
    }

    // Fail closed if RPC returned an error, null, or unexpected payload
    return { allowed: false, reason: "Rate limit verification failed" };
  } catch (err) {
    console.error("[AUTH] Rate limit exception:", err.message);
    return { allowed: false, reason: "Rate limit error" };
  }
}

/**
 * Creates a new administrative session in Supabase.
 * Returns the raw token to set in the HttpOnly cookie.
 *
 * @param {string} ip
 * @param {string} userAgent
 * @returns {Promise<string | null>} rawToken
 */
export async function createSession(ip, userAgent) {
  const sb = await getSupabaseAdmin();
  if (!sb) return null; // Fail closed

  // 32 cryptographically random bytes = 256 bits of entropy
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000).toISOString();

  try {
    const { error } = await sb.from("admin_sessions").insert({
      token_hash: tokenHash,
      expires_at: expiresAt,
      ip_address: ip || "unknown",
      user_agent: userAgent ? userAgent.slice(0, 500) : "unknown",
    });

    if (error) {
      console.error("[AUTH] Failed to create session in DB:", error.message);
      return null;
    }

    return rawToken;
  } catch (err) {
    console.error("[AUTH] createSession exception:", err.message);
    return null;
  }
}

/**
 * Validates a session token against Supabase.
 * Checks:
 *  1. Hash exists in database
 *  2. revoked_at IS NULL (not revoked)
 *  3. expires_at > now() (not expired)
 *
 * Fail Closed: Any DB error, connection drop, or missing data returns false.
 *
 * @param {string} rawToken
 * @returns {Promise<boolean>}
 */
export async function verifySession(rawToken) {
  if (!rawToken || typeof rawToken !== "string" || rawToken.length !== 64) {
    return false;
  }

  const sb = await getSupabaseAdmin();
  if (!sb) return false; // Fail closed

  const tokenHash = hashToken(rawToken);
  const nowIso = new Date().toISOString();

  try {
    const { data, error } = await sb
      .from("admin_sessions")
      .select("expires_at, revoked_at")
      .eq("token_hash", tokenHash)
      .is("revoked_at", null)
      .gt("expires_at", nowIso)
      .maybeSingle();

    if (error) {
      console.error("[AUTH] verifySession DB error:", error.message);
      return false; // Fail closed
    }

    return !!data;
  } catch (err) {
    console.error("[AUTH] verifySession exception:", err.message);
    return false; // Fail closed
  }
}

/**
 * Revokes a session immediately in Supabase.
 * Sets `revoked_at = now()`.
 *
 * @param {string} rawToken
 * @returns {Promise<boolean>}
 */
export async function revokeSession(rawToken) {
  if (!rawToken || typeof rawToken !== "string") return false;

  const sb = await getSupabaseAdmin();
  if (!sb) return false;

  const tokenHash = hashToken(rawToken);

  try {
    const { error } = await sb
      .from("admin_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("token_hash", tokenHash);

    if (error) {
      console.error("[AUTH] revokeSession error:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[AUTH] revokeSession exception:", err.message);
    return false;
  }
}

/**
 * Standard cookie configuration for the session identifier.
 */
export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   SESSION_MAX_AGE_SEC,
    path:     "/",
  };
}
