import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "rgb(var(--brand-50) / <alpha-value>)",
          100: "rgb(var(--brand-100) / <alpha-value>)",
          400: "rgb(var(--brand-400) / <alpha-value>)",
          500: "rgb(var(--brand-500) / <alpha-value>)",
          600: "rgb(var(--brand-600) / <alpha-value>)",
          700: "rgb(var(--brand-700) / <alpha-value>)",
          900: "rgb(var(--brand-900) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "#0a0a0a",
          raised: "#141414",
          border: "#2a2a2a",
        },
        silver: {
          100: "#f4f4f5",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
