import { CheckCircle2, QrCode } from "lucide-react";
import Avatar from "./Avatar";

function shortRef(order) {
  return `ORD-${order.order_id.slice(0, 4).toUpperCase()}`;
}

function formatWhen(iso) {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Every "proof" here is a real delivered order confirmed through the
// scan-to-confirm flow - there's no photo or signature capture built yet,
// so this shows exactly what we actually have: who delivered it and when,
// not a fabricated receipt image.
export default function ProofOfDeliveryList({ orders, users }) {
  const delivered = orders
    .filter((o) => o.status === "delivered")
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  if (delivered.length === 0) {
    return <p className="text-sm text-slate-400 italic py-6">No confirmed deliveries yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {delivered.map((o) => {
        const rider = users.find((u) => u.user_id === o.assigned_rider);
        return (
          <div key={o.order_id} className="border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">{shortRef(o)}</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Confirmed
              </span>
            </div>
            <div className="text-sm font-medium text-slate-800">{o.customer_name}</div>
            <div className="text-xs text-slate-400 mb-3">{o.delivery_address}</div>
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                {rider && <Avatar name={rider.full_name} size={22} />}
                <span className="text-xs text-slate-500 truncate">{rider ? rider.full_name : "Unknown rider"}</span>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">{formatWhen(o.updated_at)}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
              <QrCode className="w-3 h-3" /> Confirmed by rider via Scan to Confirm
            </div>
          </div>
        );
      })}
    </div>
  );
}
