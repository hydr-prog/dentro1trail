/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef2ff',   // Indigo 50
          100: '#e0e7ff',  // Indigo 100
          500: '#6366f1',  // Indigo 500
          600: '#4f46e5',  // Indigo 600
          700: '#4338ca',  // Indigo 700
        },
        secondary: {
            500: '#14b8a6', // Teal 500
            600: '#0d9488', // Teal 600
        }
      }
    },
  },
  plugins: [],
}