import Avatar from "./Avatar";

function fmtDuration(ms) {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
}

function dayKey(iso) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

// Every number here comes straight from real order timestamps and statuses -
// no invented historical trend lines, no simulated percentages. On a small,
// young dataset these numbers will look sparse; that's honest, not a bug.
export default function ReportsPanel({ orders, riders }) {
  const total = orders.length;
  const delivered = orders.filter((o) => o.status === "delivered");
  const pending = orders.filter((o) => o.status === "pending").length;
  const assigned = orders.filter((o) => o.status === "assigned").length;
  const pickedUp = orders.filter((o) => o.status === "picked_up").length;
  const completionRate = total > 0 ? Math.round((delivered.length / total) * 100) : 0;

  const durations = delivered.map((o) => new Date(o.updated_at) - new Date(o.created_at)).filter((d) => d >= 0);
  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : null;

  const byDay = new Map();
  for (const o of orders) {
    const key = dayKey(o.created_at);
    byDay.set(key, (byDay.get(key) || 0) + 1);
  }
  const dayRows = Array.from(byDay.entries()).slice(-7);
  const maxDay = Math.max(1, ...dayRows.map(([, n]) => n));

  const riderCounts = riders
    ? riders
        .map((r) => ({ rider: r, count: delivered.filter((o) => o.assigned_rider === r.user_id).length }))
        .sort((a, b) => b.count - a.count)
    : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="border border-slate-200 rounded-xl p-3.5">
          <div className="text-xl font-semibold text-slate-900">{total}</div>
          <div className="text-xs text-slate-500 mt-0.5">Total deliveries</div>
        </div>
        <div className="border border-slate-200 rounded-xl p-3.5">
          <div className="text-xl font-semibold text-slate-900">{completionRate}%</div>
          <div className="text-xs text-slate-500 mt-0.5">Completion rate</div>
        </div>
        <div className="border border-slate-200 rounded-xl p-3.5">
          <div className="text-xl font-semibold text-slate-900">{avgDuration != null ? fmtDuration(avgDuration) : "—"}</div>
          <div className="text-xs text-slate-500 mt-0.5">Avg. time to delivery</div>
        </div>
        <div className="border border-slate-200 rounded-xl p-3.5">
          <div className="text-xl font-semibold text-slate-900">{pending + assigned + pickedUp}</div>
          <div className="text-xs text-slate-500 mt-0.5">Still in progress</div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Deliveries logged by day</h3>
        {dayRows.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No deliveries logged yet.</p>
        ) : (
          <div className="space-y-2">
            {dayRows.map(([day, count]) => (
              <div key={day} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-xs text-slate-500">{day}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(count / maxDay) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-xs text-slate-500 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {riderCounts && (
        <div className="border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Deliveries completed by rider</h3>
          {riderCounts.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No riders registered yet.</p>
          ) : (
            <div className="space-y-2.5">
              {riderCounts.map(({ rider, count }) => (
                <div key={rider.user_id} className="flex items-center gap-2.5">
                  <Avatar name={rider.full_name} size={28} />
                  <span className="text-sm text-slate-700 flex-1 truncate">{rider.full_name}</span>
                  <span className="text-sm font-medium text-slate-800">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
