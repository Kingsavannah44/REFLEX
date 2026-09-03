/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        surface2: "rgb(var(--c-surface2) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        cream: "rgb(var(--c-cream) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        signal: "rgb(var(--c-signal) / <alpha-value>)",
        signal2: "rgb(var(--c-signal2) / <alpha-value>)",
        go: "rgb(var(--c-go) / <alpha-value>)",
        wait: "rgb(var(--c-wait) / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Bricolage Grotesque'", "system-ui", "sans-serif"],
        body: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
