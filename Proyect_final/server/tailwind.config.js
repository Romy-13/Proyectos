/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",         // Asegúrate de que esto esté correcto según tu proyecto
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Inter', 'sans-serif'],  // Agrega la fuente aquí
      },
    },
  },
  plugins: [],
};
