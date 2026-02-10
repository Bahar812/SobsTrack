/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
      },
      colors: {
        ink: '#0f172a',
        ash: '#64748b',
        sky: '#e0f2fe',
        ember: '#f97316',
        moss: '#16a34a'
      },
      boxShadow: {
        glow: '0 12px 30px rgba(15, 23, 42, 0.12)'
      }
    },
  },
  plugins: [],
};
