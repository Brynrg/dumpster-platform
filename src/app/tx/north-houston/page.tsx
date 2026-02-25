import type { Metadata } from "next";
import Link from "next/link";
import RegionHero from "@/components/RegionHero";
import TrustBadges from "@/components/TrustBadges";
import { buildCheckUrl, getRegionById } from "@/lib/regions";
import { buildLocalBusinessSchema, buildServiceSchema } from "@/lib/schema";

const region = getRegionById("tx-north-houston");

export const metadata: Metadata = {
  title: "Dumpster & Dump Trailer Rentals in North Houston, TX",
  description:
    "Request dumpster and dump trailer rentals in North Houston, TX and nearby service areas.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <RegionHero
        title="North Houston, TX Dumpster & Dump Trailer Rentals"
        subtitle="Flexible rental options for cleanup, renovation, and construction projects across North Houston communities."
        ctaHref={buildCheckUrl(region.id)}
      />
      <TrustBadges />

      <section>
        <h2 className="text-2xl font-semibold">What We Rent</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {["Dump Trailer", "20-Yard Dumpster", "30-Yard Dumpster"].map((item) => (
            <article
              key={item}
              className="rounded-lg border border-black/10 p-4 dark:border-white/15"
            >
              <h3 className="font-medium">{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">How It Works</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Choose your container type and project timeline.",
            "Submit your request for North Houston service.",
            "Receive confirmation and scheduling details.",
            "Get delivery, fill the container, and schedule pickup.",
          ].map((step) => (
            <li
              key={step}
              className="rounded-lg border border-black/10 p-4 dark:border-white/15"
            >
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Popular Projects</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {["Roofing", "Remodel", "Yard Cleanup", "Contractor Debris"].map((project) => (
            <p
              key={project}
              className="rounded-lg border border-black/10 p-4 dark:border-white/15"
            >
              {project}
            </p>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Sizing Guide</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/[0.03] dark:bg-white/[0.04]">
              <tr>
                <th className="px-4 py-3 font-semibold">Option</th>
                <th className="px-4 py-3 font-semibold">Best Use</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-black/10 dark:border-white/15">
                <td className="px-4 py-3 font-medium">Dump Trailer</td>
                <td className="px-4 py-3">
                  Driveway-friendly, smaller cleanouts, landscaping
                </td>
              </tr>
              <tr className="border-t border-black/10 dark:border-white/15">
                <td className="px-4 py-3 font-medium">20-yard</td>
                <td className="px-4 py-3">Mid-size cleanouts, small remodels</td>
              </tr>
              <tr className="border-t border-black/10 dark:border-white/15">
                <td className="px-4 py-3 font-medium">30-yard</td>
                <td className="px-4 py-3">Large cleanouts, roofing/remodels</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Service Areas</h2>
        <ul className="mt-4 grid list-disc gap-2 pl-5 sm:grid-cols-2">
          {region.cities.map((city) => (
            <li key={city}>{city}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Popular North Houston Service Area Pages</h2>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/service-areas/north-houston-tx" className="underline underline-offset-4">
            North Houston, TX
          </Link>
          <Link href="/service-areas/aldine-tx" className="underline underline-offset-4">
            Aldine, TX
          </Link>
          <Link href="/service-areas/greenspoint-tx" className="underline underline-offset-4">
            Greenspoint, TX
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Common Questions</h2>
        <div className="mt-4 space-y-2">
          {faqItems.map((item) => (
            <details key={item.question} className="rounded-lg border border-black/10 p-4 dark:border-white/15">
              <summary className="cursor-pointer font-medium">{item.question}</summary>
              <p className="mt-2 text-sm text-black/75 dark:text-white/75">{item.answer}</p>
            </details>
          ))}
        </div>
        <Link href="/faq" className="mt-4 inline-block underline underline-offset-4">
          View all FAQs
        </Link>
      </section>
    </main>
  );
}
