import type { Metadata } from "next";
import Canonical from "@/components/Canonical";
import RegionHero from "@/components/RegionHero";
import RegionPageInfo from "@/components/RegionPageInfo";
import TrustBadges from "@/components/TrustBadges";
import { buildCheckUrl, getRegionById } from "@/lib/regions";
import { buildLocalBusinessSchema, buildServiceSchema } from "@/lib/schema";

const region = getRegionById("tx-north-houston");

export const metadata: Metadata = {
  title: "Dumpster & Dump Trailer Rentals in North Houston, TX",
  description:
    "Request dumpster and dump trailer rentals in North Houston, TX and nearby service areas.",
  openGraph: {
    title: "Dumpster & Dump Trailer Rentals in North Houston, TX",
    description:
      "Request dumpster and dump trailer rentals in North Houston, TX and nearby service areas.",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dumpster & Dump Trailer Rentals in North Houston, TX",
    description:
      "Request dumpster and dump trailer rentals in North Houston, TX and nearby service areas.",
    images: ["/og.png"],
  },
};

const faqItems = [
  {
    question: "Which container size is best for remodel debris?",
    answer:
      "Mid-size remodels often fit a 20-yard dumpster, while larger renovations can require a 30-yard. Project details are reviewed before confirming.",
  },
  {
    question: "Do you offer driveway-friendly options in North Houston?",
    answer:
      "Yes, many requests use driveway-friendly placement when the property allows safe access and positioning.",
  },
  {
    question: "Can contractors submit requests for recurring jobs?",
    answer:
      "Contractors can submit each project request with timing and location details, then scheduling is confirmed after review.",
  },
  {
    question: "What materials are typically not accepted?",
    answer:
      "Hazardous and regulated materials are generally not accepted. You can share project details for guidance before disposal.",
  },
];

export default function NorthHoustonRegionPage() {
  const areaServed = region.cities.map((city) => `${city}, ${region.state}`);
  const localBusinessSchema = buildLocalBusinessSchema({
    name: "Spring Dumpsters & Trailers",
    areaServed,
    url: region.pathPrefix,
  });
  const serviceSchema = buildServiceSchema({
    serviceName: "Dumpster rental and dump trailer rental",
    areaServed,
    url: region.pathPrefix,
  });

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <Canonical pathname="/tx/north-houston" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema).replace(/</g, '\\u003c') }}
      />
      <RegionHero
        title="North Houston, TX Dumpster & Dump Trailer Rentals"
        subtitle="Flexible rental options for cleanup, renovation, and construction projects across North Houston communities."
        ctaHref={buildCheckUrl(region.id)}
      />
      <TrustBadges />


      <RegionPageInfo
        region={region}
        howItWorksSteps={[
          "Choose your container type and project timeline.",
          "Submit your request for North Houston service.",
          "Receive confirmation and scheduling details.",
          "Get delivery, fill the container, and schedule pickup."
        ]}
        popularAreaPrefix="North Houston"
        popularAreaLinks={[
          { label: "North Houston, TX", href: "/service-areas/north-houston-tx" },
          { label: "Aldine, TX", href: "/service-areas/aldine-tx" },
          { label: "Greenspoint, TX", href: "/service-areas/greenspoint-tx" }
        ]}
        faqItems={faqItems}
      />
    </main>
  );
}
