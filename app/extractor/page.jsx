"use client";

import { useState } from "react";
import { extractWebsite } from "@/lib/api";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function ExtractorPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleExtract(e) {
    e.preventDefault();

    if (!url.trim()) {
      setError("Enter a website URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await extractWebsite(url.trim());
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
          Puppeteer · Website Extractor
        </p>

        <h2 className="mt-2 text-xl font-bold text-white">
          Extract contact data
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Puppeteer opens the page in headless Chrome and parses emails and
          phone numbers from the HTML.
        </p>
      </header>

      <Card className="mb-8">
        <form onSubmit={handleExtract} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-300">
              Website URL
            </span>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Extracting with Puppeteer…
              </>
            ) : (
              "Extract"
            )}
          </button>
        </form>

        {error && (
          <section className="mt-6">
            <Alert variant="error">{error}</Alert>
          </section>
        )}
      </Card>

      {result && (
        <section className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="font-semibold text-white">Page info</h3>

            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-slate-500">URL</dt>
                <dd className="break-all text-slate-300">{result.url}</dd>
              </div>

              {result.title && (
                <div>
                  <dt className="text-slate-500">Title</dt>
                  <dd className="text-slate-300">{result.title}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card>
            <h3 className="font-semibold text-white">
              Emails ({result.emailCount})
            </h3>

            {result.emails.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No emails found.</p>
            ) : (
              <ul className="mt-4 space-y-1 text-sm text-blue-300">
                {result.emails.map((email) => (
                  <li key={email}>{email}</li>
                ))}
              </ul>
            )}

            <h3 className="mt-6 font-semibold text-white">
              Phones ({result.phoneCount})
            </h3>

            {result.phones.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No phones found.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {result.phones.map((phone) => (
                  <li key={phone}>{phone}</li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      )}
    </>
  );
}
