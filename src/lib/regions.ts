export type RegionId = "tx-spring" | "tx-north-houston" | "fl-brevard";

export type Region = {
  id: RegionId;
  pathPrefix: string;
  displayName: string;
  state: "TX" | "FL";
  cities: string[];
};

const REGIONS: Record<RegionId, Region> = {
  "tx-spring": {
    id: "tx-spring",
    pathPrefix: "/tx/spring",
    displayName: "Spring, TX",
    state: "TX",
    cities: ["Spring", "Klein", "Tomball", "The Woodlands", "Porter"],
  },
  "tx-north-houston": {
    id: "tx-north-houston",
    pathPrefix: "/tx/north-houston",
    displayName: "North Houston, TX",
    state: "TX",
    cities: ["North Houston", "Aldine", "Greenspoint", "Cypress"],
  },
  "fl-brevard": {
    id: "fl-brevard",
    pathPrefix: "/fl/brevard-county",
    displayName: "Brevard County, FL",
    state: "FL",
    cities: [
      "Melbourne",
      "Palm Bay",
      "Titusville",
      "Cocoa",
      "Merritt Island",
      "Viera",
      "Rockledge",
    ],
  },
};

export function getAllRegions(): Region[] {
  return Object.values(REGIONS);
}

export function getRegionById(id: RegionId): Region {
  return REGIONS[id];
}

export function buildCheckUrl(regionId: RegionId): string {
  return `/check?region=${regionId}`;
}
