"use client";

import Button from "@/components/ui/Button";
import { usePathname } from "next/navigation";

const hiddenPrefixes = ["/check", "/admin", "/unavailable"];

export default function StickyCtaBar() {
  const pathname = usePathname();
  const shouldHide = hiddenPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (shouldHide) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-background/95 px-4 py-3 shadow-lg backdrop-blur sm:hidden dark:border-white/15">
      <div className="mx-auto flex max-w-5xl gap-3">
        <Button href="/check" className="flex-1">
          Check Availability
        </Button>
        <Button href="/service-areas" variant="secondary" className="flex-1">
          See Service Areas
        </Button>
      </div>
    </div>
  );
}
