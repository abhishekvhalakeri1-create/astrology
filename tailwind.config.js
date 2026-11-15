/** @type {import('tailwindcss').Config} */
const serif = ['"Cormorant Garamond Variable"', '"Noto Serif Devanagari Variable"', '"Noto Serif Kannada Variable"', 'Georgia', 'serif'];
const sans = ['"Source Sans 3 Variable"', '"Noto Sans Devanagari Variable"', '"Noto Sans Kannada Variable"', 'system-ui', 'sans-serif'];

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
        serif,
        sans,
        display: serif,
      },
      letterSpacing: {
        editorial: "-0.025em",
        wide: "0.08em",
        wider: "0.12em",
      },
      lineHeight: {
        editorial: "1.1",
        relaxed: "1.7",
      },
      keyframes: {
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "rise": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "spin-slow": "spin-slow 180s linear infinite",
        "rise": "rise 0.5s ease-out both",
      },
    }
  },
  plugins: []
}
