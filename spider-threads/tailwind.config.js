/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0F",       // near-black background
        web: "#E62429",       // webslinger red (primary accent)
        volt: "#1B6FE0",      // electric blue (secondary accent)
        pop: "#FFD400",       // pop yellow (action bursts)
        glitch: "#FF2D95",    // magenta glitch offset
        cream: "#F5F1E8",     // halftone cream (light panels)
      },
      fontFamily: {
        display: ['Bangers', 'cursive'],
        impact: ['Anton', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: "6px 6px 0 0 #0A0A0F",
        panelRed: "6px 6px 0 0 #E62429",
        panelBlue: "6px 6px 0 0 #1B6FE0",
      },
      keyframes: {
        burst: {
          "0%": { transform: "scale(0.9) rotate(-4deg)" },
          "100%": { transform: "scale(1) rotate(-4deg)" },
        },
      },
    },
  },
  plugins: [],
};
