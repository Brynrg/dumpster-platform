import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Button from "@/components/ui/Button";
import StickyCtaBar from "@/components/StickyCtaBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spring Dumpsters & Trailers",
  description:
    "Dumpster and dump trailer rentals across Texas and Florida service areas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navLinks = [
    { href: "/dumpsters", label: "Dumpsters" },
    { href: "/dump-trailers", label: "Dump Trailers" },
    { href: "/service-areas", label: "Service Areas" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-background text-foreground">
          <header className="border-b border-black/10 dark:border-white/15">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
              <Link href="/" className="text-base font-semibold sm:text-lg">
                Spring Dumpsters &amp; Trailers
              </Link>
              <nav className="flex flex-wrap items-center gap-4 text-sm">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="underline-offset-4 hover:underline">
                    {link.label}
                  </Link>
                ))}
              </nav>
              <Button href="/check" className="w-full sm:w-auto">
                Check Availability
              </Button>
            </div>
          </header>

          <div className="pb-20 sm:pb-0">{children}</div>

          <footer className="mt-10 border-t border-black/10 dark:border-white/15">
            <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 sm:grid-cols-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-black/70 dark:text-white/70">
                  Regions
                </h2>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link href="/tx/spring" className="underline-offset-4 hover:underline">
                      Spring, TX
                    </Link>
                  </li>
                  <li>
                    <Link href="/tx/north-houston" className="underline-offset-4 hover:underline">
                      North Houston, TX
                    </Link>
                  </li>
                  <li>
                    <Link href="/fl/brevard-county" className="underline-offset-4 hover:underline">
                      Brevard County, FL
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-black/70 dark:text-white/70">
                  Explore
                </h2>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link href="/dumpsters" className="underline-offset-4 hover:underline">
                      Dumpsters
                    </Link>
                  </li>
                  <li>
                    <Link href="/dump-trailers" className="underline-offset-4 hover:underline">
                      Dump Trailers
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="underline-offset-4 hover:underline">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <p className="mx-auto w-full max-w-6xl px-6 pb-10 text-sm text-black/65 dark:text-white/65">
              Availability is confirmed after request submission.
            </p>
          </footer>
        </div>
        <StickyCtaBar />
      </body>
    </html>
  );
}
