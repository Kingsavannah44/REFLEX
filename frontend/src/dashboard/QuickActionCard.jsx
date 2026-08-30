const TONES = {
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
};

export default function QuickActionCard({ icon: Icon, tone = "green", label, sub, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 text-left transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${TONES[tone]}`}>
        <Icon className="w-4.5 h-4.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        <span className="block text-xs text-slate-400 truncate">{sub}</span>
      </span>
    </button>
  );
}
