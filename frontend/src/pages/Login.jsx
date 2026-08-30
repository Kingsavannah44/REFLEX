import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api";
import { setSession, ROLE_HOME } from "../session";
import ThemeToggle from "../components/ThemeToggle";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await api.login(phone.trim(), password);
      setSession(user);
      navigate(ROLE_HOME[user.role] || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 relative overflow-hidden">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm relative"
      >
        <motion.div variants={item} className="mb-10">
          <div className="eyebrow mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-go live-dot" />
            Delivery, tracked
          </div>
          <p className="font-display text-xl font-medium text-muted tracking-tight leading-none mb-1">
            Welcome to
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight leading-none">
            Reflex
          </h1>
          <p className="text-sm text-muted mt-3 leading-relaxed">
            Sign in with your phone number and password.
          </p>
        </motion.div>

        <motion.form variants={item} onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label>Phone number</label>
            <input
              required
              autoFocus
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0700000001"
              className="w-full"
            />
          </div>
          <div>
            <label>Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>

          {error && <p className="text-sm text-signal">{error}</p>}

          <motion.button
            type="submit"
            disabled={submitting}
            whileTap={{ scale: 0.985 }}
            className="btn-primary w-full mt-1"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </motion.button>
        </motion.form>

        <motion.div variants={item} className="mt-6">
          <div className="eyebrow mb-2" style={{ fontSize: 10 }}>
            Demo accounts
          </div>
          <div className="border border-line rounded-lg p-3 space-y-1.5 font-mono text-[11px] text-muted">
            <div className="flex justify-between gap-3">
              <span>Retailer, Amina</span>
              <span className="text-cream">0700000001 / retailer123</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Dispatcher, James</span>
              <span className="text-cream">0700000002 / dispatcher123</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Rider, Kevin</span>
              <span className="text-cream">0700000003 / rider123</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Rider, Faith</span>
              <span className="text-cream">0700000004 / rider456</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
