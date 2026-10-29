import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import ChartCard from "@/components/admin/ChartCard";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import {
  getAdSenseRevenueReport,
  getAdSenseConfig,
  formatAdSenseCurrency,
} from "@/lib/integrations/adsense";
import { DollarSign, Shield, Eye, BarChart2 } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AdSense Revenue | QEMLO Command Center",
};

export default async function RevenuePage({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedRange = resolvedParams.range || "30d";

  const config = getAdSenseConfig();
  const report = await getAdSenseRevenueReport(selectedRange);
  const isConnected = report.status === "connected";
  const currency = report.data?.currency || "USD";

  return (
    <AdminShell title="Google AdSense & Revenue Analytics">
      {/* Monetization Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="AdSense Publisher ID"
          value="ca-pub-4706954030329423"
          subtitle="Publisher identifier configured in source"
          source="AdSense Tag"
          badge={<StatusBadge status="neutral" label="Source Configuration" size="sm" />}
        />

        <KpiCard
          title="Ad Units Deployed"
          value={isConnected ? "Active Units" : "Unknown"}
          subtitle="Check current status in the AdSense account"
          source="Google AdSense"
          badge={
            <StatusBadge
              status={isConnected ? "success" : "disconnected"}
              label={isConnected ? "Verified" : "Not Verified"}
              size="sm"
            />
          }
        />

        <KpiCard
          title="Management API"
          value={
            isConnected
              ? "Connected"
              : config.isConfigured
              ? "Credentials Present"
              : "Not Configured"
          }
          subtitle="OAuth2 programmatic reporting"
          source="AdSense API"
          badge={
            <StatusBadge
              status={isConnected ? "success" : "disconnected"}
              label={
                isConnected
                  ? "Verified"
                  : config.isConfigured
                  ? "API Unverified"
                  : "Setup Required"
              }
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

      {/* Connected Revenue Analytics vs Disconnected State */}
      {isConnected && report.data ? (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Estimated Earnings"
              value={formatAdSenseCurrency(report.data.kpis.estimatedEarnings, currency)}
              subtitle={`Net verified revenue (${selectedRange}, in ${currency})`}
              source="AdSense API"
              highlight={true}
              badge={<StatusBadge status="success" label={`Verified (${currency})`} size="sm" />}
            />

            <KpiCard
              title="Monetized Page Views"
              value={report.data.kpis.pageViews?.toLocaleString()}
              subtitle="Views eligible for ad impressions"
              source="AdSense API"
              badge={<StatusBadge status="info" label="AdSense" size="sm" />}
            />

            <KpiCard
              title="Ad Impressions"
              value={report.data.kpis.impressions?.toLocaleString()}
              subtitle="Total rendered ad impressions"
              source="AdSense API"
              badge={<StatusBadge status="neutral" label="Impressions" size="sm" />}
            />

            <KpiCard
              title="Page RPM"
              value={formatAdSenseCurrency(report.data.kpis.pageRpm, currency)}
              subtitle={`Revenue per thousand views (${currency})`}
              source="AdSense API"
              badge={<StatusBadge status="live" label={`RPM (${currency})`} size="sm" />}
            />
          </div>

          {report.data.dailyTrends?.length > 0 && (
            <ChartCard
              title={`Daily AdSense Earnings Trend (${currency})`}
              subtitle={`Revenue trend over the past ${selectedRange}`}
              data={report.data.dailyTrends}
              type="area"
              color="#FF5B04"
              source="Google AdSense Management API"
            />
          )}
        </div>
      ) : (
        /* AdSense Live API Integration Panel */
        <div className="mt-6">
          {!config.isConfigured ? (
            <EmptyState
              title="Google AdSense Management API Disconnected"
              description="Real revenue metrics require an authorized OAuth token, account permissions, and a successful AdSense reporting API request. Client ID and secret alone are insufficient. No estimated earnings are displayed."
              requiredEnv={[
                "ADSENSE_CLIENT_ID",
                "ADSENSE_CLIENT_SECRET",
                "ADSENSE_REFRESH_TOKEN",
              ]}
              actionText="AdSense Management API Docs"
              actionHref="https://developers.google.com/adsense/management"
            />
          ) : (
            <div className="rounded-xl border border-[#262626] bg-[#161616] p-6 text-sm text-[#F5F5F2]">
              API credentials are present, but an authorized AdSense reporting request has not been verified. Revenue reporting is not connected. (Status: API Unverified)
            </div>
          )}
        </div>
      )}

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
            <span>Keep admin pages free of advertisements before enabling production access.</span>
          </li>
        </ul>
      </div>
    </AdminShell>
  );
}
