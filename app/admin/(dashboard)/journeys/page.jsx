import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { GitFork, Shield } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User Journeys | QEMLO Command Center",
};

export default function UserJourneysPage() {
  const commonJourneys = [
    {
      name: "Organic Search → Salary Calculator → PDF Export",
      steps: ["Google / Organic Search", "Salary Calculator (/salary-calculator)", "Full Breakdown Calculated", "PDF Payslip Generated"],
      rate: "76% Completion",
      dropoff: "24% Abandoned",
    },
    {
      name: "Direct Landing → Gratuity Calculator → Country Switcher",
      steps: ["Direct Visit", "Gratuity Calculator (/gratuity-calculator)", "Switched Country (Saudi → UAE)", "Service Award Verified"],
      rate: "68% Completion",
      dropoff: "32% Abandoned",
    },
    {
      name: "Homepage Discovery → Islamic Tool → WhatsApp Share",
      steps: ["Homepage (/)", "Zakat Calculator (/zakat-calculator)", "Nisab Threshold Calculated", "Result Copied to WhatsApp"],
      rate: "82% Completion",
      dropoff: "18% Abandoned",
    },
  ];

  return (
    <AdminShell title="Anonymous User Journeys & Funnels">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Average Path Depth"
          value="2.8 Steps"
          subtitle="Page interactions per anonymous session"
          source="Session Analyzer"
          highlight={true}
          badge={<StatusBadge status="live" label="High Intent" size="sm" />}
        />
        <KpiCard
          title="Overall Funnel Conversion"
          value="74%"
          subtitle="Tool opening to successful calculation"
          source="Telemetry"
          badge={<StatusBadge status="success" label="Optimal" size="sm" />}
        />
        <KpiCard
          title="Privacy Shield"
          value="Zero Storage"
          subtitle="No typed values or PII collected"
          source="Privacy Spec"
          badge={<StatusBadge status="info" label="Compliant" size="sm" />}
        />
      </div>

      {/* Privacy Notice Banner */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#262626] bg-[#161616] p-4 text-xs text-[#A3A39E]">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5B04]" />
        <div>
          <span className="font-semibold text-[#F5F5F2]">Anonymous Path Tracing: </span>
          Funnels are reconstructed from short-lived, ephemeral session tokens in <code className="text-[#FF5B04]">sessionStorage</code>. Once the user closes the browser tab, the session identifier is permanently destroyed.
        </div>
      </div>

      {/* Common Journey Paths */}
      <div className="mt-6 space-y-4">
        <h3 className="text-sm font-semibold text-[#F5F5F2]">
          Common Navigation Paths & Funnel Conversions
        </h3>

        {commonJourneys.map((journey, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-[#262626] bg-[#161616] p-5 transition hover:border-[#333333]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222222] pb-3">
              <span className="text-sm font-bold text-[#F5F5F2]">
                {journey.name}
              </span>
              <div className="flex items-center gap-2">
                <StatusBadge status="success" label={journey.rate} size="sm" />
                <span className="text-[11px] text-rose-400 font-mono">
                  {journey.dropoff}
                </span>
              </div>
            </div>

            {/* Stepper visual */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {journey.steps.map((step, sIdx) => (
                <React.Fragment key={sIdx}>
                  <div className="flex items-center gap-2 rounded-lg border border-[#262626] bg-[#0D0D0D] px-3 py-1.5 text-xs">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5B04]/20 text-[10px] font-bold text-[#FF5B04]">
                      {sIdx + 1}
                    </span>
                    <span className="text-[#F5F5F2]">{step}</span>
                  </div>
                  {sIdx < journey.steps.length - 1 && (
                    <span className="text-xs text-[#73736C]">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
