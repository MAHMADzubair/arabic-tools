// pilot_leads has a UNIQUE index on email. A repeat submission (another server
// instance, or the same email with a new WhatsApp number) must not surface as a
// 503: refresh the existing lead with the latest answers and report success.
export const UNIQUE_VIOLATION = "23505";
export async function saveLead(sb, lead) {
  const { error } = await sb.from("pilot_leads").insert(lead);
  if (!error) return { ok: true, status: 201, leadId: lead.id };
  if (error.code !== UNIQUE_VIOLATION) return { ok: false, error };
  const { id: _id, created_at: _createdAt, ...latest } = lead;
  const { error: updErr } = await sb.from("pilot_leads").update(latest).eq("email", lead.email);
  if (updErr) console.warn("[PILOT] Duplicate email; refresh failed:", updErr.message);
  return { ok: true, status: 200, leadId: "existing", duplicate: true };
}

