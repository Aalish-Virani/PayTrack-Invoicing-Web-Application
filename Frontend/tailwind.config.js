/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "476px",
      },
      colors: {
        primary: {
          light: "#ffffff",
          dark: "#1e2139",
        },
        secondary: {
          light: "#f4f4f9",
          dark: "#141625",
        },
      },
    },
  },
  plugins: [],
};
