/**
 * Private owner access configuration and RFC 6238 TOTP verification.
 * No credentials, TOTP seeds, or attempted codes may be sent to public clients.
 *
 * Enrollment is performed out-of-band in the owner's authenticator application.
 * Credentials are supplied as server-only environment variables.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TOTP_DIGITS = 6;
const TOTP_PERIOD_SECONDS = 30;

export function sanitizeEnvVar(value) {
  if (typeof value !== "string") return "";
  let s = value.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export function decodeBase32(input) {
  if (typeof input !== "string") return null;
  const cleaned = input.replace(/[\s"'-]/g, "").toUpperCase().replace(/=+$/, "");
  if (!/^[A-Z2-7]+$/.test(cleaned) || cleaned.length < 32) return null;

  let buffer = 0;
  let bitCount = 0;
  const bytes = [];

  for (const char of cleaned) {
    const value = ALPHABET.indexOf(char);
    if (value < 0) return null;
    buffer = (buffer << 5) | value;
    bitCount += 5;
    if (bitCount >= 8) {
      bitCount -= 8;
      bytes.push((buffer >>> bitCount) & 0xff);
      buffer &= (1 << bitCount) - 1;
    }
  }
  if (bitCount && buffer !== 0) return null;
  return bytes.length >= 20 ? Buffer.from(bytes) : null;
}

export function getAdminAuthConfigStatus() {
  const email = sanitizeEnvVar(process.env.ADMIN_LOGIN_EMAIL);
  const password = sanitizeEnvVar(process.env.ADMIN_SECRET);
  const totpSecret = sanitizeEnvVar(process.env.ADMIN_TOTP_SECRET);
  const flag = sanitizeEnvVar(process.env.ADMIN_MFA_ENABLED);
  const url = sanitizeEnvVar(process.env.SUPABASE_URL);
  const key = sanitizeEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return {
    ADMIN_LOGIN_EMAIL: Boolean(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "PASS" : "FAIL",
    ADMIN_SECRET: Boolean(password) && password.length >= 24 ? "PASS" : "FAIL",
    ADMIN_TOTP_SECRET: Boolean(totpSecret) && Boolean(decodeBase32(totpSecret)) ? "PASS" : "FAIL",
    ADMIN_MFA_ENABLED: flag.toLowerCase() === "true" ? "PASS" : "FAIL",
    SUPABASE_URL: Boolean(url) ? "PASS" : "FAIL",
    SUPABASE_SERVICE_ROLE_KEY: Boolean(key) ? "PASS" : "FAIL",
  };
}

export function isAdminAuthConfigured() {
  const status = getAdminAuthConfigStatus();
  return (
    status.ADMIN_MFA_ENABLED === "PASS" &&
    status.ADMIN_LOGIN_EMAIL === "PASS" &&
    status.ADMIN_SECRET === "PASS" &&
    status.ADMIN_TOTP_SECRET === "PASS" &&
    status.SUPABASE_URL === "PASS" &&
    status.SUPABASE_SERVICE_ROLE_KEY === "PASS"
  );
}

function totpAtCounter(secretBytes, counter) {
  if (!Number.isSafeInteger(counter) || counter < 0) return null;
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", secretBytes).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const value = (digest.readUInt32BE(offset) & 0x7fffffff) % (10 ** TOTP_DIGITS);
  return String(value).padStart(TOTP_DIGITS, "0");
}

export function verifyAdminTotp(code, secret = process.env.ADMIN_TOTP_SECRET, nowMs = Date.now()) {
  const bytes = decodeBase32(secret);
  if (!bytes || typeof code !== "string" || !/^\d{6}$/.test(code) || !Number.isFinite(nowMs) || nowMs < 0) {
    return false;
  }

  const counter = Math.floor(nowMs / 1000 / TOTP_PERIOD_SECONDS);
  const supplied = Buffer.from(code, "utf8");
  let valid = false;
  // A narrow +/- 30s clock tolerance; rate limiting still applies to every attempt.
  for (const offset of [-1, 0, 1]) {
    const expected = totpAtCounter(bytes, counter + offset);
    if (expected && timingSafeEqual(supplied, Buffer.from(expected, "utf8"))) valid = true;
  }
  return valid;
}
