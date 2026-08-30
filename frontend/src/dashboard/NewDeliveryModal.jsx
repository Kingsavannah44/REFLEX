import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { api } from "../api";

const EMPTY = {
  customer_name: "",
  customer_phone: "",
  delivery_address: "",
  item_description: "",
};

export default function NewDeliveryModal({ open, onClose, createdBy, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.createOrder({ ...form, created_by: createdBy });
      setForm(EMPTY);
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">New delivery</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Customer name</label>
                <input
                  required
                  value={form.customer_name}
                  onChange={update("customer_name")}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Customer phone</label>
                <input
                  required
                  value={form.customer_phone}
                  onChange={update("customer_phone")}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Delivery address</label>
                <textarea
                  required
                  rows={2}
                  value={form.delivery_address}
                  onChange={update("delivery_address")}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Item description</label>
                <textarea
                  required
                  rows={2}
                  value={form.item_description}
                  onChange={update("item_description")}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium text-sm rounded-lg py-2.5 transition-colors disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Create delivery request"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
