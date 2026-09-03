import { Phone } from "lucide-react";
import Avatar from "./Avatar";
import StatusPill from "./StatusPill";

// There's no persistent Customer record in the data model (USERS + ORDERS
// only) - a "customer" only exists as fields copied onto each order. This
// groups real orders by customer_phone (the one stable identifier repeat
// customers share) so a retailer or dispatcher can see someone's history,
// without pretending we have a real customer database.
export default function CustomersList({ orders }) {
  const groups = new Map();
  for (const o of orders) {
    const key = o.customer_phone || o.customer_name;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(o);
  }

  const customers = Array.from(groups.entries())
    .map(([phone, list]) => {
      const sorted = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const addresses = Array.from(new Set(list.map((o) => o.delivery_address)));
      return {
        phone,
        name: sorted[0].customer_name,
        orders: sorted,
        addresses,
      };
    })
    .sort((a, b) => new Date(b.orders[0].created_at) - new Date(a.orders[0].created_at));

  if (customers.length === 0) {
    return <p className="text-sm text-slate-400 italic py-6">No customers yet, they appear here once a delivery is logged.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {customers.map((c) => (
        <div key={c.phone} className="border border-slate-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={c.name} size={34} />
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{c.name}</div>
                <div className="text-xs text-slate-400 truncate">{c.phone}</div>
              </div>
            </div>
            <a
              href={`tel:${c.phone}`}
              className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
            {c.orders.length} {c.orders.length === 1 ? "order" : "orders"}
            {c.addresses.length > 1 ? `, ${c.addresses.length} addresses` : ""}
          </div>
          <div className="space-y-1.5">
            {c.orders.slice(0, 3).map((o) => (
              <div key={o.order_id} className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 truncate">{o.delivery_address}</span>
                <StatusPill status={o.status} />
              </div>
            ))}
            {c.orders.length > 3 && (
              <div className="text-xs text-slate-400">+{c.orders.length - 3} more</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
