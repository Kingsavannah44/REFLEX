const KEY = "reflex.session";

export const ROLE_HOME = {
  retailer: "/retailer",
  dispatcher: "/dispatcher",
  rider: "/rider",
};

export function getSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Support both { user, accessToken } shape and flat user shape
    return parsed?.user ?? parsed;
  } catch {
    return null;
  }
}

export function getFullSession() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}
