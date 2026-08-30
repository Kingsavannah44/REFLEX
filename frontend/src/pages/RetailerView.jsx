import { useEffect, useState } from "react";
import {
  Package,
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
  Phone,
  Search,
  ShieldCheck,
} from "lucide-react";
import DashboardSidebar from "../dashboard/DashboardSidebar";
import StatCard from "../dashboard/StatCard";
import DeliveryListRow from "../dashboard/DeliveryListRow";
import LiveMap from "../dashboard/LiveMap";
import QuickActionCard from "../dashboard/QuickActionCard";
import NewDeliveryModal from "../dashboard/NewDeliveryModal";
import Avatar from "../dashboard/Avatar";
import AccountMenu from "../dashboard/AccountMenu";
import CustomersList from "../dashboard/CustomersList";
import ProofOfDeliveryList from "../dashboard/ProofOfDeliveryList";
import ReportsPanel from "../dashboard/ReportsPanel";
import { api, POLL_INTERVAL_MS } from "../api";
import { getSession } from "../session";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function RetailerView() {
  const user = getSession();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [search, setSearch] = useState("");

  function load() {
    Promise.all([api.listOrders(), api.listUsers()])
      .then(([allOrders, allUsers]) => {
        setOrders(
          allOrders
            .filter((o) => o.created_by === user.user_id)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        );
        setUsers(allUsers);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inProgress = orders.filter((o) => o.status === "assigned" || o.status === "picked_up");
  const completed = orders.filter((o) => o.status === "delivered");
  const pending = orders.filter((o) => o.status === "pending");

  const activeDelivery = inProgress[0];
  const activeRider = activeDelivery && users.find((u) => u.user_id === activeDelivery.assigned_rider);
  const contacts = users.filter((u) => u.user_id !== user.user_id);

  const q = search.trim().toLowerCase();
  const searchedOrders = !q
    ? orders
    : orders.filter(
        (o) =>
          o.order_id.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.delivery_address.toLowerCase().includes(q)
      );

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: Package, onClick: () => setTab("dashboard") },
    { key: "new", label: "New Delivery", icon: Plus, onClick: () => setModalOpen(true) },
    { key: "deliveries", label: "My Deliveries", icon: ListChecks, onClick: () => setTab("deliveries") },
    { key: "customers", label: "Customers", icon: Users, onClick: () => setTab("customers") },
    { key: "proof", label: "Proof of Delivery", icon: ShieldCheck, onClick: () => setTab("proof") },
    { key: "reports", label: "Reports", icon: FileBarChart, onClick: () => setTab("reports") },
    { key: "settings", label: "Settings", icon: Settings },
  ];

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
              Here's what's happening with your deliveries today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white">
              <Bell className="w-4.5 h-4.5" />
            </button>
            <AccountMenu user={user} />
          </div>
        </div>

        {tab === "dashboard" && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatCard icon={Package} tone="green" label="Total Deliveries" value={orders.length} sub="All time" />
              <StatCard icon={Clock} tone="amber" label="In Progress" value={inProgress.length} sub="Active now" />
              <StatCard icon={CheckCircle2} tone="blue" label="Completed" value={completed.length} sub="All time" />
              <StatCard icon={Hourglass} tone="purple" label="Pending Assignment" value={pending.length} sub="Need dispatch" />
            </div>

            <div className="grid grid-cols-[1.4fr_1fr] gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-slate-800">Recent Deliveries</h2>
                </div>
                {orders.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-4">
                    Nothing logged yet, use New Delivery to get started.
                  </p>
                ) : (
                  orders.slice(0, 6).map((o) => <DeliveryListRow key={o.order_id} order={o} />)
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h2 className="text-sm font-semibold text-slate-800 mb-2">Live Map</h2>
                <LiveMap riders={activeRider ? [{ id: activeRider.user_id, name: activeRider.full_name, color: "#16A34A" }] : []} />
                {activeRider && activeDelivery && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={activeRider.full_name} size={32} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">{activeRider.full_name}</div>
                        <div className="text-xs text-slate-400 truncate">
                          ORD-{activeDelivery.order_id.slice(0, 4).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <a
                      href={`tel:${activeRider.phone_number}`}
                      className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Team Contacts</h2>
              {contacts.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-2">No dispatcher or riders registered yet.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {contacts.map((c) => (
                    <div key={c.user_id} className="flex items-center gap-3 border border-slate-100 rounded-lg p-3">
                      <Avatar name={c.full_name} size={38} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-800 truncate">{c.full_name}</div>
                        <div className="text-xs text-slate-400 capitalize">{c.role}</div>
                      </div>
                      <a
                        href={`tel:${c.phone_number}`}
                        className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-5 gap-3">
                <QuickActionCard icon={Plus} tone="green" label="New Delivery" sub="Create a delivery request" onClick={() => setModalOpen(true)} />
                <QuickActionCard icon={Search} tone="blue" label="Track Delivery" sub="Search an order" onClick={() => setTab("deliveries")} />
                <QuickActionCard icon={Hourglass} tone="purple" label="Pending" sub={`${pending.length} awaiting dispatch`} onClick={() => setTab("deliveries")} />
                <QuickActionCard icon={ShieldCheck} tone="green" label="Proof of Delivery" sub="Confirmed deliveries" onClick={() => setTab("proof")} />
                <QuickActionCard icon={FileBarChart} tone="amber" label="View Reports" sub="Real delivery stats" onClick={() => setTab("reports")} />
              </div>
            </div>
          </>
        )}

        {tab === "deliveries" && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">My Deliveries</h2>
            <div className="relative mb-4 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Track by order ID, customer, or address"
                className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-green-500"
              />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              {searchedOrders.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-4">
                  {q ? "No delivery matches that search." : "Nothing logged yet, use New Delivery to get started."}
                </p>
              ) : (
                searchedOrders.map((o) => <DeliveryListRow key={o.order_id} order={o} />)
              )}
            </div>
          </div>
        )}

        {tab === "customers" && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Customers</h2>
            <CustomersList orders={orders} />
          </div>
        )}

        {tab === "proof" && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Proof of Delivery</h2>
            <ProofOfDeliveryList orders={orders} users={users} />
          </div>
        )}

        {tab === "reports" && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Reports</h2>
            <ReportsPanel orders={orders} />
          </div>
        )}
      </main>

      <NewDeliveryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        createdBy={user.user_id}
        onCreated={load}
      />
    </div>
  );
}
