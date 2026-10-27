import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifySession } from "@/lib/sessionAuth";
import AdminLoginForm from "./AdminLoginForm";

export const metadata = {
  title: "Admin Sign In | QEMLO",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const adminSecret = process.env.ADMIN_SECRET;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  // If already authenticated with a valid session, redirect directly to dashboard
  if (token && (await verifySession(token))) {
    redirect("/admin");
  }

  const isConfigured = Boolean(adminSecret);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0D0D0D] px-4 py-12 text-[#F5F5F2]">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#FF5B04]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF5B04] text-xl font-black text-[#0D0D0D] shadow-xl shadow-[#FF5B04]/20">
            Q
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-[#F5F5F2]">
            QEMLO Command Center
          </h1>
          <p className="mt-1 text-xs text-[#A3A39E]">
            Private Administrative Access Control
          </p>
        </div>

        {/* Login form or unconfigured notice */}
        {!isConfigured ? (
          <div className="rounded-2xl border border-amber-500/30 bg-[#161616] p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              ⚠️
            </div>
            <h2 className="mt-3 text-sm font-semibold text-[#F5F5F2]">
              ADMIN_SECRET Not Configured
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#A3A39E]">
              The administrative passphrase has not been defined in environment variables. Add <code className="rounded bg-[#0D0D0D] px-1.5 py-0.5 text-[#FF5B04]">ADMIN_SECRET</code> to your server configuration.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#262626] bg-[#161616] p-6 shadow-2xl sm:p-8">
            <AdminLoginForm />
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-[#73736C]">
          <span>Protected Area · Authorized Personnel Only</span>
          <div className="mt-2">
            <a
              href="/"
              className="text-[#A3A39E] transition hover:text-[#FF5B04]"
            >
              ← Back to QEMLO Public Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
