/**
 * POST /api/internal/auth  — Admin login
 * GET  /api/internal/auth  — Logout (clears cookie)
 * Validates password against ADMIN_SECRET env var.
 * Sets Secure HttpOnly SameSite=Strict session cookie on success.
 */
import { NextResponse } from "next/server";

const COOKIE_NAME = "pilot_admin_session";
const COOKIE_MAX_AGE = 8 * 60 * 60; // 8 hours

export async function POST(request) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const password = String(body.password || "").trim();

  // Constant-time comparison to prevent timing attacks
  if (!timingSafeEqual(password, adminSecret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Set HttpOnly session cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, adminSecret, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   COOKIE_MAX_AGE,
    path:     "/internal",
  });
  return response;
}

export async function GET() {
  // Logout — clear cookie
  const response = NextResponse.redirect(
    new URL("/internal/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
  );
  response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/internal" });
  return response;
}

// Simple constant-time string comparison
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
