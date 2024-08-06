
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
        'maingreen': '#AFFE00',
        'maingreenhvr': '#a9f30a',
      },
      fontFamily: {
        light: ['satoshi-light', 'sans-serif'],
        normal: ['satoshi-regular', 'sans-serif'],
        medium: ['satoshi-medium', 'sans-serif'],
        semibold: ['satoshi-semibol', 'sans-serif'],
      },
    },

  },
  plugins: [],
})