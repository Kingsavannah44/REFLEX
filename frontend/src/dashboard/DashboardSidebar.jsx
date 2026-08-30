import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import AccountMenu from "./AccountMenu";
import { clearSession } from "../session";

// Items with a `key` matching the current page render as the active state
// and actually do something; everything else is a real nav item that's
// visually present but not wired up yet - Reflex's actual scope right now
// is just the dashboard each role already has.
export default function DashboardSidebar({ user, items, activeKey, footer }) {
  const navigate = useNavigate();

  function goBack() {
    clearSession();
    navigate("/");
  }

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-slate-800">
        <button onClick={goBack} className="flex items-center gap-2 text-left">
          <span className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
            <Zap className="w-4.5 h-4.5 text-slate-900" fill="currentColor" />
          </span>
          <span>
            <span className="block font-display font-semibold text-white text-lg leading-none">
              Reflex
            </span>
            <span className="block text-[10px] text-slate-500 mt-0.5">
              Deliveries. Simplified.
            </span>
          </span>
        </button>
      </div>

      <div className="p-4 border-b border-slate-800">
        <AccountMenu user={user} align="left">
          <div className="flex items-center gap-2.5 hover:bg-slate-800 -m-1.5 p-1.5 rounded-lg transition-colors">
            <Avatar name={user.full_name} size={34} />
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.full_name}</div>
              <div className="text-xs text-slate-500 capitalize">{user.role}</div>
            </div>
          </div>
        </AccountMenu>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-green-500/15 text-green-400 font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {footer && <div className="p-4 border-t border-slate-800 space-y-3">{footer}</div>}
    </aside>
  );
}
