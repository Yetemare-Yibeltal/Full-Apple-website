/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#05060A",
        surface: "rgba(255, 255, 255, 0.06)",
        "text-primary": "#F5F6FA",
        "text-muted": "#9AA0AE",
        glow: "#6EE7F9",
        prism: {
          violet: "#7C6CF6",
          aqua: "#4FD3C4",
          rose: "#FF7AC6",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "prism-gradient": "linear-gradient(90deg, #7C6CF6, #4FD3C4, #FF7AC6)",
      },
      backdropBlur: {
        glass: "20px",
      },
      animation: {
        "gradient-shift": "gradientShift 8s ease infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};
