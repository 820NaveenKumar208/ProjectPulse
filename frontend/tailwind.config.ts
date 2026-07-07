import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pulse: {
          primary: '#7C3AED',
          secondary: '#22D3EE',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          background: '#F8FAFC',
          text: '#111827',
        },
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 23, 42, 0.08)',
        subtle: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      }
    },
  },
  plugins: [],
} satisfies Config;
