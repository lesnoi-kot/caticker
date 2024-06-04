import typography from "@tailwindcss/typography";
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        checkered: "url(/src/assets/pattern.png)",
        checkeredDark: "url(/src/assets/pattern-dark.png)",
      },
    },
  },
  safelist: [{ pattern: /cursor/ }],
  plugins: [typography, daisyui],
  daisyui: {
    themes: ["cupcake", "dark"],
    darkTheme: "dark",
    base: false,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
};
