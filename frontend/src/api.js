// Hardcode the production URL as fallback so the app works even if
// VITE_API_BASE_URL is not picked up by the Vercel build.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://reflex-6axo.onrender.com";

function getToken() {
  try {
    const raw = localStorage.getItem("reflex.session");
    return raw ? JSON.parse(raw)?.accessToken : null;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { headers, ...options });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let message = `${options.method || "GET"} ${path} failed: ${res.status}`;
    try {
      const parsed = JSON.parse(body);
      if (parsed?.error?.message) message = parsed.error.message;
      // Validation errors carry the actually useful part in error.details
      // (which field, and why) - the top-level message alone is just
      // "Validation failed." with no way to know what to fix.
      if (Array.isArray(parsed?.error?.details) && parsed.error.details.length > 0) {
        message = parsed.error.details.map((d) => d.message).join(" ");
      }
    } catch { /* not JSON */ }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  const json = await res.json();
  return json?.data ?? json;
}

// OPEN in the backend = "pending" in the frontend (unassigned, not yet dispatched)
const STATUS_FROM_BACKEND = {
  OPEN: "pending",
  ASSIGNED: "assigned",
  PICKED_UP: "picked_up",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

function normalizeDelivery(d) {
  return {
    order_id: d.id,
    customer_name: d.customer_name,
    customer_phone: d.customer_phone,
    delivery_address: d.delivery_address,
    item_description: d.item_description,
    status: STATUS_FROM_BACKEND[d.status] || d.status?.toLowerCase(),
    created_by: d.created_by,
    assigned_rider: d.assigned_rider_id,
    created_at: d.created_at,
    updated_at: d.updated_at,
    qr_token: d.qr_token,
    statusHistory: d.statusHistory,
  };
}

function normalizeUser(u) {
  return {
    user_id: u.id,
    full_name: u.name,
    phone_number: u.phone,
    role: u.role === "retailer_staff" ? "retailer" : u.role,
    is_active: u.is_active,
  };
}

export const api = {
  login: async (phone, password) => {
    const data = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: normalizeUser(data.user),
    };
  },

  listUsers: async () => {
    const data = await request("/api/riders");
    return data.map(normalizeUser);
  },

  listRiders: async () => {
    const data = await request("/api/riders");
    return data.map(normalizeUser);
  },

  // Dispatcher sees all open deliveries; rider sees their own assigned ones.
  // The assignedRider param tells us which endpoint to hit.
  listOrders: async ({ assignedRider } = {}) => {
    const data = assignedRider
      ? await request("/api/deliveries/assigned")
      : await request("/api/deliveries/open");
    return data.map(normalizeDelivery);
  },

  createOrder: async (order) => {
    const data = await request("/api/deliveries", {
      method: "POST",
      body: JSON.stringify({
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        deliveryAddress: order.delivery_address,
        itemDescription: order.item_description,
      }),
    });
    return normalizeDelivery(data);
  },

  assignRider: async (orderId, riderId) => {
    const data = await request(`/api/deliveries/${orderId}/assign`, {
      method: "PUT",
      body: JSON.stringify({ riderId }),
    });
    return normalizeDelivery(data);
  },

  updateStatus: async (orderId, status) => {
    const data = await request(`/api/deliveries/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: status.toUpperCase() }),
    });
    return normalizeDelivery(data);
  },

  confirmDelivery: async (orderId, qrToken) => {
    const data = await request(`/api/deliveries/${orderId}/confirm`, {
      method: "POST",
      body: JSON.stringify({ qrToken }),
    });
    return normalizeDelivery(data);
  },

  getDelivery: async (orderId) => {
    const data = await request(`/api/deliveries/${orderId}`);
    return normalizeDelivery(data);
  },
};

export const POLL_INTERVAL_MS = 5000;
