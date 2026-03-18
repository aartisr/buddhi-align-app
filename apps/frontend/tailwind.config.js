/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      heading: ['Playfair Display', 'serif'],
      body: ['Inter', 'Nunito', 'Open Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      sans: ['Inter', 'Nunito', 'Open Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: '#4B0082', // deep indigo
        accent: '#8200da',
        gold: '#FFD700',
        emerald: '#2E8B57',
        rose: '#C72C6A',
        lavender: '#B39DDB',
        sky: '#87CEEB',
        sand: '#F6F8FC',
        background: '#F6F8FC',
        surface: '#fff',
        zinc: {
          900: '#18181b',
          800: '#27272a',
          700: '#3f3f46',
          600: '#52525c',
          400: '#9f9fa9',
          200: '#e4e4e7',
          100: '#f4f4f5',
        },
      },
      borderRadius: {
        xl: '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 24px 0 rgba(80, 200, 120, 0.08)',
        focus: '0 0 0 3px #FFD70055',
      },
    },
  },
  plugins: [],
};
