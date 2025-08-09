import js from "@eslint/js";
import checkFile from "eslint-plugin-check-file";
import importPlugin from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

const project = "./tsconfig.app.json";

export default tseslint.config(
  { ignores: ["dist", "src/vite-env.d.ts", "@types", "templates"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      importPlugin.flatConfigs.recommended,
      eslintPluginPrettier,
    ],
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "check-file": checkFile,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          project,
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.recommended.rules,
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{js,jsx,ts,tsx}": "CAMEL_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      "import/order": [
        "error",
        {
          distinctGroup: false,
          groups: ["builtin", "external", "internal", ["sibling", "parent"], "index", "unknown"],
          pathGroups: [],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "no-nested-ternary": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: ["../*", "../../*"],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/]",
          message:
            'Avoid using hex color codes. Use theme-based colors like "black", "red.600" or theme.palette.* instead.',
        },
      ],
      "react/forbid-component-props": [
        "error",
        {
          forbid: [
            {
              propName: "style",
              message: "Avoid using inline styles. Use sx prop instead.",
            },
          ],
        },
      ],
      "react/forbid-elements": [
        "error",
        {
          forbid: [
            { element: "div", message: "Use <Box> instead of <div>" },
            { element: "span", message: `Use <Box component="span"> instead of <span>` },
            { element: "a", message: `Use <Link> instead of <a>` },
          ],
        },
      ],
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": [
        "error",
        {
          props: "never",
          children: "ignore",
        },
      ],
      "react/no-unknown-property": ["error", { ignore: ["css"] }],
      "react/react-in-jsx-scope": "off",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  }
);
