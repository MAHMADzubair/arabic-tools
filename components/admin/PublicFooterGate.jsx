"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * Keep public footer markup unchanged while isolating the private admin UI.
 * This does not modify the root document's Arabic lang/dir attributes.
 */
export default function PublicFooterGate({ children }) {
  const path = usePathname();
  if (path === "/owner-access" || path === "/admin" || path?.startsWith("/admin/") || path === "/internal" || path?.startsWith("/internal/")) {
    return null;
  }
  return <>{children}</>;
}
