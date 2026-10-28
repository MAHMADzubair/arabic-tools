"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Users,
  Wrench,
  Search,
  DollarSign,
  GitFork,
  Gauge,
  Shield,
  Server,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "./Icons";

export const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/live", label: "Live Activity", icon: Activity },
  { href: "/admin/visitors", label: "Visitors", icon: Users },
  { href: "/admin/tools", label: "Tool Analytics", icon: Wrench },
  { href: "/admin/seo", label: "SEO & Search", icon: Search },
  { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
  { href: "/admin/journeys", label: "User Journeys", icon: GitFork },
  { href: "/admin/performance", label: "Performance", icon: Gauge },
  { href: "/admin/security", label: "Security", icon: Shield },
  { href: "/admin/system", label: "System Health", icon: Server },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop scrim */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar aside element */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#222222] bg-[#0D0D0D] transition-all duration-200 lg:static ${
          collapsed && !mobileOpen ? "w-[72px]" : "w-64"
        } ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-[#222222] px-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 overflow-hidden text-decoration-none"
          >
            {/* QEMLO Brand Mark */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FF5B04] text-xs font-black text-[#0D0D0D] shadow-md shadow-[#FF5B04]/20">
              Q
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-[#F5F5F2]">
                  QEMLO
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FF5B04]">
                  Command Center
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-7 w-7 items-center justify-center rounded-md border border-[#262626] text-[#A3A39E] transition hover:bg-[#1A1A1A] hover:text-[#F5F5F2] lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-[#73736C]">
            {(!collapsed || mobileOpen) && "Platform Operations"}
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  aria-current={isActive ? "page" : undefined}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[#1A1A1A] font-semibold text-[#F5F5F2]"
                      : "text-[#A3A39E] hover:bg-[#141414] hover:text-[#F5F5F2]"
                  }`}
                >
                  {/* Left active accent pip */}
                  {isActive && (
                    <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-[#FF5B04]" />
                  )}

                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive
                        ? "text-[#FF5B04]"
                        : "text-[#73736C] group-hover:text-[#F5F5F2]"
                    }`}
                  />

                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}

                  {(!collapsed || mobileOpen) && item.badge && (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info: Public site link & Version */}
        <div className="border-t border-[#222222] p-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Arabic Public Website"
            className="flex items-center gap-2.5 rounded-lg border border-[#262626] bg-[#141414] px-3 py-2 text-xs font-medium text-[#A3A39E] transition hover:border-[#383838] hover:text-[#F5F5F2]"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#FF5B04]" />
            {!collapsed && (
              <div className="flex flex-1 items-center justify-between">
                <span>Public Site</span>
                <span className="rounded bg-[#202020] px-1.5 py-0.2 text-[9px] text-[#73736C]">
                  RTL
                </span>
              </div>
            )}
          </a>

          {!collapsed && (
            <div className="mt-3 flex items-center justify-between px-1 text-[10px] text-[#73736C]">
              <span>v1.0-stage1</span>
              <span className="text-emerald-500 font-mono">LIVE PROTECTED</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
