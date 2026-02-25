export type DisposalFacilitySeed = {
  market: string;
  name: string;
  facility_type: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  website?: string;
  commercial_allowed: boolean;
  notes: string;
  last_verified: string;
};

export type DisposalRateSeed = {
  market: string;
  facility_name: string;
  material_category: string;
  price: number;
  unit: string;
  effective_date: string;
  source_url: string;
  source_notes: string;
};

const brevardRatesSourceUrl =
  "https://www.brevardfl.gov/docs/default-source/solid-waste-documents/special-rates-and-gate-charges-resolution-fy2026.pdf";

export const facilitiesSeed: DisposalFacilitySeed[] = [
  {
    market: "fl-brevard",
    name: "Brevard County Central Disposal Facility",
    facility_type: "Landfill",
    address1: "2060 Adamson Road",
    city: "Cocoa",
    state: "FL",
    zip: "",
    website:
      "https://www.brevardfl.gov/SolidWaste/Facilities/CentralDisposalFacility",
    commercial_allowed: true,
    notes:
      "County landfill + HHW center; see website for accepted/prohibited materials.",
    last_verified: "2025-08-12",
  },
  {
    market: "tx-north-houston",
    name: "Hardy Road Transfer Station (Waste Connections)",
    facility_type: "Transfer Station",
    address1: "18784 Hardy Rd",
    city: "Houston",
    state: "TX",
    zip: "77396",
    phone: "281-443-1456",
    website: "https://www.wasteconnections.com/hardy-road-transfer-station",
    commercial_allowed: true,
    notes: "Rates not published; call to verify.",
    last_verified: "",
  },
  {
    market: "tx-north-houston",
    name: "Blue Ridge Landfill (Republic Services)",
    facility_type: "Landfill",
    address1: "2200 FM 521",
    city: "Fresno",
    state: "TX",
    zip: "77545",
    phone: "281-835-6142",
    website: "https://blueridgelandfill.com/drop-off-information/",
    commercial_allowed: true,
    notes: "Public drop-off; rates by tonnage/type; call for full rates.",
    last_verified: "",
  },
  {
    market: "tx-north-houston",
    name: "Casco Landfill",
    facility_type: "Landfill",
    address1: "1306 East Anderson Road",
    city: "Houston",
    state: "TX",
    zip: "77047",
    phone: "713-433-2421",
    website: "https://www.cascolandfill.com/casco-landfill-construction-disposal-rates/",
    commercial_allowed: true,
    notes: "Publishes C&D rates per cubic yard.",
    last_verified: "",
  },
];

export const ratesSeed: DisposalRateSeed[] = [
  {
    market: "fl-brevard",
    facility_name: "Brevard County Central Disposal Facility",
    material_category: "Construction Debris (not mixed)",
    price: 38.47,
    unit: "ton",
    effective_date: "2025-10-01",
    source_url: brevardRatesSourceUrl,
    source_notes: "Special Rates and Gate Charges Resolution FY2026.",
  },
  {
    market: "fl-brevard",
    facility_name: "Brevard County Central Disposal Facility",
    material_category: "Yard Waste / Land Clearing Debris (not mixed)",
    price: 49.38,
    unit: "ton",
    effective_date: "2025-10-01",
    source_url: brevardRatesSourceUrl,
    source_notes: "Special Rates and Gate Charges Resolution FY2026.",
  },
  {
    market: "fl-brevard",
    facility_name: "Brevard County Central Disposal Facility",
    material_category: "Discarded Recyclables",
    price: 24.7,
    unit: "ton",
    effective_date: "2025-10-01",
    source_url: brevardRatesSourceUrl,
    source_notes: "Special Rates and Gate Charges Resolution FY2026.",
  },
  {
    market: "fl-brevard",
    facility_name: "Brevard County Central Disposal Facility",
    material_category: "Clean Concrete",
    price: 0,
    unit: "ton",
    effective_date: "2025-10-01",
    source_url: brevardRatesSourceUrl,
    source_notes: "Special Rates and Gate Charges Resolution FY2026.",
  },
  {
    market: "fl-brevard",
    facility_name: "Brevard County Central Disposal Facility",
    material_category: "Cardboard only",
    price: 0,
    unit: "ton",
    effective_date: "2025-10-01",
    source_url: brevardRatesSourceUrl,
    source_notes: "Special Rates and Gate Charges Resolution FY2026.",
  },
  {
    market: "tx-north-houston",
    facility_name: "Casco Landfill",
    material_category: "Standard C&D Waste",
    price: 9,
    unit: "yd3",
    effective_date: "",
    source_url: "https://www.cascolandfill.com/casco-landfill-construction-disposal-rates/",
    source_notes: "Published C&D rates.",
  },
  {
    market: "tx-north-houston",
    facility_name: "Casco Landfill",
    material_category: "Special Handling C&D",
    price: 10,
    unit: "yd3",
    effective_date: "",
    source_url: "https://www.cascolandfill.com/casco-landfill-construction-disposal-rates/",
    source_notes: "Published C&D rates.",
  },
  {
    market: "tx-north-houston",
    facility_name: "Casco Landfill",
    material_category: "Minimum Charge",
    price: 30,
    unit: "minimum",
    effective_date: "",
    source_url: "https://www.cascolandfill.com/casco-landfill-construction-disposal-rates/",
    source_notes: "Published C&D rates.",
  },
];
