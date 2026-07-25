import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdeceb",
          100: "#f8c9c6",
          400: "#e6473f",
          500: "#c8102e",
          600: "#a50d26",
          700: "#7a0a1c",
          900: "#3a0509",
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
