"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, AlertTriangle } from "@/components/admin/Icons";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading || !email.trim() || !password || !/^\d{6}$/.test(totp)) return;
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ email: email.trim(), password, totp }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setError("Too many attempts. Please retry after the lockout window.");
        } else if (response.status === 401) {
          setError("The email, password or authenticator code is incorrect.");
        } else {
          setError("Admin authentication is temporarily unavailable.");
        }
        setTotp("");
        setLoading(false);
        return;
      }

      setPassword("");
      setTotp("");
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Connection unavailable. Please try again.");
      setTotp("");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" dir="ltr">
      <div>
        <label htmlFor="admin-email" className="block text-xs font-semibold uppercase tracking-wider text-[#A3A39E]">
          Owner Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          maxLength={320}
          required
          spellCheck={false}
          placeholder="owner@example.com"
          className="mt-2 w-full rounded-xl border border-[#262626] bg-[#0D0D0D] px-4 py-3 text-sm text-[#F5F5F2] placeholder:text-[#73736C] focus:border-[#FF5B04] focus:outline-none focus:ring-1 focus:ring-[#FF5B04]"
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="block text-xs font-semibold uppercase tracking-wider text-[#A3A39E]">
          Password
        </label>
        <div className="relative mt-2">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#73736C]"><Lock className="h-4 w-4" /></span>
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            maxLength={256}
            autoComplete="current-password"
            placeholder="Enter your private password"
            className="w-full rounded-xl border border-[#262626] bg-[#0D0D0D] py-3 pl-10 pr-10 text-sm text-[#F5F5F2] placeholder:text-[#73736C] focus:border-[#FF5B04] focus:outline-none focus:ring-1 focus:ring-[#FF5B04]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#73736C] hover:text-[#F5F5F2]"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="admin-totp" className="block text-xs font-semibold uppercase tracking-wider text-[#A3A39E]">
          Authenticator Code
        </label>
        <input
          id="admin-totp"
          name="one-time-code"
          type="text"
          value={totp}
          onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="6-digit code"
          className="mt-2 w-full rounded-xl border border-[#262626] bg-[#0D0D0D] px-4 py-3 font-mono text-lg tracking-[.2em] text-[#F5F5F2] placeholder:font-sans placeholder:text-sm placeholder:tracking-normal placeholder:text-[#73736C] focus:border-[#FF5B04] focus:outline-none focus:ring-1 focus:ring-[#FF5B04]"
        />
        <p className="mt-2 text-xs text-[#73736C]">Use your linked authenticator app. Never share this code.</p>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email.trim() || !password || !/^\d{6}$/.test(totp)}
        className="w-full rounded-xl bg-[#FF5B04] py-3 text-sm font-bold text-[#0D0D0D] transition hover:bg-[#FF7326] focus:outline-none focus:ring-2 focus:ring-[#FF5B04] focus:ring-offset-2 focus:ring-offset-[#161616] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Verifying secure login…" : "Sign in to Command Center"}
      </button>
    </form>
  );
}
