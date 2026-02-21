/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F5F3FC",
        surface: "#FFFFFF",
        surfaceAlt: "#EEEAFF",
        text: "#1A1830",
        muted: "#6E6A85",
        textMuted: "#9895B0",
        primary: "#5C4EE0",
        primaryHover: "#4A3DC7",
        primaryActive: "#3A2DAF",
        primarySoft: "#EBE9FA",
        secondary: "#FF6B6B",
        secondarySoft: "#FFE5E5",
        accent: "#FF6B6B",
        accentSoft: "#FFE5E5",
        danger: "#EF4444",
        border: "#D9D6EC",
        success: "#22C55E",
        successSoft: "#DCFCE7",
        warning: "#F59E0B",
        warningSoft: "#FEF3C7",
        errorSoft: "#FEE2E2"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(92, 78, 224, 0.10)"
      },
      borderRadius: {
        xl: "12px"
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        heading: ["Bricolage Grotesque", "Nunito", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
};
