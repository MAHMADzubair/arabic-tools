import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifySession } from "@/lib/sessionAuth";
import { isAdminAuthConfigured } from "@/lib/adminMfa";
import AdminLoginForm from "../admin/login/AdminLoginForm";

export const metadata = {
  title: "Owner Sign In | QEMLO",
  description: "Private QEMLO owner administration.",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const isConfigured = isAdminAuthConfigured();

  if (isConfigured) {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token && (await verifySession(token))) redirect("/admin");
  }

  return (
    <div lang="en" dir="ltr" className="relative flex min-h-screen flex-col items-center justify-center bg-[#0D0D0D] px-4 py-12 text-[#F5F5F2]">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF5B04]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF5B04] text-xl font-black text-[#0D0D0D] shadow-xl shadow-[#FF5B04]/20" aria-hidden="true">Q</div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">QEMLO Command Center</h1>
          <p className="mt-2 text-sm text-[#A3A39E]">Secure owner-only access</p>
        </div>

        <div className="rounded-2xl border border-[#262626] bg-[#161616] p-6 shadow-2xl sm:p-8">
          {isConfigured ? (
            <AdminLoginForm />
          ) : (
            <div role="status" className="space-y-3 text-center">
              <div aria-hidden="true" className="text-2xl text-[#FF5B04]">🔒</div>
              <h2 className="text-base font-semibold">Admin access is being configured</h2>
              <p className="text-xs leading-6 text-[#A3A39E]">
                Private sign-in is temporarily unavailable. The site owner must complete secure
                identity, authenticator, and database setup before dashboard access can be enabled.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-[#73736C]">
          <p>Private area · Authorized owner only · MFA required</p>
          <a href="/" className="mt-3 inline-block rounded-md py-2 text-[#A3A39E] transition hover:text-[#FF5B04]">
            ← Back to QEMLO
          </a>
        </div>
      </div>
    </div>
  );
}
