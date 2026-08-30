// API client for the Reflex backend.
//
// Contract (matches the finalized data model: USERS + ORDERS):
//   POST  /api/login                       -> body: { phone_number, password } -> the matching
//                                              user object on success, 401 on wrong credentials
//   GET   /api/users                       -> list of { user_id, full_name, phone_number, role }
//   GET   /api/orders?status=&assigned_rider=  -> list of orders, both filters optional
//   POST  /api/orders                      -> create an order, body: { customer_name, customer_phone,
//                                              delivery_address, item_description, created_by }
//   PATCH /api/orders/:id/assign           -> body: { assigned_rider } -> sets status "assigned"
//   PATCH /api/orders/:id/status           -> body: { status } -> "picked_up" | "delivered"
//
// The base URL is configurable so this points at the mock server today and
// the real backend once it exists, with no code changes.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // If the server sent a structured { error: "..." } body, surface that
    // message directly instead of the raw response text.
    let message = `${options.method || "GET"} ${path} failed: ${res.status} ${body}`;
    try {
      const parsed = JSON.parse(body);
      if (parsed?.error) message = parsed.error;
    } catch {
      // body wasn't JSON, keep the fallback message above
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: (phone_number, password) =>
    request("/api/login", { method: "POST", body: JSON.stringify({ phone_number, password }) }),

  listUsers: () => request("/api/users"),

  listOrders: ({ status, assignedRider } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (assignedRider) params.set("assigned_rider", assignedRider);
    const qs = params.toString();
    return request(`/api/orders${qs ? `?${qs}` : ""}`);
  },

  createOrder: (order) =>
    request("/api/orders", { method: "POST", body: JSON.stringify(order) }),

  assignRider: (orderId, assignedRider) =>
    request(`/api/orders/${orderId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ assigned_rider: assignedRider }),
    }),

  updateStatus: (orderId, status) =>
    request(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Sync strategy per the finalized architecture: 5-second short HTTP polling,
// not WebSockets (chosen for reliability on weak 3G and lower data usage).
export const POLL_INTERVAL_MS = 5000;
