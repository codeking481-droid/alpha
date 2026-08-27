/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alpha: {
          dark: "#0B0215",
          card: "#14141f",
          accent: "#FFD700",
          gold: "#FFD700"
        }
      }
    },
  },
  plugins: [],
}
