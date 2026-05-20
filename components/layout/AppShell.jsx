"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/extractor", label: "Website Extractor" },
  { href: "/sessions", label: "Sessions" },
  { href: "/approved", label: "Approved Leads" },
];

export function AppShell({ children }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#020617]">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <article>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
              Puppeteer · Node.js · Next.js
            </p>

            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              Lead Generation Dashboard
            </h1>

            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Internship project: browser automation with Puppeteer to scrape
              Google Maps leads, manage sessions, and extract website contacts.
            </p>
          </article>

          <nav className="flex flex-wrap gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {children}
      </section>
    </main>
  );
}
