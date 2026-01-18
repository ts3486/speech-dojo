/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FFFBF7",
        surface: "#FFFFFF",
        surfaceAlt: "#FFF2E6",
        text: "#1F2937",
        muted: "#6B7280",
        textMuted: "#9CA3AF",
        primary: "#FB923C",
        primaryHover: "#F97316",
        primaryActive: "#EA580C",
        primarySoft: "#FED7AA",
        accent: "#0F766E",
        accentSoft: "#99F6E4",
        danger: "#EF4444",
        border: "#E7E2DA",
        success: "#22C55E",
        successSoft: "#DCFCE7",
        warning: "#F59E0B",
        warningSoft: "#FEF3C7",
        errorSoft: "#FEE2E2"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(0, 0, 0, 0.12)"
      },
      borderRadius: {
        xl: "12px"
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        heading: ["Sora", "Manrope", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
};
