import Button from "@/components/ui/Button";

type RegionHeroProps = {
  title: string;
  subtitle: string;
  ctaHref: string;
};

export default function RegionHero({ title, subtitle, ctaHref }: RegionHeroProps) {
  return (
    <section className="rounded-xl border border-black/10 bg-white p-8 dark:border-white/15 dark:bg-black/20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-base text-black/70 dark:text-white/70">
        {subtitle}
      </p>
      <div className="mt-6">
        <Button href={ctaHref}>Check Availability</Button>
      </div>
    </section>
  );
}
