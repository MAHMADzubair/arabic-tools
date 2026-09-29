/**
 * POST /api/pilot
 * Lead capture endpoint for the AI Sales Closer pilot programme.
 *
 * Storage strategy (in priority order):
 *  1. Supabase (persistent) — used when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.
 *  2. /tmp fallback + console.log — used during local dev or if Supabase is not yet configured.
 *
 * HOW TO CONFIGURE SUPABASE:
 *  1. Create a free project at https://supabase.com
 *  2. Run this SQL in the Supabase SQL editor:
 *       CREATE TABLE pilot_leads (
 *         id          TEXT PRIMARY KEY,
 *         submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 *         name        TEXT NOT NULL,
 *         store_name  TEXT NOT NULL,
 *         email       TEXT NOT NULL,
 *         whatsapp    TEXT NOT NULL,
 *         platform    TEXT NOT NULL,
 *         volume      TEXT NOT NULL,
 *         problem     TEXT NOT NULL,
 *         trial_interest TEXT NOT NULL,
 *         ip          TEXT
 *       );
 *  3. Add these env vars in Vercel dashboard (Settings → Environment Variables):
 *       SUPABASE_URL            = https://xxxx.supabase.co
 *       SUPABASE_SERVICE_ROLE_KEY = eyJ...   (service_role key — server-only, never public)
 *  4. Redeploy. Leads will be saved persistently to Supabase.
 *
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY client-side.
 * Never use NEXT_PUBLIC_ prefix for this key.
 */

import { NextResponse }           from "next/server";
import { writeFile, readFile }    from "fs/promises";
import { join }                   from "path";

// ── In-memory rate-limit: max 3 submissions per IP per 10 minutes ─────────────
const rateLimitMap = new Map();
const RATE_LIMIT_MAX    = 3;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;

function checkRateLimit(ip) {
  const now   = Date.now();
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
const VALID_PROBLEMS  = ["no_followup", "price_objection", "slow_response", "cart_abandon", "unknown_loss", "other"];
const VALID_INTEREST  = ["yes", "maybe"];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
function isValidWhatsApp(num) {
  return /^\D*(\d\D*){9,15}$/.test(num);
}
function sanitizeStr(val, maxLen = 120) {
  return String(val || "").trim().slice(0, maxLen);
}

// ── Supabase lazy init (only when env vars are present) ───────────────────────
let _supabase = null;
function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const { createClient } = require("@supabase/supabase-js");
    _supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return _supabase;
  } catch (err) {
    console.error("[PILOT] Supabase init failed:", err.message);
    return null;
  }
}

// ── Persist lead ──────────────────────────────────────────────────────────────
async function persistLead(lead) {
  // 1. Always log (visible in Vercel function logs)
  console.log("[PILOT LEAD]", JSON.stringify(lead));

  // 2. Try Supabase (persistent)
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("pilot_leads").insert({
      id:             lead.id,
      submitted_at:  lead.submittedAt,
      name:          lead.name,
      store_name:    lead.storeName,
      email:         lead.email,
      whatsapp:      lead.whatsapp,
      platform:      lead.platform,
      volume:        lead.volume,
      problem:       lead.problem,
      trial_interest: lead.trialInterest,
      ip:            lead.ip,
    });
    if (error) {
      console.error("[PILOT] Supabase insert error:", error.message);
      // Fall through to /tmp backup
    } else {
      console.log("[PILOT] Saved to Supabase:", lead.id);
      return;
    }
  } else {
    console.warn("[PILOT] Supabase not configured — SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing. Add these env vars in Vercel to enable persistent storage.");
  }

  // 3. /tmp fallback (ephemeral — only for local dev / pre-Supabase)
  try {
    const filePath = join("/tmp", "pilot-leads.json");
    let existing  = [];
    try { existing = JSON.parse(await readFile(filePath, "utf8")); } catch { /* fresh */ }
    existing.push(lead);
    await writeFile(filePath, JSON.stringify(existing, null, 2), "utf8");
  } catch (err) {
    console.warn("[PILOT] /tmp write failed:", err.message);
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────
export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ success: false, error: "too_many_requests" }, { status: 429 });
  }

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 }); }

  const { name, storeName, email, whatsapp, platform, volume, problem, trialInterest, _honey } = body;

  // Honeypot
  if (_honey && String(_honey).length > 0) {
    return NextResponse.json({ success: true }); // silent accept
  }

  const errors      = {};
  const cleanName      = sanitizeStr(name);
  const cleanStore     = sanitizeStr(storeName);
  const cleanEmail     = sanitizeStr(email, 200);
  const cleanWhatsApp  = sanitizeStr(whatsapp, 30);
  const cleanPlatform  = sanitizeStr(platform, 30).toLowerCase();
  const cleanVolume    = sanitizeStr(volume, 30).toLowerCase();
  const cleanProblem   = sanitizeStr(problem, 30).toLowerCase();
  const cleanInterest  = sanitizeStr(trialInterest, 10).toLowerCase();

  if (!cleanName)                                   errors.name          = "الاسم مطلوب";
  if (!cleanStore)                                  errors.storeName     = "اسم المتجر مطلوب";
  if (!cleanEmail || !isValidEmail(cleanEmail))     errors.email         = "البريد الإلكتروني غير صالح";
  if (!cleanWhatsApp || !isValidWhatsApp(cleanWhatsApp)) errors.whatsapp = "رقم واتساب غير صالح";
  if (!VALID_PLATFORMS.includes(cleanPlatform))     errors.platform      = "اختر المنصة";
  if (!VALID_VOLUMES.includes(cleanVolume))         errors.volume        = "اختر حجم المحادثات";
  if (!VALID_PROBLEMS.includes(cleanProblem))       errors.problem       = "اختر المشكلة الرئيسية";
  if (!VALID_INTEREST.includes(cleanInterest))      errors.trialInterest = "اختر خيار التجربة";

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

  await persistLead(lead);

  return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
}
