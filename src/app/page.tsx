import Link from "next/link";
import { getAllRegions } from "@/lib/regions";

export default function Home() {
  const regions = getAllRegions();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Dumpster Platform Region Hub
        </h1>
        <p className="mt-3 text-black/70 dark:text-white/70">
          Select a service region to view rental options and service area details.
        </p>
        <p className="mt-2 text-sm font-medium">Texas — start with Spring</p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {regions.map((region) => (
          <article
            key={region.id}
            className="rounded-lg border border-black/10 p-5 dark:border-white/15"
          >
            <h2 className="text-lg font-semibold">{region.displayName}</h2>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">
              {region.cities.slice(0, 3).join(", ")}
            </p>
            <Link
              href={region.pathPrefix}
              className="mt-4 inline-flex rounded-md border border-black/20 px-3 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
            >
              View Region
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
