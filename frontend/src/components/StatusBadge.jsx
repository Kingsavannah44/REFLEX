const CONFIG = {
  pending: { label: "Pending", dot: "bg-wait", text: "text-wait" },
  assigned: { label: "Assigned", dot: "bg-signal2", text: "text-signal2" },
  picked_up: { label: "Picked Up", dot: "bg-cream", text: "text-cream" },
  delivered: { label: "Delivered", dot: "bg-go", text: "text-go" },
};

export default function StatusBadge({ status }) {
  const c = CONFIG[status] || { label: status, dot: "bg-muted", text: "text-muted" };
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
