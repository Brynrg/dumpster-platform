import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const MARKETS = ["tx-spring", "tx-north-houston", "fl-brevard"] as const;
const DEFAULT_PROVIDERS = [
  "Yelp",
  "Bing Places",
  "Apple Business Connect",
  "Nextdoor",
  "Angi",
  "Thumbtack",
  "Chamber",
] as const;

async function main() {
  console.log("Seeding citations...");

  for (const market of MARKETS) {
    const { error } = await supabase.from("citations").upsert(
      DEFAULT_PROVIDERS.map((provider) => ({ market, provider })),
      { onConflict: "market,provider" },
    );

    if (error) {
      console.error(`Error seeding citations for market ${market}:`, error);
    } else {
      console.log(`Successfully seeded citations for market ${market}.`);
    }
  }

  console.log("Done.");
}

main().catch(console.error);
