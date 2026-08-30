import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { clearSession } from "../session";
import ThemeToggle from "./ThemeToggle";
import LiveClock from "./LiveClock";

const ROLE_LABELS = {
  retailer: "Retailer Staff",
  dispatcher: "Dispatcher",
  rider: "Rider",
};

export default function NavBar({ user }) {
  const navigate = useNavigate();

  function goBack() {
    clearSession();
    navigate("/");
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="border-b border-line sticky top-0 z-20 bg-ink/90 backdrop-blur-sm"
    >
      <div className="max-w-5xl mx-auto px-5 py-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            aria-label="Back to login"
            title="Back"
            className="text-muted hover:text-cream transition-colors text-base leading-none"
          >
            ←
          </button>
          <span className="font-display font-semibold text-lg tracking-tight whitespace-nowrap">
            Reflex
          </span>
          <span className="eyebrow whitespace-nowrap">{ROLE_LABELS[user.role]}</span>
        </div>
        <div className="flex items-center gap-4">
          <LiveClock />
          <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-muted whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-go live-dot" />
            Live
          </span>
          <span className="text-sm text-muted whitespace-nowrap">{user.full_name}</span>
          <button onClick={goBack} className="btn-ghost whitespace-nowrap">
            Switch user
          </button>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
