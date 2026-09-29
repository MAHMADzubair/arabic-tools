/**
 * GET /api/internal/pilot-leads
 * Internal-only endpoint: returns all pilot leads as JSON.
 * Protected by ADMIN_SECRET env var.
 *
 * Usage: GET /api/internal/pilot-leads?secret=YOUR_SECRET
 *
 * Required env vars:
 *   ADMIN_SECRET              — any random long string you generate
 *   SUPABASE_URL              — your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (server-only)
 */

import { NextResponse } from "next/server";
import { readFile }     from "fs/promises";
import { join }         from "path";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const { createClient } = require("@supabase/supabase-js");
    return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  } catch { return null; }
}

export async function GET(request) {
  // ── Auth check ──────────────────────────────────────────────────────────
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Fetch from Supabase ─────────────────────────────────────────────────
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("pilot_leads")
      .select("id, created_at, name, store_name, email, whatsapp, platform, monthly_conversation_volume, biggest_problem, trial_interest, priority, source, referrer")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[INTERNAL] Supabase fetch error:", error.message);
      return NextResponse.json({ error: "Database error", detail: error.message }, { status: 500 });
    }
    return NextResponse.json({ leads: data || [], source: "supabase" });
  }

  // ── /tmp fallback ───────────────────────────────────────────────────────
  try {
    const raw  = await readFile(join("/tmp", "pilot-leads.json"), "utf8");
    const arr  = JSON.parse(raw);
    const leads = arr
      .map(l => ({
        id:                          l.id,
        created_at:                  l.createdAt,
        name:                        l.name,
        store_name:                  l.storeName,
        email:                       l.email,
        whatsapp:                    l.whatsapp,
        platform:                    l.platform,
        monthly_conversation_volume: l.volume,
        biggest_problem:             l.problem,
        trial_interest:              l.trialInterest,
        priority:                    l.priority,
        source:                      l.source,
        referrer:                    l.referrer,
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return NextResponse.json({ leads, source: "tmp_fallback" });
  } catch {
    return NextResponse.json({ leads: [], source: "empty" });
  }
}
