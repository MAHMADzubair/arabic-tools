/**
 * lib/integrations/googleAuth.js
 *
 * Lightweight, zero-dependency server-side Google Service Account & OAuth2 token exchanger.
 * Uses standard Node.js crypto and fetch. Never exposes private keys or raw tokens to browsers.
 */

import { createSign } from "node:crypto";
import { sanitizeEnvVar } from "../adminMfa.js";

const tokenCache = new Map();

/**
 * Normalizes PEM private key formatting (handles escaped newlines, quotes, trailing spaces).
 */
export function normalizePrivateKey(key) {
  if (typeof key !== "string") return "";
  let clean = sanitizeEnvVar(key);
  // Replace literal '\n' characters with actual newlines if stored in single-line env strings
  clean = clean.replace(/\\n/g, "\n").trim();
  return clean;
}

/**
 * Builds and signs a Google RS256 JWT assertion for a service account.
 */
export function createSignedJwt(clientEmail, privateKeyPem, scopes, audience = "https://oauth2.googleapis.com/token") {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const scopeStr = Array.isArray(scopes) ? scopes.join(" ") : scopes;

  const payload = {
    iss: clientEmail,
    scope: scopeStr,
    aud: audience,
    exp: now + 3600,
    iat: now,
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signInput = `${b64Header}.${b64Payload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(signInput);
  const signature = signer.sign(privateKeyPem, "base64url");

  return `${signInput}.${signature}`;
}

/**
 * Obtains an OAuth2 access token for a Google Service Account.
 * Returns cached token when valid. Fails closed with descriptive, non-sensitive errors.
 */
export async function getGoogleServiceAccountAccessToken({
  clientEmail,
  privateKey,
  scopes,
  timeoutMs = 8000,
}) {
  const email = sanitizeEnvVar(clientEmail);
  const key = normalizePrivateKey(privateKey);
  const scopeList = Array.isArray(scopes) ? scopes : [scopes];
  const cacheKey = `sa:${email}:${scopeList.sort().join(",")}`;

  if (!email || !key || scopeList.length === 0) {
    return { ok: false, error: "missing_credentials", message: "Client email or private key is missing." };
  }

  // Check cache
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60000) {
    return { ok: true, token: cached.token, fromCache: true };
  }

  try {
    const jwt = createSignedJwt(email, key, scopeList);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const status = res.status;
      return {
        ok: false,
        error: "auth_token_rejected",
        status,
        message: `Google OAuth returned status ${status}`,
      };
    }

    const data = await res.json();
    const token = data.access_token;
    const expiresInSec = typeof data.expires_in === "number" ? data.expires_in : 3600;

    if (!token) {
      return { ok: false, error: "invalid_token_response", message: "Token missing in response." };
    }

    tokenCache.set(cacheKey, {
      token,
      expiresAt: Date.now() + expiresInSec * 1000,
    });

    return { ok: true, token, fromCache: false };
  } catch (err) {
    return {
      ok: false,
      error: err.name === "AbortError" ? "timeout" : "network_error",
      message: err.name === "AbortError" ? "Google OAuth exchange timed out." : "Connection failed.",
    };
  }
}

/**
 * Exchanges an OAuth2 refresh token for an access token (for AdSense Management API).
 */
export async function getGoogleOAuthAccessToken({
  clientId,
  clientSecret,
  refreshToken,
  timeoutMs = 8000,
}) {
  const cId = sanitizeEnvVar(clientId);
  const cSecret = sanitizeEnvVar(clientSecret);
  const rToken = sanitizeEnvVar(refreshToken);
  const cacheKey = `oauth:${cId}`;

  if (!cId || !cSecret || !rToken) {
    return { ok: false, error: "missing_credentials", message: "OAuth client ID, secret, or refresh token missing." };
  }

  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60000) {
    return { ok: true, token: cached.token, fromCache: true };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: cId,
        client_secret: cSecret,
        refresh_token: rToken,
        grant_type: "refresh_token",
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        ok: false,
        error: "refresh_token_rejected",
        status: res.status,
        message: `Google OAuth token refresh failed with status ${res.status}`,
      };
    }

    const data = await res.json();
    const token = data.access_token;
    const expiresInSec = typeof data.expires_in === "number" ? data.expires_in : 3600;

    tokenCache.set(cacheKey, {
      token,
      expiresAt: Date.now() + expiresInSec * 1000,
    });

    return { ok: true, token, fromCache: false };
  } catch (err) {
    return {
      ok: false,
      error: err.name === "AbortError" ? "timeout" : "network_error",
      message: err.name === "AbortError" ? "OAuth request timed out." : "Connection failed.",
    };
  }
}

