// eslint.config.cjs
// Expo + React Native + TypeScript (Flat config)
const { defineConfig } = require('eslint/config')
const expoFlat = require('eslint-config-expo/flat')
const tsParser = require('@typescript-eslint/parser')
const tsPlugin = require('@typescript-eslint/eslint-plugin')

// 주의: expoFlat는 이미 여러 플러그인을 포함하므로
// 중복 선언(react-hooks, import 등)하지 않도록 함.
// unused-imports는 포함되어 있지 않아 직접 등록.

module.exports = defineConfig([
  // 0) Expo 권장 규칙 세트
  expoFlat,

  // 1) TS/TSX 전용 규칙
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.d.ts'], // 타입 선언 파일 제외(선택)
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-refresh': require('eslint-plugin-react-refresh'),
      'unused-imports': require('eslint-plugin-unused-imports'),
    },
    rules: {
      // JSX 안에서 ', ` 그대로 쓰게 허용
      'react/no-unescaped-entities': 'off',

      // React Hooks (expoFlat가 플러그인 제공하므로 룰만 지정)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Fast Refresh 친화
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // import 정렬/중복 방지 (expoFlat가 import 플러그인 제공)
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'warn',
      'import/no-unresolved': 'off', // TypeScript가 처리하므로 비활성화

      // 미사용 import/변수
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // 2) 테스트 파일 전용(Jest 전역 허용)
  {
    files: ['**/__tests__/**/*.{js,ts,tsx}', '**/*.{spec,test}.{js,ts,tsx}'],
    languageOptions: {
      globals: {
        it: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },

  // 3) 전역 ignore
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'android/**',
      'ios/**',
      'dist/**',
      'build/**',
      'web-build/**',
      '.turbo/**',
      '.cache/**',
      '.parcel-cache/**',
    ],
  },
])
