/**
 * POST /api/pilot
 * Lead capture for AI Sales Closer pilot programme.
 *
 * Storage: Supabase (primary) → /tmp + console.log (fallback)
 *
 * Required env vars (set in Vercel → Settings → Environment Variables):
 *   SUPABASE_URL              https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY eyJ...  (service_role, server-only — NEVER prefix with NEXT_PUBLIC_)
 *
 * SQL schema (run once in Supabase SQL editor):
 *   See /supabase/migrations/001_pilot_leads.sql
 */

import { NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

// ── Rate limit: 3 submissions / IP / 10 min ────────────────────────────────
const rlMap = new Map(); // ip → { count, resetAt }
const RL_MAX = 3, RL_WIN = 10 * 60 * 1000;

function checkRL(ip) {
  const now = Date.now(), e = rlMap.get(ip);
  if (!e || now > e.resetAt) { rlMap.set(ip, { count: 1, resetAt: now + RL_WIN }); return true; }
  if (e.count >= RL_MAX) return false;
  e.count++; return true;
}

// ── Dedup: block same email within 2 min ──────────────────────────────────
const dedupMap = new Map(); // email → lastSubmitAt
const DEDUP_WIN = 2 * 60 * 1000;

function checkDedup(email) {
  const now = Date.now(), last = dedupMap.get(email);
  if (last && now - last < DEDUP_WIN) return false;
  dedupMap.set(email, now); return true;
}

// ── Validation constants ───────────────────────────────────────────────────
const VALID_PLATFORMS = ["salla", "shopify", "zid", "other"];
const VALID_VOLUMES   = ["lt_100", "100_500", "500_2000", "gt_2000"];
const VALID_PROBLEMS  = ["no_followup", "price_objection", "slow_response", "cart_abandon", "unknown_loss", "other"];
const VALID_INTEREST  = ["yes", "maybe"];

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isPhone = (v) => /^\D*(\d\D*){9,15}$/.test(v);
const trim    = (v, n = 120) => String(v ?? "").trim().slice(0, n);

// Normalize phone: strip everything except + and digits, keep leading +
function normalizePhone(raw) {
  const stripped = String(raw ?? "").trim();
  const digits   = stripped.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : digits.replace(/^0+/, "");
}

// ── Supabase client (lazy, server-side only) ───────────────────────────────
let _sb = null;
function getSupabase() {
  if (_sb) return _sb;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const { createClient } = require("@supabase/supabase-js");
    _sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    return _sb;
  } catch (err) {
    console.error("[PILOT] Supabase init error:", err.message);
    return null;
  }
}

// ── Lead priority (internal scoring, never exposed to merchant) ─────────────
function calcPriority(volume, trialInterest) {
  if ((volume === "500_2000" || volume === "gt_2000") && trialInterest === "yes") return "high";
  if (volume === "100_500" || trialInterest === "maybe") return "medium";
  return "low";
}

// ── Persist lead ─────────────────────────────────────────────────────────────
async function persistLead(lead) {
  // Always log (Vercel function logs)
  console.log("[PILOT LEAD]", JSON.stringify({ ...lead, ip: "REDACTED" }));

  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from("pilot_leads").insert({
      id:                          lead.id,
      name:                        lead.name,
      store_name:                  lead.storeName,
      email:                       lead.email,
      whatsapp:                    lead.whatsapp,
      platform:                    lead.platform,
      monthly_conversation_volume: lead.volume,
      biggest_problem:             lead.problem,
      trial_interest:              lead.trialInterest,
      priority:                    lead.priority,
      source:                      lead.source,
      referrer:                    lead.referrer,
      user_agent:                  lead.userAgent,
      ip:                          lead.ip,
      created_at:                  lead.createdAt,
    });
    if (error) {
      console.error("[PILOT] Supabase insert error:", error.message);
      // fall through to /tmp
    } else {
      console.log("[PILOT] Saved to Supabase:", lead.id);
      return { saved: "supabase" };
    }
  } else {
    console.warn("[PILOT] Supabase not configured — set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in Vercel.");
  }

  // /tmp fallback (ephemeral — local dev only)
  try {
    const fp = join("/tmp", "pilot-leads.json");
    let arr = [];
    try { arr = JSON.parse(await readFile(fp, "utf8")); } catch { /* fresh */ }
    arr.push(lead);
    await writeFile(fp, JSON.stringify(arr, null, 2), "utf8");
  } catch (err) {
    console.warn("[PILOT] /tmp write failed:", err.message);
  }
  return { saved: "tmp_fallback" };
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!checkRL(ip)) {
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

  // Normalize
  const cleanName      = trim(name);
  const cleanStore     = trim(storeName);
  const cleanEmail     = trim(email, 200).toLowerCase();
  const cleanWhatsApp  = normalizePhone(whatsapp);
  const cleanPlatform  = trim(platform, 30).toLowerCase();
  const cleanVolume    = trim(volume, 30).toLowerCase();
  const cleanProblem   = trim(problem, 30).toLowerCase();
  const cleanInterest  = trim(trialInterest, 10).toLowerCase();

  // Validate
  const errors = {};
  if (!cleanName)                                    errors.name          = "الاسم مطلوب";
  if (!cleanStore)                                   errors.storeName     = "اسم المتجر مطلوب";
  if (!cleanEmail || !isEmail(cleanEmail))           errors.email         = "البريد الإلكتروني غير صالح";
  if (!cleanWhatsApp || !isPhone(cleanWhatsApp))     errors.whatsapp      = "رقم واتساب غير صالح";
  if (!VALID_PLATFORMS.includes(cleanPlatform))      errors.platform      = "اختر المنصة";
  if (!VALID_VOLUMES.includes(cleanVolume))          errors.volume        = "اختر حجم المحادثات";
  if (!VALID_PROBLEMS.includes(cleanProblem))        errors.problem       = "اختر المشكلة الرئيسية";
  if (!VALID_INTEREST.includes(cleanInterest))       errors.trialInterest = "اختر خيار التجربة";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ success: false, errors }, { status: 422 });
  }

  // Dedup
  if (!checkDedup(cleanEmail)) {
    return NextResponse.json({ success: false, error: "duplicate_submission" }, { status: 429 });
  }

  // Build lead record
  const lead = {
    id:            `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt:     new Date().toISOString(),
    name:          cleanName,
    storeName:     cleanStore,
    email:         cleanEmail,
    whatsapp:      cleanWhatsApp,
    platform:      cleanPlatform,
    volume:        cleanVolume,
    problem:       cleanProblem,
    trialInterest: cleanInterest,
    priority:      calcPriority(cleanVolume, cleanInterest),
    source:        trim(body.source || "direct", 60),
    referrer:      trim(request.headers.get("referer") || "", 200),
    userAgent:     trim(request.headers.get("user-agent") || "", 300),
    ip,
  };

  const result = await persistLead(lead);

  return NextResponse.json(
    { success: true, leadId: lead.id, stored: result.saved },
    { status: 201 }
  );
}
