import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui-kit/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#5E4095',
          50: '#F0ECF5',
          100: '#E1D9EB',
          200: '#C3B3D7',
          300: '#A58DC3',
          400: '#8767AF',
          500: '#5E4095',
          600: '#4B3377',
          700: '#382659',
          800: '#25193B',
          900: '#120C1D',
        },
        sidebar: {
          background: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
        },
        success: { DEFAULT: '#2E7D32', 50: '#E8F5E9' },
        warning: { DEFAULT: '#ED6C02', 50: '#FFF3E0' },
        error: { DEFAULT: '#D32F2F', 50: '#FFEBEE' },
      },
      borderRadius: {
        xl: '0.5rem',
        '2xl': '0.75rem',
      },
    },
  },
  plugins: [],
};

export default config;
