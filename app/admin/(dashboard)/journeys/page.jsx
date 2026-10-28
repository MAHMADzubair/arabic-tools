import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import EmptyState from "@/components/admin/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "User Journeys | QEMLO Command Center" };

export default function UserJourneysPage() {
  return (
    <AdminShell title="Anonymous User Journeys & Funnels">
      <EmptyState
        title="User Journey Analytics — Setup Required"
        description="No verified journey or conversion data source is connected. Funnel completion percentages and session paths will appear only when privacy-safe telemetry is implemented, reviewed and explicitly enabled."
      />
    </AdminShell>
  );
}
