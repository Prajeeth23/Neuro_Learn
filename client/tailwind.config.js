module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#111827",
        primary:   "#0ea5e9",   /* Sky blue */
        secondary: "#38bdf8",   /* Light sky blue */
        accent:    "#0284c7",   /* Deep sky blue */
        darkbg:    "#f0f9ff",   /* Very light sky tint */
        glass:     "rgba(14, 165, 233, 0.06)"
      },
      backdropBlur: {
        xs: "2px"
      },
      boxShadow: {
        glow: "0 0 10px rgba(14,165,233,0.4), 0 0 20px rgba(14,165,233,0.2)"
      }
    }
  },
  plugins: []
};
