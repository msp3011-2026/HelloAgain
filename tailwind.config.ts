import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0faf4',
          100: '#dcf3e6',
          500: '#2D6A4F',
          600: '#256042',
          700: '#1d5035',
        },
      },
    },
  },
  plugins: [],
}

export default config
