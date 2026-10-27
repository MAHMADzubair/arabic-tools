"use client";

import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminShell({
  children,
  title = "Command Center",
  selectedRange = "7d",
  onRangeChange,
  onRefresh,
  refreshing = false,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div id="admin-root" className="flex min-h-screen bg-[#0D0D0D] text-[#F5F5F2]">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          title={title}
          onOpenMobile={() => setMobileOpen(true)}
          selectedRange={selectedRange}
          onRangeChange={onRangeChange}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
