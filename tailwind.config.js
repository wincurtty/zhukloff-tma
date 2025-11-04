// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        card: '#171717',
        border: '#262626',
        hover: '#404040',
        'text-primary': '#fafafa',
        'text-secondary': '#e5e5e5',
        'text-subtle': '#a3a3a3',
      },
      fontFamily: {
        sans: ['Lufga', 'Inter', 'sans-serif'], // Lufga нужно будет подключить через шрифты Google или локально
      },
    },
  },
  plugins: [],
};