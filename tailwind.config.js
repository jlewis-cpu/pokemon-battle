/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      dropShadow: { card: "0 10px 20px rgba(0,0,0,0.15)" },
    },
  },
  plugins: [],
}
