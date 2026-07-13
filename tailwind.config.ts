import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#003366',
          dark: '#002244',
          light: '#e8f0f8',
        },
        accent: {
          DEFAULT: '#c9a227',
          dark: '#a8861f',
        },
        ink: '#1a1a2e',
        surface: '#f5f7fa',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
