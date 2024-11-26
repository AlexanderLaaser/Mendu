/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui'),],
  daisyui: {
    themes: [{
      mytheme: {
        "primary": "#2778cf",
        "secondary": "#f6d860",
        "accent": "#37cdbe",
        "neutral": "#536280",
        "base-100": "#ffffff",
      },
    },"light", "corporate"],
  },
}