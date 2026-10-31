/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: [
          "var(--font-ibm-plex-arabic)",
          "'IBM Plex Sans Arabic'",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "700",
        black: "700",
      },
      colors: {
        brand: {
          DEFAULT: "#FF5B04",      // QEMLO Brand Orange primary
          dark: "#9A3412",         // Brand dark rust/orange
          light: "#FFF7ED",        // Brand light warm bg
          border: "#FED7AA",       // Brand warm border
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          500: "#FF5B04",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
        },
        accent: {
          DEFAULT: "#FF5B04",      // QEMLO Orange accent
          light: "#FFF7ED",
          dark: "#9A3412",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F5F5F2",
          tertiary: "#EAEAE5",
        },
        ink: {
          DEFAULT: "#0D0D0D",
          secondary: "#555555",
          muted: "#6B6B66",
          subtle: "#D4D4CE",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06)",
        "card-hover": "0 10px 25px -5px rgba(255,91,4,.15), 0 4px 10px -5px rgba(255,91,4,.1)",
        "result": "0 4px 24px 0 rgba(255,91,4,.18)",
        "glow": "0 0 0 3px rgba(255,91,4,.25)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #1C1917 0%, #0D0D0D 100%)",
        "card-gradient": "linear-gradient(135deg, #FFFFFF 0%, #F5F5F2 100%)",
        "result-gradient": "linear-gradient(135deg, #FF7A29 0%, #FF5B04 100%)",
      },
    },
  },
  plugins: [],
};
