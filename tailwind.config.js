/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'bento-cream': '#FFEDD5',
        'bento-blue': '#DBEAFE',
        'bento-green': '#DCFCE7',
        'bento-pink': '#FCE7F3',
        'bento-purple': '#F3E8FF',
        'bento-yellow': '#FEF9C3',
        'bento-red': '#FEE2E2',
        'bento-card': '#FFFFFF',
        'custom-green': '#c3e4c5',
        'custom-purple': '#d3c2e5',
      },
      fontFamily: {
        // We'll stick to system fonts for now to keep it simple, but set up the utilities
        sans: ['System'],
      },
    },
  },
  plugins: [],
}
