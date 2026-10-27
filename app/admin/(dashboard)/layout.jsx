import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifySession } from "@/lib/sessionAuth";

export const dynamic = "force-dynamic";

export default async function ProtectedDashboardLayout({ children }) {
  const adminSecret = process.env.ADMIN_SECRET;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const isValid = await verifySession(token);

  if (!isValid || !adminSecret) {
    redirect("/admin/login");
  }

  return children;
}
