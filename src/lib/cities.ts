import type { RegionId } from "@/lib/regions";

export type City = {
  slug: string;
  displayName: string;
  regionId: RegionId;
  state: "TX" | "FL";
  nearby: string[];
};

export const cities: City[] = [
  {
    slug: "spring-tx",
    displayName: "Spring",
    regionId: "tx-spring",
    state: "TX",
    nearby: ["klein-tx", "tomball-tx", "the-woodlands-tx"],
  },
  {
    slug: "klein-tx",
    displayName: "Klein",
    regionId: "tx-spring",
    state: "TX",
    nearby: ["spring-tx", "tomball-tx", "north-houston-tx"],
  },
  {
    slug: "tomball-tx",
    displayName: "Tomball",
    regionId: "tx-spring",
    state: "TX",
    nearby: ["spring-tx", "klein-tx", "the-woodlands-tx"],
  },
  {
    slug: "the-woodlands-tx",
    displayName: "The Woodlands",
    regionId: "tx-spring",
    state: "TX",
    nearby: ["spring-tx", "tomball-tx", "porter-tx"],
  },
  {
    slug: "porter-tx",
    displayName: "Porter",
    regionId: "tx-spring",
    state: "TX",
    nearby: ["spring-tx", "the-woodlands-tx", "north-houston-tx"],
  },
  {
    slug: "north-houston-tx",
    displayName: "North Houston",
    regionId: "tx-north-houston",
    state: "TX",
    nearby: ["aldine-tx", "greenspoint-tx", "cypress-tx"],
  },
  {
    slug: "aldine-tx",
    displayName: "Aldine",
    regionId: "tx-north-houston",
    state: "TX",
    nearby: ["north-houston-tx", "greenspoint-tx", "cypress-tx"],
  },
  {
    slug: "greenspoint-tx",
    displayName: "Greenspoint",
    regionId: "tx-north-houston",
    state: "TX",
    nearby: ["north-houston-tx", "aldine-tx", "spring-tx"],
  },
  {
    slug: "cypress-tx",
    displayName: "Cypress",
    regionId: "tx-north-houston",
    state: "TX",
    nearby: ["north-houston-tx", "aldine-tx", "tomball-tx"],
  },
  {
    slug: "melbourne-fl",
    displayName: "Melbourne",
    regionId: "fl-brevard",
    state: "FL",
    nearby: ["palm-bay-fl", "rockledge-fl", "viera-fl"],
  },
  {
    slug: "palm-bay-fl",
    displayName: "Palm Bay",
    regionId: "fl-brevard",
    state: "FL",
    nearby: ["melbourne-fl", "rockledge-fl", "merritt-island-fl"],
  },
  {
    slug: "titusville-fl",
    displayName: "Titusville",
    regionId: "fl-brevard",
    state: "FL",
    nearby: ["cocoa-fl", "viera-fl", "rockledge-fl"],
  },
  {
    slug: "cocoa-fl",
    displayName: "Cocoa",
    regionId: "fl-brevard",
    state: "FL",
    nearby: ["rockledge-fl", "viera-fl", "merritt-island-fl"],
  },
  {
    slug: "merritt-island-fl",
    displayName: "Merritt Island",
    regionId: "fl-brevard",
    state: "FL",
    nearby: ["cocoa-fl", "rockledge-fl", "melbourne-fl"],
  },
  {
    slug: "viera-fl",
    displayName: "Viera",
    regionId: "fl-brevard",
    state: "FL",
    nearby: ["rockledge-fl", "cocoa-fl", "melbourne-fl"],
  },
  {
    slug: "rockledge-fl",
    displayName: "Rockledge",
    regionId: "fl-brevard",
    state: "FL",
    nearby: ["viera-fl", "cocoa-fl", "melbourne-fl"],
  },
];

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((city) => city.slug === slug);
}

export function getCitiesByRegion(regionId: RegionId): City[] {
  return cities.filter((city) => city.regionId === regionId);
}
