"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, AlertTriangle } from "@/components/admin/Icons";

export default function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError("Rate limit reached. Too many failed attempts. Try again in 15 minutes.");
        } else if (res.status === 401) {
          setError("Invalid administrative credentials.");
        } else {
          setError(data.error || "Authentication failed. Please check server logs.");
        }
        setLoading(false);
        return;
      }

      // Success — redirect to dashboard
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network or server connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="admin-password"
          className="block text-xs font-semibold uppercase tracking-wider text-[#A3A39E]"
        >
          Master Password
        </label>
        <div className="relative mt-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#73736C]">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Enter administrative passphrase"
            className="w-full rounded-xl border border-[#262626] bg-[#0D0D0D] py-3 pl-10 pr-10 text-sm text-[#F5F5F2] placeholder-[#73736C] outline-none transition focus:border-[#FF5B04] focus:ring-1 focus:ring-[#FF5B04]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#73736C] transition hover:text-[#F5F5F2]"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !password.trim()}
        className="flex w-full items-center justify-center rounded-xl bg-[#FF5B04] py-3 text-sm font-bold text-[#0D0D0D] transition hover:bg-[#FF7326] focus:outline-none focus:ring-2 focus:ring-[#FF5B04] focus:ring-offset-2 focus:ring-offset-[#161616] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0D0D0D] border-t-transparent" />
            Verifying Session...
          </span>
        ) : (
          "Access Command Center"
        )}
      </button>
    </form>
  );
}
