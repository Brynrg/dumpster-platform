const badges = [
  "Driveway-Friendly Options",
  "Fast Confirmation By Text",
  "Local Service",
];

export default function TrustBadges() {
  return (
    <section aria-label="Trust badges">
      <div className="grid gap-3 sm:grid-cols-3">
        {badges.map((badge) => (
          <p
            key={badge}
            className="rounded-lg border border-black/10 bg-black/[0.02] px-4 py-3 text-sm font-medium dark:border-white/15 dark:bg-white/[0.03]"
          >
            {badge}
          </p>
        ))}
      </div>
    </section>
  );
}
