import React from "react";

export default function StatusBadge({ status, label, size = "md" }) {
  const styles = {
    live: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    pending: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    disconnected: "bg-zinc-800 text-zinc-400 border-zinc-700",
    neutral: "bg-zinc-800/80 text-zinc-300 border-zinc-700/60",
  };

  const dots = {
    live: "bg-emerald-400 animate-pulse",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    error: "bg-rose-400",
    info: "bg-sky-400",
    pending: "bg-amber-400",
    disconnected: "bg-zinc-500",
    neutral: "bg-zinc-400",
  };

  const currentStyle = styles[status] || styles.neutral;
  const currentDot = dots[status] || dots.neutral;
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${currentStyle} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${currentDot}`} />
      <span>{label}</span>
    </span>
  );
}
