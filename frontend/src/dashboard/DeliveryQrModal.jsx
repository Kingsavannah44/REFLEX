import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { X } from "lucide-react";

function shortRef(order) {
  return `ORD-${order.order_id.slice(0, 4).toUpperCase()}`;
}

// Shows the real per-delivery QR code the backend generated at creation
// time (order.qr_token) - this is what a rider actually needs to scan to
// confirm the delivery, since the backend validates that exact token and
// has no manual bypass. Whoever hands the parcel to the rider (retailer or
// dispatcher, depending on how the team wants to run the handoff) pulls
// this up so the rider can scan it with their camera.
export default function DeliveryQrModal({ order, onClose }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!order?.qr_token) return;
    let cancelled = false;
    QRCode.toDataURL(order.qr_token, { width: 260, margin: 1 })
      .then((url) => !cancelled && setDataUrl(url))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [order?.qr_token]);

  return (
    <AnimatePresence>
      {order && (
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
            className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-xl text-center"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">{shortRef(order)}</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {order.qr_token ? (
              <>
                {dataUrl ? (
                  <img src={dataUrl} alt="Delivery QR code" className="mx-auto rounded-lg" width={220} height={220} />
                ) : error ? (
                  <p className="text-xs text-red-500 py-10">Couldn't generate the QR code: {error}</p>
                ) : (
                  <div className="w-[220px] h-[220px] mx-auto flex items-center justify-center text-xs text-slate-400">
                    Generating…
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-4">
                  Have the rider scan this to confirm delivery of {order.customer_name}'s order.
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-400 py-10">
                No QR code on this delivery yet.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
