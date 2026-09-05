/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f3eee6",
      },
      keyframes: {
        sheetIn: {
          from: { transform: "translate3d(0, 100%, 0)" },
          to: { transform: "translate3d(0, 0, 0)" },
        },
        sheetInDesk: {
          from: { transform: "translate3d(0, 1.25rem, 0)", opacity: "0" },
          to: { transform: "translate3d(0, 0, 0)", opacity: "1" },
        },
        backdropIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        toastIn: {
          from: { transform: "translate3d(1rem, 0, 0)", opacity: "0" },
          to: { transform: "translate3d(0, 0, 0)", opacity: "1" },
        },
        toastUp: {
          from: { transform: "translate3d(0, 0.75rem, 0)", opacity: "0" },
          to: { transform: "translate3d(0, 0, 0)", opacity: "1" },
        },
      },
      animation: {
        "sheet-in": "sheetIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both",
        "sheet-in-desk": "sheetInDesk 0.28s cubic-bezier(0.22, 1, 0.36, 1) both",
        "backdrop-in": "backdropIn 0.2s ease-out both",
        "toast-in": "toastIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) both",
        "toast-up": "toastUp 0.28s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
