const KEY = "reflex.theme";

export function getTheme() {
  return localStorage.getItem(KEY) || "dark";
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle("light", theme === "light");
  localStorage.setItem(KEY, theme);
}

// Call once, before first paint, so there's no flash of the wrong theme.
export function initTheme() {
  applyTheme(getTheme());
}
