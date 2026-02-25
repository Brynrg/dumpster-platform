import { getRequestOrigin as getOriginFromHeaders } from "@/lib/origin";

export async function getRequestOrigin(): Promise<string> {
  return getOriginFromHeaders();
}

export async function buildCanonical(pathname: string): Promise<string> {
  const origin = await getRequestOrigin();
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin}${normalizedPath}`;
}

export async function buildOgImageUrl(): Promise<string> {
  const origin = await getRequestOrigin();
  return `${origin}/og.png`;
}
