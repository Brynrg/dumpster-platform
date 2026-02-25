import type { Metadata } from "next";
import Link from "next/link";
import RegionHero from "@/components/RegionHero";
import { buildCheckUrl, getRegionById } from "@/lib/regions";
import { buildLocalBusinessSchema, buildServiceSchema } from "@/lib/schema";

const region = getRegionById("tx-north-houston");

export const metadata: Metadata = {
  title: "Dumpster & Dump Trailer Rentals in North Houston, TX",
  description:
    "Request dumpster and dump trailer rentals in North Houston, TX and nearby service areas.",
};

const faqQuestions = [
  "What dumpster sizes are available for residential projects?",
  "Can I use a dump trailer for landscaping debris?",
  "How long can I keep a rental on site?",
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
        <h2 className="text-2xl font-semibold">Service Areas</h2>
        <ul className="mt-4 grid list-disc gap-2 pl-5 sm:grid-cols-2">
          {region.cities.map((city) => (
            <li key={city}>{city}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <ul className="mt-4 space-y-2">
          {faqQuestions.map((question) => (
            <li key={question} className="rounded-lg border border-black/10 p-4 dark:border-white/15">
              {question}
            </li>
          ))}
        </ul>
        <Link href="/faq" className="mt-4 inline-block underline underline-offset-4">
          View all FAQs
        </Link>
      </section>
    </main>
  );
}
