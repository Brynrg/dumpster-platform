import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Canonical from "@/components/Canonical";
import Button from "@/components/ui/Button";
import { cities, getCityBySlug } from "@/lib/cities";
import { buildCheckUrl, getRegionById } from "@/lib/regions";
import { buildLocalBusinessSchema, buildServiceSchema } from "@/lib/schema";

type CityPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return cities.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) {
    return {
      title: "Service Area",
      description: "Local dumpster and dump trailer rental service area details.",
    };
  }

  return {
    title: `Dumpster & Dump Trailer Rentals in ${city.displayName}, ${city.state}`,
    description: `Explore dumpster and dump trailer rental options in ${city.displayName}, ${city.state}, including local project guidance and service area links.`,
    openGraph: {
      title: `Dumpster & Dump Trailer Rentals in ${city.displayName}, ${city.state}`,
      description: `Explore dumpster and dump trailer rental options in ${city.displayName}, ${city.state}, including local project guidance and service area links.`,
      type: "website",
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `Dumpster & Dump Trailer Rentals in ${city.displayName}, ${city.state}`,
      description: `Explore dumpster and dump trailer rental options in ${city.displayName}, ${city.state}, including local project guidance and service area links.`,
      images: ["/og.png"],
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  const region = getRegionById(city.regionId);
  const nearbyCities = city.nearby
    .map((nearbySlug) => getCityBySlug(nearbySlug))
    .filter((entry) => Boolean(entry))
    .slice(0, 3);

  const businessName =
    city.state === "TX"
      ? "Spring Dumpsters & Trailers"
      : "Brevard County Dumpsters & Trailers";
  const pageUrl = `/service-areas/${city.slug}`;
  const area = [`${city.displayName}, ${city.state}`];

  const localBusinessSchema = buildLocalBusinessSchema({
    name: businessName,
    areaServed: area,
    url: pageUrl,
  });
  const serviceSchema = buildServiceSchema({
    serviceName: "Dumpster rental and dump trailer rental",
    areaServed: area,
    url: pageUrl,
  });

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <Canonical pathname={`/service-areas/${city.slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <section className="rounded-xl border border-black/10 p-8 dark:border-white/15">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Dumpster &amp; Dump Trailer Rentals in {city.displayName}
        </h1>
        <p className="mt-3 max-w-3xl text-black/70 dark:text-white/70">
          Local container rental guidance for residential and commercial cleanup
          projects in {city.displayName}, {city.state}.
        </p>
        <div className="mt-6">
          <Button href={buildCheckUrl(city.regionId)}>Check Availability</Button>
        </div>
      </section>

      <section className="rounded-lg border border-black/10 p-5 dark:border-white/15">
        <h2 className="text-2xl font-semibold">Start Your Request</h2>
        <p className="mt-3 text-black/75 dark:text-white/75">
          Share your project timeline and material type to get container guidance
          and scheduling confirmation for {city.displayName}.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button href={buildCheckUrl(city.regionId)}>Check Availability</Button>
          <Button href={region.pathPrefix} variant="secondary">
            View {region.displayName}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">
          Common Projects in {city.displayName}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Home cleanouts and move-out debris removal</li>
          <li>Kitchen, bath, and flooring renovation debris</li>
          <li>Yard cleanup and storm debris projects</li>
          <li>Contractor and jobsite material disposal</li>
        </ul>
      </section>

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

      <section className="grid gap-6 sm:grid-cols-2">
        <article className="rounded-lg border border-black/10 p-5 dark:border-white/15">
          <h2 className="text-2xl font-semibold">Driveway Placement</h2>
          <p className="mt-3 text-black/75 dark:text-white/75">
            Driveway placement is commonly requested. Placement details depend on
            access, slope, and safe positioning at the property.
          </p>
        </article>
        <article className="rounded-lg border border-black/10 p-5 dark:border-white/15">
          <h2 className="text-2xl font-semibold">Permit Note</h2>
          <p className="mt-3 text-black/75 dark:text-white/75">
            Permit requirements depend on location, especially for street placement.
            We will help guide permit considerations during request review.
          </p>
        </article>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Nearby Service Areas</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {nearbyCities.map((nearbyCity) => (
            <article
              key={nearbyCity!.slug}
              className="rounded-lg border border-black/10 p-4 dark:border-white/15"
            >
              <h3 className="font-medium">
                {nearbyCity!.displayName}, {nearbyCity!.state}
              </h3>
              <Link
                href={`/service-areas/${nearbyCity!.slug}`}
                className="mt-2 inline-block text-sm underline underline-offset-4"
              >
                View service page
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Related Services</h2>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/dumpsters" className="underline underline-offset-4">
            Dumpster Options
          </Link>
          <Link href="/dump-trailers" className="underline underline-offset-4">
            Dump Trailer Options
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-black/10 p-5 dark:border-white/15">
        <h2 className="text-2xl font-semibold">Ready to Request Service?</h2>
        <p className="mt-3 text-black/75 dark:text-white/75">
          Submit your project details for {city.displayName} and we will confirm
          availability after request review.
        </p>
        <div className="mt-4">
          <Button href={buildCheckUrl(city.regionId)}>Check Availability</Button>
        </div>
      </section>
    </main>
  );
}
