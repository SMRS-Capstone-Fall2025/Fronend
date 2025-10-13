/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ✅ để Tailwind quét toàn bộ file React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
