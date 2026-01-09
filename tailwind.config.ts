
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "var(--spacing-4)", // 16px basé sur la grille
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        futuristic: ['Orbitron', 'system-ui', 'sans-serif'],
        competitive: ['Rajdhani', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'caption': ['var(--text-xs)', { lineHeight: 'var(--leading-xs)' }],
        'body': ['var(--text-sm)', { lineHeight: 'var(--leading-sm)' }],
        'subtitle': ['var(--text-base)', { lineHeight: 'var(--leading-base)' }],
        'post-title': ['var(--text-lg)', { lineHeight: 'var(--leading-lg)' }],
        'header': ['var(--text-xl)', { lineHeight: 'var(--leading-xl)' }],
      },
      fontWeight: {
        'regular': 'var(--font-regular)',
        'medium': 'var(--font-medium)',
        'semibold': 'var(--font-semibold)',
        'bold': 'var(--font-bold)',
      },
      spacing: {
        'grid-1': 'var(--spacing-unit)',
        'grid-2': 'var(--spacing-2)',
        'grid-4': 'var(--spacing-4)',
        'grid-6': 'var(--spacing-6)',
        'grid-8': 'var(--spacing-8)',
        'safe-top': 'var(--safe-area-inset-top)',
        'safe-bottom': 'var(--safe-area-inset-bottom)',
        'safe-left': 'var(--safe-area-inset-left)',
        'safe-right': 'var(--safe-area-inset-right)',
      },
      height: {
        'nav': 'calc(3.5rem + var(--safe-area-inset-top))',
        'bottom-bar': 'calc(4rem + var(--safe-area-inset-bottom))',
        'safe-top': 'var(--safe-area-inset-top)',
        'safe-bottom': 'var(--safe-area-inset-bottom)',
      },
      minHeight: {
        'bottom-bar': 'calc(4rem + var(--safe-area-inset-bottom))',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          subtle: "hsl(var(--primary) / 0.1)",
          hover: "hsl(var(--primary) / 0.9)",
          light: "hsl(var(--primary) / 0.2)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          subtle: "hsl(var(--secondary) / 0.1)",
          hover: "hsl(var(--secondary) / 0.8)",
          light: "hsl(var(--secondary) / 0.2)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          subtle: "hsl(var(--accent) / 0.1)",
          hover: "hsl(var(--accent) / 0.9)",
          light: "hsl(var(--accent) / 0.2)",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
          subtle: "hsl(var(--gold) / 0.1)",
          hover: "hsl(var(--gold) / 0.9)",
          light: "hsl(var(--gold) / 0.2)",
        },
        amber: {
          DEFAULT: "hsl(var(--amber))",
          foreground: "hsl(var(--amber-foreground))",
          subtle: "hsl(var(--amber) / 0.1)",
          hover: "hsl(var(--amber) / 0.9)",
          light: "hsl(var(--amber) / 0.2)",
        },
        yellow: {
          DEFAULT: "hsl(var(--yellow))",
          foreground: "hsl(var(--yellow-foreground))",
          subtle: "hsl(var(--yellow) / 0.1)",
          hover: "hsl(var(--yellow) / 0.9)",
          light: "hsl(var(--yellow) / 0.2)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          subtle: "hsl(var(--success) / 0.1)",
          light: "hsl(var(--success) / 0.2)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          subtle: "hsl(var(--warning) / 0.1)",
          light: "hsl(var(--warning) / 0.2)",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
          subtle: "hsl(var(--error) / 0.1)",
          light: "hsl(var(--error) / 0.2)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      zIndex: {
        'overlay': '9997',
        'modal': '9998', 
        'toast': '9999',
      },
      boxShadow: {
        'glow': '0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.1)',
        'glow-accent': '0 0 20px hsl(var(--accent) / 0.3)',
        'app-native': '0 -2px 10px hsl(var(--shadow) / 0.1), 0 0 0 1px hsl(var(--border) / 0.5)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-down": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "shimmer": "shimmer 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
