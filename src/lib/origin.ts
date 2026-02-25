import { headers } from "next/headers";

export async function getRequestOrigin(): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "https";

  if (!host) {
    return "http://localhost:3000";
  }

  return `${proto}://${host}`;
}
