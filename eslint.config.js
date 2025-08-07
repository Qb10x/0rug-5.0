import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        // React globals
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off', // Disabled for now
      'max-lines': 'off', // Disabled for now
      'max-depth': 'off', // Disabled for now
      'no-console': 'off', // Disabled for now
      'no-undef': 'off', // Turn off since we're defining globals
      '@typescript-eslint/no-unused-vars': 'warn', // Keep as warning
      '@typescript-eslint/no-empty-object-type': 'off', // Disabled
      'no-case-declarations': 'off', // Disabled
    },
  },
  prettier,
]; 