import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#F4F4F2",
          card: "#FFFFFF",
          border: "#E8E8E6",
          ink: "#1A1A1A",
          muted: "#7A7872",
          subtle: "#5A5A57",
          hover: "#F7F6F3",
          active: "#F0EFEC",
          accent: "#FF5B8A",
          accentDark: "#E84478",
        },
        pill: {
          pinkBg: "#FCE7EF",
          pinkText: "#A8345C",
          greenBg: "#E5EFE2",
          greenText: "#3F6E3A",
          amberBg: "#F5ECDA",
          amberText: "#7A5A1F",
          blueBg: "#E2ECF5",
          blueText: "#2E5A87",
          neutralBg: "#EDEAE3",
          neutralText: "#3D3A33",
          redBg: "#F5DCDC",
          redText: "#8A3A3A",
        },
        priority: {
          low: "#C8C6BF",
          medium: "#D8A24A",
          high: "#C84B6E",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.5)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease",
        "scale-in": "scale-in 150ms ease",
        "slide-in-right": "slide-in-right 200ms ease",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
