import { useEffect, useState } from "react";
import {
  Package,
  UserCheck,
  Clock,
  CheckCircle2,
  Hourglass,
  Bell,
  Plus,
  ListChecks,
  QrCode,
  FileBarChart,
  Users,
  Settings,
  ClipboardList,
  Phone,
  Map as MapIcon,
  AlertTriangle,
} from "lucide-react";
import DashboardSidebar from "../dashboard/DashboardSidebar";
import StatCard from "../dashboard/StatCard";
import LiveMap from "../dashboard/LiveMap";
import QuickActionCard from "../dashboard/QuickActionCard";
import Avatar from "../dashboard/Avatar";
import AccountMenu from "../dashboard/AccountMenu";
import DeliveryListRow from "../dashboard/DeliveryListRow";
import CustomersList from "../dashboard/CustomersList";
import ReportsPanel from "../dashboard/ReportsPanel";
import NewDeliveryModal from "../dashboard/NewDeliveryModal";
import { api, POLL_INTERVAL_MS } from "../api";
import { getSession } from "../session";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function shortRef(order) {
  return `ORD-${order.order_id.slice(0, 4).toUpperCase()}`;
}

const DELIVERY_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "assigned", label: "Assigned" },
  { key: "picked_up", label: "Picked Up" },
  { key: "delivered", label: "Delivered" },
];

export default function DispatcherView() {
  const user = getSession();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("overview");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [assigning, setAssigning] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);

  function load() {
    Promise.all([api.listOrders(), api.listUsers()])
      .then(([allOrders, allUsers]) => {
        setOrders(allOrders);
        setUsers(allUsers);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  async function assign(orderId, riderId) {
    if (!riderId) return;
    setAssigning(orderId);
    try {
      await api.assignRider(orderId, riderId);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigning(null);
    }
  }

  const riders = users.filter((u) => u.role === "rider");
  const pending = orders.filter((o) => o.status === "pending");
  const assignedOrders = orders.filter((o) => o.status === "assigned");
  const assignedCount = assignedOrders.length;
  const inProgressCount = orders.filter((o) => o.status === "picked_up").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  const active = orders.filter((o) => o.status === "assigned" || o.status === "picked_up");
  const busyRiderIds = new Set(active.map((o) => o.assigned_rider).filter(Boolean));
  const activeRiders = riders.filter((r) => busyRiderIds.has(r.user_id));

  function activeCount(riderId) {
    return active.filter((o) => o.assigned_rider === riderId).length;
  }

  function lifetimeCount(riderId) {
    return orders.filter((o) => o.assigned_rider === riderId).length;
  }

  const navItems = [
    { key: "overview", label: "Overview", icon: Package, onClick: () => setTab("overview") },
    { key: "deliveries", label: "Deliveries", icon: ListChecks, onClick: () => setTab("deliveries") },
    { key: "assignments", label: "Assignments", icon: ClipboardList, onClick: () => setTab("assignments") },
    { key: "riders", label: "Riders", icon: Users, onClick: () => setTab("riders") },
    { key: "livemap", label: "Live Map", icon: MapIcon, onClick: () => setTab("livemap") },
    { key: "customers", label: "Customers", icon: Users, onClick: () => setTab("customers") },
    { key: "scan", label: "Scan to Confirm", icon: QrCode },
    { key: "reports", label: "Reports", icon: FileBarChart, onClick: () => setTab("reports") },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  const filteredDeliveries =
    deliveryFilter === "all" ? orders : orders.filter((o) => o.status === deliveryFilter);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar user={user} items={navItems} activeKey={tab} />

      <main className="flex-1 min-w-0 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {greeting()}, {user.full_name.split(" ")[0]}!
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Here's what's happening with your deliveries.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white">
              <Bell className="w-4.5 h-4.5" />
            </button>
            <AccountMenu user={user} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {tab === "overview" && (
          <>
            {pending.length > 0 && (
              <button
                onClick={() => setTab("assignments")}
                className="w-full flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 hover:bg-amber-100 transition-colors text-left"
              >
                <span className="flex items-center gap-2.5 text-amber-800 font-medium text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {pending.length} unassigned {pending.length === 1 ? "delivery" : "deliveries"} need a rider
                </span>
                <span className="text-xs font-semibold text-amber-700">Assign now →</span>
              </button>
            )}

            <div className="grid grid-cols-5 gap-4 mb-6">
              <StatCard icon={Package} tone="green" label="Total Deliveries" value={orders.length} sub="All time" />
              <StatCard icon={UserCheck} tone="amber" label="Assigned" value={assignedCount} sub="Awaiting pickup" />
              <StatCard icon={Clock} tone="blue" label="In Progress" value={inProgressCount} sub="Out for delivery" />
              <StatCard icon={CheckCircle2} tone="green" label="Delivered" value={deliveredCount} sub="All time" />
              <StatCard icon={Hourglass} tone="purple" label="Pending" value={pending.length} sub="Need assignment" />
            </div>

            <div className="grid grid-cols-[1.4fr_1fr] gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h2 className="text-sm font-semibold text-slate-800 mb-2">Open Deliveries</h2>
                {pending.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-4">
                    Nothing waiting, new requests appear here within 5 seconds.
                  </p>
                ) : (
                  pending.map((o) => (
                    <AssignRow key={o.order_id} order={o} riders={riders} assigning={assigning === o.order_id} onAssign={assign} activeCount={activeCount} />
                  ))
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h2 className="text-sm font-semibold text-slate-800 mb-2">Live Map</h2>
                <LiveMap
                  riders={activeRiders.map((r, i) => ({
                    id: r.user_id,
                    name: r.full_name,
                    color: ["#16A34A", "#2563EB", "#D97706"][i % 3],
                  }))}
                />
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Active Riders</h3>
                  {activeRiders.length === 0 && <p className="text-xs text-slate-400 italic">No riders on a delivery right now.</p>}
                  <div className="space-y-2">
                    {activeRiders.map((r) => (
                      <div key={r.user_id} className="flex items-center gap-2.5">
                        <Avatar name={r.full_name} size={30} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-slate-800 truncate">{r.full_name}</div>
                          <div className="text-xs text-slate-400 truncate">
                            {lifetimeCount(r.user_id)} {lifetimeCount(r.user_id) === 1 ? "delivery" : "deliveries"}
                          </div>
                        </div>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">In Progress</span>
                        <a href={`tel:${r.phone_number}`} className="w-7 h-7 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                          <Phone className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-5 gap-3">
                <QuickActionCard icon={Plus} tone="green" label="New Delivery" sub="Log one on a customer's behalf" onClick={() => setModalOpen(true)} />
                <QuickActionCard icon={ClipboardList} tone="amber" label="Assign Deliveries" sub={`${pending.length} waiting`} onClick={() => setTab("assignments")} />
                <QuickActionCard icon={MapIcon} tone="blue" label="Live Map" sub="See riders in motion" onClick={() => setTab("livemap")} />
                <QuickActionCard icon={QrCode} tone="purple" label="Scan to Confirm" sub="Rider-only action" disabled />
                <QuickActionCard icon={FileBarChart} tone="green" label="View Reports" sub="Real delivery stats" onClick={() => setTab("reports")} />
              </div>
            </div>
          </>
        )}

        {tab === "deliveries" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">All Deliveries</h2>
            </div>
            <div className="flex gap-2 mb-4">
              {DELIVERY_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setDeliveryFilter(f.key)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    deliveryFilter === f.key ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              {filteredDeliveries.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-4">No deliveries in this view.</p>
              ) : (
                filteredDeliveries
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .map((o) => <DeliveryListRow key={o.order_id} order={o} />)
              )}
            </div>
          </div>
        )}

        {tab === "assignments" && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Assignments</h2>
            <p className="text-sm text-slate-500 mb-4">Assign new requests, or reassign anything not yet picked up.</p>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              {pending.length === 0 && assignedOrders.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-4">Nothing to assign right now.</p>
              ) : (
                [...pending, ...assignedOrders].map((o) => (
                  <AssignRow key={o.order_id} order={o} riders={riders} assigning={assigning === o.order_id} onAssign={assign} activeCount={activeCount} users={users} />
                ))
              )}
            </div>
          </div>
        )}

        {tab === "riders" && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Riders</h2>
            {riders.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No riders registered yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {riders.map((r) => {
                  const busy = busyRiderIds.has(r.user_id);
                  return (
                    <div key={r.user_id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                      <Avatar name={r.full_name} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-800 truncate">{r.full_name}</div>
                        <div className="text-xs text-slate-400 truncate">{r.phone_number}</div>
                        <div className="text-xs text-slate-400">{lifetimeCount(r.user_id)} lifetime deliveries</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${busy ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                        {busy ? `On ${activeCount(r.user_id)}` : "Available"}
                      </span>
                      <a href={`tel:${r.phone_number}`} className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "livemap" && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Live Map</h2>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <LiveMap
                riders={activeRiders.map((r, i) => ({
                  id: r.user_id,
                  name: r.full_name,
                  color: ["#16A34A", "#2563EB", "#D97706"][i % 3],
                }))}
              />
            </div>
          </div>
        )}

        {tab === "customers" && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Customers</h2>
            <CustomersList orders={orders} />
          </div>
        )}

        {tab === "reports" && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Reports</h2>
            <ReportsPanel orders={orders} riders={riders} />
          </div>
        )}
      </main>

      <NewDeliveryModal open={modalOpen} onClose={() => setModalOpen(false)} createdBy={user.user_id} onCreated={load} />
    </div>
  );
}

function AssignRow({ order, riders, assigning, onAssign, activeCount, users }) {
  const currentRider = users?.find((u) => u.user_id === order.assigned_rider);
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${order.status === "pending" ? "bg-purple-400" : "bg-amber-400"}`} />
      <span className="w-20 shrink-0 text-xs font-mono text-slate-400">{shortRef(order)}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-slate-800 truncate">{order.customer_name}</span>
        <span className="block text-xs text-slate-400 truncate">
          {order.delivery_address}
          {currentRider ? ` · currently ${currentRider.full_name}` : ""}
        </span>
      </span>
      {riders.length === 0 ? (
        <span className="text-xs text-red-500 font-mono whitespace-nowrap">No riders registered</span>
      ) : (
        <select
          disabled={assigning}
          defaultValue=""
          onChange={(e) => onAssign(order.order_id, e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-green-500"
        >
          <option value="" disabled>
            {order.status === "pending" ? "Assign rider…" : "Reassign to…"}
          </option>
          {riders.map((r) => (
            <option key={r.user_id} value={r.user_id}>
              {r.full_name} {activeCount(r.user_id) > 0 ? `(on ${activeCount(r.user_id)} already)` : "(free)"}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
