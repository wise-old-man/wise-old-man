import { FlatCompat } from '@eslint/eslintrc'
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
})

export default defineConfig([
  {
    extends: [
      ...compat.config({
        extends: ['next', 'next/core-web-vitals'],
        rules: {
          '@next/next/no-html-link-for-pages': 'off'
        },
        settings: {
          next: {
            rootDir: 'app/'
          }
        }
      })
    ],
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname
      }
    },
    name: 'wise-old-man/app',
  },
  globalIgnores(['.next', 'node_modules'])
]);
