import type { Metadata } from "next";
import Link from "next/link";
import RegionHero from "@/components/RegionHero";
import { buildCheckUrl, getRegionById } from "@/lib/regions";

const region = getRegionById("fl-brevard");

export const metadata: Metadata = {
  title: "Dumpster & Dump Trailer Rentals in Brevard County, FL",
  description:
    "Request dumpster and dump trailer rentals in Brevard County, FL and nearby cities.",
};

const faqQuestions = [
  "Which rental option is best for home cleanouts?",
  "Do you service multiple cities within Brevard County?",
  "What items are prohibited in containers?",
];

export default function BrevardCountyRegionPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <RegionHero
        title="Brevard County, FL Dumpster & Dump Trailer Rentals"
        subtitle="Container rental options for residential and commercial cleanup projects throughout Brevard County."
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
            "Choose dump trailer or dumpster rental type.",
            "Submit your request for Brevard County service.",
            "Receive scheduling details and confirmation.",
            "Use the container and request pickup when complete.",
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
