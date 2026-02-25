import type { MetadataRoute } from "next";
import { cities } from "@/lib/cities";
import { getRequestOrigin } from "@/lib/origin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await getRequestOrigin();
  const now = new Date();

  const staticPaths = [
    "/",
    "/tx/spring",
    "/tx/north-houston",
    "/fl/brevard-county",
    "/dump-trailers",
    "/dumpsters",
    "/faq",
    "/service-areas",
  ];

  const staticEntries = staticPaths.map((path) => ({
    url: `${origin}${path}`,
    lastModified: now,
  }));

  const cityEntries = cities.map((city) => ({
    url: `${origin}/service-areas/${city.slug}`,
    lastModified: now,
  }));

  return [...staticEntries, ...cityEntries];
}
