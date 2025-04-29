/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0092ec', // Custom primary color
          light: '#3B82F6',   // Optional lighter shade
          dark: '#1E3A8A',    // Optional darker shade
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideIn: 'slideIn 0.4s ease-out',
        speaking: 'speaking 1s ease-in-out infinite',
        'speaking-short': 'speaking-short 1s ease-in-out infinite',
        'speaking-medium': 'speaking-medium 1s ease-in-out infinite',
        'speaking-tall': 'speaking-tall 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        speaking: {
          '0%, 100%': { height: '3px' },
          '50%': { height: '12px' },
        },
        'speaking-short': {
          '0%, 100%': { height: '2px' },
          '50%': { height: '6px' },
        },
        'speaking-medium': {
          '0%, 100%': { height: '3px' },
          '50%': { height: '10px' },
        },
        'speaking-tall': {
          '0%, 100%': { height: '4px' },
          '50%': { height: '16px' },
        },
      },
    },
  },
  plugins: [],
};
