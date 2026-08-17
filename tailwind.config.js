/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#EEF2FF',
        },
        expense: '#EF4444',
        income: '#10B981',
        bg: '#F8FAFC',
        card: '#FFFFFF',
        text: '#1E293B',
        muted: '#64748B',
        border: '#E2E8F0',
      },
      dark: {
        bg: '#0F172A',
        card: '#1E293B',
        text: '#F1F5F9',
        muted: '#94A3B8',
        border: '#334155',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
