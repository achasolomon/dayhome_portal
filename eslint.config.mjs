import tsPlugin from '@typescript-eslint/eslint-plugin';

export default {
  ignores: ['eslint.config.mjs', 'apps/api/dist/**', 'apps/api/src/database/config.js', 'node_modules/**', '**/dist/**'],
  ignorePatterns: ['apps/api/dist/**', 'apps/api/src/database/config.js', 'node_modules/**', '**/dist/**'],
  env: {
    node: true,
    jest: true,
  },
  languageOptions: {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: ['./apps/api/tsconfig.json'],
      tsconfigRootDir: new URL('.', import.meta.url).pathname,
      sourceType: 'module',
    },
  },
  plugins: {
    '@typescript-eslint': tsPlugin,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
};
