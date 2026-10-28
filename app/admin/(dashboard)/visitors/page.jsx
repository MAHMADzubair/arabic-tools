import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import EmptyState from "@/components/admin/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Visitors & Audience | QEMLO Command Center" };

export default function VisitorsPage() {
  return (
    <AdminShell title="Visitors & Audience Analytics">
      <EmptyState
        title="Audience Analytics — Setup Required"
        description="A verified analytics source has not been connected. Country share, device mix, session counts and conversion rates are intentionally withheld rather than displayed as estimated or fabricated data."
      />
    </AdminShell>
  );
}
