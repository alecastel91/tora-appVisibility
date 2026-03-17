/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-pink': '#FF3366',
        'primary-pink-hover': '#FF1A4D',
        'bg-black': '#000000',
        'bg-card': '#0a0a0a',
        'border-dark': '#222222',
        'text-gray': '#999999',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      letterSpacing: {
        'landing': '0.22em',
      },
    },
  },
  plugins: [],
}
