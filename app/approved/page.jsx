"use client";

import { useCallback, useEffect, useState } from "react";
import {
  exportLeadsToCsv,
  fetchApproved,
  fetchEmailStatus,
  removeApproved,
  sendBulkEmail,
  sendEmail,
} from "@/lib/api";

import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function ApprovedLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [smtpConfigured, setSmtpConfigured] = useState(false);

  const [singleTo, setSingleTo] = useState("");
  const [bulkRecipients, setBulkRecipients] = useState("");

  const [subject, setSubject] = useState(
    "Partnership opportunity for your salon",
  );

  const [body, setBody] = useState(
    "Hello,\n\nWe noticed your business on Google Maps and would love to discuss building a website for you.\n\nBest regards",
  );

  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [approved, emailStatus] = await Promise.all([
        fetchApproved(),
        fetchEmailStatus(),
      ]);

      setLeads(approved.leads);
      setSmtpConfigured(emailStatus.configured);
    } catch (err) {
      setError(err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRemove(id) {
    try {
      await removeApproved(id);

      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch (err) {
      setError(err?.message || "Remove failed");
    }
  }

  async function handleSingleSend(e) {
    e.preventDefault();

    setSending(true);
    setError(null);
    setMessage(null);

    try {
      await sendEmail({
        to: singleTo,
        subject,
        body,
      });

      setMessage(`Email sent to ${singleTo}`);
      setSingleTo("");
    } catch (err) {
      setError(err?.message || "Send failed");
    } finally {
      setSending(false);
    }
  }

  async function handleBulkSend(e) {
    e.preventDefault();

    const recipients = bulkRecipients
      .split(/[\n,;]+/)
      .map((recipient) => recipient.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      setError("Add at least one recipient email.");
      return;
    }

    setSending(true);
    setError(null);
    setMessage(null);

    try {
      const result = await sendBulkEmail({
        recipients,
        subject,
        body,
      });

      setMessage(`Sent ${result.sent} email(s). Failed: ${result.failed}.`);

      setBulkRecipients("");
    } catch (err) {
      setError(err?.message || "Bulk send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <header className="mb-6">
        <h2 className="text-xl font-bold text-white">Approved Leads</h2>

        <p className="mt-1 text-sm text-slate-400">
          Vetted businesses ready for outreach. Export or send email campaigns
          below.
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

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-white">Single email</h3>

          {!smtpConfigured && (
            <p className="mt-2 text-xs text-amber-400/90">
              SMTP not configured. Add SMTP_* variables in backend/.env
            </p>
          )}

          <form onSubmit={handleSingleSend} className="mt-4 space-y-3">
            <input
              type="email"
              required
              placeholder="recipient@example.com"
              value={singleTo}
              onChange={(e) => setSingleTo(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />

            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />

            <textarea
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />

            <button
              type="submit"
              disabled={sending || !smtpConfigured}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send email"}
            </button>
          </form>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white">Bulk email</h3>

          <p className="mt-1 text-xs text-slate-500">
            One email per line. Polite delay between sends configurable on
            server.
          </p>

          <form onSubmit={handleBulkSend} className="mt-4 space-y-3">
            <textarea
              rows={4}
              placeholder={"email1@example.com\nemail2@example.com"}
              value={bulkRecipients}
              onChange={(e) => setBulkRecipients(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />

            <button
              type="submit"
              disabled={sending || !smtpConfigured}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send bulk"}
            </button>
          </form>
        </Card>
      </section>

      <section className="mb-4 flex gap-3">
        <button
          type="button"
          onClick={() => exportLeadsToCsv(leads)}
          disabled={leads.length === 0}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          Export CSV
        </button>
      </section>

      {loading ? (
        <section className="flex justify-center py-16 text-slate-500">
          <Spinner className="mr-2 h-5 w-5" />
          Loading...
        </section>
      ) : leads.length === 0 ? (
        <Card>
          <p className="text-slate-400">
            No approved leads yet. Open a session, select rows, and click
            Approve.
          </p>
        </Card>
      ) : (
        <section className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-800/60">
                  <td className="px-4 py-3 text-white">{lead.name}</td>

                  <td className="px-4 py-3 text-slate-400">
                    {lead.phone || "—"}
                  </td>

                  <td className="px-4 py-3 text-slate-500">
                    {lead.sessionQuery || "—"}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleRemove(lead.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
