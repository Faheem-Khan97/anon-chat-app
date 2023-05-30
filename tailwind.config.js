/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: "#121027",
        secondary: "#fce7f3",
        primaryLight: "#172554",
        primaryLighter: "#4658fa",
        primaryLightest: "#9ba4fa",
        secondaryTight: "#fbcfe8",
        secondaryTighter: "#ec4899",
        secondaryTightest: "#9d174d",
      },
    },
  },
  plugins: [],
};
