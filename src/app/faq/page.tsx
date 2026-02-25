import type { Metadata } from "next";
import Link from "next/link";
import Canonical from "@/components/Canonical";

export const metadata: Metadata = {
  title: "Dumpster Rental FAQ | TX & FL Service Areas",
  description:
    "Get answers about dumpster and dump trailer rentals, pricing, permits, placement, sizing, and pickup for local TX and FL service areas.",
  openGraph: {
    title: "Dumpster Rental FAQ | TX & FL Service Areas",
    description:
      "Get answers about dumpster and dump trailer rentals, pricing, permits, placement, sizing, and pickup for local TX and FL service areas.",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dumpster Rental FAQ | TX & FL Service Areas",
    description:
      "Get answers about dumpster and dump trailer rentals, pricing, permits, placement, sizing, and pickup for local TX and FL service areas.",
    images: ["/og.png"],
  },
};

const faqs = [
  {
    question: "How much does a dumpster rental cost in Spring TX?",
    answer:
      "Pricing depends on container size, debris type, and rental length. Request details through our check form and we will provide clear options for your project.",
  },
  {
    question: "Dump trailer vs dumpster — which should I rent?",
    answer:
      "Dump trailers are strong for tighter access and heavy loads, while 20-yard and 30-yard dumpsters are often better for larger volume cleanup and remodel debris.",
  },
  {
    question: "What can’t go in a dumpster?",
    answer:
      "Hazardous chemicals, paint, oils, asbestos-containing materials, batteries, propane tanks, and medical waste should stay out of standard rental containers.",
  },
  {
    question: "Do I need a permit?",
    answer:
      "Permit requirements depend on placement location and local rules. Street placement is more likely to require a permit than private driveway placement.",
  },
  {
    question: "How long can I keep it?",
    answer:
      "Rental windows vary by container type, location, and project scope. We align scheduling details with your cleanup timeline during request review.",
  },
  {
    question: "What size do I need for a home cleanout?",
    answer:
      "A 20-yard dumpster is often a solid fit for full home cleanouts. A dump trailer may fit better when access is tight or disposal is very dense.",
  },
  {
    question: "What size do I need for a remodel?",
    answer:
      "Many kitchen and bath remodels fit a 20-yard dumpster, while larger multi-room projects may need a 30-yard option for better volume coverage.",
  },
  {
    question: "What size do I need for roofing debris?",
    answer:
      "Roofing projects often require sizing based on total squares and material weight. We help match the right container size to your roof scope.",
  },
  {
    question: "Can you place it in a driveway?",
    answer:
      "Driveway placement is common when access and slope allow safe positioning. Surface protection options can also be discussed during scheduling.",
  },
  {
    question: "How does pickup work?",
    answer:
      "When your project is complete, request pickup and we coordinate the removal window based on your location and container readiness.",
  },
  {
    question: "What if I finish earlier than expected?",
    answer:
      "Early completion is easy to handle. Submit pickup timing updates and we can coordinate removal based on current routing.",
  },
  {
    question: "What if I need more capacity?",
    answer:
      "If debris volume exceeds your original plan, you can request a larger option or an additional haul depending on project needs.",
  },
  {
    question: "Do you serve both residential and commercial projects?",
    answer:
      "Yes. Our service pages are designed for homeowners, contractors, property managers, and business cleanup projects.",
  },
  {
    question: "Can yard waste and renovation debris go together?",
    answer:
      "In many cases yes, but load composition can affect disposal handling. Include your material mix in the request so guidance is accurate.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Canonical pathname="/faq" />
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Dumpster &amp; Dump Trailer FAQ
      </h1>
      <p className="mt-3 max-w-3xl text-black/70 dark:text-white/70">
        Answers to common rental questions for local cleanup, remodeling, and
        construction projects.
      </p>

      <section className="mt-8 space-y-4">
        {faqs.map((faq) => (
          <article
            key={faq.question}
            className="rounded-lg border border-black/10 p-5 dark:border-white/15"
          >
            <h2 className="text-lg font-semibold">{faq.question}</h2>
            <p className="mt-2 text-black/75 dark:text-white/75">
              {faq.answer}{" "}
              <Link href="/check" className="underline underline-offset-4">
                Check availability
              </Link>
              .
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
