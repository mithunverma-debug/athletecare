import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#060B18", // Deepest background
          900: "#0B132B", // Card background
          850: "#101A38", // Elevated cards / hovering
          800: "#1C2A4E", // Borders
          700: "#2B3C68",
          600: "#3E5288",
        },
        sports: {
          green: "#10B981", // Primary accent
          "green-hover": "#059669",
          "green-light": "#34D399",
          "green-glow": "rgba(16, 185, 129, 0.15)",
          cyan: "#06B6D4",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
