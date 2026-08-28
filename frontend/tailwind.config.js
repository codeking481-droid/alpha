/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FFFCF8",
        ink: "#0A0A0A",
        violet: "#5E17EB",
        muted: "#6B7280",
        border: "#EDEDED",
        success: "#10B981",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      maxWidth: {
        content: "1040px",
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
        input: "8px",
      },
    },
  },
  plugins: [],
}
