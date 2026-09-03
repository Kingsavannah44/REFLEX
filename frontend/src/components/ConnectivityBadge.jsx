import { motion, AnimatePresence } from "framer-motion";

export default function ConnectivityBadge({ isOnline, queueLength }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={isOnline ? "online" : "offline"}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full border ${
          isOnline ? "border-go/40 text-go" : "border-wait/40 text-wait"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-go" : "bg-wait"}`} />
        {isOnline ? "Online" : `Offline (${queueLength})`}
      </motion.span>
    </AnimatePresence>
  );
}
