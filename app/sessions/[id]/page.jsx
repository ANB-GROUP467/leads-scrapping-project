"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { approveLeads, exportLeadsToCsv, fetchSession } from "@/lib/api";
import { LeadTable } from "@/components/LeadTable";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [approving, setApproving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchSession(id);
      setSession(data.session);
    } catch (err) {
      setError(err?.message || "Session not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  function toggleLead(leadId) {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }

      return next;
    });
  }

  function toggleAll() {
    if (!session) return;

    const allSelected = session.leads.every((lead) => selectedIds.has(lead.id));

    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(session.leads.map((lead) => lead.id)));
    }
  }

  async function handleApprove() {
    if (selectedIds.size === 0) return;

    setApproving(true);
    setError(null);
    setMessage(null);

    try {
      await approveLeads([...selectedIds]);
      setMessage(`${selectedIds.size} lead(s) moved to approved list.`);
      setSelectedIds(new Set());
      await load();
    } catch (err) {
      setError(err?.message || "Approval failed");
    } finally {
      setApproving(false);
    }
  }

  if (loading) {
    return (
      <section className="flex items-center justify-center py-20 text-slate-500">
        <Spinner className="mr-2 h-5 w-5" />
        Loading session...
      </section>
    );
  }

  if (!session) {
    return (
      <section>
        <Alert variant="error">{error || "Session not found"}</Alert>

        <Link
          href="/sessions"
          className="mt-4 inline-block text-sm text-blue-400 hover:underline"
        >
          Back to sessions
        </Link>
      </section>
    );
  }

  return (
    <>
      <header className="mb-6">
        <button
          type="button"
          onClick={() => router.push("/sessions")}
          className="mb-2 text-sm text-slate-500 hover:text-slate-300"
        >
          ← Back to sessions
        </button>

        <h2 className="text-xl font-bold text-white">{session.query}</h2>

        <p className="mt-1 text-sm text-slate-400">
          {session.leadCount} leads · {session.provider} ·{" "}
          {new Date(session.createdAt).toLocaleString("en-US")}
        </p>
      </header>

      {error && (
        <section className="mb-4">
          <Alert variant="error">{error}</Alert>
        </section>
      )}

      {message && (
        <section className="mb-4">
          <Alert variant="success">{message}</Alert>
        </section>
      )}

      <section className="mb-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleApprove}
          disabled={approving || selectedIds.size === 0}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {approving
            ? "Approving..."
            : `Approve selected (${selectedIds.size})`}
        </button>

        <button
          type="button"
          onClick={() => exportLeadsToCsv(session.leads)}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
        >
          Export CSV
        </button>
      </section>

      <LeadTable
        leads={session.leads}
        selectable
        selectedIds={selectedIds}
        onToggle={toggleLead}
        onToggleAll={toggleAll}
      />
    </>
  );
}
