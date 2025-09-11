import { defineConfig, globalIgnores } from 'eslint/config';
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';

export default defineConfig([
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ...prettierConfig,
    name: 'prettier-config',
    plugins: { prettier: prettierPlugin }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname
      }
    },
    name: 'wise-old-man/client-js',
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'prettier/prettier': 'error'
    }
  },
  globalIgnores(['dist', 'node_modules'])
]);
