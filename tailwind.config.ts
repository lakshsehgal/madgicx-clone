import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f0ff",
          100: "#e0e1ff",
          200: "#c7c8fe",
          300: "#a4a5fc",
          400: "#8183f8",
          500: "#6C5CE7",
          600: "#5A4BD1",
          700: "#4839A8",
          800: "#3B2F8A",
          900: "#2D2472",
        },
        accent: {
          50: "#FFF8F0",
          100: "#FFECD8",
          200: "#FFD6AE",
          300: "#FFBB7D",
          400: "#FF9F4A",
          500: "#FF8C2E",
          600: "#E67520",
          700: "#C25F18",
          800: "#9D4C14",
          900: "#7A3C12",
        },
        sidebar: {
          bg: "#0B0E1A",
          hover: "#151929",
          active: "#1E2338",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F8F9FC",
          tertiary: "#F1F3F9",
        },
        border: {
          DEFAULT: "#E5E8F0",
          light: "#F0F2F7",
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'elevated': '0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'glow-primary': '0 0 20px rgba(108,92,231,0.15)',
        'glow-green': '0 0 20px rgba(16,185,129,0.15)',
        'glow-red': '0 0 20px rgba(239,68,68,0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(135deg, rgba(108,92,231,0.05) 0%, rgba(16,185,129,0.05) 50%, rgba(255,140,46,0.05) 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
