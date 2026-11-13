import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/', 'docs/'] },
  js.configs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Core ESLint does not see JSX usage; components start with a capital.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: 'error',
      // Object keys may mirror API enum values such as `checked_in`.
      camelcase: ['error', { properties: 'never' }],
    },
  },
  {
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
];
