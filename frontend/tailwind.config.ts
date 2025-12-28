import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#60a5fa', // М'який блакитний - стриманий акцент
          dark: '#3b82f6',
          light: '#93c5fd',
        },
        secondary: {
          DEFAULT: '#818cf8', // М'який фіолетовий - стриманий акцент
          dark: '#6366f1',
          light: '#a5b4fc',
        },
        accent: {
          DEFAULT: '#60a5fa',
          dark: '#3b82f6',
          light: '#93c5fd',
        },
        foreground: '#f5f5f5',
        background: {
          DEFAULT: '#1a1a1a',
          light: '#252525',
          lighter: '#2f2f2f',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'subtle-glow': 'subtle-glow 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        'subtle-glow': {
          '0%, 100%': {
            boxShadow: '0 0 8px rgba(96, 165, 250, 0.15)',
          },
          '50%': {
            boxShadow: '0 0 16px rgba(96, 165, 250, 0.25)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

