import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      zIndex: {
        '60': '60',
        '999': '999',
      },
    },
    screens: {
      sm: '640px',
      md: '768px', // Ensure this is correctly set to 768px
      lg: '1024px',
      xl: '1280px',
    },
    textShadow: {
      default: '2px 2px 4px rgba(0, 0, 0, 0.5)',
      md: '3px 3px 5px rgba(0, 0, 0, 0.3)',
      lg: '4px 4px 6px rgba(0, 0, 0, 0.2)',
    },
    animation: {
      'spin-once': 'spinOnce 1s ease-in-out 1', // 1 rotation in 1 second
      'spin-once2': 'spinOnce2 1s ease-in-out 1', // 1 rotation in 1 second
      'show-element': 'showElement 1s forwards 1s',
      'justify-content-animation': 'justifyAnimation 1s ease-in-out forwards',
      'move-to-center': 'moveToCenter 1s ease-in-out forwards',
      'move-to-center2': 'moveToCenter2 1s ease-in-out forwards',
    },
    keyframes: {
      spinOnce: {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
      spinOnce2: {
        '0%': { transform: 'rotate(360deg)' },
        '100%': { transform: 'rotate(0deg)' },
      },
      showElement: {
        '0%': { visibility: 'hidden', opacity: '0' },
        '100%': { visibility: 'visible', opacity: '1' },
      },
      justifyAnimation: {
        '0%': { 'justify-content': 'space-between' },
        '100%': { 'justify-content': 'center' },
      },
      moveToCenter: {
        '0%': { transform: 'translateX(120%) rotateY(0deg) rotateX(0deg)', opacity: '0' }, 
        '50%': { opacity: '1' }, 
        '100%': { transform: 'translateX(0%) rotateY(360deg) rotateX(360deg)' }, 
      },
      moveToCenter2: {
        '0%': { transform: 'translateX(-120%) rotate(360deg)', opacity: '0' }, 
        '50%': { opacity: '1' }, 
        '100%': { transform: 'translateX(0%) rotate(0deg)' }, 
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const shadows = {
        '.text-shadow': {
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow-md': {
          textShadow: '3px 3px 5px rgba(0, 0, 0, 0.3)',
        },
        '.text-shadow-lg': {
          textShadow: '4px 4px 6px rgba(0, 0, 0, 0.2)',
        },
      }
      addUtilities(shadows, ['responsive', 'hover'])
    },
  ],
};
export default config;
