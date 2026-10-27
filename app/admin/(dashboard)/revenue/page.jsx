import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AdSense Revenue | QEMLO Command Center",
};

export default function RevenuePage() {
  const isAdSenseApiConfigured = Boolean(
    process.env.ADSENSE_CLIENT_ID && process.env.ADSENSE_CLIENT_SECRET
  );

  return (
    <AdminShell title="Google AdSense & Revenue Analytics">
      {/* Monetization Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="AdSense Publisher ID"
          value="ca-pub-4706954030329423"
          subtitle="Mounted in public <head> verification"
          source="AdSense Tag"
          badge={<StatusBadge status="success" label="Verified" size="sm" />}
        />
        <KpiCard
          title="Ad Units Deployed"
          value="Pending Review"
          subtitle="Site monetization approval status"
          source="Google AdSense"
          badge={<StatusBadge status="pending" label="Pending" size="sm" />}
        />
        <KpiCard
          title="Management API"
          value={isAdSenseApiConfigured ? "Connected" : "Disconnected"}
          subtitle="OAuth2 programmatic reporting"
          source="AdSense API"
          badge={
            <StatusBadge
              status={isAdSenseApiConfigured ? "success" : "disconnected"}
              label={isAdSenseApiConfigured ? "Authorized" : "Setup Required"}
              size="sm"
            />
          }
        />
        <KpiCard
          title="Monetization Strategy"
          value="100% Free Tools"
          subtitle="Non-intrusive display ads only"
          source="QEMLO Policy"
          highlight={true}
          badge={<StatusBadge status="live" label="Strict" size="sm" />}
        />
      </div>

      {/* AdSense Live API Integration Panel */}
      <div className="mt-6">
        {!isAdSenseApiConfigured ? (
          <EmptyState
            title="Google AdSense Management API Disconnected"
            description="To securely display real-time earnings, daily revenue trends, page RPM, impressions, and ad CTR directly inside the QEMLO Command Center, connect the Google AdSense Management API OAuth2 credentials. We never fabricate revenue figures."
            requiredEnv={["ADSENSE_CLIENT_ID", "ADSENSE_CLIENT_SECRET"]}
            actionText="AdSense Management API Docs"
            actionHref="https://developers.google.com/adsense/management"
          />
        ) : (
          <div className="rounded-xl border border-[#262626] bg-[#161616] p-6 text-sm text-[#F5F5F2]">
            Authorized AdSense revenue reporting active.
          </div>
        )}
      </div>

      {/* Monetization Safety & Compliance Rules */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#161616] p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F2]">
          AdSense Compliance & User Experience Principles
        </h3>
        <p className="mt-0.5 text-xs text-[#A3A39E]">
          Guarantees preserving calculator accessibility while serving compliant display advertisements.
        </p>

        <ul className="mt-4 space-y-2.5 text-xs text-[#A3A39E]">
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#FF5B04]">1.</span>
            <span>Zero intrusive popups, interstitials, or deceptive download buttons.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#FF5B04]">2.</span>
            <span>All calculations and export functionalities (PDF, print) operate 100% free with zero paywalls.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#FF5B04]">3.</span>
            <span>Admin center routes are completely excluded from ad script execution.</span>
          </li>
        </ul>
      </div>
    </AdminShell>
  );
}
