"use client";

import React from "react";
import { usePathname } from "next/navigation";
import PublicAnalyticsTracker from "@/components/analytics/PublicAnalyticsTracker";

/**
 * Keep public footer markup unchanged while isolating the private admin UI.
 * Public analytics is mounted only on public routes and never records form values.
 */
export default function PublicFooterGate({ children }) {
  const path = usePathname();
  if (path === "/owner-access" || path === "/admin" || path?.startsWith("/admin/") || path === "/internal" || path?.startsWith("/internal/")) {
    return null;
  }
  return (
    <>
      <PublicAnalyticsTracker />
      {children}
    </>
  );
}
