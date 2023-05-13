/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
      boxShadow: {
        button: "0 1px 2px 0 rgb(0 0 0 / 0.15)",
        "inner-border": `inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.15)`,
      },
      colors: {
        "gray-950": "hsl(215 10% 4%)",
        "gray-900": "hsl(215 10% 8%)",
        "gray-800": "hsl(215 10% 11%)",
        "gray-700": "hsl(215 10% 15%)",
        "gray-600": "hsl(215 10% 20%)",
        "gray-500": "hsl(215 10% 25%)",
        "gray-400": "hsl(215 10% 31%)",
        "gray-300": "hsl(215 10% 43%)",
        "gray-200": "hsl(215 10% 64%)",
        "gray-100": "hsl(215 10% 83%)",
      },
      fontSize: {
        h1: ["2.25rem", "2.5rem"],
        h2: ["1.875rem", "2.25rem"],
        h3: ["1.125rem", "1.5rem"],
        body: ["0.875rem", "1.5rem"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
