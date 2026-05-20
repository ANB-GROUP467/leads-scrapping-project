import type {
  ExtractResult,
  Lead,
  ScrapeResponse,
  Session,
  SessionSummary,
} from "@/types/lead";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });

  let data: { error?: string } & T;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Invalid response from API (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

export async function scrapeSession(
  query: string,
  options?: { excludePrevious?: boolean; filterNoWebsite?: boolean },
): Promise<ScrapeResponse> {
  return request<ScrapeResponse>("/api/scrape", {
    method: "POST",
    body: JSON.stringify({
      query,
      filterNoWebsite: options?.filterNoWebsite !== false,
      excludePrevious: options?.excludePrevious !== false,
    }),
  });
}

export async function fetchSessions(): Promise<{
  sessions: SessionSummary[];
  count: number;
}> {
  return request("/api/sessions");
}

export async function fetchSession(id: string): Promise<{ session: Session }> {
  return request(`/api/sessions/${id}`);
}

export async function fetchApproved(): Promise<{
  leads: Lead[];
  count: number;
}> {
  return request("/api/approved");
}

export async function approveLeads(
  leadIds: string[],
): Promise<{ approved: Lead[] }> {
  return request("/api/approved", {
    method: "POST",
    body: JSON.stringify({ leadIds }),
  });
}

export async function removeApproved(id: string): Promise<void> {
  await request(`/api/approved/${id}`, { method: "DELETE" });
}

export async function extractWebsite(
  url: string,
): Promise<{ data: ExtractResult }> {
  return request("/api/extractor", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function fetchEmailStatus(): Promise<{ configured: boolean }> {
  return request("/api/email/status");
}

export async function sendEmail(payload: {
  to: string;
  subject: string;
  body: string;
}): Promise<void> {
  await request("/api/email/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function sendBulkEmail(payload: {
  recipients: string[];
  subject: string;
  body: string;
}): Promise<{
  sent: number;
  failed: number;
  errors: { to: string; error: string }[];
}> {
  return request("/api/email/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function exportLeadsToCsv(leads: Lead[]): void {
  const headers = [
    "Name",
    "Address",
    "Phone",
    "Rating",
    "Source",
    "Maps URL",
    "Approved",
  ];
  const rows = leads.map((l) => [
    l.name,
    l.address,
    l.phone || "",
    l.rating != null ? String(l.rating) : "",
    l.source,
    l.mapsUrl || "",
    l.approved ? "yes" : "no",
  ]);

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
