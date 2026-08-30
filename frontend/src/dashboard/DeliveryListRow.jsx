import { ChevronRight } from "lucide-react";
import StatusPill from "./StatusPill";

const DOT = {
  pending: "bg-purple-400",
  assigned: "bg-amber-400",
  picked_up: "bg-blue-400",
  delivered: "bg-green-400",
};

function timeOf(order) {
  return new Date(order.created_at || order.updated_at || Date.now()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortRef(order) {
  return `ORD-${order.order_id.slice(0, 4).toUpperCase()}`;
}

export default function DeliveryListRow({ order, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="w-full flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 text-left disabled:cursor-default"
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT[order.status] || "bg-slate-300"}`} />
      <span className="w-20 shrink-0 text-xs font-mono text-slate-400">{shortRef(order)}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-slate-800 truncate">
          {order.customer_name}
        </span>
        <span className="block text-xs text-slate-400 truncate">{order.delivery_address}</span>
      </span>
      <StatusPill status={order.status} />
      <span className="w-16 shrink-0 text-xs text-slate-400 text-right">{timeOf(order)}</span>
      {onClick && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
    </button>
  );
}
