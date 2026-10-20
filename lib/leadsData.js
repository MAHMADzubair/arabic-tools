/**
 * lib/leadsData.js
 *
 * Server-only data access for pilot leads.
 * Called directly from the server component — no HTTP round-trip.
 *
 * Security invariants (same as the API route):
 *  1. Uses service-role client — never exposed to the browser.
 *  2. Session must already be verified by the caller before invoking.
 *  3. Fail-closed: any DB error returns an empty array + error message.
 */

import { getSupabaseAdmin } from "./sessionAuth.js";

const LEAD_COLUMNS = [
  "id",
  "created_at",
  "name",
  "store_name",
  "email",
  "whatsapp",
  "platform",
  "monthly_conversation_volume",
  "biggest_problem",
  "trial_interest",
  "priority",
  "source",
  "referrer",
].join(", ");

/**
 * Fetches all pilot leads directly from Supabase using the service-role client.
 * The caller MUST verify the session before calling this function.
 *
 * @returns {Promise<{ leads: object[], source: string, error?: string }>}
 */
export async function fetchLeadsDirect() {
  const sb = await getSupabaseAdmin();
  if (!sb) {
    return { leads: [], source: "error", error: "Database client unavailable" };
  }

  try {
    const { data, error } = await sb
      .from("pilot_leads")
      .select(LEAD_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[LEADS] Supabase fetch error:", error.message);
      return { leads: [], source: "error", error: "Database error" };
    }

    return { leads: data || [], source: "supabase" };
  } catch (err) {
    console.error("[LEADS] fetchLeadsDirect exception:", err.message);
    return { leads: [], source: "error", error: "Unexpected error" };
  }
}
