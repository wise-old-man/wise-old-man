/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        button: "0 1px 2px 0 rgb(0 0 0 / 0.15)",
        "inner-border": `inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.15)`,
      },
      colors: {
        "gray-1000": "hsl(0 0% 4%)",
        "gray-950": "hsl(0 0% 8%)",
        "gray-900": "hsl(0 0% 12%)",
        "gray-800": "hsl(0 0% 15%)",
        "gray-700": "hsl(0 0% 19%)",
        "gray-600": "hsl(0 0% 22%)",
        "gray-500": "hsl(0 0% 26%)",
        "gray-400": "hsl(0 0% 32%)",
        "gray-300": "hsl(0 0% 45%)",
        "gray-200": "hsl(0 0% 64%)",
        "gray-100": "hsl(0 0% 83%)",
      },
    },
  },
  plugins: [],
};
