import type { Metadata } from "next";
import Link from "next/link";
import Canonical from "@/components/Canonical";
import TrustBadges from "@/components/TrustBadges";
import Button from "@/components/ui/Button";

type DumpTrailersPageProps = {
  searchParams: Promise<{ region?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Dump Trailer Rentals | TX & FL Service Areas",
  description:
    "Find dump trailer rental options for cleanouts, landscaping, and renovation debris across our Texas and Florida service areas.",
  openGraph: {
    title: "Dump Trailer Rentals | TX & FL Service Areas",
    description:
      "Find dump trailer rental options for cleanouts, landscaping, and renovation debris across our Texas and Florida service areas.",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dump Trailer Rentals | TX & FL Service Areas",
    description:
      "Find dump trailer rental options for cleanouts, landscaping, and renovation debris across our Texas and Florida service areas.",
    images: ["/og.png"],
  },
};

export default async function DumpTrailersPage({
  searchParams,
}: DumpTrailersPageProps) {
  const params = await searchParams;
  const region = Array.isArray(params.region) ? params.region[0] : params.region;
  const checkHref = region ? `/check?region=${region}` : "/check";

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <Canonical pathname="/dump-trailers" />
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
      <TrustBadges />

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
        <h2 className="text-2xl font-semibold">Choose a Size</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Dump Trailer",
              detail: "Driveway-friendly for smaller cleanouts and landscaping.",
            },
            {
              title: "20-Yard Dumpster",
              detail: "Mid-size option for cleanouts and small remodel jobs.",
            },
            {
              title: "30-Yard Dumpster",
              detail: "Large-volume option for roofing and full-scale remodels.",
            },
          ].map((option) => (
            <article key={option.title} className="rounded-lg border border-black/10 p-4 dark:border-white/15">
              <h3 className="font-medium">{option.title}</h3>
              <p className="mt-2 text-sm text-black/70 dark:text-white/70">{option.detail}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <Link href="/check" className="underline underline-offset-4">
                  Check Availability
                </Link>
                <Link href="/service-areas" className="underline underline-offset-4">
                  See Service Areas
                </Link>
              </div>
            </article>
          ))}
        </div>
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

      <section>
        <h2 className="text-2xl font-semibold">Top City Service Pages</h2>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/service-areas/spring-tx" className="underline underline-offset-4">
            Spring, TX
          </Link>
          <Link href="/service-areas/klein-tx" className="underline underline-offset-4">
            Klein, TX
          </Link>
          <Link href="/service-areas/cypress-tx" className="underline underline-offset-4">
            Cypress, TX
          </Link>
          <Link href="/service-areas/melbourne-fl" className="underline underline-offset-4">
            Melbourne, FL
          </Link>
          <Link href="/service-areas/cocoa-fl" className="underline underline-offset-4">
            Cocoa, FL
          </Link>
          <Link href="/service-areas/viera-fl" className="underline underline-offset-4">
            Viera, FL
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Common Questions</h2>
        <div className="mt-4 space-y-2">
          <details className="rounded-lg border border-black/10 p-4 dark:border-white/15">
            <summary className="cursor-pointer font-medium">When is a dump trailer a better fit?</summary>
            <p className="mt-2 text-sm text-black/75 dark:text-white/75">
              Dump trailers are often chosen for driveway-friendly access, dense debris, and projects with tighter placement constraints.
            </p>
          </details>
          <details className="rounded-lg border border-black/10 p-4 dark:border-white/15">
            <summary className="cursor-pointer font-medium">Can I still request a dumpster from this page?</summary>
            <p className="mt-2 text-sm text-black/75 dark:text-white/75">
              Yes, you can compare container options and submit a request based on your project details and location.
            </p>
          </details>
          <details className="rounded-lg border border-black/10 p-4 dark:border-white/15">
            <summary className="cursor-pointer font-medium">Are weekend projects supported?</summary>
            <p className="mt-2 text-sm text-black/75 dark:text-white/75">
              Weekend requests can be submitted in the form, and scheduling is confirmed after request submission.
            </p>
          </details>
          <details className="rounded-lg border border-black/10 p-4 dark:border-white/15">
            <summary className="cursor-pointer font-medium">What is the next step after submitting?</summary>
            <p className="mt-2 text-sm text-black/75 dark:text-white/75">
              Your request is reviewed and followed with confirmation details for container type, timing, and service availability.
            </p>
          </details>
        </div>
      </section>
    </main>
  );
}
