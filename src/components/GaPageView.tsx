"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type GaPageViewProps = {
  gaId: string;
};

export default function GaPageView({ gaId }: GaPageViewProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }

    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    window.gtag("config", gaId, { page_path: pagePath });
  }, [gaId, pathname, searchParams]);

  return null;
}
