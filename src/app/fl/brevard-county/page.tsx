import type { Metadata } from "next";
import Canonical from "@/components/Canonical";
import RegionHero from "@/components/RegionHero";
import RegionPageInfo from "@/components/RegionPageInfo";
import TrustBadges from "@/components/TrustBadges";
import { buildCheckUrl, getRegionById } from "@/lib/regions";
import { buildLocalBusinessSchema, buildServiceSchema } from "@/lib/schema";

const region = getRegionById("fl-brevard");

export const metadata: Metadata = {
  title: "Dumpster & Dump Trailer Rentals in Brevard County, FL",
  description:
    "Request dumpster and dump trailer rentals in Brevard County, FL and nearby cities.",
  openGraph: {
    title: "Dumpster & Dump Trailer Rentals in Brevard County, FL",
    description:
      "Request dumpster and dump trailer rentals in Brevard County, FL and nearby cities.",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dumpster & Dump Trailer Rentals in Brevard County, FL",
    description:
      "Request dumpster and dump trailer rentals in Brevard County, FL and nearby cities.",
    images: ["/og.png"],
  },
};

const faqItems = [
  {
    question: "Do you cover multiple cities across Brevard County?",
    answer:
      "Yes, requests can be submitted for multiple Brevard County locations. Service and scheduling details are confirmed after request review.",
  },
  {
    question: "What should I choose for yard and landscaping debris?",
    answer:
      "A dump trailer is often a strong fit for smaller cleanups and landscaping projects with driveway access.",
  },
  {
    question: "Can I use a 30-yard for larger remodels?",
    answer:
      "Yes, 30-yard dumpsters are commonly requested for larger remodel and roofing cleanup volume.",
  },
  {
    question: "What happens after I submit a request?",
    answer:
      "You receive follow-up to confirm container type, timing, and final service availability for your specific project.",
  },
];

export default function BrevardCountyRegionPage() {
  const areaServed = region.cities.map((city) => `${city}, ${region.state}`);
  const localBusinessSchema = buildLocalBusinessSchema({
    name: "Brevard County Dumpsters & Trailers",
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
      <Canonical pathname="/fl/brevard-county" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema).replace(/</g, '\\u003c') }}
      />
      <RegionHero
        title="Brevard County, FL Dumpster & Dump Trailer Rentals"
        subtitle="Container rental options for residential and commercial cleanup projects throughout Brevard County."
        ctaHref={buildCheckUrl(region.id)}
      />
      <TrustBadges />


      <RegionPageInfo
        region={region}
        howItWorksSteps={[
          "Choose dump trailer or dumpster rental type.",
          "Submit your request for Brevard County service.",
          "Receive scheduling details and confirmation.",
          "Use the container and request pickup when complete."
        ]}
        popularAreaPrefix="Brevard"
        popularAreaLinks={[
          { label: "Melbourne, FL", href: "/service-areas/melbourne-fl" },
          { label: "Palm Bay, FL", href: "/service-areas/palm-bay-fl" },
          { label: "Cocoa, FL", href: "/service-areas/cocoa-fl" }
        ]}
        faqItems={faqItems}
      />
    </main>
  );
}
