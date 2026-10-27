import React from "react";

export const metadata = {
  title: "Command Center | QEMLO",
  description: "Private operations, analytics, and security command center for QEMLO.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminRootLayout({ children }) {
  return (
    <div id="admin-root" dir="ltr" lang="en" className="min-h-screen bg-[#0D0D0D] text-[#F5F5F2]">
      {children}
    </div>
  );
}
