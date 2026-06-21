import Link from "next/link";
import { ReactNode } from "react";

export function AdminNavigation({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/admin/pricing"
        className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
      >
        Pricing Model
      </Link>
      <Link
        href="/admin/disposal"
        className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
      >
        Disposal Intel
      </Link>
      <Link
        href="/admin/seo"
        className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
      >
        Local SEO Ops
      </Link>
      <Link
        href="/admin/metrics"
        className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
      >
        Metrics
      </Link>
      <Link
        href="/admin/notify"
        className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
      >
        Notify Leads
      </Link>
      {children}
    </div>
  );
}
