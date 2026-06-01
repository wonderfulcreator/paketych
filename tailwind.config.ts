import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#fff7ed",
          100: "#ffedd5",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        }
      },
      borderRadius: { brand: "16px" },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.07)",
        lift: "0 8px 32px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;
