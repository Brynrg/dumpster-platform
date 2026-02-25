import type { Metadata } from "next";
import Link from "next/link";
import RegionHero from "@/components/RegionHero";
import { buildCheckUrl, getRegionById } from "@/lib/regions";

const region = getRegionById("tx-spring");

export const metadata: Metadata = {
  title: "Dumpster & Dump Trailer Rentals in Spring, TX",
  description:
    "Request dumpster and dump trailer rentals in Spring, TX and nearby service areas.",
};

const faqQuestions = [
  "What size dumpster should I choose?",
  "How soon can delivery be scheduled?",
  "What materials are not allowed in dumpsters?",
];

export default function SpringRegionPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <RegionHero
        title="Spring, TX Dumpster & Dump Trailer Rentals"
        subtitle="Reliable rental options for home cleanouts, renovation debris, and jobsite waste in Spring and nearby communities."
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
