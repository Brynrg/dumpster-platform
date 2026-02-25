import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";

type DumpstersPageProps = {
  searchParams: Promise<{ region?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Dumpster Rentals | 20-Yard & 30-Yard Options",
  description:
    "Explore dumpster rental options, size guidance, accepted materials, and service areas across Texas and Florida.",
};

export default async function DumpstersPage({
  searchParams,
}: DumpstersPageProps) {
  const params = await searchParams;
  const region = Array.isArray(params.region) ? params.region[0] : params.region;
  const checkHref = region ? `/check?region=${region}` : "/check";

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <section className="rounded-xl border border-black/10 p-8 dark:border-white/15">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Dumpster Rentals
        </h1>
        <p className="mt-3 max-w-3xl text-black/70 dark:text-white/70">
          20-yard and 30-yard dumpsters support clean, efficient debris removal for
          remodels, roofing jobs, and larger cleanouts.
        </p>
        <div className="mt-6">
          <Button href={checkHref}>Check Availability</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Best For</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Home remodeling and renovation projects</li>
          <li>Roof tear-offs and contractor cleanup</li>
          <li>Large household decluttering projects</li>
          <li>Commercial and construction debris</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Size &amp; Fit Guidance</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <article className="rounded-lg border border-black/10 p-4 dark:border-white/15">
            <h3 className="font-medium">Dump Trailer</h3>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">
              Great when access is tight and loading flexibility matters.
            </p>
          </article>
          <article className="rounded-lg border border-black/10 p-4 dark:border-white/15">
            <h3 className="font-medium">20-Yard Dumpster</h3>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">
              Often the best fit for mid-size projects and home cleanouts.
            </p>
          </article>
          <article className="rounded-lg border border-black/10 p-4 dark:border-white/15">
            <h3 className="font-medium">30-Yard Dumpster</h3>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">
              Better for major remodels, bulky debris, and larger volumes.
            </p>
          </article>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">What&apos;s Included</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Drop-off at your site based on request details</li>
          <li>Container placement aligned with location constraints</li>
          <li>Pickup when your project is wrapped and ready</li>
        </ul>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">Materials Accepted</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>General household junk</li>
            <li>Wood, drywall, and flooring materials</li>
            <li>Construction and renovation debris</li>
            <li>Yard waste and brush</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Prohibited Items</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>Hazardous chemicals and flammable liquids</li>
            <li>Paint, oils, and pesticides</li>
            <li>Asbestos and regulated hazardous waste</li>
            <li>Batteries, propane tanks, and medical waste</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">How It Works</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Select your container size and project type.",
            "Submit your service location and timing details.",
            "Confirm placement and scheduling information.",
            "Fill the dumpster and request pickup.",
          ].map((step) => (
            <li key={step} className="rounded-lg border border-black/10 p-4 dark:border-white/15">
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-wrap gap-4">
        <Link href="/faq" className="underline underline-offset-4">
          Read FAQs
        </Link>
        <Link href="/service-areas" className="underline underline-offset-4">
          Explore Service Areas
        </Link>
      </section>
    </main>
  );
}
