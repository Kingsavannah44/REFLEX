const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

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

// Backend's DeliveryStatus enum uses different words than the frontend was
// originally built against, not just different casing - OPEN is the same
// concept as what the rest of this app calls "pending" (created, not yet
// assigned). Lowercasing alone silently breaks every status === "pending"
// check across all three dashboards, which is exactly what happened here.
const STATUS_FROM_BACKEND = {
  OPEN: "pending",
  ASSIGNED: "assigned",
  PICKED_UP: "picked_up",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// Map backend delivery shape to the frontend's expected shape.
// Backend uses snake_case UUIDs and uppercase statuses.
// Frontend was built with mock data using different field names.
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

// Map backend user shape to frontend expected shape.
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
    // Normalize user inside login response
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: normalizeUser(data.user),
    };
  },

  listRiders: async () => {
    const data = await request("/api/riders");
    return data.map(normalizeUser);
  },

  listUsers: async () => {
    const data = await request("/api/riders");
    return data.map(normalizeUser);
  },

  listOrders: async ({ status, assignedRider } = {}) => {
    let deliveries;
    if (assignedRider) {
      deliveries = await request("/api/deliveries/assigned");
    } else {
      deliveries = await request("/api/deliveries/open");
    }
    return deliveries.map(normalizeDelivery);
  },

  listOpenDeliveries: async () => {
    const data = await request("/api/deliveries/open");
    return data.map(normalizeDelivery);
  },

  listMyDeliveries: async () => {
    const data = await request("/api/deliveries/assigned");
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
    // Frontend uses lowercase, backend expects uppercase
    const backendStatus = status.toUpperCase();
    const data = await request(`/api/deliveries/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: backendStatus }),
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
