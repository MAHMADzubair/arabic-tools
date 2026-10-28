import { redirect } from "next/navigation";

export const metadata = {
  title: "Owner Sign In | QEMLO",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";

// Maintain old bookmarks without exposing a second independently maintained login.
export default function LegacyAdminLogin() {
  redirect("/owner-access");
}
