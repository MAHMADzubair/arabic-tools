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
          title="Authoritative Origin"
          value="qemlo.com"
          subtitle="Strict 308 redirect from legacy domain"
          source="Middleware"
          badge={<StatusBadge status="success" label="Active" size="sm" />}
        />
        <KpiCard
          title="XML Sitemap"
          value="Active"
          subtitle={`${SITE_URL}/sitemap.xml`}
          source="Sitemap"
          badge={<StatusBadge status="success" label="Indexed" size="sm" />}
        />
        <KpiCard
          title="Admin Disallow"
          value="Enforced"
          subtitle="robots.txt disallows /admin/ & /api/"
          source="Robots.txt"
          highlight={true}
          badge={<StatusBadge status="live" label="Protected" size="sm" />}
        />
        <KpiCard
          title="GSC API Status"
          value={isGscConfigured ? "Connected" : "Disconnected"}
          subtitle="Google Cloud Service Account"
          source="GSC"
          badge={
            <StatusBadge
              status={isGscConfigured ? "success" : "disconnected"}
              label={isGscConfigured ? "Authorized" : "Setup Required"}
              size="sm"
            />
          }
        />
      </div>

      {/* Google Search Console Live Integration Panel */}
      {!isGscConfigured ? (
        <EmptyState
          title="Google Search Console API Integration Pending"
          description="Direct Search Analytics reporting requires a Google Cloud Service Account with Search Console read permissions. Once credentials are provided, real-time clicks, impressions, average CTR, average search ranking, and top Arabic queries will populate automatically."
          requiredEnv={[
            "GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL",
            "GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY",
          ]}
          actionText="Google Cloud Console"
          actionHref="https://console.cloud.google.com/iam-admin/serviceaccounts"
        />
      ) : (
        <div className="rounded-xl border border-[#262626] bg-[#161616] p-6 text-sm text-[#F5F5F2]">
          Authorized GSC reporting active.
        </div>
      )}

      {/* Crawl Diagnostics Overview */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#161616] p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F2]">
          Robots.txt & Sitemap Diagnostic Status
        </h3>
        <p className="mt-0.5 text-xs text-[#A3A39E]">
          Verified crawler rules protecting private operations and indexing public Arabic tools.
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
