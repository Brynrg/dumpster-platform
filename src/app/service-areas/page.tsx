import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { getCitiesByRegion } from "@/lib/cities";
import { getAllRegions } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Service Areas | Dumpster & Dump Trailer Rentals",
  description:
    "Explore service areas across Texas and Florida with region pages and city landing pages for local dumpster and dump trailer rentals.",
};

export default function ServiceAreasPage() {
  const regions = getAllRegions();
  const texasRegions = regions.filter((region) => region.state === "TX");
  const floridaRegions = regions.filter((region) => region.state === "FL");

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <section className="rounded-xl border border-black/10 p-8 dark:border-white/15">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Service Areas
        </h1>
        <p className="mt-3 max-w-3xl text-black/70 dark:text-white/70">
          Browse regional and city-level pages for local dumpster and dump trailer
          rental project planning.
        </p>
        <div className="mt-6">
          <Button href="/check">Check Availability</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Texas</h2>
        <div className="mt-4 space-y-4">
          {texasRegions.map((region) => (
            <article
              key={region.id}
              className="rounded-lg border border-black/10 p-5 dark:border-white/15"
            >
              <h3 className="text-lg font-semibold">
                <Link href={region.pathPrefix} className="underline underline-offset-4">
                  {region.displayName}
                </Link>
              </h3>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {getCitiesByRegion(region.id).map((city) => (
                  <Link
                    key={city.slug}
                    href={`/service-areas/${city.slug}`}
                    className="underline underline-offset-4"
                  >
                    {city.displayName}, {city.state}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Florida</h2>
        <div className="mt-4 space-y-4">
          {floridaRegions.map((region) => (
            <article
              key={region.id}
              className="rounded-lg border border-black/10 p-5 dark:border-white/15"
            >
              <h3 className="text-lg font-semibold">
                <Link href={region.pathPrefix} className="underline underline-offset-4">
                  {region.displayName}
                </Link>
              </h3>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {getCitiesByRegion(region.id).map((city) => (
                  <Link
                    key={city.slug}
                    href={`/service-areas/${city.slug}`}
                    className="underline underline-offset-4"
                  >
                    {city.displayName}, {city.state}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
