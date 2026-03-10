/** @type {import('tailwindcss').Config} */
module.exports = {
  // Include all files where NativeWind classes are used
  content: [
    "./App.tsx",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/screens/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};