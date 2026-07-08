import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui-kit/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
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
        golden: {
          DEFAULT: '#F7B30E',
          50: '#FFF8E6',
          100: '#FDEBB2',
          200: '#FBDE7F',
          300: '#F9D14C',
          400: '#F8C41F',
          500: '#F7B30E',
          600: '#D99A0C',
          700: '#BB820A',
          800: '#9D6908',
          900: '#7F5006',
        },
        teal: {
          DEFAULT: '#62BDC4',
          50: '#EAF6F7',
          100: '#CCE9EC',
          200: '#AAD9DF',
          300: '#88C9D2',
          400: '#6DC2C9',
          500: '#62BDC4',
          600: '#4FA6AD',
          700: '#3D8F96',
          800: '#2B787F',
          900: '#196168',
        },
        orange: {
          DEFAULT: '#D27225',
          50: '#FDF2E9',
          100: '#F9DCC3',
          200: '#F4C49A',
          300: '#EFAC71',
          400: '#EA9448',
          500: '#D27225',
          600: '#B1611F',
          700: '#905019',
          800: '#6F3F13',
          900: '#4E2E0D',
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
