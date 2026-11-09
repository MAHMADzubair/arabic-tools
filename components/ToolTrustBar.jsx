"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getToolTrust } from "@/lib/toolTrust";
import { formatArabicDate, formatArabicMonth } from "@/lib/changelog";

/**
 * Slim trust line rendered above every indexed tool page (from the root layout).
 * Renders nothing on non-tool routes.
 */
export default function ToolTrustBar() {
  const trust = getToolTrust(usePathname());
  if (!trust) return null;

  const { updated, reviewed, source, change } = trust;

  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg)]">
      <p className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 text-[13px] leading-6 text-[var(--text-2)]">
        {reviewed ? (
          <span>
            آخر مراجعة مقابل المصدر:{" "}
            <time dateTime={reviewed} className="font-semibold text-[var(--text)]">{formatArabicDate(reviewed)}</time>
          </span>
        ) : (
          <span>
            آخر تحديث للصفحة:{" "}
            <time dateTime={updated} className="font-semibold text-[var(--text)]">{formatArabicMonth(updated.slice(0, 7))}</time>
          </span>
        )}
        {source && <span>المصدر الرسمي: {source}</span>}
        {change ? (
          <Link href={`/changelog#${change.id}`} className="font-semibold text-[var(--accent-text)]">
            ما الذي تغيّر؟ ←
          </Link>
        ) : (
          <Link href="/changelog" className="text-[var(--text-2)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--text)]">
            سجل التحديثات
          </Link>
        )}
      </p>
    </div>
  );
}
