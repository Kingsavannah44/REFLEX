import { motion } from "framer-motion";

const STEPS = [
  { key: "assigned", label: "Assigned" },
  { key: "picked_up", label: "Picked Up" },
  { key: "delivered", label: "Delivered" },
];

export default function DeliveryProgress({ status }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const fillPercent = currentIndex <= 0 ? 0 : (currentIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="mb-5">
      <div className="relative flex justify-between mb-2">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 bg-line" />
        <motion.div
          className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 bg-signal"
          initial={false}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <motion.div
              key={step.key}
              className={`relative z-10 w-3 h-3 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                done || active ? "bg-signal border-signal" : "bg-ink border-line"
              }`}
              animate={{ scale: active ? 1.3 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {active && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-signal"
                  animate={{ opacity: [0.6, 0, 0.6], scale: [1, 2, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-wide">
        {STEPS.map((step, i) => (
          <span
            key={step.key}
            className={i <= currentIndex ? "text-cream" : "text-muted"}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
