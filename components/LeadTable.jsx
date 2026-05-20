"use client";

export function LeadTable({
  leads,
  selectable = false,
  selectedIds = new Set(),
  onToggle,
  onToggleAll,
  emptyMessage = "No leads in this session yet. Start a scrape from the dashboard.",
}) {
  if (leads.length === 0) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <p className="text-slate-400">{emptyMessage}</p>
      </section>
    );
  }

  const allSelected =
    leads.length > 0 && leads.every((lead) => selectedIds.has(lead.id));

  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
      <section className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
              {selectable && (
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleAll}
                    className="rounded border-slate-600 bg-slate-800"
                    aria-label="Select all"
                  />
                </th>
              )}

              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead, index) => (
              <tr
                key={lead.id}
                className="border-b border-slate-800/60 transition hover:bg-slate-800/20"
              >
                {selectable && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(lead.id)}
                      onChange={() => onToggle?.(lead.id)}
                      className="rounded border-slate-600 bg-slate-800"
                      aria-label={`Select ${lead.name}`}
                    />
                  </td>
                )}

                <td className="px-4 py-3 text-slate-500">{index + 1}</td>

                <td className="px-4 py-3">
                  <span className="font-medium text-white">{lead.name}</span>

                  {lead.mapsUrl && (
                    <a
                      href={lead.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-xs text-blue-400 hover:text-blue-300"
                    >
                      View on map
                    </a>
                  )}
                </td>

                <td className="max-w-xs px-4 py-3 text-slate-400">
                  {lead.address}
                </td>

                <td className="px-4 py-3 text-slate-300">
                  {lead.phone || "—"}
                </td>

                <td className="px-4 py-3">
                  {lead.rating != null ? (
                    <span className="text-amber-400">
                      ★ {Number(lead.rating).toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  {lead.approved ? (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                      Approved
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-xs text-slate-400">
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}
