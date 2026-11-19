/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f4f7fb',
          100: '#e8eef7',
          200: '#ccdcef',
          300: '#a1c1e2',
          400: '#6f9ece',
          500: '#4a7eb8',
          600: '#38659e',
          700: '#2e5181',
          800: '#29466c',
          900: '#1e3a5f',
          950: '#0e1e38',
        },
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 18px 45px -20px rgba(14, 30, 56, 0.28)',
        'premium-lg': '0 30px 70px -30px rgba(14, 30, 56, 0.35)',
        'glow-green': '0 12px 35px -12px rgba(5, 150, 105, 0.45)',
      },
    },
  },
  plugins: [],
}
