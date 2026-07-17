/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A56DB',
          50: '#EBF2FF',
          100: '#C7DAFE',
          200: '#A4C2FD',
          300: '#76A9FA',
          400: '#3F83F8',
          500: '#1A56DB',
          600: '#1C44B9',
          700: '#1E3A8A',
          800: '#1E2E6E',
          900: '#1A2456',
        },
        secondary: '#3B82F6',
        success: '#059669',
        danger: '#DC2626',
        warning: '#D97706',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        dark: {
          bg: '#0F172A',
          surface: '#1E293B',
          card: '#1E293B',
          border: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'count-up': 'countUp 1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -5px rgba(0, 0, 0, 0.08)',
        glow: '0 0 20px rgba(26, 86, 219, 0.3)',
      },
    },
  },
  plugins: [],
}
