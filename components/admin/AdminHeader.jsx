"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Calendar,
  LogOut,
  ChevronDown,
  RefreshCw,
  Shield,
} from "./Icons";

export default function AdminHeader({
  title = "Command Center",
  onOpenMobile,
  selectedRange = "7d",
  onRangeChange,
  onRefresh,
  refreshing = false,
}) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [riyadhTime, setRiyadhTime] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // Live Gulf clock update
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatted = now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Riyadh",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        setRiyadhTime(formatted);
      } catch {
        setRiyadhTime("");
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      router.push("/admin/login");
      router.refresh();
    } catch {
      window.location.href = "/admin/login";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#222222] bg-[#0D0D0D]/90 px-4 backdrop-blur-md sm:px-6">
      {/* Left side: Mobile menu toggle and Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          aria-label="Open mobile menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#262626] text-[#A3A39E] transition hover:bg-[#1A1A1A] hover:text-[#F5F5F2] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base font-bold tracking-tight text-[#F5F5F2] sm:text-lg">
            {title}
          </h1>
          <p className="hidden text-[11px] text-[#73736C] sm:block">
            QEMLO Operational Telemetry & Control
          </p>
        </div>
      </div>

      {/* Right side: Clock, Date Filter, Refresh, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Riyadh Clock */}
        {riyadhTime && (
          <div className="hidden items-center gap-1.5 rounded-lg border border-[#262626] bg-[#141414] px-3 py-1.5 text-xs text-[#A3A39E] md:flex">
            <span className="text-[10px] font-semibold uppercase text-[#73736C]">
              Riyadh
            </span>
            <span className="font-mono font-medium text-[#F5F5F2]">
              {riyadhTime}
            </span>
          </div>
        )}

        {/* Date Range Picker */}
        {onRangeChange && (
          <div className="flex items-center gap-1 rounded-lg border border-[#262626] bg-[#141414] p-1 text-xs text-[#A3A39E]">
            <Calendar className="ml-1.5 h-3.5 w-3.5 text-[#73736C]" />
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7D" },
              { id: "30d", label: "30D" },
              { id: "90d", label: "90D" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => onRangeChange(r.id)}
                className={`rounded px-2 py-0.5 font-medium transition ${
                  selectedRange === r.id
                    ? "bg-[#FF5B04] text-[#0D0D0D] font-bold"
                    : "hover:text-[#F5F5F2]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh telemetry data"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#262626] bg-[#141414] text-[#A3A39E] transition hover:border-[#383838] hover:text-[#F5F5F2] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#FF5B04]" : ""}`}
            />
          </button>
        )}

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-lg border border-[#262626] bg-[#141414] p-1.5 pr-2.5 text-xs transition hover:border-[#383838]"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FF5B04]/20 text-[10px] font-bold text-[#FF5B04]">
              <Shield className="h-3.5 w-3.5" />
            </div>
            <span className="hidden font-medium text-[#F5F5F2] sm:inline">
              Owner
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[#73736C]" />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-[#262626] bg-[#161616] p-1.5 shadow-2xl">
                <div className="border-b border-[#222222] px-3 py-2">
                  <p className="text-xs font-semibold text-[#F5F5F2]">
                    Website Administrator
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    Session: Active (8h)
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
