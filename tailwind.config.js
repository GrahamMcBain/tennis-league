/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'tennis-dark': '#1b4332',
        'tennis-primary': '#2d6a4f',
        'tennis-secondary': '#40916c',
        'tennis-light': '#74c69d',
        'tennis-pale': '#d8f3dc',
      }
    }
  },
  plugins: []
};
