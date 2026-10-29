import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import ChartCard from "@/components/admin/ChartCard";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import DataTable from "@/components/admin/DataTable";
import { getGscSearchPerformance, getGscConfig } from "@/lib/integrations/gsc";
import { SITE_URL } from "@/lib/siteConfig";
import { Search, Globe, FileText, ExternalLink } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SEO & Search Console | QEMLO Command Center",
};

export default async function SeoPage({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedRange = resolvedParams.range || "28d";

  const config = getGscConfig();
  const perf = await getGscSearchPerformance(selectedRange);
  const isConnected = perf.status === "connected";

  const queryColumns = [
    { key: "query", label: "Search Query", sortable: true },
    { key: "clicks", label: "Clicks", sortable: true },
    { key: "impressions", label: "Impressions", sortable: true },
    { key: "ctr", label: "CTR (%)", sortable: true },
    { key: "position", label: "Avg Position", sortable: true },
  ];

  const pageColumns = [
    { key: "page", label: "Search Landing Page", sortable: true },
    { key: "clicks", label: "Clicks", sortable: true },
    { key: "impressions", label: "Impressions", sortable: true },
    { key: "ctr", label: "CTR (%)", sortable: true },
    { key: "position", label: "Avg Position", sortable: true },
  ];

  return (
    <AdminShell title="SEO & Search Console Analytics">
      {/* Indexing & Host Status Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Configured Canonical Host"
          value="qemlo.com"
          subtitle="Strict HTTPS 308 canonical redirection"
          source="Middleware"
          badge={<StatusBadge status="success" label="Active" size="sm" />}
        />

        <KpiCard
          title="XML Sitemap"
          value="Configured"
          subtitle={`${SITE_URL}/sitemap.xml`}
          source="Sitemap"
          badge={<StatusBadge status="neutral" label="Not an Indexing Check" size="sm" />}
        />

        <KpiCard
          title="Crawler Exclusion"
          value="Configured"
          subtitle="robots.txt rule; authorization is separate"
          source="Robots.txt"
          highlight={true}
          badge={<StatusBadge status="neutral" label="Crawler Rule" size="sm" />}
        />

        <KpiCard
          title="GSC API Status"
          value={
            isConnected
              ? "Connected"
              : config.isConfigured
              ? "Credentials Present"
              : "Not Configured"
          }
          subtitle="Google Cloud Service Account"
          source="GSC"
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
      </div>

      {/* Connected Search Analytics vs Disconnected State */}
      {isConnected && perf.data ? (
        <div className="space-y-6">
          {/* Performance KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Organic Search Clicks"
              value={perf.data.kpis.clicks?.toLocaleString()}
              subtitle={`Google Web Search clicks (${selectedRange})`}
              source="Search Console"
              highlight={true}
              badge={<StatusBadge status="success" label="Verified Clicks" size="sm" />}
            />

            <KpiCard
              title="Search Impressions"
              value={perf.data.kpis.impressions?.toLocaleString()}
              subtitle="Total query impressions in Google SERPs"
              source="Search Console"
              badge={<StatusBadge status="info" label="Verified" size="sm" />}
            />

            <KpiCard
              title="Average Click-Through Rate"
              value={`${perf.data.kpis.ctr}%`}
              subtitle="Organic search CTR"
              source="Search Console"
              badge={<StatusBadge status="neutral" label="Calculated" size="sm" />}
            />

            <KpiCard
              title="Average Position"
              value={perf.data.kpis.position}
              subtitle="Average Google ranking position"
              source="Search Console"
              badge={<StatusBadge status="live" label="Rank" size="sm" />}
            />
          </div>

          {/* Daily Trend Chart */}
          {perf.data.dailyTrends?.length > 0 && (
            <ChartCard
              title="Organic Search Clicks Trend"
              subtitle={`Search performance over the past ${selectedRange}`}
              data={perf.data.dailyTrends}
              type="area"
              color="#FF5B04"
              source="GSC Search Analytics"
            />
          )}

          {/* Top Queries Table */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#F5F5F2]">
              Top Organic Search Queries
            </h3>
            <DataTable
              columns={queryColumns}
              data={perf.data.topQueries || []}
              emptyMessage="No search queries recorded for this period."
              searchPlaceholder="Filter search queries..."
            />
          </div>

          {/* Top Search Landing Pages Table */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#F5F5F2]">
              Top Performing Search Landing Pages
            </h3>
            <p className="mb-2 text-xs text-[#A3A39E]">
              URLs receiving Google Search traffic. Search Analytics is not an indexing verification tool and does not measure URL indexation status.
            </p>
            <DataTable
              columns={pageColumns}
              data={perf.data.topPages || []}
              emptyMessage="No search landing pages recorded."
              searchPlaceholder="Filter search landing pages..."
            />
          </div>
        </div>
      ) : (
        /* Disconnected GSC Integration Panel */
        <div>
          {!config.isConfigured ? (
            <EmptyState
              title="Google Search Console Integration Not Verified"
              description="Direct Search Analytics reporting requires a Google Cloud Service Account with Search Console read permissions. Credentials alone do not establish a working integration. Search Console data is delayed; an authenticated API query and permission checks are required before displaying real metrics."
              requiredEnv={[
                "GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL",
                "GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY",
              ]}
              actionText="Google Cloud Console"
              actionHref="https://console.cloud.google.com/iam-admin/serviceaccounts"
            />
          ) : (
            <div className="rounded-xl border border-[#262626] bg-[#161616] p-6 text-sm text-[#F5F5F2]">
              Credentials are present, but the GSC reporting API has not been called or verified. Reporting is not active. (Status: API Unverified)
            </div>
          )}
        </div>
      )}

      {/* Crawl Diagnostics Overview */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#161616] p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F2]">
          Robots.txt & Sitemap Diagnostic Status
        </h3>
        <p className="mt-0.5 text-xs text-[#A3A39E]">
          Configured crawler directives. Search Analytics alone never proves whether specific pages are indexed. Index verification requires URL Inspection.
        </p>

        <div className="mt-4 overflow-x-auto rounded-lg border border-[#262626] bg-[#0D0D0D] p-4 font-mono text-xs text-[#A3A39E]">
          <p className="text-[#FF5B04]"># Current Production Robots Rules</p>
          <p>User-agent: *</p>
          <p className="text-emerald-400">Allow: /</p>
          <p className="text-rose-400">Disallow: /api/</p>
          <p className="text-rose-400">Disallow: /internal/</p>
          <p className="text-rose-400 font-bold">Disallow: /admin/</p>
          <p className="mt-2 text-[#73736C]">Sitemap: {SITE_URL}/sitemap.xml</p>
          <p className="text-[#73736C]">Host: {SITE_URL}</p>
        </div>
      </div>
    </AdminShell>
  );
}
