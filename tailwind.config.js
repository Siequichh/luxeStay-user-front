/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#64289B',
          50: '#E8D9F5',
          100: '#D5B9EB',
          200: '#B899D7',
          300: '#9B7AC3',
          400: '#7F51AF',
          500: '#64289B',
          600: '#512087',
          700: '#3E1873',
          800: '#2B105F',
          900: '#18084B',
        },
        accent: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#CCB300',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}

