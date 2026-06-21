import type { Metadata } from "next";
import Canonical from "@/components/Canonical";
import RegionHero from "@/components/RegionHero";
import RegionPageInfo from "@/components/RegionPageInfo";
import TrustBadges from "@/components/TrustBadges";
import { buildCheckUrl, getRegionById } from "@/lib/regions";
import { buildLocalBusinessSchema, buildServiceSchema } from "@/lib/schema";

const region = getRegionById("tx-spring");

export const metadata: Metadata = {
  title: "Dumpster & Dump Trailer Rentals in Spring, TX",
  description:
    "Request dumpster and dump trailer rentals in Spring, TX and nearby service areas.",
  openGraph: {
    title: "Dumpster & Dump Trailer Rentals in Spring, TX",
    description:
      "Request dumpster and dump trailer rentals in Spring, TX and nearby service areas.",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dumpster & Dump Trailer Rentals in Spring, TX",
    description:
      "Request dumpster and dump trailer rentals in Spring, TX and nearby service areas.",
    images: ["/og.png"],
  },
};

const faqItems = [
  {
    question: "What size is best for a roofing project?",
    answer:
      "Many roofing projects use a 30-yard dumpster, while smaller roof sections can fit a 20-yard. Request details are reviewed before confirming the fit.",
  },
  {
    question: "Can I place a container on my driveway?",
    answer:
      "Driveway placement is common when access and slope allow safe positioning. Placement details are confirmed during request review.",
  },
  {
    question: "Can I request service for a weekend cleanup?",
    answer:
      "You can submit your requested dates and project timing in the form, and scheduling options are confirmed after request submission.",
  },
  {
    question: "What if I am not sure whether to choose trailer or dumpster?",
    answer:
      "Share your project type and debris volume in your request and we will help guide the best option for your location.",
  },
];

export default function SpringRegionPage() {
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
      <Canonical pathname="/tx/spring" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema).replace(/</g, '\\u003c') }}
      />
      <RegionHero
        title="Spring, TX Dumpster & Dump Trailer Rentals"
        subtitle="Reliable rental options for home cleanouts, renovation debris, and jobsite waste in Spring and nearby communities."
        ctaHref={buildCheckUrl(region.id)}
      />
      <TrustBadges />


      <RegionPageInfo
        region={region}
        howItWorksSteps={[
          "Select your rental type and project details.",
          "Submit your request for Spring, TX service.",
          "Get confirmation and scheduling details.",
          "Receive delivery and request pickup when finished."
        ]}
        popularAreaPrefix="Spring"
        popularAreaLinks={[
          { label: "Spring, TX", href: "/service-areas/spring-tx" },
          { label: "Klein, TX", href: "/service-areas/klein-tx" },
          { label: "Tomball, TX", href: "/service-areas/tomball-tx" }
        ]}
        faqItems={faqItems}
      />
    </main>
  );
}
