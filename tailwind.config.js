/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["'IBM Plex Sans Arabic'", "Tahoma", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#4F46E5",      // Indigo primary
          dark: "#3730A3",         // Indigo dark
          light: "#EEF2FF",        // Indigo light bg
          border: "#C7D2FE",       // Indigo border
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
        },
        accent: {
          DEFAULT: "#F59E0B",      // Amber accent
          light: "#FEF3C7",
          dark: "#D97706",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F8FAFC",
          tertiary: "#F1F5F9",
        },
        ink: {
          DEFAULT: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
          subtle: "#CBD5E1",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06)",
        "card-hover": "0 10px 25px -5px rgba(79,70,229,.15), 0 4px 10px -5px rgba(79,70,229,.1)",
        "result": "0 4px 24px 0 rgba(79,70,229,.18)",
        "glow": "0 0 0 3px rgba(99,102,241,.25)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #6366F1 100%)",
        "card-gradient": "linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 100%)",
        "result-gradient": "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
      },
    },
  },
  plugins: [],
};
