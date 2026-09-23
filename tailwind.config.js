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
        cartFly: {
          "0%": {
            transform: "translate3d(0, 0, 0) scale(1)",
            opacity: "1",
          },
          "70%": {
            opacity: "1",
          },
          "100%": {
            transform: "translate3d(var(--fly-x), var(--fly-y), 0) scale(0.28)",
            opacity: "0.35",
          },
        },
        cartPop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.22)" },
          "100%": { transform: "scale(1)" },
        },
        cartRowOut: {
          "0%": { opacity: "1", transform: "translate3d(0, 0, 0)", maxHeight: "8rem" },
          "100%": { opacity: "0", transform: "translate3d(0, -0.5rem, 0)", maxHeight: "0", paddingTop: "0", paddingBottom: "0", marginTop: "0", marginBottom: "0" },
        },
        cartNoticeIn: {
          from: { opacity: "0", transform: "translate3d(0, -0.35rem, 0)" },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        stepPushIn: {
          from: { transform: "translate3d(100%, 0, 0)", opacity: "0.35" },
          to: { transform: "translate3d(0, 0, 0)", opacity: "1" },
        },
        stepPushInPrev: {
          from: { transform: "translate3d(-100%, 0, 0)", opacity: "0.35" },
          to: { transform: "translate3d(0, 0, 0)", opacity: "1" },
        },
      },
      animation: {
        "sheet-in": "sheetIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both",
        "sheet-in-desk": "sheetInDesk 0.28s cubic-bezier(0.22, 1, 0.36, 1) both",
        "backdrop-in": "backdropIn 0.2s ease-out both",
        "toast-in": "toastIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) both",
        "toast-up": "toastUp 0.28s cubic-bezier(0.22, 1, 0.36, 1) both",
        "cart-fly": "cartFly 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "cart-pop": "cartPop 0.4s ease-out",
        "cart-row-out": "cartRowOut 0.45s ease forwards",
        "cart-notice-in": "cartNoticeIn 0.3s ease-out both",
        "step-push-in": "stepPushIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both",
        "step-push-in-prev": "stepPushInPrev 0.32s cubic-bezier(0.22, 1, 0.36, 1) both",
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
