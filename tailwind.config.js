// /** @type {import('tailwindcss').Config} */
// export const darkMode = false;
// export const content = [
//   "./pages/**/*.{js,ts,jsx,tsx}",
//   "./components/**/*.{js,ts,jsx,tsx}",
// ];
// export const theme = {
//   extend: {},
// };
// export const plugins = [];




/** @type {import('tailwindcss').Config} */
export const darkMode = false;
export const content = [
  "./pages/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    gridAutoRows: {
      fr: '1fr',
    },
  },
};
export const plugins = [];
