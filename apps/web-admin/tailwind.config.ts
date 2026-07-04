import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui-kit/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B2D8E',
          50: '#F3EEF8',
          100: '#E7DCF1',
          200: '#CFB9E3',
          300: '#B796D5',
          400: '#9F73C7',
          500: '#5B2D8E',
          600: '#4A2472',
          700: '#391B56',
          800: '#28123A',
          900: '#17091E',
        },
        success: { DEFAULT: '#2E7D32', 50: '#E8F5E9' },
        warning: { DEFAULT: '#ED6C02', 50: '#FFF3E0' },
        error: { DEFAULT: '#D32F2F', 50: '#FFEBEE' },
      },
    },
  },
  plugins: [],
};

export default config;
