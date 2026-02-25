import type { Metadata } from "next";
import Link from "next/link";
import RegionHero from "@/components/RegionHero";
import TrustBadges from "@/components/TrustBadges";
import { buildCheckUrl, getRegionById } from "@/lib/regions";
import { buildLocalBusinessSchema, buildServiceSchema } from "@/lib/schema";

const region = getRegionById("tx-spring");

export const metadata: Metadata = {
  title: "Dumpster & Dump Trailer Rentals in Spring, TX",
  description:
    "Request dumpster and dump trailer rentals in Spring, TX and nearby service areas.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <RegionHero
        title="Spring, TX Dumpster & Dump Trailer Rentals"
        subtitle="Reliable rental options for home cleanouts, renovation debris, and jobsite waste in Spring and nearby communities."
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
            "Select your rental type and project details.",
            "Submit your request for Spring, TX service.",
            "Get confirmation and scheduling details.",
            "Receive delivery and request pickup when finished.",
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
        <h2 className="text-2xl font-semibold">Popular Spring Service Area Pages</h2>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/service-areas/spring-tx" className="underline underline-offset-4">
            Spring, TX
          </Link>
          <Link href="/service-areas/klein-tx" className="underline underline-offset-4">
            Klein, TX
          </Link>
          <Link href="/service-areas/tomball-tx" className="underline underline-offset-4">
            Tomball, TX
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
