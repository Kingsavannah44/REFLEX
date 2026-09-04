import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import AccountMenu from "./AccountMenu";
import { clearSession } from "../session";

// Items with a `key` matching the current page render as the active state
// and actually do something; everything else is a real nav item that's
// visually present but not wired up yet - Reflex's actual scope right now
// is just the dashboard each role already has.
//
// Below the lg breakpoint this becomes an off-canvas drawer (mobileOpen
// controls it) instead of the always-visible column it is on desktop -
// Retailer and Dispatcher have too many nav items for a bottom tab bar to
// make sense, unlike Rider's five-item mobile nav.
export default function DashboardSidebar({ user, items, activeKey, footer, mobileOpen = false, onCloseMobile }) {
  const navigate = useNavigate();

  function goBack() {
    clearSession();
    navigate("/");
  }

  function handleItemClick(item) {
    onCloseMobile?.();
    item.onClick?.();
  }

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col transform transition-transform duration-200 lg:static lg:z-auto lg:h-screen lg:sticky lg:top-0 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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
                onClick={() => handleItemClick(item)}
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
    </>
  );
}
