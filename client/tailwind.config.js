module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        background: "#f7f7f7",
        foreground: "#111111",
        primary:    "#111111",  /* Black */
        secondary:  "#f0f0f0",  /* Light gray */
        accent:     "#444444",  /* Mid gray */
        darkbg:     "#1c1c1c",
        glass:      "rgba(0,0,0,0.04)"
      },
      fontSize: {
        'xs':   ['0.75rem',   { lineHeight: '1.4',  letterSpacing: '0em'    }],
        'sm':   ['0.875rem',  { lineHeight: '1.5',  letterSpacing: '-0.005em' }],
        'base': ['1rem',      { lineHeight: '1.6',  letterSpacing: '-0.01em'  }],
        'lg':   ['1.125rem',  { lineHeight: '1.5',  letterSpacing: '-0.01em'  }],
        'xl':   ['1.25rem',   { lineHeight: '1.4',  letterSpacing: '-0.015em' }],
        '2xl':  ['1.5rem',    { lineHeight: '1.3',  letterSpacing: '-0.02em'  }],
        '3xl':  ['1.875rem',  { lineHeight: '1.2',  letterSpacing: '-0.025em' }],
        '4xl':  ['2.25rem',   { lineHeight: '1.1',  letterSpacing: '-0.03em'  }],
        '5xl':  ['3rem',      { lineHeight: '1.05', letterSpacing: '-0.035em' }],
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md':'0 4px 12px rgba(0,0,0,0.08)',
        'card-lg':'0 8px 24px rgba(0,0,0,0.10)',
        'glow':   '0 0 0 3px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'sm':  '6px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px',
        '3xl': '24px',
      }
    }
  },
  plugins: []
};
