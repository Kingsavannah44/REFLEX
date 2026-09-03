import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTheme, applyTheme } from "../theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getTheme());

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      aria-label="Toggle light and dark mode"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-7 h-7 rounded-full border border-line flex items-center justify-center overflow-hidden shrink-0"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.25 }}
          className="text-xs leading-none"
        >
          {theme === "dark" ? "☀" : "☾"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
