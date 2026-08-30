import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import Avatar from "./Avatar";
import { api } from "../api";
import { clearSession, setSession, ROLE_HOME } from "../session";

// Wraps an Avatar (or a fuller profile block via `children`) so clicking it
// opens a menu with every known account grouped together - handy for
// demoing across roles without re-typing a password each time - plus a real
// log out action at the bottom.
export default function AccountMenu({ user, children, align = "right" }) {
  const [open, setOpen] = useState(false);
  const [others, setOthers] = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    api
      .listUsers()
      .then((all) => setOthers(all.filter((u) => u.user_id !== user.user_id)))
      .catch(() => {});
  }, [open, user.user_id]);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function switchTo(otherUser) {
    setSession(otherUser);
    setOpen(false);
    navigate(ROLE_HOME[otherUser.role] || "/");
  }

  function logout() {
    clearSession();
    navigate("/");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="block rounded-lg focus:outline-none"
        aria-label="Account menu"
      >
        {children || <Avatar name={user.full_name} size={36} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50`}
          >
            <div className="flex items-center gap-2.5 px-1.5 py-2">
              <Avatar name={user.full_name} size={36} />
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{user.full_name}</div>
                <div className="text-xs text-slate-400 truncate">{user.phone_number}, signed in</div>
              </div>
            </div>

            {others.length > 0 && (
              <div className="pt-1 pb-1.5 border-t border-slate-100 mt-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-1.5 pt-1.5 pb-1">
                  Switch account
                </div>
                {others.map((o) => (
                  <button
                    key={o.user_id}
                    onClick={() => switchTo(o)}
                    className="w-full flex items-center gap-2.5 px-1.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <Avatar name={o.full_name} size={30} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{o.full_name}</div>
                      <div className="text-xs text-slate-400 capitalize">{o.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="pt-1.5 border-t border-slate-100 mt-1">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg px-2.5 py-2 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
