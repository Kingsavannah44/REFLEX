const CONFIG = {
  pending: { label: "Pending", cls: "bg-purple-50 text-purple-700" },
  assigned: { label: "Assigned", cls: "bg-amber-50 text-amber-700" },
  picked_up: { label: "Picked Up", cls: "bg-blue-50 text-blue-700" },
  delivered: { label: "Delivered", cls: "bg-green-50 text-green-700" },
};

export default function StatusPill({ status }) {
  const c = CONFIG[status] || { label: status, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${c.cls}`}>
      {c.label}
    </span>
  );
}
