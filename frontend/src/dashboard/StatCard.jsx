const TONES = {
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
};

export default function StatCard({ icon: Icon, tone = "green", label, value, sub }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${TONES[tone]}`}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-slate-900 mb-1">{value}</div>
      <div className="text-xs text-slate-400">{sub}</div>
    </div>
  );
}
