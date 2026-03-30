/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{svelte,js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        idea: {
          dark: '#002B7A',
          navy: '#1A2C68',
          blue: '#1A73E8',
          bright: '#007BFF',
          light: '#E8F0FE',
          yellow: '#FBBF24',
          brown: '#B45309',
        },
      },
      borderRadius: {
        'idea': '1rem',
        'idea-lg': '1.5rem',
      },
    },
  },
  plugins: [],
};
