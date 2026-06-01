import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fff8ef",
        creamSoft: "#fff0de",
        paper: "#fffcf7",
        ink: "#5d2b18",
        inkSoft: "#8a5c42",
        line: "#eecdaf",
        flame: "#e65c1b",
        flameDeep: "#b02a09",
        sun: "#ffbf50",
        leaf: "#829a4a",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 40px rgba(176,42,9,0.10)",
        card: "0 8px 28px rgba(176,42,9,0.08)",
      },
      borderRadius: { brand: "22px" },
    },
  },
  plugins: [],
} satisfies Config;
