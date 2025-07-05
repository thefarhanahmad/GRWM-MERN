/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        "max-xs": { max: "500px" },
      },
      fontFamily: {
        sans: ["Open Sans", "sans-serif"],
        openSans: ["'Open Sans'", "sans-serif"],
        source: ["Source Sans Pro", "sans-serif"],
        gotham: ["Gotham", "sans-serif"],
        futura: ["Futura", "sans-serif"],
        ubuntu: ["Ubuntu", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        helvetica: ["Helvetica", "sans-serif"],
        georgia: ["Georgia", "serif"],
        merriweather: ["Merriweather", "serif"],
        playfair: ["Playfair Display", "serif"],
        raleway: ["Raleway", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        arobede: ["Arobede", "sans-serif"],

        // New Fonts
        helveticaWorld: ["HelveticaWorld", "sans-serif"],
        horizon: ["Horizon", "sans-serif"],
        seasons: ["TheSeasonsBold", "serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
