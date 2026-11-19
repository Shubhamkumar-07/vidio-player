/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vlc: {
          orange: '#FF8800',
          'orange-hover': '#FFA333',
          'orange-dark': '#D97300',
          dark: '#1e1e24',
          darker: '#16161a',
          surface: '#24242c',
          panel: '#2a2a35',
          border: '#3c3c4a',
        }
      }
    },
  },
  plugins: [],
}
