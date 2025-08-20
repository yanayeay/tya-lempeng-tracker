/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
      extend: {
        fontFamily: {
          roboto: ['Roboto', 'sans-serif'],
          edu: ['"Edu NSW ACT Cursive"', 'cursive'],
        },
      },
    },
  plugins: [],
}

