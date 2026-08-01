/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark:  '#1E3A5F',
          mid:   '#2E86C1',
          light: '#D6E4F0',
        }
      }
    }
  },
  plugins: []
}