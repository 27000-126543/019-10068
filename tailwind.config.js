/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#2563EB",
          600: "#1E40AF",
          700: "#1E3A8A",
          900: "#1E293B",
        },
        sentiment: {
          positive: "#059669",
          neutral: "#64748B",
          negative: "#D97706",
          severe: "#DC2626",
        },
        divergence: {
          DEFAULT: "#7C3AED",
          light: "#F5F3FF",
        },
        surface: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', '"思源宋体"', "Georgia", "serif"],
        sans: ['"Noto Sans SC"', '"Source Han Sans SC"', '"思源黑体"', "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 8px 24px -8px rgba(15, 23, 42, 0.12)",
        divergence: "0 0 0 4px rgba(124, 58, 237, 0.15)",
      },
      keyframes: {
        "pulse-divergence": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(124, 58, 237, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(124, 58, 237, 0)" },
        },
        "draw-check": {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "pulse-divergence": "pulse-divergence 1.2s ease-out",
        "draw-check": "draw-check 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
