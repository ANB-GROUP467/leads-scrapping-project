"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fetchSessions } from "@/lib/api";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    async function loadSessions() {
      try {
        setError(null);
        const data = await fetchSessions();
        setSessions(data.sessions || []);
      } catch (err) {
        setError(err?.message || "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, []);

  return (
    <>
      <header className="mb-6">
        <h2 className="text-xl font-bold text-white">Sessions</h2>
        <p className="mt-1 text-sm text-slate-400">
          Every scrape run is stored with its query, provider, and timestamp.
        </p>
      </header>

      {error && (
        <section className="mb-6">
          <Alert variant="error">{error}</Alert>
        </section>
      )}

      {loading ? (
        <section className="flex items-center justify-center py-20 text-slate-500">
          <Spinner className="mr-2 h-5 w-5" />
          Loading sessions...
        </section>
      ) : sessions.length === 0 ? (
        <Card>
          <p className="text-slate-400">
            No sessions yet. Run a scrape from the dashboard.
          </p>

          <Link
            href="/"
            className="mt-4 inline-block text-sm text-blue-400 hover:underline"
          >
            Go to Dashboard
          </Link>
        </Card>
      ) : (
        <section className="space-y-3">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/sessions/${session.id}`}
              prefetch={false}
              className="block rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700 hover:bg-slate-900/70"
            >
              <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <article>
                  <p className="font-medium text-white">{session.query}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(session.createdAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </article>

                <section className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
                    {session.leadCount} leads
                  </span>

                  <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs uppercase text-blue-400">
                    {session.provider}
                  </span>

                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                    {session.type}
                  </span>
                </section>
              </section>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
