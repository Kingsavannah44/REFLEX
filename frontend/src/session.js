// Session handling per the team's trade-off log: "Local State Auth vs
// OAuth/JWT" - the server verifies a real password (POST /api/login, bcrypt
// checked server-side) before a session is ever created, but once signed in,
// the session itself is just the returned user object kept in local storage.
// No token, no expiry, no refresh - deliberately simpler than full JWT auth,
// acceptable for a single-sprint deployment where nobody needs to stay
// signed in across devices or after the demo ends.
const KEY = "reflex.session";

// Where each role lands after login (or after switching accounts). Shared
// between Login and AccountMenu so the mapping only lives in one place.
export const ROLE_HOME = {
  retailer: "/retailer",
  dispatcher: "/dispatcher",
  rider: "/rider",
};

export function getSession() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(user) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}
