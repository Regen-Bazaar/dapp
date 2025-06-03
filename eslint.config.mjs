import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import typescriptParser from '@typescript-eslint/parser'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import prettierPlugin from 'eslint-plugin-prettier'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import reactPlugin from 'eslint-plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  { ignores: ['**/.next/*'] },
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      prettier: prettierPlugin,
      'jsx-a11y': jsxA11yPlugin,
      react: reactPlugin,
    },
    rules: {
      // Disable base rule to avoid conflict
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_', // Allow arguments prefixed with `_` to be unused
          varsIgnorePattern: '^_', // Allow variables prefixed with `_` to be unused
        },
      ],
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      'react/prop-types': 'off',
      'jsx-quotes': ['error', 'prefer-single'],
      'arrow-parens': ['error', 'as-needed'],
      'prettier/prettier': 'error',
      'no-duplicate-imports': 'off',
      'import/no-duplicates': 'error',
      'react/react-in-jsx-scope': 'off',
      'import/named': 'off',
    },
  },
  {
    files: ['**/*.json'],
    rules: {
      quotes: 'off',
    },
  },
]

export default eslintConfig
