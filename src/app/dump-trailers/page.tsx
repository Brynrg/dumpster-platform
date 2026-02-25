import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";

type DumpTrailersPageProps = {
  searchParams: Promise<{ region?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Dump Trailer Rentals | TX & FL Service Areas",
  description:
    "Find dump trailer rental options for cleanouts, landscaping, and renovation debris across our Texas and Florida service areas.",
};

export default async function DumpTrailersPage({
  searchParams,
}: DumpTrailersPageProps) {
  const params = await searchParams;
  const region = Array.isArray(params.region) ? params.region[0] : params.region;
  const checkHref = region ? `/check?region=${region}` : "/check";

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <section className="rounded-xl border border-black/10 p-8 dark:border-white/15">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Dump Trailer Rentals
        </h1>
        <p className="mt-3 max-w-3xl text-black/70 dark:text-white/70">
          Dump trailers are a strong fit for projects that need flexible loading and
          straightforward placement for residential or light commercial cleanup.
        </p>
        <div className="mt-6">
          <Button href={checkHref}>Check Availability</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Best For</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Garage and attic cleanouts</li>
          <li>Yard debris and landscaping removal</li>
          <li>Small-to-mid renovation debris</li>
          <li>Projects with limited placement space</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Size &amp; Fit Guidance</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <article className="rounded-lg border border-black/10 p-4 dark:border-white/15">
            <h3 className="font-medium">Dump Trailer</h3>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">
              Great for dense, heavy debris and tighter access points.
            </p>
          </article>
          <article className="rounded-lg border border-black/10 p-4 dark:border-white/15">
            <h3 className="font-medium">20-Yard Dumpster</h3>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">
              Solid all-around choice for most remodels and large cleanouts.
            </p>
          </article>
          <article className="rounded-lg border border-black/10 p-4 dark:border-white/15">
            <h3 className="font-medium">30-Yard Dumpster</h3>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">
              Better for bulky material and larger construction jobs.
            </p>
          </article>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">What&apos;s Included</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Delivery to your project location</li>
          <li>Placement guidance at drop-off</li>
          <li>Pickup coordination when your project is complete</li>
        </ul>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">Materials Accepted</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>Household junk and general cleanup debris</li>
            <li>Wood, drywall, and non-hazardous construction materials</li>
            <li>Yard waste and brush</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Prohibited Items</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>Hazardous chemicals and solvents</li>
            <li>Paints, oils, and automotive fluids</li>
            <li>Asbestos-containing materials</li>
            <li>Tires, batteries, and propane tanks</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">How It Works</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Choose a trailer or container type for your project.",
            "Submit project details and service location.",
            "Review delivery and scheduling details.",
            "Fill the container and request pickup.",
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
