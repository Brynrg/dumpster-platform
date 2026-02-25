declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", event, props ?? {});
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[track]", event, props ?? {});
  }
}
