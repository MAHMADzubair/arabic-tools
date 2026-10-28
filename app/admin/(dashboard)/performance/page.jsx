import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import EmptyState from "@/components/admin/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Performance & Core Web Vitals | QEMLO Command Center" };

export default function PerformancePage() {
  return (
    <AdminShell title="Performance & Core Web Vitals">
      <EmptyState
        title="Core Web Vitals — Setup Required"
        description="Verified field measurements have not been connected. No LCP, INP, CLS, TTFB or route-count values are presented as live measurements until an authorized source is available."
      />
    </AdminShell>
  );
}
