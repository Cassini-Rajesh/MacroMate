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
        primary: '#0A0A0A',
        surface: '#141414',
        surface2: '#1C1C1C',
        borderSlate: '#2A2A2A',
        accent: '#D4A017',
        accentSoft: '#F0C040',
        success: '#22C55E',
        danger: '#EF4444',
        textPrimary: '#FFFFFF',
        textSecondary: '#A0A0A0',
        macroBlue: '#3B82F6',
        macroPurple: '#A78BFA',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
