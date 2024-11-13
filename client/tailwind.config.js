/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        black: '#242424',
        grey: '#F3F3F3',
        'dark-grey': '#6B6B6B',
        red: '#FF4E4E',
        transparent: 'transparent',
        twitter: '#1DA1F2',
        purple: {
          DEFAULT: '#8B46FF', // Default purple
          30: 'rgba(139, 70, 255, 0.3)', // Purple with 30% opacity
        },
      },
      fontSize: {
        sm: '12px',
        base: '14px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '38px',
        '5xl': '50px',
      },
      fontFamily: {
        inter: ["'Inter'", "sans-serif"],
        gelasio: ["'Gelasio'", "serif"],
      },
    },
  },
  plugins: [],
}
