import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import { SITE_URL } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SEO & Search Console | QEMLO Command Center",
};

export default function SeoPage() {
  const isGscConfigured = Boolean(
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL &&
      process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY
  );

  return (
    <AdminShell title="SEO & Search Console Analytics">
      {/* Indexing Configuration Card */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Configured Canonical Host"
          value="qemlo.com"
          subtitle="Verify live redirects separately"
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
          value={isGscConfigured ? "Credentials Present" : "Not Configured"}
          subtitle="Google Cloud Service Account"
          source="GSC"
          badge={
            <StatusBadge
              status="disconnected"
              label={isGscConfigured ? "API Unverified" : "Setup Required"}
              size="sm"
            />
          }
        />
      </div>

      {/* Google Search Console Live Integration Panel */}
      {!isGscConfigured ? (
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
          Credentials are present, but the GSC reporting API has not been called or verified. Reporting is not active.
        </div>
      )}

      {/* Crawl Diagnostics Overview */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#161616] p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F2]">
          Robots.txt & Sitemap Diagnostic Status
        </h3>
        <p className="mt-0.5 text-xs text-[#A3A39E]">
          Configured crawler directives. They do not prove that pages are indexed or that private routes are authorized.
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
