import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Package,
  QrCode,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Phone,
  Navigation,
  AlertCircle,
  CheckCircle2,
  LogOut,
  Bell,
  PlayCircle,
  ListChecks,
  PhoneCall,
} from "lucide-react";
import DashboardSidebar from "../dashboard/DashboardSidebar";
import Avatar from "../dashboard/Avatar";
import AccountMenu from "../dashboard/AccountMenu";
import StatusPill from "../dashboard/StatusPill";
import QuickActionCard from "../dashboard/QuickActionCard";
import QrScanner from "../components/QrScanner";
import { api, POLL_INTERVAL_MS } from "../api";
import { getSession, clearSession } from "../session";
import { queueStatusUpdate } from "../offlineQueue";
import { useConnectivity } from "../hooks/useConnectivity";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function isToday(iso) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function shortRef(order) {
  return `ORD-${order.order_id.slice(0, 4).toUpperCase()}`;
}

export default function RiderView() {
  const user = getSession();
  const navigate = useNavigate();
  const { isOnline, queueLength, refreshQueueLength } = useConnectivity();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("home");
  const [selectedId, setSelectedId] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [justDelivered, setJustDelivered] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    Promise.all([api.listOrders({ assignedRider: user.user_id }), api.listUsers()])
      .then(([allOrders, allUsers]) => {
        setOrders(allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setUsers(allUsers);
        setError(null);
      })
      .catch((err) => {
        // Fetch failed (likely offline) - keep showing the last-known list
        // rather than wiping it, so the rider can keep working.
        setError(err.message);
      });
  }

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateOrderStatus(order, nextStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.order_id === order.order_id ? { ...o, status: nextStatus } : o))
    );
    if (!navigator.onLine) {
      queueStatusUpdate(order.order_id, nextStatus);
      refreshQueueLength();
      return;
    }
    try {
      await api.updateStatus(order.order_id, nextStatus);
    } catch {
      queueStatusUpdate(order.order_id, nextStatus);
      refreshQueueLength();
    }
  }

  async function markPickedUp(order) {
    setUpdating(order.order_id);
    await updateOrderStatus(order, "picked_up");
    setUpdating(null);
  }

  async function confirmDelivered(order) {
    setUpdating(order.order_id);
    await updateOrderStatus(order, "delivered");
    setUpdating(null);
    setJustDelivered({ ...order, deliveredAt: new Date() });
    setSelectedId(null);
    setTab("home");
    setTimeout(() => setJustDelivered(null), 4500);
  }

  const active = orders.filter((o) => o.status !== "delivered");
  const assignedCount = active.filter((o) => o.status === "assigned").length;
  const inTransitCount = active.filter((o) => o.status === "picked_up").length;
  const deliveredToday = orders.filter((o) => o.status === "delivered" && isToday(o.updated_at)).length;

  const selectedOrder = orders.find((o) => o.order_id === selectedId);
  const readyToScan = active.find((o) => o.status === "picked_up");
  const nextAction = active.find((o) => o.status === "assigned") || readyToScan;

  function openDetails(order) {
    setSelectedId(order.order_id);
  }

  function goTab(key) {
    setSelectedId(null);
    setTab(key);
  }

  const navItems = [
    { key: "home", label: "Home", icon: Home, onClick: () => goTab("home") },
    { key: "deliveries", label: "Deliveries", icon: Package, onClick: () => goTab("deliveries") },
    { key: "scan", label: "Scan to Confirm", icon: QrCode, onClick: () => goTab("scan") },
    { key: "history", label: "History", icon: Clock },
    { key: "account", label: "Account", icon: User, onClick: () => goTab("account") },
  ];

  const showingDetails = !!selectedOrder;
  const isScanTab = tab === "scan" && !showingDetails;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:block">
        <DashboardSidebar user={user} items={navItems} activeKey={showingDetails ? "" : tab} />
      </div>

      <main className={`flex-1 min-w-0 p-4 lg:p-6 pb-24 lg:pb-6 ${isScanTab ? "bg-slate-950" : ""}`}>
        {showingDetails ? (
          <DetailsScreen
            order={selectedOrder}
            users={users}
            updating={updating === selectedOrder.order_id}
            onBack={() => setSelectedId(null)}
            onMarkPickedUp={() => markPickedUp(selectedOrder)}
            onGoScan={() => {
              setSelectedId(null);
              setTab("scan");
            }}
          />
        ) : tab === "scan" ? (
          <div className="text-white">
            <h1 className="text-lg font-semibold">Scan to Confirm</h1>
            <p className="text-xs text-slate-400 mt-0.5 mb-5">
              {readyToScan
                ? `Confirming delivery for ${readyToScan.customer_name}`
                : "No delivery is ready to confirm right now."}
            </p>
            <div className="max-w-xs">
              {readyToScan ? (
                <QrScanner
                  onScan={() => confirmDelivered(readyToScan)}
                  onManualConfirm={() => confirmDelivered(readyToScan)}
                />
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                  <QrCode className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">
                    Mark a delivery as picked up first, then come back here to confirm it.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : tab === "account" ? (
          <div>
            <h1 className="text-lg font-semibold text-slate-900 mb-4">Account</h1>
            <div className="max-w-sm">
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 mb-4">
                <Avatar name={user.full_name} size={44} />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{user.full_name}</div>
                  <div className="text-xs text-slate-500 truncate">{user.phone_number}</div>
                  <div className="text-xs text-slate-400 capitalize">{user.role}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  clearSession();
                  navigate("/");
                }}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl py-3 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          </div>
        ) : tab === "deliveries" ? (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-y-2 mb-6">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">All Deliveries</h1>
                <p className="text-sm text-slate-500 mt-0.5">Everything ever assigned to you.</p>
              </div>
              <AccountMenu user={user} />
            </div>
            {orders.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4">Nothing assigned to you yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {orders.map((o) => (
                  <DeliveryRow key={o.order_id} order={o} onClick={() => openDetails(o)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-y-2 mb-6">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {greeting()}, {user.full_name.split(" ")[0]}!
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">Here's your run for today.</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                    isOnline ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500" : "bg-amber-500"}`} />
                  {isOnline ? "Online" : `Offline, ${queueLength} update${queueLength === 1 ? "" : "s"} queued`}
                </span>
                <button className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white">
                  <Bell className="w-4.5 h-4.5" />
                </button>
                <AccountMenu user={user} />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 mb-4">
                Can't reach the server right now, showing your last known list.
              </p>
            )}

            <AnimatePresence>
              {justDelivered && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3.5 max-w-md"
                >
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Delivery confirmed
                  </div>
                  <p className="text-xs text-green-700/80">
                    {justDelivered.customer_name}, {shortRef(justDelivered)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-3 gap-4 mb-6 max-w-lg">
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-semibold text-slate-900">{assignedCount}</div>
                <div className="text-xs text-slate-500 mt-0.5">Assigned</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-semibold text-slate-900">{inTransitCount}</div>
                <div className="text-xs text-slate-500 mt-0.5">In Transit</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-semibold text-slate-900">{deliveredToday}</div>
                <div className="text-xs text-slate-500 mt-0.5">Delivered</div>
              </div>
            </div>

            <h2 className="text-sm font-semibold text-slate-800 mb-2">My Deliveries</h2>
            {active.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4">Nothing assigned to you right now.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {active.map((o) => (
                  <DeliveryRow key={o.order_id} order={o} onClick={() => openDetails(o)} />
                ))}
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <QuickActionCard
                  icon={PlayCircle}
                  tone="green"
                  label={nextAction ? "Next Delivery" : "No Active Delivery"}
                  sub={nextAction ? nextAction.customer_name : "Nothing queued right now"}
                  onClick={nextAction ? () => openDetails(nextAction) : undefined}
                  disabled={!nextAction}
                />
                <QuickActionCard icon={ListChecks} tone="blue" label="View Deliveries" sub="Everything assigned to you" onClick={() => goTab("deliveries")} />
                <QuickActionCard icon={QrCode} tone="purple" label="Scan to Confirm" sub="Confirm a delivery" onClick={() => goTab("scan")} />
                <QuickActionCard
                  icon={PhoneCall}
                  tone="amber"
                  label="Call Customer"
                  sub={nextAction ? nextAction.customer_name : "No active delivery"}
                  onClick={nextAction ? () => window.open(`tel:${nextAction.customer_phone}`, "_self") : undefined}
                  disabled={!nextAction}
                />
                <QuickActionCard icon={AlertCircle} tone="green" label="Report an Issue" sub="Coming soon" disabled />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile-only bottom nav - the sidebar above is desktop-only (hidden below lg).
          Real riders are on a phone, so this is the layout that actually matters
          for them; the sidebar exists so this dashboard reads consistently with
          Retailer/Dispatcher on a laptop during the demo. */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-stretch z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = !showingDetails && tab === item.key;
          return (
            <button
              key={item.key}
              disabled={!item.onClick}
              onClick={item.onClick}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                !item.onClick
                  ? "text-slate-300 cursor-not-allowed"
                  : isActive
                  ? "text-green-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.key === "scan" ? "Scan" : item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DeliveryRow({ order, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 text-left hover:border-slate-300 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">{shortRef(order)}</span>
          <StatusPill status={order.status} />
        </div>
        <div className="text-sm font-medium text-slate-800 truncate mt-1">{order.customer_name}</div>
        <div className="text-xs text-slate-400 truncate">{order.delivery_address}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
    </button>
  );
}

function DetailsScreen({ order, users, updating, onBack, onMarkPickedUp, onGoScan }) {
  const pickupContact = users.find((u) => u.user_id === order.created_by);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`;

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-700">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{shortRef(order)}</h1>
          <p className="text-xs text-slate-500">{order.item_description}</p>
        </div>
      </div>

      <div className="mb-5">
        <Stepper status={order.status} />
      </div>

      <div className="space-y-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Pickup</div>
          <div className="text-sm font-medium text-slate-800">
            {pickupContact ? pickupContact.full_name : "Retailer"}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{order.item_description}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Dropoff</div>
          <div className="text-sm font-medium text-slate-800">{order.customer_name}</div>
          <p className="text-xs text-slate-500 mt-0.5 mb-3">{order.delivery_address}</p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${order.customer_phone}`}
              className="flex items-center justify-center gap-1.5 text-xs font-medium border border-slate-200 rounded-lg py-2 hover:border-slate-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-medium border border-slate-200 rounded-lg py-2 hover:border-slate-300 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" /> Navigate
            </a>
          </div>
        </div>

        {order.status === "assigned" && (
          <button
            onClick={onMarkPickedUp}
            disabled={updating}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium text-sm rounded-xl py-3 transition-colors disabled:opacity-50"
          >
            {updating ? "Updating…" : "Confirm Package Picked Up"}
          </button>
        )}

        {order.status === "picked_up" && (
          <button
            onClick={onGoScan}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium text-sm rounded-xl py-3 transition-colors"
          >
            Arrived, Scan to Confirm Delivery
          </button>
        )}

        {order.status === "delivered" && (
          <div className="flex items-center justify-center gap-1.5 text-sm text-green-600 font-medium py-2">
            <CheckCircle2 className="w-4 h-4" /> Delivered
          </div>
        )}

        <button
          disabled
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-300 border border-slate-100 rounded-xl py-2.5 cursor-not-allowed"
        >
          <AlertCircle className="w-3.5 h-3.5" /> Report an issue (coming soon)
        </button>
      </div>
    </div>
  );
}

const STEPS = [
  { key: "assigned", label: "Assigned" },
  { key: "picked_up", label: "Picked Up" },
  { key: "delivered", label: "Delivered" },
];

function Stepper({ status }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const fillPercent = currentIndex <= 0 ? 0 : (currentIndex / (STEPS.length - 1)) * 100;

  return (
    <div>
      <div className="relative flex justify-between mb-2">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 bg-slate-200" />
        <motion.div
          className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 bg-green-500"
          initial={false}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        {STEPS.map((step, i) => {
          const reached = i <= currentIndex;
          return (
            <motion.div
              key={step.key}
              className={`relative z-10 w-3 h-3 rounded-full border-2 ${
                reached ? "bg-green-500 border-green-500" : "bg-white border-slate-300"
              }`}
              animate={{ scale: i === currentIndex ? 1.25 : 1 }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-wide font-medium">
        {STEPS.map((step, i) => (
          <span key={step.key} className={i <= currentIndex ? "text-slate-700" : "text-slate-300"}>
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
