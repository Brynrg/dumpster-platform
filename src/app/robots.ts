import type { MetadataRoute } from "next";
import { getRequestOrigin } from "@/lib/origin";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await getRequestOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
