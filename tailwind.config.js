
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./ui/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'landing-neon': '#0f172a', // existing bg class
        'card': '#1e293b',
        'border': '#334155',
        'primary': '#3b82f6',
        'primary-foreground': '#ffffff',
        'secondary': '#f97316',
        'muted-foreground': '#cbd5e1'
      },
    },
  },
  plugins: [],
};
