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
        "gray-950": "hsl(14 17% 4%)",
        "gray-900": "hsl(14 17% 8%)",
        "gray-800": "hsl(14 17% 11%)",
        "gray-700": "hsl(14 17% 15%)",
        "gray-600": "hsl(14 17% 20%)",
        "gray-500": "hsl(14 17% 25%)",
        "gray-400": "hsl(14 17% 31%)",
        "gray-300": "hsl(14 17% 43%)",
        "gray-200": "hsl(14 14% 64%)",
        "gray-100": "hsl(14 12% 83%)",
        "discord-blue": "#5865F2",
        "discord-blue-hover": "#4853cf",
        "patreon-orange": "#F96855",
        "patreon-orange-hover": "#c95040",
        primary: {
          50: "hsl(20 77% 95%)",
          100: "hsl(18 64% 99%)",
          200: "hsl(19 65% 88%)",
          300: "hsl(19 65% 79%)",
          400: "hsl(19 65% 70%)",
          500: "hsl(19 65% 60%)",
          600: "hsl(19 65% 50%)",
          700: "hsl(19 65% 39%)",
          800: "hsl(19 65% 28%)",
          900: "hsl(19 65% 18%)",
          950: "hsl(17 63% 12%)",
        },
      },
      fontSize: {
        h1: ["2.25rem", "2.5rem"],
        h2: ["1.875rem", "2.25rem"],
        h3: ["1.125rem", "1.5rem"],
        body: ["0.875rem", "1.5rem"],
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse 100% 100% at bottom, rgba(230, 87, 42, 0.1), rgba(230, 87, 42, 0) 50%)",
        "feature-gradient":
          "radial-gradient(ellipse 100% 100% at 50% 75%, rgba(230, 87, 42, 0.07), rgba(230, 87, 42, 0) 60%)",
        "howto-gradient":
          "radial-gradient(ellipse 100% 100% at center, rgba(230, 87, 42, 0.1), rgba(230, 87, 42, 0) 50%)",
      },
      screens: {
        xs: "450px",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/container-queries")],
};
