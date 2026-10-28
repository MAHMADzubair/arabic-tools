import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { isAdminAuthConfigured } from "@/lib/adminMfa";
import { COOKIE_NAME, verifySession } from "@/lib/sessionAuth";

export const dynamic = "force-dynamic";

export default async function ProtectedDashboardLayout({ children }) {
  // Fail closed on production if MFA, owner identity or database is not configured.
  if (process.env.VERCEL_ENV === "production" && !isAdminAuthConfigured()) notFound();
  if (!isAdminAuthConfigured()) redirect("/owner-access");
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const isValid = await verifySession(token);

  if (!isValid) {
    redirect("/owner-access");
  }

  return children;
}
