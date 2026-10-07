/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deepTeal: '#133E48',
        cream: '#FAF7F2',
        warmCoral: '#E26D5C',
        sunnyYellow: '#F4C542',
        magenta: '#B83A68',
        leafGreen: '#3E8E62',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
