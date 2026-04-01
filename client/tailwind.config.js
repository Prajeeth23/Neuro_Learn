module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        secondary: "hsl(var(--secondary) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        darkbg: "hsl(230, 20%, 10% / <alpha-value>)",
        glass: "rgba(255,255,255,0.08)"
      },
      backdropBlur: {
        xs: "2px"
      },
      boxShadow: {
        glow: "0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)"
      }
    }
  },
  plugins: []
};
