import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0B1220', 2: '#3A4560', muted: '#6B7899' },
        brand: { DEFAULT: '#3B82F6', deep: '#2563EB' },
        accent: { DEFAULT: '#7C6CFF', deep: '#6355F0' },
        surface: { DEFAULT: '#FFFFFF', soft: '#F8FAFF', blue: '#EAF4FF', lav: '#EEF1FF' },
        hairline: '#E7ECF8',
      },
      fontFamily: {
        display: ['General Sans', 'SF Pro Display', '-apple-system', 'Segoe UI', 'sans-serif'],
        sans: ['Satoshi', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: { shell: '1200px' },
    },
  },
  plugins: [],
};
export default config;
