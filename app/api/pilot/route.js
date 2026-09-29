/**
 * POST /api/pilot
 * Lead capture endpoint for the AI Sales Closer pilot programme.
 * Validates the submission, logs it to console (always),
 * and appends to /tmp/pilot-leads.json (ephemeral on Vercel — acts as
 * a buffer until a proper database is wired up).
 *
 * No secrets are exposed client-side.
 * Basic rate-limiting via in-memory Map (resets on cold start).
 */

import { NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

// ── In-memory rate-limit: max 3 submissions per IP per 10 minutes ─────────────
const rateLimitMap = new Map(); // ip → { count, resetAt }
const RATE_LIMIT_MAX      = 3;
const RATE_LIMIT_WINDOW   = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(ip) {
  const now  = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

// ── Validators ────────────────────────────────────────────────────────────────
const VALID_PLATFORMS = ["salla", "shopify", "zid", "other"];
const VALID_VOLUMES   = ["lt_100", "100_500", "500_2000", "gt_2000"];
const VALID_PROBLEMS  = [
  "no_followup", "price_objection", "slow_response",
  "cart_abandon", "unknown_loss", "other",
];
const VALID_INTEREST  = ["yes", "maybe"];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isValidWhatsApp(num) {
  // Allow digits, +, spaces, dashes — min 9 digits
  const digits = num.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

function sanitizeStr(val, maxLen = 120) {
  return String(val || "").trim().slice(0, maxLen);
}

// ── Handler ───────────────────────────────────────────────────────────────────
export async function POST(request) {
  // IP for rate-limiting (Vercel sets x-forwarded-for)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: "too_many_requests" },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  const {
    name, storeName, email, whatsapp, platform,
    volume, problem, trialInterest,
    _honey, // honeypot — must be empty
  } = body;

  // Honeypot check
  if (_honey && String(_honey).length > 0) {
    // Silently accept to not tip off bots
    return NextResponse.json({ success: true });
  }

  // Required field validation
  const errors = {};
  const cleanName      = sanitizeStr(name);
  const cleanStore     = sanitizeStr(storeName);
  const cleanEmail     = sanitizeStr(email, 200);
  const cleanWhatsApp  = sanitizeStr(whatsapp, 30);
  const cleanPlatform  = sanitizeStr(platform, 30).toLowerCase();
  const cleanVolume    = sanitizeStr(volume, 30).toLowerCase();
  const cleanProblem   = sanitizeStr(problem, 30).toLowerCase();
  const cleanInterest  = sanitizeStr(trialInterest, 10).toLowerCase();

  if (!cleanName)                          errors.name      = "الاسم مطلوب";
  if (!cleanStore)                         errors.storeName = "اسم المتجر مطلوب";
  if (!cleanEmail || !isValidEmail(cleanEmail)) errors.email = "البريد الإلكتروني غير صالح";
  if (!cleanWhatsApp || !isValidWhatsApp(cleanWhatsApp)) errors.whatsapp = "رقم واتساب غير صالح";
  if (!VALID_PLATFORMS.includes(cleanPlatform)) errors.platform = "اختر المنصة";
  if (!VALID_VOLUMES.includes(cleanVolume))     errors.volume   = "اختر حجم المحادثات";
  if (!VALID_PROBLEMS.includes(cleanProblem))   errors.problem  = "اختر المشكلة الرئيسية";
  if (!VALID_INTEREST.includes(cleanInterest))  errors.trialInterest = "اختر خيار التجربة";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ success: false, errors }, { status: 422 });
  }

  const lead = {
    id:            `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    submittedAt:   new Date().toISOString(),
    name:          cleanName,
    storeName:     cleanStore,
    email:         cleanEmail,
    whatsapp:      cleanWhatsApp,
    platform:      cleanPlatform,
    volume:        cleanVolume,
    problem:       cleanProblem,
    trialInterest: cleanInterest,
    ip,
  };

  // Always log (visible in Vercel function logs)
  console.log("[PILOT LEAD]", JSON.stringify(lead));

  // Append to /tmp/pilot-leads.json (ephemeral but useful for local dev)
  try {
    const filePath = join("/tmp", "pilot-leads.json");
    let existing = [];
    try {
      const raw = await readFile(filePath, "utf8");
      existing  = JSON.parse(raw);
    } catch {
      // File doesn't exist yet — start fresh
    }
    existing.push(lead);
    await writeFile(filePath, JSON.stringify(existing, null, 2), "utf8");
  } catch (err) {
    // Non-fatal — lead is already logged to console
    console.warn("[PILOT LEAD] /tmp write failed:", err.message);
  }

  return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
}
