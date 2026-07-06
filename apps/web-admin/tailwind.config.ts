import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui-kit/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-nunito)', 'Nunito', 'sans-serif'],
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
        golden: {
          DEFAULT: '#F7B30E',
          50: '#FEF8E7',
          100: '#FDF1CF',
          200: '#FBE39F',
          300: '#F9D56F',
          400: '#F7C73F',
          500: '#F7B30E',
          600: '#D99A0B',
          700: '#A87709',
          800: '#775406',
          900: '#463103',
        },
        teal: {
          DEFAULT: '#62BDC4',
          50: '#EFF7F8',
          100: '#DFEFF1',
          200: '#BFDFE3',
          300: '#9FCFD5',
          400: '#80BFC7',
          500: '#62BDC4',
          600: '#4E979D',
          700: '#3B7176',
          800: '#274C4F',
          900: '#142628',
        },
        orange: {
          DEFAULT: '#D27225',
          50: '#FCF3EC',
          100: '#F9E7D9',
          200: '#F3CFB3',
          300: '#EDB78D',
          400: '#E79F67',
          500: '#D27225',
          600: '#A85C1E',
          700: '#7E4516',
          800: '#542E0F',
          900: '#2A1707',
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
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};

export default config;
