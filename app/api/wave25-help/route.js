/**
 * POST /api/wave25-help — "help me integrate" requests from the Wave 25 checker.
 * Stores to Supabase (table wave25_leads, migration 003). Never claims success
 * if the row was not stored. Contact consent is required; sharing with one
 * provider or consultant needs a separate, optional consent (PDPL).
 */
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { INVOICING_SYSTEMS } from "@/lib/wave25NextSteps";

const rl = new Map();
const RL_MAX = 3;
const RL_WINDOW = 10 * 60 * 1000;
function allow(ip) {
  const now = Date.now();
  const e = rl.get(ip);
  if (!e || now > e.resetAt) {
    rl.set(ip, { count: 1, resetAt: now + RL_WINDOW });
    return true;
  }
  if (e.count >= RL_MAX) return false;
  e.count += 1;
  return true;
}

const clean = (v, n = 120) => String(v ?? "").trim().slice(0, n);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const normalizePhone = (raw) => {
  const d = String(raw ?? "").replace(/[^\d+]/g, "");
  return d.startsWith("+") ? d : d.replace(/^0+/, "");
};
const isPhone = (v) => /^\+?\d{9,15}$/.test(v);
const SYSTEM_IDS = INVOICING_SYSTEMS.map((s) => s.id);

let client = null;
function supabase() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const { createClient } = require("@supabase/supabase-js");
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allow(ip)) return NextResponse.json({ success: false, error: "too_many_requests" }, { status: 429 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }
  if (body._honey) return NextResponse.json({ success: true });

  const name = clean(body.name);
  const businessName = clean(body.businessName);
  const whatsapp = normalizePhone(body.whatsapp);
  const email = clean(body.email, 200).toLowerCase();
  const system = clean(body.invoicingSystem, 20);
  const triggerYears = clean(body.triggerYears, 40);
  const consentContact = body.consentContact === true;
  const consentShare = body.consentShare === true;

  const errors = {};
  if (!name) errors.name = "اكتب اسمك";
  if (!businessName) errors.businessName = "اكتب اسم المنشأة";
  if (!isPhone(whatsapp)) errors.whatsapp = "اكتب رقم جوال صحيحاً، مثل 0512345678";
  if (email && !isEmail(email)) errors.email = "البريد الإلكتروني غير صحيح";
  if (!SYSTEM_IDS.includes(system)) errors.invoicingSystem = "اختر النظام الذي تصدر به فواتيرك";
  if (!consentContact) errors.consentContact = "نحتاج موافقتك لنتواصل معك";
  if (Object.keys(errors).length) return NextResponse.json({ success: false, errors }, { status: 422 });

  const sb = supabase();
  if (!sb) {
    console.error("[WAVE25] Supabase is not configured");
    return NextResponse.json({ success: false, error: "service_unavailable" }, { status: 503 });
  }

  const { error } = await sb.from("wave25_leads").insert({
    id: randomUUID(),
    name,
    business_name: businessName,
    whatsapp,
    email: email || null,
    invoicing_system: system,
    trigger_years: triggerYears || null,
    consent_contact: consentContact,
    consent_share: consentShare,
    referrer: clean(request.headers.get("referer"), 300) || null,
    user_agent: clean(request.headers.get("user-agent"), 300) || null,
  });

  if (error) {
    console.error("[WAVE25] insert failed:", error.message);
    return NextResponse.json({ success: false, error: "service_unavailable" }, { status: 503 });
  }
  return NextResponse.json({ success: true });
}
