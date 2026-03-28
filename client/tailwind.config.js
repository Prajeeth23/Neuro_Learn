module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Tailwind compat tokens
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary:    "hsl(var(--primary) / <alpha-value>)",
        secondary:  "hsl(var(--secondary) / <alpha-value>)",
        accent:     "hsl(var(--accent) / <alpha-value>)",
        // Cognitive Sanctuary palette
        cs: {
          purple:   '#7c3aed',
          'purple-light': '#a855f7',
          teal:     '#06d6a0',
          cyan:     '#22d3ee',
          gold:     '#fbbf24',
          rose:     '#f43f5e',
          'bg-deep': '#0a0020',
          'bg-dark': '#0f0035',
          'surface': '#160045',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: "2px"
      },
      boxShadow: {
        glow:         "0 0 10px rgba(124,58,237,0.5), 0 0 20px rgba(124,58,237,0.3)",
        'glow-teal':  "0 0 10px rgba(6,214,160,0.5), 0 0 20px rgba(6,214,160,0.3)",
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease both',
        'float':      'float 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(124,58,237,0.4)' },
          '50%':      { boxShadow: '0 0 25px rgba(124,58,237,0.7)' },
        }
      }
    }
  },
  plugins: []
};
