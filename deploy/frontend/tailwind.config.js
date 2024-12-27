/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins'],
      },
      colors: {
        primaryBlue: '#473BF0',
        darkBlue: '#161C2D',
        white: '#FFFFFF',
        neutral700: '#344051',
        neutral500: '#637083',
        neutral300: '#CED2DA',
        neutral200: '#E7E9ED',
        neutral100: '#F4F7FA',
        text900: '#141C24',
        text700: '#344051',
      },
      fontSize: {
        h0: '78px',
        h1: '56px',
        h2: '48px',
        h3: '32px',
        h4: '24px',
        p1: '18px',
        p2: '16px',
        p3: '14px',
        p4: '12px',
      },
      fontWeight: {
        h: 'bold',
        pRegular: 'normal',
        pBold: '600',
      },
    },
  },
  plugins: [],
};
