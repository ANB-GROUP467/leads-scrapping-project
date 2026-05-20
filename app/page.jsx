"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { scrapeSession } from "@/lib/api";
import { Alert } from "@/components/ui/Alert";
import { Card, FeatureCard } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

const DEFAULT_QUERY = "salons in Islamabad Pakistan";

// Maximum time (ms) to wait for a scrape response before showing a timeout error.
// Puppeteer can take 2-5 min, so we allow 8 min as a safety net.
const SCRAPE_TIMEOUT_MS = 8 * 60 * 1000;

export default function DashboardPage() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [sessionAt, setSessionAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [lastSession, setLastSession] = useState(null);
  const [excludePrevious, setExcludePrevious] = useState(true);
  const [filterNoWebsite, setFilterNoWebsite] = useState(true);

  // Keep a ref to the timeout so we can cancel it on success
  const timeoutRef = useRef(null);

  useEffect(() => {
    setSessionAt(new Date().toISOString());
    // Clear any dangling timeout on unmount
    return () => clearTimeout(timeoutRef.current);
  }, []);

  async function handleScrape() {
    if (!query.trim()) {
      setError("Please enter a search query.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    // Safety-net: force-clear loading state after SCRAPE_TIMEOUT_MS
    // in case the fetch never resolves (e.g. proxy drops the connection).
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setError(
        "Request timed out after 8 minutes. The backend may still be running — check the Sessions page in a moment.",
      );
    }, SCRAPE_TIMEOUT_MS);

    try {
      const data = await scrapeSession(query.trim(), {
        excludePrevious,
        filterNoWebsite,
      });

      // Guard: cache-hit responses don't include a session object
      const session = data?.session ?? null;

      setLastSession(session);
      setMessage(data?.message ?? null);

      // Only update the timestamp if we got a real session back
      if (session?.completedAt) {
        setSessionAt(session.completedAt);
      } else {
        setSessionAt(new Date().toISOString());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scrape failed");
    } finally {
      // Always clear both the timeout and the loading state
      clearTimeout(timeoutRef.current);
      setLoading(false);
    }
  }

  const formattedSessionAt = sessionAt
    ? new Date(sessionAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <>
      <section className="mb-6">
        <Alert variant="info">
          <strong>Puppeteer scraper.</strong> Uses headless Chrome to open
          Google Maps, search your query, scroll results, and extract business
          details — same data you see on Maps. First run takes{" "}
          <strong>2–5 minutes</strong>.
        </Alert>
      </section>

      <Card className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
          Google Maps · Puppeteer
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Start a new session
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
          Enter any Maps-style query. Puppeteer automates the browser, collects
          salons, and filters those without a website. Each session is saved
          with a timestamp.
        </p>

        <label className="mt-8 block">
          <span className="text-sm font-medium text-slate-300">
            Search query
          </span>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. salons in Islamabad Pakistan"
            disabled={loading}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />

          <span className="mt-2 block text-xs text-slate-500">
            Session started: {formattedSessionAt}
          </span>
        </label>

        <fieldset className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={excludePrevious}
              onChange={(e) => setExcludePrevious(e.target.checked)}
              disabled={loading}
              className="rounded border-slate-600 bg-slate-800"
            />
            Skip previously scraped
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={filterNoWebsite}
              onChange={(e) => setFilterNoWebsite(e.target.checked)}
              disabled={loading}
              className="rounded border-slate-600 bg-slate-800"
            />
            Only without a website
          </label>
        </fieldset>

        <section className="mt-8 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
          {lastSession && (
            <p className="text-sm text-slate-400">
              Last run:{" "}
              <span className="text-white">{lastSession.leadCount} leads</span>{" "}
              —
              <Link
                href={`/sessions/${lastSession.id}`}
                className="ml-1 text-blue-400 hover:underline"
              >
                View session
              </Link>
            </p>
          )}

          <button
            type="button"
            onClick={handleScrape}
            disabled={loading}
            className="ml-auto inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Puppeteer scraping… (2–5 min)
              </>
            ) : (
              "Scrape with Puppeteer"
            )}
          </button>
        </section>

        {error && (
          <section className="mt-6">
            <Alert variant="error">
              {error}
              <p className="mt-2 text-xs opacity-80">
                Ensure Chromium is installed: run <code>npm install</code> in
                the backend folder. Keep the backend terminal open during
                scrape.
              </p>
            </Alert>
          </section>
        )}

        {message && !error && (
          <section className="mt-6">
            <Alert variant="success">{message}</Alert>
          </section>
        )}
      </Card>

      <section className="grid gap-4 sm:grid-cols-3">
        <FeatureCard
          title="Sessions"
          description="Every Puppeteer run is stored with query, timestamp, and leads."
          href="/sessions"
        />

        <FeatureCard
          title="Approval"
          description="Approve vetted leads for your demo outreach list."
          href="/approved"
        />

        <FeatureCard
          title="Website Extractor"
          description="Puppeteer opens any URL and extracts emails and phones."
          href="/extractor"
        />
      </section>
    </>
  );
}
