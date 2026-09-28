/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#1A0F0A",
          800: "#2C1810",
          700: "#3D2F26",
        },
        ivory: {
          50: "#FFFEFB",
          100: "#FDF8F0",
          200: "#F5F1EB",
          300: "#E8DDD0",
          400: "#D4C4B0",
        },
        gold: {
          50: "#FDF8F0",
          100: "#F5E6C8",
          200: "#E8C99A",
          300: "#C9A86A",
          400: "#A68B5B",
          500: "#8B7355",
        },
        maroon: {
          50: "#FDF2F2",
          100: "#7C2D2D",
          200: "#5C1F1F",
          300: "#8B4513",
        },
        saffron: {
          50: "#FEF3C7",
          100: "#D97706",
          200: "#B45309",
        }
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Playfair Display", "Libre Baskerville", "Georgia", "serif"],
        sans: ["Source Sans 3", "Manrope", "Lato", "system-ui", "sans-serif"],
        display: ["DM Serif Display", "Cormorant Garamond", "serif"]
      },
      letterSpacing: {
        editorial: "-0.025em",
        wide: "0.08em",
        wider: "0.12em",
      },
      lineHeight: {
        editorial: "1.1",
        relaxed: "1.7",
      }
    }
  },
  plugins: []
}
