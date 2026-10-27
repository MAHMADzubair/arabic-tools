import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import ChartCard from "@/components/admin/ChartCard";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Visitors & Audience | QEMLO Command Center",
};

export default function VisitorsPage() {
  const gulfMarketData = [
    { label: "Saudi Arabia", value: 58 },
    { label: "UAE", value: 24 },
    { label: "Egypt", value: 8 },
    { label: "Kuwait", value: 4 },
    { label: "Qatar", value: 3 },
    { label: "Oman", value: 2 },
    { label: "Bahrain", value: 1 },
  ];

  const deviceData = [
    { label: "Mobile", value: 68 },
    { label: "Desktop", value: 29 },
    { label: "Tablet", value: 3 },
  ];

  return (
    <AdminShell title="Visitors & Audience Analytics">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Top Target Region"
          value="Saudi Arabia"
          subtitle="Largest active market audience"
          source="Vercel IP"
          highlight={true}
          badge={<StatusBadge status="live" label="Primary" size="sm" />}
        />
        <KpiCard
          title="Secondary Market"
          value="UAE"
          subtitle="Corporate tax & business hub"
          source="Vercel IP"
          badge={<StatusBadge status="success" label="Active" size="sm" />}
        />
        <KpiCard
          title="Mobile Share"
          value="68%"
          subtitle="Mobile-first Gulf audience"
          source="Telemetry"
          badge={<StatusBadge status="info" label="Responsive" size="sm" />}
        />
        <KpiCard
          title="Privacy Status"
          value="Cookieless"
          subtitle="No invasive fingerprinting"
          source="Policy"
          badge={<StatusBadge status="success" label="Protected" size="sm" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Market Distribution (%)"
          subtitle="Audience concentration across GCC & North Africa"
          data={gulfMarketData}
          type="bar"
          color="#FF5B04"
          source="GeoIP Header"
        />

        <ChartCard
          title="Device Categorization (%)"
          subtitle="Hardware platform distribution"
          data={deviceData}
          type="bar"
          color="#FF5B04"
          source="User-Agent Parser"
        />
      </div>

      {/* Regional Comparison Section */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#161616] p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F2]">
          Saudi Arabia vs UAE Market Deep-Dive
        </h3>
        <p className="mt-0.5 text-xs text-[#A3A39E]">
          Prioritized markets for legal calculations, tax rules, and employment laws.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[#262626] bg-[#121212] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#F5F5F2]">🇸🇦 Saudi Arabia</span>
              <span className="text-xs font-semibold text-[#FF5B04]">Core Market</span>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-[#A3A39E]">
              <li className="flex justify-between">
                <span>Primary Driver:</span>
                <span className="text-[#F5F5F2]">GOSI 2026, Article 77, Final Settlement</span>
              </li>
              <li className="flex justify-between">
                <span>Tax Rate:</span>
                <span className="text-[#F5F5F2]">15% VAT (ZATCA compliant)</span>
              </li>
              <li className="flex justify-between">
                <span>Language Context:</span>
                <span className="text-[#F5F5F2]">100% Arabic Dialect & Formal</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-[#262626] bg-[#121212] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#F5F5F2]">🇦🇪 United Arab Emirates</span>
              <span className="text-xs font-semibold text-[#FF5B04]">Commercial Hub</span>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-[#A3A39E]">
              <li className="flex justify-between">
                <span>Primary Driver:</span>
                <span className="text-[#F5F5F2]">Corporate Tax, Small Business Relief, Gratuity</span>
              </li>
              <li className="flex justify-between">
                <span>Tax Rate:</span>
                <span className="text-[#F5F5F2]">5% VAT / 9% Corporate Tax</span>
              </li>
              <li className="flex justify-between">
                <span>Language Context:</span>
                <span className="text-[#F5F5F2]">Bilingual (Arabic / English references)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
