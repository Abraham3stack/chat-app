/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
    "./services/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "Segoe UI", "sans-serif"]
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(14px) rotate(-1deg)" },
          "100%": { opacity: "1", transform: "translateY(0) rotate(0deg)" }
        },
        pulseDot: {
          "0%, 80%, 100%": { transform: "scale(0.75)", opacity: "0.45" },
          "40%": { transform: "scale(1)", opacity: "1" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "float-in": "floatIn 0.7s ease",
        "pulse-dot": "pulseDot 1s infinite",
        "slide-up": "slideUp 0.24s ease"
      }
    }
  },
  plugins: []
};
