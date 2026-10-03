/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        heading: ['"Montserrat"', 'sans-serif'],
        display: ['"Cinzel"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        prmsu: {
          navy: '#002554',      // PRMSU Official Navy
          deep: '#010E21',      // Base Midnight
          royal: '#004393',     // Banner Royal Blue
          cyan: '#00C0F3',      // Circuit Cyan
          cyanGlow: '#00E5FF',
          gold: '#F4B41A',      // Engineering / University Gold
          orange: '#FF6B00',    // College of Engineering Orange
          card: '#031733',
        }
      }
    },
  },
  plugins: [],
}
