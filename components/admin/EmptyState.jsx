import React from "react";
import { AlertTriangle, ExternalLink } from "./Icons";

export default function EmptyState({
  title = "Integration Setup Required",
  description = "This integration is not yet connected to an authorized provider API.",
  actionText,
  actionHref,
  requiredEnv = [],
  status = "disconnected",
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#333333] bg-[#161616]/60 p-8 text-center sm:p-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-[#F5F5F2]">{title}</h3>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-[#A3A39E]">
        {description}
      </p>

      {requiredEnv.length > 0 && (
        <div className="mt-4 rounded-lg border border-[#262626] bg-[#0D0D0D] p-3 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#73736C]">
            Required Environment Variables
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {requiredEnv.map((env) => (
              <code
                key={env}
                className="rounded bg-[#1C1C1C] px-2 py-0.5 font-mono text-[11px] text-[#FF5B04]"
              >
                {env}
              </code>
            ))}
          </div>
        </div>
      )}

      {actionText && actionHref && (
        <a
          href={actionHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[#FF5B04] px-4 py-2 text-xs font-semibold text-[#0D0D0D] transition hover:bg-[#FF7326]"
        >
          <span>{actionText}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
