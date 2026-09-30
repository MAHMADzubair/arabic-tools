/**
 * POST /api/pilot — AI Sales Closer lead capture
 * Production: Supabase mandatory. No /tmp fallback in prod.
 * Dev: /tmp fallback allowed.
 */
import { NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

const IS_PROD = process.env.NODE_ENV === "production";

// Rate limit: 3 / IP / 10 min
const rlMap = new Map();
const RL_MAX = 3, RL_WIN = 10 * 60 * 1000;
function checkRL(ip) {
  const now = Date.now(), e = rlMap.get(ip);
  if (!e || now > e.resetAt) { rlMap.set(ip, { count: 1, resetAt: now + RL_WIN }); return true; }
  if (e.count >= RL_MAX) return false;
  e.count++; return true;
}

// Dedup: 24h window by email+whatsapp hash
const dedupMap = new Map();
const DEDUP_WIN = 24 * 60 * 60 * 1000;
function checkDedup(email, phone) {
  const key = `${email}|${phone}`, now = Date.now(), last = dedupMap.get(key);
  if (last && now - last < DEDUP_WIN) return false;
  dedupMap.set(key, now); return true;
}

// Validators
const VALID_PLATFORMS = ["salla","shopify","zid","other"];
const VALID_VOLUMES   = ["lt_100","100_500","500_2000","gt_2000"];
const VALID_PROBLEMS  = ["no_followup","price_objection","slow_response","cart_abandon","unknown_loss","other"];
const VALID_INTEREST  = ["yes","maybe"];
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isPhone = v => /^\D*(\d\D*){9,15}$/.test(v);
const clean   = (v, n=120) => String(v ?? "").trim().slice(0, n);
function normalizePhone(raw) {
  const s = String(raw ?? "").trim(), d = s.replace(/[^\d+]/g,"");
  return d.startsWith("+") ? d : d.replace(/^0+/, "");
}

// Priority scoring (internal only)
function calcPriority(volume, interest) {
  if ((volume === "500_2000" || volume === "gt_2000") && interest === "yes") return "high";
  if (volume === "100_500" || interest === "maybe") return "medium";
  return "low";
}

// Supabase client
let _sb = null;
function getSB() {
  if (_sb) return _sb;
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const { createClient } = require("@supabase/supabase-js");
    _sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    return _sb;
  } catch (err) { console.error("[PILOT] SB init:", err.message); return null; }
}

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRL(ip)) return NextResponse.json({ success:false, error:"too_many_requests" }, { status:429 });

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success:false, error:"invalid_json" }, { status:400 }); }

  // Honeypot
  if (body._honey && String(body._honey).length > 0) return NextResponse.json({ success:true });

  // Normalize
  const name      = clean(body.name);
  const storeName = clean(body.storeName);
  const email     = clean(body.email, 200).toLowerCase();
  const whatsapp  = normalizePhone(body.whatsapp);
  const platform  = clean(body.platform, 30).toLowerCase();
  const volume    = clean(body.volume, 30).toLowerCase();
  const problem   = clean(body.problem, 30).toLowerCase();
  const interest  = clean(body.trialInterest, 10).toLowerCase();

  // Validate
  const errors = {};
  if (!name)                        errors.name          = "الاسم مطلوب";
  if (!storeName)                   errors.storeName     = "اسم المتجر مطلوب";
  if (!email || !isEmail(email))    errors.email         = "البريد الإلكتروني غير صالح";
  if (!whatsapp || !isPhone(whatsapp)) errors.whatsapp   = "رقم واتساب غير صالح";
  if (!VALID_PLATFORMS.includes(platform)) errors.platform = "اختر المنصة";
  if (!VALID_VOLUMES.includes(volume))     errors.volume   = "اختر حجم المحادثات";
  if (!VALID_PROBLEMS.includes(problem))   errors.problem  = "اختر المشكلة الرئيسية";
  if (!VALID_INTEREST.includes(interest))  errors.trialInterest = "اختر خيار التجربة";
  if (Object.keys(errors).length > 0) return NextResponse.json({ success:false, errors }, { status:422 });

  // Dedup
  if (!checkDedup(email, whatsapp)) return NextResponse.json({ success:true, leadId:"dedup" }, { status:200 });

  // UTM params
  const utmSource   = clean(body.utm_source,   80);
  const utmMedium   = clean(body.utm_medium,   80);
  const utmCampaign = clean(body.utm_campaign, 120);
  const utmContent  = clean(body.utm_content,  120);
  const utmTerm     = clean(body.utm_term,     120);

  const lead = {
    id:                          `lead_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    created_at:                  new Date().toISOString(),
    name, store_name: storeName, email, whatsapp, platform,
    monthly_conversation_volume: volume,
    biggest_problem:             problem,
    trial_interest:              interest,
    priority:                    calcPriority(volume, interest),
    source:      clean(body.source || "direct", 60),
    referrer:    clean(request.headers.get("referer") || "", 200),
    user_agent:  clean(request.headers.get("user-agent") || "", 300),
    utm_source:   utmSource,
    utm_medium:   utmMedium,
    utm_campaign: utmCampaign,
    utm_content:  utmContent,
    utm_term:     utmTerm,
    // IP not stored persistently — used only for in-memory rate limiting above
  };

  // Always log (Vercel function logs)
  console.log("[PILOT LEAD]", JSON.stringify({ ...lead, user_agent: "REDACTED" }));

  const sb = getSB();

  // ── PRODUCTION: Supabase is mandatory ───────────────────────────────────
  if (IS_PROD) {
    if (!sb) {
      console.error("[PILOT] FATAL: Supabase not configured in production.");
      return NextResponse.json({ success:false, error:"service_unavailable", message:"تعذر حفظ طلبك حالياً. يرجى المحاولة لاحقاً." }, { status:503 });
    }
    const { error } = await sb.from("pilot_leads").insert(lead);
    if (error) {
      console.error("[PILOT] Supabase insert error:", error.message);
      return NextResponse.json({ success:false, error:"database_error", message:"تعذر حفظ طلبك حالياً. يرجى المحاولة لاحقاً." }, { status:503 });
    }
    return NextResponse.json({ success:true, leadId: lead.id }, { status:201 });
  }

  // ── DEV: try Supabase, fallback to /tmp ──────────────────────────────────
  if (sb) {
    const { error } = await sb.from("pilot_leads").insert(lead);
    if (!error) return NextResponse.json({ success:true, leadId: lead.id }, { status:201 });
    console.warn("[PILOT] SB insert failed, using /tmp fallback:", error.message);
  } else {
    console.warn("[PILOT] Supabase not configured — using /tmp fallback (dev only).");
  }
  try {
    const fp = join("/tmp","pilot-leads.json");
    let arr = [];
    try { arr = JSON.parse(await readFile(fp,"utf8")); } catch {}
    arr.push(lead);
    await writeFile(fp, JSON.stringify(arr, null, 2), "utf8");
  } catch (err) { console.warn("[PILOT] /tmp write failed:", err.message); }
  return NextResponse.json({ success:true, leadId: lead.id }, { status:201 });
}
