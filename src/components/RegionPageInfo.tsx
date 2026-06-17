import Link from "next/link";
import { Region } from "@/lib/regions";
import React from "react";

type RegionPageInfoProps = {
  region: Region;
  howItWorksSteps: string[];
  popularAreaPrefix: string;
  popularAreaLinks: { label: string; href: string }[];
  faqItems: { question: string; answer: string }[];
};

export default function RegionPageInfo({
  region,
  howItWorksSteps,
  popularAreaPrefix,
  popularAreaLinks,
  faqItems,
}: RegionPageInfoProps) {
  return (
    <>
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
          {howItWorksSteps.map((step) => (
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
        <h2 className="text-2xl font-semibold">Popular {popularAreaPrefix} Service Area Pages</h2>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {popularAreaLinks.map((link) => (
            <Link key={link.href} href={link.href} className="underline underline-offset-4">
              {link.label}
            </Link>
          ))}
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
    </>
  );
}
