
import withMT from "@material-tailwind/react/utils/withMT";
export default withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '250px',
      'sm': '376px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px'
    },

    extend: {
      colors: {
        'main': '#be1e2d',
      },
      fontFamily: {
        light: ['figtree-light', 'sans-serif'],
        normal: ['figtree-regular', 'sans-serif'],
        medium: ['figtree-medium', 'sans-serif'],
        semibold: ['figtree-semibold', 'sans-serif'],
        bold: ['figtree-bold', 'sans-serif'],
        extrabold: ['figtree-extrabold', 'sans-serif'],
        black: ['figtree-black', 'sans-serif'],
      },
    },

  },
  plugins: [],
})