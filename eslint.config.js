// https://docs.expo.dev/guides/using-eslint/
import tsParser from "@typescript-eslint/parser"
import tsPlugin from "@typescript-eslint/eslint-plugin"
import reactPlugin from "eslint-plugin-react"
import reactNativePlugin from "eslint-plugin-react-native"
import prettierPlugin from "eslint-plugin-prettier"
import importPlugin from "eslint-plugin-import"
import globals from "globals"

export default [
  {
    ignores: ["node_modules/**", "ios/**", "android/**", ".expo/**", ".vscode/**", "package.json"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react": reactPlugin,
      "react-native": reactNativePlugin,
      "prettier": prettierPlugin,
      "import": importPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "prettier/prettier": "error",
      // typescript-eslint
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      // eslint
      "no-use-before-define": "off",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            // Prefer named exports from 'react' instead of importing `React`
            {
              name: "react",
              importNames: ["default"],
              message: "Import named exports from 'react' instead.",
            },
            {
              name: "react-native",
              importNames: ["SafeAreaView"],
              message: "Use the SafeAreaView from 'react-native-safe-area-context' instead.",
            },
            {
              name: "react-native",
              importNames: ["Text", "Button", "TextInput"],
              message: "Use the custom wrapper component from '@/components'.",
            },
          ],
        },
      ],
      // react
      "react/prop-types": "off",
      // react-native
      "react-native/no-raw-text": "off",
      // eslint-config-standard overrides
      "comma-dangle": "off",
      "no-global-assign": "off",
      "quotes": "off",
      "space-before-function-paren": "off",
      // eslint-import
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          "groups": ["builtin", "external", "parent", "sibling", "index"],
          "pathGroups": [
            {
              pattern: "@/**",
              group: "external",
              position: "after",
            },
          ],
        },
      ],
      "import/newline-after-import": "warn",
    },
  },
]
